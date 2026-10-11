"""Bounded manual sync with durable idempotency, leases and transaction fencing.

No detached in-process background task: the request awaits execution. The same
execute(task_id) entry point can be called by a future durable worker.
"""
import asyncio
import json
import logging
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.automation import SyncRun, SyncSource
from app.models.job import Job, JobSource
from app.models.profile import CareerProfile
from app.models.task import TaskRun
from app.schemas.automation import SourceConfiguration, SyncRequest
from app.services.discovery.discovery_service import compute_canonical_hash, discovery_service
from app.services.discovery.public_api import ProviderFailure
from app.services.matching.matching_service import conflict_insert, matching_service

logger = logging.getLogger("opporbyte.automation")
RUN_TIMEOUT_SECONDS = 90
LEASE_SECONDS = 120
MAX_ATTEMPTS = 3
TERMINAL = {"succeeded", "partial", "failed", "cancelled", "interrupted"}


def utcnow():
    return datetime.now(timezone.utc)


def aware(value):
    return value.replace(tzinfo=timezone.utc) if value and value.tzinfo is None else value


class SyncConflict(Exception):
    def __init__(self, message, status=409):
        self.status = status
        super().__init__(message)


class Interrupted(Exception):
    pass


class AutomationService:
    def configure(self, db: Session, user_id: str, config: SourceConfiguration):
        name = f"{config.provider}:{config.board_token}"
        source = db.scalar(select(JobSource).where(JobSource.name == name))
        try:
            if source is None:
                hosts = {"greenhouse": "boards-api.greenhouse.io", "ashby": "api.ashbyhq.com", "lever": "api.lever.co"}
                source = JobSource(name=name, base_url=f"https://{hosts[config.provider]}")
                db.add(source)
                db.flush()
            state = db.get(SyncSource, source.id)
            if state and state.user_id != user_id:
                raise SyncConflict("Source unavailable for this account.")
            if state and state.active_task_id and aware(state.lease_expires_at) > utcnow():
                raise SyncConflict("Wait for the running sync before changing this source.")
            if state is None:
                state = SyncSource(source_id=source.id, user_id=user_id, provider=config.provider, board_token=config.board_token)
                db.add(state)
            source.is_active = config.is_active
            source.rate_limit_per_minute = config.rate_limit_per_minute
            state.sync_interval_minutes = config.sync_interval_minutes
            db.commit()
            return self.source_payload(db, state)
        except IntegrityError as exc:
            db.rollback()
            raise SyncConflict("Source configuration changed concurrently; try again.") from exc

    def source_payload(self, db, state):
        source = db.get(JobSource, state.source_id)
        return {
            "source_id": state.source_id, "provider": state.provider, "board_token": state.board_token,
            "is_active": source.is_active, "rate_limit_per_minute": source.rate_limit_per_minute,
            "sync_interval_minutes": state.sync_interval_minutes, "scheduler_enabled": False,
            "last_polled_at": aware(source.last_polled_at), "active_task_id": state.active_task_id,
            "lease_expires_at": aware(state.lease_expires_at), "next_request_at": aware(state.next_request_at),
        }

    def sources(self, db, user_id):
        return [self.source_payload(db, s) for s in db.scalars(select(SyncSource).where(SyncSource.user_id == user_id)).all()]

    def task(self, db, user_id, task_id):
        return db.scalar(select(TaskRun).join(SyncRun, SyncRun.task_id == TaskRun.id).where(
            SyncRun.user_id == user_id, TaskRun.id == task_id))

    def tasks(self, db, user_id, profile_type=None):
        stmt = select(TaskRun).join(SyncRun, SyncRun.task_id == TaskRun.id).where(SyncRun.user_id == user_id)
        if profile_type:
            stmt = stmt.join(CareerProfile, CareerProfile.id == SyncRun.profile_id).where(CareerProfile.profile_type == profile_type)
        return list(db.scalars(stmt.order_by(TaskRun.started_at.desc()).limit(20)).all())

    def recover_expired(self, db, user_id):
        """Mark orphaned runs interrupted, without replaying an unapproved sync."""
        now = utcnow()
        states = db.scalars(select(SyncSource).where(
            SyncSource.user_id == user_id, SyncSource.active_task_id.is_not(None), SyncSource.lease_expires_at <= now)).all()
        for state in states:
            task_id = state.active_task_id
            changed = db.execute(update(SyncSource).where(
                SyncSource.source_id == state.source_id, SyncSource.active_task_id == task_id,
                SyncSource.lease_expires_at <= now,
            ).values(active_task_id=None, lease_expires_at=None).execution_options(synchronize_session=False)).rowcount
            if changed:
                db.execute(update(TaskRun).where(TaskRun.id == task_id, TaskRun.status == "running").values(
                    status="interrupted", error_message="Execution interrupted. Start a new sync to retry.", completed_at=now))
        db.commit()

    def prepare(self, db, user_id, req: SyncRequest):
        self.recover_expired(db, user_id)
        profile = db.scalar(select(CareerProfile).where(CareerProfile.user_id == user_id, CareerProfile.profile_type == req.profile_type))
        state = db.scalar(select(SyncSource).where(SyncSource.source_id == req.source_id, SyncSource.user_id == user_id))
        if not profile or not state:
            raise SyncConflict("Profile or configured source not found.", 404)
        previous = db.scalar(select(SyncRun).where(SyncRun.user_id == user_id, SyncRun.idempotency_key == req.idempotency_key))
        if previous:
            task = db.get(TaskRun, previous.task_id)
            if previous.source_id != req.source_id or previous.profile_id != profile.id or task.parameters["limit"] != req.limit:
                raise SyncConflict("This idempotency key belongs to a different sync request.")
            return task, False
        source = db.get(JobSource, state.source_id)
        if not source.is_active:
            raise SyncConflict("This source is paused.")
        now, task_id = utcnow(), str(uuid.uuid4())
        # One atomic database UPDATE owns the source, even across API processes.
        claimed = db.execute(update(SyncSource).where(
            SyncSource.source_id == req.source_id, SyncSource.active_task_id.is_(None),
            or_(SyncSource.next_request_at.is_(None), SyncSource.next_request_at <= now),
        ).values(active_task_id=task_id, lease_expires_at=now + timedelta(seconds=LEASE_SECONDS)).execution_options(synchronize_session=False)).rowcount
        if not claimed:
            db.rollback()
            current = db.get(SyncSource, req.source_id)
            if current.active_task_id:
                raise SyncConflict("A sync is already running for this source.")
            raise SyncConflict("Source rate limit: wait before starting another sync.", 429)
        task = TaskRun(id=task_id, task_type="job_source_sync", status="running", parameters={
            "user_id": user_id, "source_id": req.source_id, "profile_type": req.profile_type,
            "provider": state.provider, "board_token": state.board_token, "limit": req.limit,
        }, result={"attempts": 0})
        db.add(task)
        db.flush()
        db.add(SyncRun(task_id=task_id, user_id=user_id, source_id=req.source_id,
                       profile_id=profile.id, idempotency_key=req.idempotency_key))
        try:
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise SyncConflict("A matching request started concurrently; retry using the same key.") from exc
        self.log(task_id, "started", source_id=req.source_id)
        return task, True

    def check_control(self, db, run):
        db.expire_all()
        state = db.get(SyncSource, run.source_id)
        if state.active_task_id != run.task_id or aware(state.lease_expires_at) <= utcnow():
            raise Interrupted()
        if db.get(SyncRun, run.task_id).cancel_requested:
            raise asyncio.CancelledError()
        return state

    async def wait(self, db, run, seconds):
        # Short waits make cancellation observable between requests/backoff steps.
        remaining = seconds
        while remaining > 0:
            self.check_control(db, run)
            step = min(remaining, 0.5)
            await asyncio.sleep(step)
            remaining -= step

    async def execute(self, db, task_id):
        run = db.get(SyncRun, task_id)
        task = db.get(TaskRun, task_id)
        if task.status in TERMINAL:
            return task
        try:
            async with asyncio.timeout(RUN_TIMEOUT_SECONDS):
                state = self.check_control(db, run)
                provider = discovery_service.get_provider(state.provider)
                source = db.get(JobSource, run.source_id)
                for attempt in range(1, MAX_ATTEMPTS + 1):
                    state = self.check_control(db, run)
                    delay = max(0, (aware(state.next_request_at) - utcnow()).total_seconds()) if state.next_request_at else 0
                    await self.wait(db, run, delay)
                    task.result = {"attempts": attempt}
                    state.next_request_at = utcnow() + timedelta(seconds=60 / source.rate_limit_per_minute)
                    db.commit()
                    self.log(task_id, "fetch", attempt=attempt)
                    try:
                        batch = await provider.fetch_recent_postings(state.board_token, task.parameters["limit"])
                        break
                    except ProviderFailure as exc:
                        if exc.retry_after:
                            state.next_request_at = max(aware(state.next_request_at), utcnow() + timedelta(seconds=exc.retry_after))
                            db.commit()
                        if not exc.retryable or attempt == MAX_ATTEMPTS:
                            raise
                        await self.wait(db, run, 2 ** (attempt - 1))
                self.check_control(db, run)
                result = await self.persist_batch(db, run, batch)
                result["attempts"] = attempt
                self.finish(db, run, "partial" if result["rejected_count"] else "succeeded", result=result)
        except ProviderFailure as exc:
            db.rollback()
            self.finish(db, run, "failed", error=f"Source sync failed ({exc.code}). Retry with a new sync after the rate limit clears.")
        except TimeoutError:
            db.rollback()
            self.finish(db, run, "failed", error="Sync exceeded its 90-second execution limit. No partial database results were committed.")
        except asyncio.CancelledError:
            db.rollback()
            self.finish(db, run, "cancelled", error="Sync cancelled before its results were committed.")
        except Interrupted:
            db.rollback()
            self.finish(db, run, "interrupted", error="Execution lease expired or was replaced. Start a new sync to retry.")
        except Exception as exc:
            self.log(task_id, "execution_error", error_type=type(exc).__name__)
            db.rollback()
            # Do not expose provider payloads, SQL errors or secrets to clients/logs.
            self.finish(db, run, "failed", error="Sync could not persist its results. No partial results were committed; start a new sync to retry.")
        return db.get(TaskRun, task_id)

    async def persist_batch(self, db, run, batch):
        jobs, seen, duplicates, new_count = [], set(), 0, 0
        for payload in batch:
            canonical = compute_canonical_hash(payload.company, payload.title, payload.location)
            if canonical in seen:
                duplicates += 1
                continue
            seen.add(canonical)
            values = {
                "source_id": run.source_id, "external_id": payload.external_id, "canonical_hash": canonical,
                "title": payload.title, "company": payload.company, "location": payload.location,
                "employment_type": payload.employment_type, "work_mode": payload.work_mode,
                "description": payload.description, "url": payload.url, "raw_payload": payload.raw_metadata,
            }
            inserted = db.execute(conflict_insert(db, Job).values(**values).on_conflict_do_nothing(
                index_elements=["canonical_hash"])).rowcount
            new_count += int(bool(inserted))
            duplicates += int(not inserted)
            jobs.append(db.scalar(select(Job).where(Job.canonical_hash == canonical)))
        profile = db.get(CareerProfile, run.profile_id)
        eligible, excluded = await matching_service.evaluate_jobs(db, profile, jobs)
        db.get(JobSource, run.source_id).last_polled_at = utcnow()
        return {
            "fetched_count": len(batch), "new_jobs_count": new_count, "duplicates_skipped_count": duplicates,
            "eligible_count": len(eligible), "excluded_count": len(excluded),
            "rejected_count": getattr(batch, "rejected_count", 0), "job_ids": eligible,
            "excluded_job_ids": excluded,
        }

    def finish(self, db, run, status, result=None, error=None):
        # Atomic fencing prevents an old worker committing after its lease was replaced.
        changed = db.execute(update(SyncSource).where(
            SyncSource.source_id == run.source_id, SyncSource.active_task_id == run.task_id,
            SyncSource.lease_expires_at > utcnow(),
        ).values(active_task_id=None, lease_expires_at=None).execution_options(synchronize_session=False)).rowcount
        if not changed:
            db.rollback()
            db.execute(update(TaskRun).where(TaskRun.id == run.task_id, TaskRun.status == "running").values(
                status="interrupted", error_message="Execution lease expired or was replaced. No results were committed.", completed_at=utcnow()))
            db.commit()
            return
        task = db.get(TaskRun, run.task_id)
        task.status, task.error_message, task.completed_at = status, error, utcnow()
        if result is not None:
            task.result = result
        db.commit()  # Jobs, matches and terminal success commit together.
        self.log(run.task_id, status)

    def cancel(self, db, user_id, task_id):
        task = self.task(db, user_id, task_id)
        if task and task.status == "running":
            db.execute(update(SyncRun).where(SyncRun.task_id == task_id).values(cancel_requested=True))
            db.commit()
        return task

    @staticmethod
    def log(task_id, event, **fields):
        logger.info(json.dumps({"event": f"sync.{event}", "task_id": task_id, **fields}))


automation_service = AutomationService()
