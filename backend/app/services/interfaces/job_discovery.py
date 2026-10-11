"""Abstract interface definitions for future Job Discovery integrations."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
from urllib.parse import urlsplit


class DiscoveredJobPayload(BaseModel):
    """Normalized payload produced by job discovery providers."""
    source_name: str
    external_id: str = Field(min_length=1, max_length=255)
    title: str = Field(min_length=1, max_length=255)
    company: str = Field(min_length=1, max_length=255)
    location: str = Field(min_length=1, max_length=255)
    work_mode: str  # remote, hybrid, on-site
    employment_type: str
    description: str
    url: str
    posted_at: Optional[str] = None
    raw_metadata: Dict[str, Any] = Field(default_factory=dict)

    @field_validator("external_id", "title", "company", "location", mode="before")
    @classmethod
    def clean_required_text(cls, value):
        if value is None:
            raise ValueError("Missing required posting field")
        return str(value).strip()

    @field_validator("url")
    @classmethod
    def public_job_url(cls, value):
        parsed = urlsplit(value)
        if len(value) > 1024 or parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError("Posting URL must be public HTTPS")
        return value


class JobDiscoveryProvider(ABC):
    """Contract for permitted job board and ATS providers (Greenhouse, Ashby, Lever, etc.)."""

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the ATS or permitted job source."""
        pass

    @abstractmethod
    async def fetch_recent_postings(
        self,
        board_token: str,
        limit: int = 50,
    ) -> List[DiscoveredJobPayload]:
        """Fetch active job postings using permitted API endpoints."""
        pass

    @abstractmethod
    async def get_posting_details(
        self,
        board_token: str,
        job_id: str,
    ) -> Optional[DiscoveredJobPayload]:
        """Retrieve full structured job description."""
        pass
