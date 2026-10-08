"""Schemas for Candidate Facts and Fact Verification."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class FactCreate(BaseModel):
    category: str = Field(..., description="Category: skill, experience, education, project, certification, achievement")
    title: str = Field(..., description="Fact headline or title")
    description: str = Field(..., description="Evidentiary detail and verifiable metric")
    verified: bool = Field(True, description="Human verification status")
    source: str = Field("manual", description="Source: manual, master_resume, transcript")


class FactUpdate(BaseModel):
    category: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    verified: Optional[bool] = None


class FactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    category: str
    title: str
    description: str
    verified: bool
    source: str
    created_at: datetime


class FactExtractRequest(BaseModel):
    text_content: str = Field(..., description="Master resume or CV text content to extract verified facts from")
    source: str = Field("master_resume", description="Origin tag")
