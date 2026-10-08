"""Ashby Public Postings API Adapter."""

import logging
from typing import List, Optional
import httpx

from app.services.discovery.html_utils import clean_html_to_text
from app.services.interfaces.job_discovery import DiscoveredJobPayload, JobDiscoveryProvider

logger = logging.getLogger("opporbyte.discovery.ashby")


class AshbyDiscoveryProvider(JobDiscoveryProvider):
    @property
    def provider_name(self) -> str:
        return "ashby"

    def _determine_work_mode(self, title: str, location: str, description: str) -> str:
        combined = f"{title} {location} {description[:300]}".lower()
        if "remote" in combined:
            return "remote"
        if "hybrid" in combined:
            return "hybrid"
        return "on-site"

    async def fetch_recent_postings(
        self,
        board_token: str,
        limit: int = 50,
    ) -> List[DiscoveredJobPayload]:
        url = f"https://api.ashbyhq.com/posting-api/job-board/{board_token}"
        postings: List[DiscoveredJobPayload] = []

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                if response.status_code != 200:
                    logger.warning(f"Ashby board '{board_token}' returned {response.status_code}")
                    return []

                data = response.json()
                raw_jobs = data.get("jobs", [])

                for item in raw_jobs[:limit]:
                    job_id = str(item.get("id", ""))
                    title = item.get("title", "").strip()
                    loc_name = item.get("location", "Unknown Location") or "Unknown Location"
                    content_html = item.get("descriptionHtml", "")
                    clean_desc = clean_html_to_text(content_html)
                    job_url = item.get("jobUrl", f"https://jobs.ashbyhq.com/{board_token}/{job_id}")

                    work_mode = self._determine_work_mode(title, loc_name, clean_desc)

                    payload = DiscoveredJobPayload(
                        source_name=self.provider_name,
                        external_id=job_id,
                        title=title,
                        company=board_token.capitalize(),
                        location=loc_name,
                        work_mode=work_mode,
                        employment_type=item.get("employmentType", "Full-time") or "Full-time",
                        description=clean_desc if clean_desc else f"{title} at {board_token}",
                        url=job_url,
                        posted_at=item.get("publishedAt"),
                        raw_metadata={"raw_ashby_id": job_id, "board_token": board_token},
                    )
                    postings.append(payload)

        except Exception as exc:
            logger.error(f"Error fetching Ashby postings for '{board_token}': {exc}")

        return postings

    async def get_posting_details(
        self,
        board_token: str,
        job_id: str,
    ) -> Optional[DiscoveredJobPayload]:
        # Ashby returns full detail in the main list; filter from list or return payload
        jobs = await self.fetch_recent_postings(board_token, limit=100)
        for j in jobs:
            if j.external_id == job_id:
                return j
        return None
