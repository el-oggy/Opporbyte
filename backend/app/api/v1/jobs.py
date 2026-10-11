"""Jobs discovery and management endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.job import Job, JobMatch, JobSource
from app.models.profile import CareerProfile
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.job import JobDiscoveryRequest, JobDiscoveryResponse, JobResponse
from app.services.discovery.discovery_service import discovery_service

router = APIRouter()


@router.get("", response_model=List[JobResponse])
def list_jobs(
    search: Optional[str] = Query(None, description="Search query for title, company, or description"),
    work_mode: Optional[str] = Query(None, description="Filter by work mode: remote, hybrid, on-site"),
    profile_type: Optional[str] = Query(None, description="Rank eligible jobs for an owned career profile"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retrieve discovered canonical jobs with optional filtering."""
    stmt = select(Job).order_by(Job.created_at.desc())
    if profile_type:
        profile = db.scalar(select(CareerProfile).where(CareerProfile.user_id == current_user.id, CareerProfile.profile_type == profile_type))
        if not profile:
            raise HTTPException(404, "Career profile not found")
        for company in profile.excluded_companies:
            if company:
                stmt = stmt.where(~func.lower(Job.company).contains(company.lower(), autoescape=True))
        stmt = stmt.outerjoin(JobMatch, (JobMatch.job_id == Job.id) & (JobMatch.profile_id == profile.id)).order_by(None).order_by(JobMatch.overall_score.desc().nullslast(), Job.created_at.desc())

    if work_mode:
        stmt = stmt.where(Job.work_mode == work_mode.lower())

    if search:
        term = f"%{search.strip().lower()}%"
        stmt = stmt.where(
            or_(
                Job.title.ilike(term),
                Job.company.ilike(term),
                Job.description.ilike(term),
                Job.location.ilike(term),
            )
        )

    stmt = stmt.limit(limit)
    jobs = db.scalars(stmt).all()

    # If database has no jobs yet, auto-seed the baseline dataset so the user has immediate data
    if not jobs and not search and not work_mode and not profile_type:
        discovery_service.seed_initial_discovery_dataset(db)
        jobs = db.scalars(select(Job).order_by(Job.created_at.desc()).limit(limit)).all()

    return [JobResponse.model_validate(j) for j in jobs]


@router.get("/{job_id}", response_model=JobResponse)
def get_job_detail(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retrieve full details of a specific discovered job."""
    job = db.scalar(select(Job).where(Job.id == job_id))
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return JobResponse.model_validate(job)


@router.post("/discover", response_model=JobDiscoveryResponse)
async def trigger_job_discovery(
    req: JobDiscoveryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Trigger real-time job discovery from an authorized public ATS board (Greenhouse, Ashby, Lever)."""
    from app.schemas.automation import SourceConfiguration, SyncRequest
    from app.services.automation import SyncConflict, automation_service
    from app.models.automation import SyncSource
    import uuid
    try:
        source = db.scalar(select(JobSource).where(JobSource.name == f"{req.provider}:{req.board_token}"))
        state = db.get(SyncSource, source.id) if source else None
        if not state:
            configured = automation_service.configure(db, current_user.id, SourceConfiguration(
                provider=req.provider, board_token=req.board_token))
            source_id = configured["source_id"]
        else:
            source_id = state.source_id
        task, execute = automation_service.prepare(db, current_user.id, SyncRequest(
            source_id=source_id, profile_type=req.profile_type, limit=req.limit,
            idempotency_key=str(uuid.uuid4())))
        if execute:
            task = await automation_service.execute(db, task.id)
        if task.status not in ("succeeded", "partial"):
            raise HTTPException(502, task.error_message or "Source sync did not complete.")
        counts = task.result or {}
        return JobDiscoveryResponse(
            success=True, new_jobs_count=counts.get("new_jobs_count", 0),
            duplicates_skipped_count=counts.get("duplicates_skipped_count", 0),
            provider=req.provider, board_token=req.board_token,
            message=f"Sync {task.status}: {counts.get('new_jobs_count', 0)} new opportunities; {counts.get('eligible_count', 0)} eligible for {req.profile_type}.",
        )
    except SyncConflict as exc:
        raise HTTPException(exc.status, str(exc)) from exc


@router.post("/seed", response_model=APIResponse[int])
def seed_baseline_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Seed curated baseline engineering jobs for local deterministic testing."""
    count = discovery_service.seed_initial_discovery_dataset(db)
    return APIResponse[int](
        success=True,
        message=f"Seeded {count} baseline engineering opportunities successfully",
        data=count,
    )
