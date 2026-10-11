"""Greenhouse public Boards API adapter; failures are observable to the caller."""
from app.services.discovery.html_utils import clean_html_to_text
from app.services.discovery.public_api import fetch_json, normalize_batch
from app.services.interfaces.job_discovery import DiscoveredJobPayload, JobDiscoveryProvider


class GreenhouseDiscoveryProvider(JobDiscoveryProvider):
    @property
    def provider_name(self):
        return "greenhouse"

    def _determine_work_mode(self, title, location, description):
        text = f"{title} {location} {description[:300]}".lower()
        return "remote" if "remote" in text else "hybrid" if "hybrid" in text else "on-site"

    def _normalize(self, item, board_token):
        title = item.get("title", "").strip()
        location = (item.get("location") or {}).get("name") or "Unknown Location"
        description = clean_html_to_text(item.get("content") or "")
        job_id = item.get("id")
        return DiscoveredJobPayload(
            source_name=self.provider_name, external_id=job_id, title=title,
            company=board_token.capitalize(), location=location,
            work_mode=self._determine_work_mode(title, location, description),
            employment_type="Full-time", description=description or f"{title} at {board_token}",
            url=item.get("absolute_url") or f"https://boards.greenhouse.io/{board_token}/jobs/{job_id}",
            posted_at=item.get("updated_at"),
            raw_metadata={"raw_greenhouse_id": job_id, "board_token": board_token},
        )

    async def fetch_recent_postings(self, board_token, limit=50):
        data = await fetch_json(f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs?content=true")
        return normalize_batch(data.get("jobs") if isinstance(data, dict) else None, limit,
                               lambda item: self._normalize(item, board_token))

    async def get_posting_details(self, board_token, job_id):
        item = await fetch_json(f"https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs/{job_id}")
        return self._normalize(item, board_token)
