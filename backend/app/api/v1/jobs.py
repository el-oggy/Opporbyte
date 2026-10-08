"""Jobs discovery and management endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.job import JobDiscoveryRequest, JobDiscoveryResponse, JobResponse
from app.services.discovery.discovery_service import discovery_service

router = APIRouter()


@router.get("", response_model=List[JobResponse])
def list_jobs(
    search: Optional[str] = Query(None, description="Search query for title, company, or description"),
    work_mode: Optional[str] = Query(None, description="Filter by work mode: remote, hybrid, on-site"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retrieve discovered canonical jobs with optional filtering."""
    stmt = select(Job).order_by(Job.created_at.desc())

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
    if not jobs and not search and not work_mode:
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
    try:
        new_cnt, dup_cnt = await discovery_service.ingest_board(
            db,
            provider_name=req.provider,
            board_token=req.board_token,
            limit=req.limit,
        )
        msg = f"Discovered {new_cnt} new opportunities from {req.provider} board '{req.board_token}'. {dup_cnt} duplicate postings were skipped."
        return JobDiscoveryResponse(
            success=True,
            new_jobs_count=new_cnt,
            duplicates_skipped_count=dup_cnt,
            provider=req.provider,
            board_token=req.board_token,
            message=msg,
        )
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Discovery failed: {exc}")


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
