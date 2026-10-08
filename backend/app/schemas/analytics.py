"""Schemas for Analytics and Telemetry reporting."""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class TaskRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    task_type: str
    status: str
    parameters: Optional[Dict[str, Any]] = None
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None


class AnalyticsSummaryResponse(BaseModel):
    total_jobs: int
    source_distribution: Dict[str, int]
    profile_type: str
    total_matches: int
    strong_matches: int
    potential_matches: int
    low_matches: int
    average_match_score: float
    total_resumes: int
    average_ats_score: float
    application_pipeline: Dict[str, int]
    recent_tasks: List[TaskRunResponse]
