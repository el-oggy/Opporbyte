"""Unit and integration tests for Candidate Facts repository and verification."""

import pytest
from app.core.config import settings


def test_seed_and_list_facts(client, auth_headers):
    """Verify seeding starter facts and listing them with filters."""
    # Seed facts
    seed_res = client.post(f"{settings.API_V1_STR}/facts/seed", headers=auth_headers)
    assert seed_res.status_code == 200
    facts = seed_res.json()
    assert len(facts) >= 6

    # List all facts
    list_res = client.get(f"{settings.API_V1_STR}/facts", headers=auth_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 6

    # Filter by category
    skill_res = client.get(f"{settings.API_V1_STR}/facts?category=skill", headers=auth_headers)
    assert skill_res.status_code == 200
    for fact in skill_res.json():
        assert fact["category"] == "skill"


def test_create_and_verify_fact_lifecycle(client, auth_headers):
    """Test full CRUD lifecycle of candidate facts including verification toggle."""
    # Create an unverified fact
    create_res = client.post(
        f"{settings.API_V1_STR}/facts",
        json={
            "category": "project",
            "title": "Tape-Out of Mixed-Signal ADC",
            "description": "Designed 12-bit SAR ADC in TSMC 28nm, validated SNDR of 68dB in lab silicon testing.",
            "verified": False,
            "source": "manual",
        },
        headers=auth_headers,
    )
    assert create_res.status_code == 201
    fact = create_res.json()
    fact_id = fact["id"]
    assert fact["verified"] is False

    # Human-in-the-loop verification
    update_res = client.put(
        f"{settings.API_V1_STR}/facts/{fact_id}",
        json={"verified": True},
        headers=auth_headers,
    )
    assert update_res.status_code == 200
    assert update_res.json()["verified"] is True

    # Check verified_only filter
    verified_res = client.get(f"{settings.API_V1_STR}/facts?verified_only=true", headers=auth_headers)
    assert verified_res.status_code == 200
    matching = [f for f in verified_res.json() if f["id"] == fact_id]
    assert len(matching) == 1

    # Delete fact
    del_res = client.delete(f"{settings.API_V1_STR}/facts/{fact_id}", headers=auth_headers)
    assert del_res.status_code == 204

    # Verify 404 on deleted fact
    get_res = client.put(
        f"{settings.API_V1_STR}/facts/{fact_id}",
        json={"title": "Updated"},
        headers=auth_headers,
    )
    assert get_res.status_code == 404


def test_extract_facts_from_text(client, auth_headers):
    """Test heuristic parsing of unstructured CV text into candidate facts requiring review."""
    cv_sample = """
    EXPERIENCE
    • Led migration of core services from monolith to Kubernetes microservices, reducing latency by 45%.
    • Authored formal verification suites for AXI-4 interconnect protocol using SystemVerilog assertions.

    SKILLS
    • Python, C++, Verilog, SystemVerilog, Next.js, FastAPI
    """
    extract_res = client.post(
        f"{settings.API_V1_STR}/facts/extract",
        json={"text_content": cv_sample, "source": "test_cv"},
        headers=auth_headers,
    )
    assert extract_res.status_code == 200
    extracted = extract_res.json()
    assert len(extracted) >= 2
    # Extracted facts must require human verification by default
    for fact in extracted:
        assert fact["verified"] is False
