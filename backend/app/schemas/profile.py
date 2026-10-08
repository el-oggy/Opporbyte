"""CareerProfile schemas supporting Semiconductor and Software profiles."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ProfileTypeEnum(str, Enum):
    SEMICONDUCTOR = "semiconductor"
    SOFTWARE = "software"


SEMICONDUCTOR_DEFAULT_INTERESTS = [
    "VLSI",
    "RTL Design",
    "Digital Design",
    "ASIC Design",
    "Design Verification",
    "FPGA",
    "Embedded Systems",
    "Physical Design",
    "DFT",
]

SOFTWARE_DEFAULT_INTERESTS = [
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "Web Development",
    "App Development",
    "Game Development",
    "Software Engineering",
]


class ProjectItem(BaseModel):
    title: str = Field(..., description="Project title")
    description: str = Field(..., description="Project summary and scope")
    technologies: List[str] = Field(default_factory=list, description="List of tools, frameworks, and languages")
    highlights: List[str] = Field(default_factory=list, description="Key measurable outcomes and achievements")


class SalaryExpectation(BaseModel):
    min_salary: int = Field(0, ge=0, description="Minimum acceptable base salary")
    target_salary: int = Field(0, ge=0, description="Target base salary")
    currency: str = Field("USD", description="Currency code (e.g. USD, EUR, INR)")


class ProfileBase(BaseModel):
    title: str
    summary: Optional[str] = ""
    target_job_titles: List[str] = Field(default_factory=list)
    technical_skills: List[str] = Field(default_factory=list)
    experience_level: str = "Mid-level"
    projects: List[ProjectItem] = Field(default_factory=list)
    preferred_locations: List[str] = Field(default_factory=list)
    work_preference: List[str] = Field(default_factory=lambda: ["remote", "hybrid"])
    employment_type: List[str] = Field(default_factory=lambda: ["full-time"])
    salary_expectation: SalaryExpectation = Field(default_factory=SalaryExpectation)
    excluded_companies: List[str] = Field(default_factory=list)
    matching_threshold: int = Field(75, ge=0, le=100)


class ProfileCreate(ProfileBase):
    profile_type: ProfileTypeEnum


class ProfileUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    target_job_titles: Optional[List[str]] = None
    technical_skills: Optional[List[str]] = None
    experience_level: Optional[str] = None
    projects: Optional[List[ProjectItem]] = None
    preferred_locations: Optional[List[str]] = None
    work_preference: Optional[List[str]] = None
    employment_type: Optional[List[str]] = None
    salary_expectation: Optional[SalaryExpectation] = None
    excluded_companies: Optional[List[str]] = None
    matching_threshold: Optional[int] = Field(None, ge=0, le=100)


class ProfileResponse(ProfileBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    profile_type: str
    created_at: datetime
    updated_at: datetime
