"""Abstract interface for Recruiter Discovery and Personalized Outreach."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, Field


class RecruiterContact(BaseModel):
    name: str
    company: str
    title: str
    email: Optional[EmailStr] = None
    linkedin_url: Optional[str] = None
    source_attribution: str


class OutreachEmailDraft(BaseModel):
    recipient_email: str
    recipient_name: str
    subject: str
    body_text: str
    referenced_job_title: str
    matching_highlights: List[str]
    ready_for_review: bool = True


class RecruiterOutreachEngine(ABC):
    """Contract for ethical, permitted recruiter discovery and email drafting."""

    @abstractmethod
    async def find_public_contacts(
        self,
        company_name: str,
        department: str,
    ) -> List[RecruiterContact]:
        """Discover publicly published contact information for relevant talent partners."""
        pass

    @abstractmethod
    async def draft_personalized_message(
        self,
        contact: RecruiterContact,
        job_id: str,
        profile_id: str,
    ) -> OutreachEmailDraft:
        """Compose tailored, professional introduction email based on verified candidate achievements."""
        pass

    @abstractmethod
    async def send_approved_email(
        self,
        draft: OutreachEmailDraft,
        user_mailbox_auth: Dict[str, Any],
    ) -> bool:
        """Send message via user's authorized mailbox after human approval."""
        pass
