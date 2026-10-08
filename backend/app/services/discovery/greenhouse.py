"""Greenhouse Public Boards API Adapter."""

import logging
from typing import Any, Dict, List, Optional
import httpx

from app.services.discovery.html_utils import clean_html_to_text
from app.services.interfaces.job_discovery import DiscoveredJobPayload, JobDiscoveryProvider

logger = logging.getLogger("opporbyte.discovery.greenhouse")


class GreenhouseDiscoveryProvider(JobDiscoveryProvider):
    @property
    def provider_name(self) -> str:
        return "greenhouse"

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
        url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true"
        postings: List[DiscoveredJobPayload] = []

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                if response.status_code != 200:
                    logger.warning(
                        f"Greenhouse board '{board_token}' returned status {response.status_code}"
                    )
                    return []

                data = response.json()
                raw_jobs = data.get("jobs", [])

                for item in raw_jobs[:limit]:
                    job_id = str(item.get("id", ""))
                    title = item.get("title", "").strip()
                    loc_name = item.get("location", {}).get("name", "Unknown Location").strip()
                    content_html = item.get("content", "")
                    clean_desc = clean_html_to_text(content_html)
                    job_url = item.get("absolute_url", f"https://boards.greenhouse.io/{board_token}/jobs/{job_id}")

                    work_mode = self._determine_work_mode(title, loc_name, clean_desc)

                    payload = DiscoveredJobPayload(
                        source_name=self.provider_name,
                        external_id=job_id,
                        title=title,
                        company=board_token.capitalize(),
                        location=loc_name,
                        work_mode=work_mode,
                        employment_type="Full-time",
                        description=clean_desc if clean_desc else f"{title} at {board_token}",
                        url=job_url,
                        posted_at=item.get("updated_at"),
                        raw_metadata={"raw_greenhouse_id": job_id, "board_token": board_token},
                    )
                    postings.append(payload)

        except Exception as exc:
            logger.error(f"Error fetching Greenhouse postings for '{board_token}': {exc}")

        return postings

    async def get_posting_details(
        self,
        board_token: str,
        job_id: str,
    ) -> Optional[DiscoveredJobPayload]:
        url = f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs/{job_id}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code != 200:
                    return None
                item = res.json()
                title = item.get("title", "")
                loc_name = item.get("location", {}).get("name", "Unknown")
                desc = clean_html_to_text(item.get("content", ""))
                return DiscoveredJobPayload(
                    source_name=self.provider_name,
                    external_id=str(item.get("id")),
                    title=title,
                    company=board_token.capitalize(),
                    location=loc_name,
                    work_mode=self._determine_work_mode(title, loc_name, desc),
                    employment_type="Full-time",
                    description=desc,
                    url=item.get("absolute_url", ""),
                    posted_at=item.get("updated_at"),
                )
        except Exception:
            return None
