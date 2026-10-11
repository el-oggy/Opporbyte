"""Deterministic public-source vertical slice and durable failure control tests."""
import asyncio
from datetime import timedelta
from unittest.mock import AsyncMock
import pytest
from sqlalchemy import func, select, update

from app.core.config import settings
from app.models.automation import SyncRun, SyncSource
from app.models.job import Job, JobMatch
from app.models.profile import CareerProfile
from app.models.task import TaskRun
from app.models.user import User
from app.schemas.automation import SyncRequest
from app.services.automation import SyncConflict, automation_service, utcnow
from app.services.discovery.discovery_service import discovery_service
from app.services.discovery.public_api import DiscoveryBatch, ProviderFailure
from app.services.interfaces.job_discovery import DiscoveredJobPayload


def posting(company="Permitted Labs", title="Frontend Engineer", external_id="1"):
    return DiscoveredJobPayload(source_name="greenhouse", external_id=external_id, title=title,
        company=company, location="Remote", work_mode="remote", employment_type="Full-time",
        description="React TypeScript frontend engineering. Fictional test vacancy.", url="https://example.com/jobs/1")


@pytest.fixture
def source(client, auth_headers):
    response = client.post("/api/v1/automation/sources", headers=auth_headers,
        json={"provider": "greenhouse", "board_token": "fixture-board", "rate_limit_per_minute": 60})
    assert response.status_code == 200
    return response.json()["source_id"]


@pytest.fixture
def mock_provider(monkeypatch):
    fetch = AsyncMock(return_value=DiscoveryBatch([posting()]))
    monkeypatch.setattr(discovery_service.providers["greenhouse"], "fetch_recent_postings", fetch)
    # No actual backoff sleeps or external networking in tests.
    monkeypatch.setattr(automation_service, "wait", AsyncMock())
    return fetch


def sync(client, auth_headers, source, key="fixture-sync-001", profile="software", limit=25):
    return client.post("/api/v1/automation/syncs", headers=auth_headers, json={
        "source_id": source, "profile_type": profile, "limit": limit, "idempotency_key": key})


def clear_cooldown(db, source):
    db.execute(update(SyncSource).where(SyncSource.source_id == source).values(next_request_at=None))
    db.commit()


def test_sync_rank_discover_review_and_persisted_save(client, auth_headers, source, mock_provider, db_session):
    result = sync(client, auth_headers, source).json()
    assert result["status"] == "succeeded"
    assert result["started_at"].endswith("Z") or result["started_at"].endswith("+00:00")
    assert result["result"]["new_jobs_count"] == result["result"]["eligible_count"] == 1
    task_id = result["id"]
    db_session.expire_all()
    assert db_session.get(TaskRun, task_id).completed_at is not None
    assert db_session.get(SyncSource, source).active_task_id is None
    next_request = client.get("/api/v1/automation/sources", headers=auth_headers).json()[0]["next_request_at"]
    assert next_request.endswith("Z") or next_request.endswith("+00:00")
    jobs = client.get("/api/v1/jobs?profile_type=software", headers=auth_headers).json()
    job = jobs[0]
    matches = client.get("/api/v1/matches?profile_type=software&min_score=0", headers=auth_headers).json()
    assert matches[0]["job_id"] == job["id"]
    assert matches[0]["match_evidence"]["eligibility"]["eligible"] is True
    assert client.get(f"/api/v1/jobs/{job['id']}", headers=auth_headers).status_code == 200
    saved = client.post("/api/v1/applications", headers=auth_headers,
        json={"job_id": job["id"], "profile_type": "software", "submission_method": "manual"})
    assert saved.status_code == 201 and saved.json()["status"] == "ready_for_review"
    duplicate = client.post("/api/v1/applications", headers=auth_headers,
        json={"job_id": job["id"], "profile_type": "semiconductor"})
    assert duplicate.status_code == 400
    assert client.get("/api/v1/analytics/tasks", headers=auth_headers).json()[0]["id"] == task_id


