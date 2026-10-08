"""Lever Public Postings API Adapter."""

import logging
from typing import List, Optional
import httpx

from app.services.interfaces.job_discovery import DiscoveredJobPayload, JobDiscoveryProvider

logger = logging.getLogger("opporbyte.discovery.lever")


class LeverDiscoveryProvider(JobDiscoveryProvider):
    @property
    def provider_name(self) -> str:
        return "lever"

    def _determine_work_mode(self, title: str, location: str, workplace_type: str) -> str:
        combined = f"{title} {location} {workplace_type}".lower()
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
        url = f"https://api.lever.co/v0/postings/{board_token}?mode=json"
        postings: List[DiscoveredJobPayload] = []

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                if response.status_code != 200:
                    logger.warning(f"Lever board '{board_token}' returned {response.status_code}")
                    return []

                raw_jobs = response.json()
                if not isinstance(raw_jobs, list):
                    return []

                for item in raw_jobs[:limit]:
                    job_id = str(item.get("id", ""))
                    title = item.get("text", "").strip()
                    cats = item.get("categories", {})
                    loc_name = cats.get("location", "Unknown Location") or "Unknown Location"
                    workplace_type = item.get("workplaceType", "")
                    description = item.get("descriptionPlain", "") or item.get("description", "")
                    job_url = item.get("hostedUrl", f"https://jobs.lever.co/{board_token}/{job_id}")

                    work_mode = self._determine_work_mode(title, loc_name, workplace_type)

                    payload = DiscoveredJobPayload(
                        source_name=self.provider_name,
                        external_id=job_id,
                        title=title,
                        company=board_token.capitalize(),
                        location=loc_name,
                        work_mode=work_mode,
                        employment_type=cats.get("commitment", "Full-time") or "Full-time",
                        description=description if description else f"{title} at {board_token}",
                        url=job_url,
                        posted_at=str(item.get("createdAt")),
                        raw_metadata={"raw_lever_id": job_id, "board_token": board_token},
                    )
                    postings.append(payload)

        except Exception as exc:
            logger.error(f"Error fetching Lever postings for '{board_token}': {exc}")

        return postings

    async def get_posting_details(
        self,
        board_token: str,
        job_id: str,
    ) -> Optional[DiscoveredJobPayload]:
        url = f"https://api.lever.co/v0/postings/{board_token}/{job_id}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code != 200:
                    return None
                item = res.json()
                cats = item.get("categories", {})
                return DiscoveredJobPayload(
                    source_name=self.provider_name,
                    external_id=str(item.get("id")),
                    title=item.get("text", ""),
                    company=board_token.capitalize(),
                    location=cats.get("location", "Unknown"),
                    work_mode=self._determine_work_mode(item.get("text", ""), cats.get("location", ""), item.get("workplaceType", "")),
                    employment_type=cats.get("commitment", "Full-time") or "Full-time",
                    description=item.get("descriptionPlain", ""),
                    url=item.get("hostedUrl", ""),
                )
        except Exception:
            return None
