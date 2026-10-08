"""Analytics and System Telemetry API Endpoints."""

from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.application import Application
from app.models.job import Job, JobMatch, JobSource
from app.models.profile import CareerProfile
from app.models.resume import ResumeVersion
from app.models.task import TaskRun
from app.models.user import User
from app.schemas.analytics import AnalyticsSummaryResponse, TaskRunResponse
from app.services.applications.application_service import application_service

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummaryResponse)
def get_analytics_summary(
    profile_type: str = Query("semiconductor", description="Domain profile: semiconductor or software"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Aggregate career analytics, score distribution, and application conversion metrics."""
    # 1. Total jobs and source distribution
    total_jobs = db.scalar(select(func.count(Job.id))) or 0

    sources = db.scalars(select(JobSource)).all()
    source_counts: Dict[str, int] = {}
    for src in sources:
        cnt = db.scalar(select(func.count(Job.id)).where(Job.source_id == src.id)) or 0
        source_counts[src.name] = cnt

    # 2. Matches for user profile
    profile = db.scalar(
        select(CareerProfile).where(
            CareerProfile.user_id == current_user.id,
            CareerProfile.profile_type == profile_type.lower(),
        )
    )

    total_matches = 0
    strong_matches = 0
    potential_matches = 0
    low_matches = 0
    avg_match_score = 0.0

    if profile:
        matches = db.scalars(
            select(JobMatch).where(JobMatch.profile_id == profile.id)
        ).all()
        total_matches = len(matches)
        if total_matches > 0:
            strong_matches = sum(1 for m in matches if m.overall_score >= 80)
            potential_matches = sum(1 for m in matches if 60 <= m.overall_score < 80)
            low_matches = sum(1 for m in matches if m.overall_score < 60)
            avg_match_score = round(sum(m.overall_score for m in matches) / total_matches, 1)

    # 3. Resumes & ATS score average
    resumes_stmt = (
        select(ResumeVersion)
        .join(CareerProfile, ResumeVersion.profile_id == CareerProfile.id)
        .where(CareerProfile.user_id == current_user.id)
    )
    if profile:
        resumes_stmt = resumes_stmt.where(ResumeVersion.profile_id == profile.id)
    resumes = db.scalars(resumes_stmt).all()
    total_resumes = len(resumes)
    avg_ats = 0.0
    scored_resumes = [r for r in resumes if r.ats_score is not None]
    if scored_resumes:
        avg_ats = round(sum(r.ats_score for r in scored_resumes) / len(scored_resumes), 1)

    # 4. Application pipeline metrics
    pipeline_metrics = application_service.get_pipeline_metrics(db=db, user_id=current_user.id)

    # 5. Recent task runs
    recent_tasks = db.scalars(
        select(TaskRun).order_by(TaskRun.started_at.desc()).limit(10)
    ).all()

    return AnalyticsSummaryResponse(
        total_jobs=total_jobs,
        source_distribution=source_counts,
        profile_type=profile_type,
        total_matches=total_matches,
        strong_matches=strong_matches,
        potential_matches=potential_matches,
        low_matches=low_matches,
        average_match_score=avg_match_score,
        total_resumes=total_resumes,
        average_ats_score=avg_ats,
        application_pipeline=pipeline_metrics,
        recent_tasks=[TaskRunResponse.model_validate(t) for t in recent_tasks],
    )


@router.get("/tasks", response_model=List[TaskRunResponse])
def get_task_runs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List recent background task executions for telemetry and auditing."""
    tasks = db.scalars(
        select(TaskRun).order_by(TaskRun.started_at.desc()).limit(20)
    ).all()
    return [TaskRunResponse.model_validate(t) for t in tasks]
