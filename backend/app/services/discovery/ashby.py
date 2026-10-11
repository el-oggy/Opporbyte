"""Ashby public Postings API adapter with per-record validation."""
from app.services.discovery.html_utils import clean_html_to_text
from app.services.discovery.public_api import fetch_json, normalize_batch
from app.services.interfaces.job_discovery import DiscoveredJobPayload, JobDiscoveryProvider


class AshbyDiscoveryProvider(JobDiscoveryProvider):
    @property
    def provider_name(self):
        return "ashby"

    def _normalize(self, item, board_token):
        title = item.get("title", "").strip()
        location = item.get("location") or "Unknown Location"
        description = clean_html_to_text(item.get("descriptionHtml") or "")
        text = f"{title} {location} {description[:300]}".lower()
        mode = "remote" if item.get("isRemote") or "remote" in text else "hybrid" if "hybrid" in text else "on-site"
        job_id = item.get("id")
        return DiscoveredJobPayload(
            source_name=self.provider_name, external_id=job_id, title=title,
            company=board_token.capitalize(), location=location, work_mode=mode,
            employment_type=item.get("employmentType") or "Full-time",
            description=description or f"{title} at {board_token}",
            url=item.get("jobUrl") or f"https://jobs.ashbyhq.com/{board_token}/{job_id}",
            posted_at=item.get("publishedAt"), raw_metadata={"raw_ashby_id": job_id, "board_token": board_token},
        )

    async def fetch_recent_postings(self, board_token, limit=50):
        data = await fetch_json(f"https://api.ashbyhq.com/posting-api/job-board/{board_token}")
        return normalize_batch(data.get("jobs") if isinstance(data, dict) else None, limit,
                               lambda item: self._normalize(item, board_token))

    async def get_posting_details(self, board_token, job_id):
        return next((job for job in await self.fetch_recent_postings(board_token, 100) if job.external_id == job_id), None)
