"""Shared public API errors and per-record isolation; no arbitrary URL fetching."""

import logging
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import httpx
from app.services.interfaces.job_discovery import DiscoveredJobPayload

logger = logging.getLogger("opporbyte.discovery")


class ProviderFailure(Exception):
    def __init__(self, code: str, retryable: bool = False, retry_after: float = 0):
        self.code, self.retryable, self.retry_after = code, retryable, retry_after
        super().__init__(code)


class DiscoveryBatch(list[DiscoveredJobPayload]):
    def __init__(self, jobs=(), rejected_count: int = 0):
        super().__init__(jobs)
        self.rejected_count = rejected_count


def retry_delay(value: str | None) -> float:
    if not value:
        return 0
    try:
        return max(0, float(value))
    except ValueError:
        try:
            return max(0, (parsedate_to_datetime(value) - datetime.now(timezone.utc)).total_seconds())
        except (ValueError, TypeError, OverflowError):
            return 0


async def fetch_json(url: str):
    try:
        # HTTPX does not follow redirects by default: redirects cannot escape the fixed host.
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=False) as client:
            response = await client.get(url)
        if response.status_code != 200:
            raise ProviderFailure(f"http_{response.status_code}", response.status_code == 429 or response.status_code >= 500,
                                  retry_delay(response.headers.get("Retry-After")))
        try:
            return response.json()
        except ValueError as exc:
            raise ProviderFailure("invalid_response") from exc
    except httpx.TimeoutException as exc:
        raise ProviderFailure("source_timeout", True) from exc
    except httpx.RequestError as exc:
        raise ProviderFailure("source_unavailable", True) from exc


def normalize_batch(items, limit, normalize):
    if not isinstance(items, list):
        raise ProviderFailure("invalid_response")
    batch = DiscoveryBatch()
    for item in items[:limit]:
        try:
            batch.append(normalize(item))
        except (ValueError, TypeError, AttributeError, KeyError):
            batch.rejected_count += 1
    if batch.rejected_count:
        logger.warning("source_records_rejected count=%s", batch.rejected_count)
    return batch
