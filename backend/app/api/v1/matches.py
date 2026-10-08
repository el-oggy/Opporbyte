"""AI Job Matching and Heuristic Evaluation endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.job import Job, JobMatch
from app.models.profile import CareerProfile
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.job import JobMatchResponse, MatchEvaluationRequest
from app.services.matching.matching_service import matching_service

router = APIRouter()


@router.post("/evaluate", response_model=APIResponse[int])
async def evaluate_matches(
    req: MatchEvaluationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Run the AI matching engine to evaluate and score all discovered jobs

    against the specified career profile (Semiconductor or Software).
    """
    profile = db.scalar(
        select(CareerProfile).where(
            CareerProfile.user_id == current_user.id,
            CareerProfile.profile_type == req.profile_type.lower(),
        )
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile '{req.profile_type}' not found for user",
        )

    # Ensure there are jobs in database; if not, seed baseline
    jobs_count = db.scalar(select(Job).limit(1))
    if not jobs_count:
        from app.services.discovery.discovery_service import discovery_service
        discovery_service.seed_initial_discovery_dataset(db)

    evaluated = await matching_service.evaluate_profile_matches(db, profile.id)

    return APIResponse[int](
        success=True,
        message=f"Successfully evaluated and scored {len(evaluated)} opportunities for {req.profile_type} profile.",
        data=len(evaluated),
    )


@router.get("", response_model=List[JobMatchResponse])
def get_matches(
    profile_type: str = Query("semiconductor", description="Domain profile: semiconductor or software"),
    classification: Optional[str] = Query(None, description="Filter: strong, potential, low"),
    min_score: Optional[int] = Query(None, description="Minimum overall score"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retrieve ranked match evaluations for the active profile, sorted by overall score descending."""
    profile = db.scalar(
        select(CareerProfile).where(
            CareerProfile.user_id == current_user.id,
            CareerProfile.profile_type == profile_type.lower(),
        )
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile '{profile_type}' not found",
        )

    stmt = (
        select(JobMatch)
        .options(joinedload(JobMatch.job))
        .where(JobMatch.profile_id == profile.id)
        .order_by(JobMatch.overall_score.desc())
    )

    if classification:
        stmt = stmt.where(JobMatch.classification == classification.lower())
    if min_score is not None:
        stmt = stmt.where(JobMatch.overall_score >= min_score)

    matches = db.scalars(stmt).all()

    # If no matches exist yet for this profile, trigger auto-evaluation
    if not matches and not classification and min_score is None:
        import asyncio
        # Run synchronous evaluation inline if empty
        loop = asyncio.get_event_loop()
        if loop.is_running():
            pass  # return empty or evaluated
        else:
            asyncio.run(matching_service.evaluate_profile_matches(db, profile.id))
            matches = db.scalars(stmt).all()

    return [JobMatchResponse.model_validate(m) for m in matches]
