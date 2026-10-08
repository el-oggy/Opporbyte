"""Abstract interface and schemas for the ATS-Friendly Tailored Resume Engine."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class TailoredResumeSection(BaseModel):
    title: str
    items: List[Dict[str, Any]]
    source_fact_ids: List[str] = Field(
        default_factory=list,
        description="Traceability links to verified candidate facts. No hallucinations allowed.",
    )


class TailoredResumePayload(BaseModel):
    profile_id: str
    job_id: Optional[str] = None
    target_role_title: str
    professional_summary: str
    skills_section: List[str]
    experience_section: List[TailoredResumeSection]
    projects_section: List[TailoredResumeSection]
    education_section: List[Dict[str, Any]]
    verified_fact_provenance: List[str]
    estimated_ats_score: Optional[int] = None


class ResumeGenerationEngine(ABC):
    """Contract for strictly fact-grounded resume tailoring and PDF generation."""

    @abstractmethod
    async def extract_facts_from_document(
        self,
        document_bytes: bytes,
        filename: str,
    ) -> List[Dict[str, Any]]:
        """Extract candidate facts from an uploaded master document for human verification."""
        pass

    @abstractmethod
    async def tailor_resume_for_job(
        self,
        job_description: str,
        profile_id: str,
        verified_facts: List[Dict[str, Any]],
    ) -> TailoredResumePayload:
        """Select relevant verified facts and synthesize ATS-compliant content without inventing data."""
        pass

    @abstractmethod
    async def compile_to_ats_pdf(
        self,
        resume_payload: TailoredResumePayload,
        template_id: str = "standard_ats",
    ) -> bytes:
        """Render tailored resume into machine-readable clean PDF."""
        pass
