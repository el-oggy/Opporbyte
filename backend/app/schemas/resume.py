"""Pydantic schemas for Tailored ATS Resumes."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ResumeTailorRequest(BaseModel):
    profile_type: str = Field("semiconductor", description="Domain profile: semiconductor or software")
    job_id: str = Field(..., description="Target canonical job ID")
    version_name: Optional[str] = None


class ResumeVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    profile_id: str
    job_id: Optional[str] = None
    version_name: str
    summary: str
    selected_facts: List[Dict[str, Any]]
    ats_score: Optional[int] = None
    pdf_storage_path: Optional[str] = None
    is_master: bool
    created_at: datetime
    # Enriched job info
    job_title: Optional[str] = None
    job_company: Optional[str] = None


class ResumeExportResponse(BaseModel):
    resume_id: str
    version_name: str
    ats_score: Optional[int]
    plain_text: str
    html_content: str

