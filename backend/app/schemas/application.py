"""Pydantic schemas for Application pipeline and staging packages."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ApplicationCreate(BaseModel):
    profile_type: str = Field(..., description="Domain profile: semiconductor or software")
    job_id: str = Field(..., description="Target canonical job ID")
    resume_version_id: Optional[str] = Field(None, description="Linked tailored resume version ID")
    submission_method: str = Field("manual", description="manual, authorized_portal, email")
    notes: Optional[str] = Field(None, description="Application notes or submission strategy")


class ApplicationUpdate(BaseModel):
    status: Optional[str] = Field(None, description="draft, ready_for_review, approved, submitted, interviewing, offer, rejected")
    submission_method: Optional[str] = None
    notes: Optional[str] = None
    resume_version_id: Optional[str] = None


class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    job_id: str
    profile_id: str
    resume_version_id: Optional[str] = None
    status: str
    submission_method: str
    submitted_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Enriched presentation fields
    job_title: Optional[str] = None
    job_company: Optional[str] = None
    job_location: Optional[str] = None
    job_source: Optional[str] = None
    profile_type: Optional[str] = None
    resume_name: Optional[str] = None
    ats_score: Optional[int] = None