def test_duplicate_batch_and_repeated_runs_are_idempotent(client, auth_headers, source, mock_provider, db_session):
    mock_provider.return_value = DiscoveryBatch([posting(), posting(external_id="2")])
    first = sync(client, auth_headers, source).json()
    assert first["result"]["new_jobs_count"] == first["result"]["duplicates_skipped_count"] == 1
    same = sync(client, auth_headers, source).json()
    assert same["id"] == first["id"] and mock_provider.await_count == 1
    assert sync(client, auth_headers, source, limit=1).status_code == 409
    clear_cooldown(db_session, source)
    repeat = sync(client, auth_headers, source, "fixture-sync-002").json()
    assert repeat["result"]["new_jobs_count"] == 0 and repeat["result"]["duplicates_skipped_count"] == 2
    assert db_session.scalar(select(func.count(Job.id))) == 1
    assert db_session.scalar(select(func.count(JobMatch.id))) == 1


def test_excluded_employers_never_rank_or_appear_in_profile_discover(client, auth_headers, source, mock_provider, db_session):
    profile = db_session.scalar(select(CareerProfile).where(CareerProfile.profile_type == "software"))
    profile.excluded_companies = ["blocked"]
    db_session.commit()
    mock_provider.return_value = DiscoveryBatch([posting(), posting("Blocked Corp")])
    result = sync(client, auth_headers, source).json()["result"]
    assert result["eligible_count"] == result["excluded_count"] == 1
    assert db_session.scalar(select(func.count(JobMatch.id))) == 1
    assert all("blocked" not in j["company"].lower() for j in client.get("/api/v1/jobs?profile_type=software", headers=auth_headers).json())
    # Other profile remains independent, and manual evaluation does not revive excluded rankings.
    client.post("/api/v1/matches/evaluate", headers=auth_headers, json={"profile_type": "software"})
    assert len(client.get("/api/v1/matches?profile_type=software&min_score=0", headers=auth_headers).json()) == 1
    clear_cooldown(db_session, source)
    assert sync(client, auth_headers, source, "fixture-semi-001", "semiconductor").json()["result"]["eligible_count"] == 2


def test_transient_retry_and_terminal_error_recovery(client, auth_headers, source, mock_provider, db_session):
    mock_provider.side_effect = [ProviderFailure("http_503", True), DiscoveryBatch([posting()])]
    result = sync(client, auth_headers, source).json()
    assert result["status"] == "succeeded" and result["result"]["attempts"] == 2
    clear_cooldown(db_session, source)
    mock_provider.side_effect = ProviderFailure("http_503", True)
    failed = sync(client, auth_headers, source, "fixture-fail-001").json()
    assert failed["status"] == "failed" and failed["result"]["attempts"] == 3
    assert "http_503" in failed["error_message"]
    assert sync(client, auth_headers, source, "fixture-fail-001").json()["id"] == failed["id"]
    clear_cooldown(db_session, source)
    mock_provider.side_effect = None
    mock_provider.return_value = DiscoveryBatch([posting(title="Backend Engineer")])
    assert sync(client, auth_headers, source, "fixture-recover-001").json()["status"] == "succeeded"


def test_partial_source_records_are_reported(client, auth_headers, source, mock_provider):
    mock_provider.return_value = DiscoveryBatch([posting()], rejected_count=2)
    task = sync(client, auth_headers, source).json()
    assert task["status"] == "partial" and task["result"]["rejected_count"] == 2
    assert task["result"]["new_jobs_count"] == 1


def test_nonretryable_failure_and_retry_after_cooldown(client, auth_headers, source, mock_provider, db_session):
    mock_provider.side_effect = ProviderFailure("http_404")
    assert sync(client, auth_headers, source).json()["status"] == "failed"
    assert mock_provider.await_count == 1
    assert sync(client, auth_headers, source, "fixture-later-001").status_code == 429
    clear_cooldown(db_session, source)
    mock_provider.side_effect = ProviderFailure("http_429", True, retry_after=120)
    assert sync(client, auth_headers, source, "fixture-rate-001").json()["status"] == "failed"
    assert db_session.get(SyncSource, source).next_request_at is not None


