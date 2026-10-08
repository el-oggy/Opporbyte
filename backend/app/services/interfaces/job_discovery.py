"""Abstract interface definitions for future Job Discovery integrations."""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class DiscoveredJobPayload(BaseModel):
    """Normalized payload produced by job discovery providers."""
    source_name: str
    external_id: str
    title: str
    company: str
    location: str
    work_mode: str  # remote, hybrid, on-site
    employment_type: str
    description: str
    url: str
    posted_at: Optional[str] = None
    raw_metadata: Dict[str, Any] = {}


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
