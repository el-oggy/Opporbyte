"""Resume Tailoring and Version Management API Endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.job import Job
from app.models.resume import ResumeVersion
from app.models.user import User
from app.schemas.resume import (
    ResumeExportResponse,
    ResumeTailorRequest,
    ResumeVersionResponse,
)
from app.services.resumes.resume_service import resume_service

router = APIRouter()


@router.post("/tailor", response_model=ResumeVersionResponse, status_code=status.HTTP_201_CREATED)
def tailor_resume(
    data: ResumeTailorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tailor an ATS-optimized, zero-hallucination resume for a target job."""
    try:
        resume = resume_service.tailor_resume_for_job(
            db=db,
            user_id=current_user.id,
            profile_type=data.profile_type,
            job_id=data.job_id,
            version_name=data.version_name,
        )
        # Enrich job details
        job = db.scalar(select(Job).where(Job.id == resume.job_id))
        resp = ResumeVersionResponse.model_validate(resume)
        if job:
            resp.job_title = job.title
            resp.job_company = job.company
        return resp
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("", response_model=List[ResumeVersionResponse])
def list_resumes(
    profile_type: Optional[str] = Query(None, description="Filter by semiconductor or software"),
    job_id: Optional[str] = Query(None, description="Filter by job ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all customized resume versions for the user."""
    resumes = resume_service.list_resumes(
        db=db,
        user_id=current_user.id,
        profile_type=profile_type,
        job_id=job_id,
    )
    result = []
    for r in resumes:
        item = ResumeVersionResponse.model_validate(r)
        if r.job:
            item.job_title = r.job.title
            item.job_company = r.job.company
        result.append(item)
    return result


@router.get("/{resume_id}", response_model=ResumeVersionResponse)
def get_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch single resume version with provenance details."""
    resume = resume_service.get_resume(db=db, user_id=current_user.id, resume_id=resume_id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume version not found")
    
    resp = ResumeVersionResponse.model_validate(resume)
    if resume.job:
        resp.job_title = resume.job.title
        resp.job_company = resume.job.company
    return resp


@router.get("/{resume_id}/export", response_model=ResumeExportResponse)
def export_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate ATS plain text and print-ready HTML exports with zero-hallucination provenance."""
    resume = resume_service.get_resume(db=db, user_id=current_user.id, resume_id=resume_id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume version not found")

    plain_text = resume_service.generate_plain_text(
        resume=resume,
        candidate_name=current_user.full_name or "Engineer Candidate",
        email=current_user.email,
    )
    html_content = resume_service.generate_html(
        resume=resume,
        candidate_name=current_user.full_name or "Engineer Candidate",
        email=current_user.email,
    )

    return ResumeExportResponse(
        resume_id=resume.id,
        version_name=resume.version_name,
        ats_score=resume.ats_score,
        plain_text=plain_text,
        html_content=html_content,
    )


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a resume version."""
    resume = resume_service.get_resume(db=db, user_id=current_user.id, resume_id=resume_id)
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume version not found")
    db.delete(resume)
    db.commit()
