"""Pydantic schemas for Discovered Jobs and AI Match evaluations."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    source_id: Optional[str] = None
    external_id: Optional[str] = None
    canonical_hash: str
    title: str
    company: str
    location: str
    employment_type: str
    work_mode: str
    description: str
    url: str
    created_at: datetime


class JobDiscoveryRequest(BaseModel):
    provider: str = Field("greenhouse", description="ATS provider name: greenhouse, ashby, lever")
    board_token: str = Field(..., description="Target company board slug (e.g. cloudflare, stripe, datadog)")
    limit: int = Field(30, ge=1, le=100)


class JobDiscoveryResponse(BaseModel):
    success: bool
    new_jobs_count: int
    duplicates_skipped_count: int
    provider: str
    board_token: str
    message: str


class MatchEvidenceSchema(BaseModel):
    eligibility: Dict[str, Any]
    matched_skills: List[str]
    missing_critical_skills: List[str]
    explanation: str
    score_breakdown: Dict[str, Any]


class JobMatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    job_id: str
    profile_id: str
    overall_score: int
    required_skills_score: int
    experience_score: int
    alignment_score: int
    preferences_score: int
    classification: str
    match_evidence: Dict[str, Any]
    reviewed_at: Optional[datetime] = None
    created_at: datetime
    job: Optional[JobResponse] = None


class MatchEvaluationRequest(BaseModel):
    profile_type: str = Field("semiconductor", description="Domain profile: semiconductor or software")
