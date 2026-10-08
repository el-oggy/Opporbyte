"""Abstract interface and schemas for the AI Matching Engine."""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class MatchClassification(str, Enum):
    STRONG = "strong"        # 80 - 100
    POTENTIAL = "potential"  # 60 - 79
    LOW = "low"              # 0 - 59


class MatchBreakdown(BaseModel):
    """Detailed score breakdown matching the 40/25/20/15 heuristic specification."""
    required_skills_score: int = Field(..., ge=0, le=100, description="Weight: 40%")
    experience_score: int = Field(..., ge=0, le=100, description="Weight: 25%")
    alignment_score: int = Field(..., ge=0, le=100, description="Weight: 20%")
    preferences_score: int = Field(..., ge=0, le=100, description="Weight: 15%")
    overall_score: int = Field(..., ge=0, le=100, description="Weighted composite score")
    classification: MatchClassification


class EligibilityEvaluation(BaseModel):
    """Mandatory gating check prior to scoring."""
    eligible: bool
    requires_human_review: bool
    review_reasons: List[str] = Field(default_factory=list)
    visa_sponsorship_status: Optional[str] = None
    location_compatible: bool = True
    experience_gap_years: Optional[float] = None


class MatchEvaluationResult(BaseModel):
    """Grounded AI evaluation with auditable evidence."""
    job_id: str
    profile_id: str
    eligibility: EligibilityEvaluation
    breakdown: MatchBreakdown
    matched_skills: List[str] = Field(default_factory=list)
    missing_critical_skills: List[str] = Field(default_factory=list)
    matching_projects: List[str] = Field(default_factory=list)
    explanation: str
    raw_ai_metadata: Dict[str, Any] = Field(default_factory=dict)


class AIMatchingEngine(ABC):
    """Contract for AI compatibility and ranking engines (OpenAI, Gemini, local models)."""

    @abstractmethod
    async def evaluate_job_match(
        self,
        job_description: str,
        profile_data: Dict[str, Any],
        verified_facts: List[Dict[str, Any]],
    ) -> MatchEvaluationResult:
        """Evaluate job eligibility and calculate composite heuristic match score."""
        pass

    @abstractmethod
    async def batch_evaluate_jobs(
        self,
        job_ids: List[str],
        profile_id: str,
    ) -> List[MatchEvaluationResult]:
        """Rank multiple jobs against a single career profile."""
        pass
