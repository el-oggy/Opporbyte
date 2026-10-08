"""Abstract interface for Application Automation and Human-in-the-Loop workflows."""

from abc import ABC, abstractmethod
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class ApplicationApprovalStatus(str, Enum):
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED_BY_USER = "rejected_by_user"


class ApplicationPackage(BaseModel):
    """Complete application artifact package ready for human inspection."""
    application_id: str
    job_id: str
    canonical_job_hash: str
    profile_id: str
    resume_version_id: str
    custom_cover_letter: Optional[str] = None
    target_portal_url: str
    approval_status: ApplicationApprovalStatus = ApplicationApprovalStatus.PENDING_APPROVAL
    submitted: bool = False


class ApplicationAutomationEngine(ABC):
    """Contract for human-governed application preparation and authorized submission."""

    @abstractmethod
    async def prepare_application_package(
        self,
        job_id: str,
        profile_id: str,
    ) -> ApplicationPackage:
        """Stage an application package for mandatory candidate review."""
        pass

    @abstractmethod
    async def submit_application(
        self,
        application_id: str,
        user_authorization_token: str,
    ) -> Dict[str, Any]:
        """Submit application strictly via authorized APIs following explicit user approval."""
        pass
