"""Real normalization code, mocked HTTP transport; never contacts a board."""
import httpx
import pytest
from app.services.discovery.ashby import AshbyDiscoveryProvider
from app.services.discovery.greenhouse import GreenhouseDiscoveryProvider
from app.services.discovery.lever import LeverDiscoveryProvider
from app.services.discovery.public_api import ProviderFailure


@pytest.mark.asyncio
@pytest.mark.parametrize("provider,body", [
    (GreenhouseDiscoveryProvider(), {"jobs": [{"id": 1, "title": " Engineer ", "location": {"name": "Remote"}, "content": "<p>React &amp; TypeScript</p>"}, {"title": ""}]}),
    (AshbyDiscoveryProvider(), {"jobs": [{"id": "1", "title": "Engineer", "location": "Remote", "descriptionHtml": "<p>React &amp; TypeScript</p>", "isRemote": True}, {"title": ""}]}),
    (LeverDiscoveryProvider(), [{"id": "1", "text": "Engineer", "categories": {"location": "Remote"}, "description": "<p>React &amp; TypeScript</p>"}, {"text": ""}]),
])
async def test_adapters_normalize_and_isolate_bad_records(provider, body, monkeypatch):
    async def get(self, url, **kwargs):
        assert url.startswith("https://") and "fixture-board" in url
        return httpx.Response(200, json=body)
    monkeypatch.setattr(httpx.AsyncClient, "get", get)
    batch = await provider.fetch_recent_postings("fixture-board")
    assert len(batch) == 1 and batch.rejected_count == 1
    assert batch[0].title == "Engineer" and batch[0].work_mode == "remote"
    assert batch[0].description == "React & TypeScript"


@pytest.mark.asyncio
@pytest.mark.parametrize("status,retryable", [(404, False), (429, True), (503, True), (302, False)])
async def test_http_failures_are_not_empty_success(status, retryable, monkeypatch):
    async def get(self, url, **kwargs):
        return httpx.Response(status, headers={"Retry-After": "30"})
    monkeypatch.setattr(httpx.AsyncClient, "get", get)
    with pytest.raises(ProviderFailure) as raised:
        await GreenhouseDiscoveryProvider().fetch_recent_postings("fixture-board")
    assert raised.value.retryable is retryable and raised.value.code == f"http_{status}"
    assert raised.value.retry_after == 30


@pytest.mark.asyncio
async def test_timeout_and_malformed_envelope(monkeypatch):
    async def timeout(self, url, **kwargs):
        raise httpx.ReadTimeout("fixture timeout")
    monkeypatch.setattr(httpx.AsyncClient, "get", timeout)
    with pytest.raises(ProviderFailure, match="source_timeout"):
        await LeverDiscoveryProvider().fetch_recent_postings("fixture-board")
    async def malformed(self, url, **kwargs):
        return httpx.Response(200, json={"not_jobs": []})
    monkeypatch.setattr(httpx.AsyncClient, "get", malformed)
    with pytest.raises(ProviderFailure, match="invalid_response"):
        await AshbyDiscoveryProvider().fetch_recent_postings("fixture-board")
