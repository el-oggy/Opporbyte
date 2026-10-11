"""Lever public Postings API adapter with per-record validation."""
from app.services.discovery.html_utils import clean_html_to_text
from app.services.discovery.public_api import fetch_json, normalize_batch
from app.services.interfaces.job_discovery import DiscoveredJobPayload, JobDiscoveryProvider


class LeverDiscoveryProvider(JobDiscoveryProvider):
    @property
    def provider_name(self):
        return "lever"

    def _normalize(self, item, board_token):
        title = item.get("text", "").strip()
        categories = item.get("categories") or {}
        location = categories.get("location") or "Unknown Location"
        text = f"{title} {location} {item.get('workplaceType', '')}".lower()
        mode = "remote" if "remote" in text else "hybrid" if "hybrid" in text else "on-site"
        job_id = item.get("id")
        return DiscoveredJobPayload(
            source_name=self.provider_name, external_id=job_id, title=title,
            company=board_token.capitalize(), location=location, work_mode=mode,
            employment_type=categories.get("commitment") or "Full-time",
            description=item.get("descriptionPlain") or clean_html_to_text(item.get("description") or "") or f"{title} at {board_token}",
            url=item.get("hostedUrl") or f"https://jobs.lever.co/{board_token}/{job_id}",
            posted_at=str(item["createdAt"]) if item.get("createdAt") is not None else None,
            raw_metadata={"raw_lever_id": job_id, "board_token": board_token},
        )

    async def fetch_recent_postings(self, board_token, limit=50):
        data = await fetch_json(f"https://api.lever.co/v0/postings/{board_token}?mode=json")
        return normalize_batch(data, limit, lambda item: self._normalize(item, board_token))

    async def get_posting_details(self, board_token, job_id):
        item = await fetch_json(f"https://api.lever.co/v0/postings/{board_token}/{job_id}")
        return self._normalize(item, board_token)