def test_concurrent_claim_cancellation_and_lease_recovery(client, auth_headers, source, mock_provider, db_session):
    user = db_session.scalar(select(User).where(User.email == settings.FIRST_USER_EMAIL))
    req = SyncRequest(source_id=source, profile_type="software", idempotency_key="fixture-lock-001")
    task, execute = automation_service.prepare(db_session, user.id, req)
    assert execute is True
    with pytest.raises(SyncConflict, match="already running"):
        automation_service.prepare(db_session, user.id, req.model_copy(update={"idempotency_key": "fixture-lock-002"}))
    assert client.post(f"/api/v1/automation/syncs/{task.id}/cancel", headers=auth_headers).status_code == 200
    cancelled = asyncio.run(automation_service.execute(db_session, task.id))
    assert cancelled.status == "cancelled" and mock_provider.await_count == 0
    clear_cooldown(db_session, source)
    abandoned, _ = automation_service.prepare(db_session, user.id, req.model_copy(update={"idempotency_key": "fixture-lock-003"}))
    db_session.execute(update(SyncSource).where(SyncSource.source_id == source).values(lease_expires_at=utcnow() - timedelta(seconds=1)))
    db_session.commit()
    tasks = client.get("/api/v1/automation/syncs", headers=auth_headers).json()
    assert next(t for t in tasks if t["id"] == abandoned.id)["status"] == "interrupted"
    assert db_session.get(SyncSource, source).active_task_id is None
    assert sync(client, auth_headers, source, "fixture-lock-004").json()["status"] == "succeeded"


def test_database_failure_rolls_back_jobs_and_matches(client, auth_headers, source, mock_provider, monkeypatch, db_session):
    from app.services.matching.matching_service import matching_service
    monkeypatch.setattr(matching_service, "evaluate_jobs", AsyncMock(side_effect=RuntimeError("sensitive DB details")))
    result = sync(client, auth_headers, source).json()
    assert result["status"] == "failed" and "sensitive" not in result["error_message"]
    assert db_session.scalar(select(func.count(Job.id))) == 0
    assert db_session.scalar(select(func.count(JobMatch.id))) == 0
    assert db_session.get(SyncSource, source).active_task_id is None


def test_run_timeout_and_empty_source_are_distinct(client, auth_headers, source, mock_provider, monkeypatch, db_session):
    import app.services.automation as module
    monkeypatch.setattr(module, "RUN_TIMEOUT_SECONDS", 0.001)
    async def slow(*args, **kwargs):
        await asyncio.sleep(0.02)
    mock_provider.side_effect = slow
    assert sync(client, auth_headers, source).json()["status"] == "failed"
    clear_cooldown(db_session, source)
    monkeypatch.setattr(module, "RUN_TIMEOUT_SECONDS", 90)
    mock_provider.side_effect = None
    mock_provider.return_value = DiscoveryBatch()
    task = sync(client, auth_headers, source, "fixture-empty-001").json()
    assert task["status"] == "succeeded" and task["result"]["fetched_count"] == 0


def test_authorization_inactive_user_and_invalid_sources(client, auth_headers, source, mock_provider, db_session):
    task = sync(client, auth_headers, source).json()
    client.cookies.clear()
    assert client.get("/api/v1/automation/sources").status_code == 401
    assert client.get("/api/v1/automation/syncs").status_code == 401
    assert client.post("/api/v1/automation/syncs", json={}).status_code == 401
    assert client.get(f"/api/v1/automation/syncs/{task['id']}").status_code == 401
    assert client.post(f"/api/v1/automation/syncs/{task['id']}/cancel").status_code == 401
    assert client.post("/api/v1/automation/sources", headers=auth_headers, json={"provider": "unknown", "board_token": "fixture"}).status_code == 422
    assert client.post("/api/v1/automation/sources", headers=auth_headers, json={"provider": "lever", "board_token": "../https://bad-host"}).status_code == 422
    # A second signed-in owner cannot read/cancel/use the first owner's controls.
    other = User(email="second-fixture@example.com", hashed_password="unused", is_active=True)
    db_session.add(other); db_session.commit()
    from app.core.security import create_access_token
    other_headers = {"Authorization": f"Bearer {create_access_token(subject=other.id)}"}
    assert client.get("/api/v1/automation/syncs", headers=other_headers).json() == []
    assert client.get("/api/v1/automation/sources", headers=other_headers).json() == []
    assert client.get(f"/api/v1/automation/syncs/{task['id']}", headers=other_headers).status_code == 404
    assert client.post(f"/api/v1/automation/syncs/{task['id']}/cancel", headers=other_headers).status_code == 404
    assert sync(client, other_headers, source, "fixture-other-001").status_code == 404
    assert client.get("/api/v1/analytics/tasks", headers=other_headers).json() == []
    other.is_active = False; db_session.commit()
    assert client.get("/api/v1/automation/sources", headers=other_headers).status_code == 403


