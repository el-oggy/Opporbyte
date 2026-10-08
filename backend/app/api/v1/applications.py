"""Application Pipeline and Human-in-the-Loop Management API Endpoints."""

from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)
from app.services.applications.application_service import application_service

router = APIRouter()


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def stage_application(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Stage an application package with strict cross-profile deduplication enforcement."""
    try:
        app = application_service.create_application(
            db=db, user_id=current_user.id, data=data
        )
        # Fetch fresh with relationships
        full_app = application_service.get_application(
            db=db, user_id=current_user.id, application_id=app.id
        )
        return _serialize_application(full_app or app)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    profile_type: Optional[str] = Query(None, description="Filter by semiconductor or software"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List application packages in the staging and submission pipeline."""
    apps = application_service.list_applications(
        db=db,
        user_id=current_user.id,
        profile_type=profile_type,
        status=status_filter,
    )
    return [_serialize_application(a) for a in apps]


@router.get("/metrics", response_model=Dict[str, int])
def get_pipeline_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve stage counts across the application pipeline."""
    return application_service.get_pipeline_metrics(db=db, user_id=current_user.id)


@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch details of a single staged application."""
    app = application_service.get_application(
        db=db, user_id=current_user.id, application_id=application_id
    )
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application record not found",
        )
    return _serialize_application(app)


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: str,
    data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update application status, notes, or resume (e.g. approve or mark submitted)."""
    app = application_service.update_application(
        db=db, user_id=current_user.id, application_id=application_id, data=data
    )
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application record not found",
        )
    full_app = application_service.get_application(
        db=db, user_id=current_user.id, application_id=app.id
    )
    return _serialize_application(full_app or app)


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an application record."""
    success = application_service.delete_application(
        db=db, user_id=current_user.id, application_id=application_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application record not found",
        )


def _serialize_application(app) -> ApplicationResponse:
    resp = ApplicationResponse.model_validate(app)
    if app.job:
        resp.job_title = app.job.title
        resp.job_company = app.job.company
        resp.job_location = app.job.location
        resp.job_source = app.job.source.name if app.job.source else "external"
    if app.profile:
        resp.profile_type = app.profile.profile_type
    if app.resume_version:
        resp.resume_name = app.resume_version.version_name
        resp.ats_score = app.resume_version.ats_score
    return resp

