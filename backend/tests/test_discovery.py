"""Tests for Job Discovery, HTML extraction, and canonical hashing."""

from app.services.discovery.discovery_service import compute_canonical_hash, discovery_service
from app.services.discovery.html_utils import clean_html_to_text


def test_html_cleaner():
    raw_html = "<p>Join our team!<br/>We need <strong>SystemVerilog</strong> &amp; UVM.</p>"
    cleaned = clean_html_to_text(raw_html)
    assert "Join our team!" in cleaned
    assert "SystemVerilog & UVM" in cleaned
    assert "<p>" not in cleaned


def test_canonical_hash_normalization():
    # Company with legal suffix vs without
    hash_1 = compute_canonical_hash("Advanced Micro Devices, Inc.", "RTL Design Engineer", "Austin, TX")
    hash_2 = compute_canonical_hash("advanced micro devices inc", "RTL Design Engineer", "Austin, TX")
    hash_3 = compute_canonical_hash("Advanced Micro Devices", "rtl design engineer", "austin, tx")

    assert hash_1 == hash_2
    assert hash_2 == hash_3


def test_seed_initial_dataset_and_deduplication(db_session):
    # First seed
    count_1 = discovery_service.seed_initial_discovery_dataset(db_session)
    assert count_1 > 0

    # Second seed should detect existing canonical hashes and add 0 duplicates
    count_2 = discovery_service.seed_initial_discovery_dataset(db_session)
    assert count_2 == 0


def test_list_jobs_endpoint(client, auth_headers):
    response = client.get("/api/v1/jobs", headers=auth_headers)
    assert response.status_code == 200
    jobs = response.json()
    assert len(jobs) >= 8

    # Filter by work mode
    remote_res = client.get("/api/v1/jobs?work_mode=remote", headers=auth_headers)
    assert remote_res.status_code == 200
    for j in remote_res.json():
        assert j["work_mode"] == "remote"