def test_paused_and_scheduler_configuration(client, auth_headers, source, mock_provider):
    response = client.post("/api/v1/automation/sources", headers=auth_headers, json={
        "provider": "greenhouse", "board_token": "fixture-board", "is_active": False, "sync_interval_minutes": 60})
    assert response.json()["scheduler_enabled"] is False
    assert response.json()["sync_interval_minutes"] == 60
    assert sync(client, auth_headers, source).status_code == 409
    assert mock_provider.await_count == 0


def test_legacy_discovery_also_tracks_and_ranks(client, auth_headers, mock_provider):
    response = client.post("/api/v1/jobs/discover", headers=auth_headers,
        json={"provider": "greenhouse", "board_token": "fixture-board", "profile_type": "software"})
    assert response.status_code == 200 and response.json()["new_jobs_count"] == 1
    assert len(client.get("/api/v1/automation/syncs", headers=auth_headers).json()) == 1


def test_atomic_claim_across_independent_connections(tmp_path):
    from concurrent.futures import ThreadPoolExecutor
    from threading import Barrier
    from sqlalchemy import create_engine
    from sqlalchemy.orm import Session
    from app.db.base import Base
    from app.schemas.automation import SourceConfiguration
    engine = create_engine("sqlite:///" + (tmp_path / "concurrent-sync.db").as_posix(), connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        user = User(email="concurrent-fixture@example.com", hashed_password="unused", is_active=True)
        db.add(user); db.flush()
        user_id = user.id
        db.add(CareerProfile(user_id=user_id, profile_type="software", title="Fixture Software"))
        db.commit()
        source_id = automation_service.configure(db, user_id, SourceConfiguration(provider="lever", board_token="fixture-concurrent"))["source_id"]
    barrier = Barrier(2)
    def claim(index):
        with Session(engine) as db:
            barrier.wait(timeout=5)
            try:
                task, _ = automation_service.prepare(db, user_id, SyncRequest(source_id=source_id, profile_type="software", idempotency_key=f"fixture-concurrent-{index}"))
                return task.id
            except SyncConflict:
                return "blocked"
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(claim, [1, 2]))
    assert results.count("blocked") == 1
    with Session(engine) as db:
        assert db.scalar(select(func.count(SyncRun.task_id))) == 1
        assert db.scalar(select(func.count(TaskRun.id))) == 1
    engine.dispose()


def test_expired_lease_fences_results_before_commit(client, auth_headers, source, mock_provider, monkeypatch, db_session):
    import app.services.automation as module
    from app.services.matching.matching_service import matching_service
    original = matching_service.evaluate_jobs
    real_now = module.utcnow
    async def expire_after_ranking(*args):
        result = await original(*args)
        expired_time = real_now() + timedelta(minutes=3)
        monkeypatch.setattr(module, "utcnow", lambda: expired_time)
        return result
    monkeypatch.setattr(matching_service, "evaluate_jobs", expire_after_ranking)
    task = sync(client, auth_headers, source).json()
    assert task["status"] == "interrupted"
    assert db_session.scalar(select(func.count(Job.id))) == 0
    assert db_session.scalar(select(func.count(JobMatch.id))) == 0
