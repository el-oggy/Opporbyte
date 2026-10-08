"""Unit and integration tests for ATS Resume Tailoring Engine and Zero-Hallucination Guarantee."""

import pytest
from app.core.config import settings
from app.models.job import Job


def test_resume_tailoring_and_zero_hallucination(client, auth_headers, db_session):
    """Verify ATS resume tailoring with strictly verified facts and provenance tracking."""
    # 1. Seed verified facts
    seed_res = client.post(f"{settings.API_V1_STR}/facts/seed", headers=auth_headers)
    assert seed_res.status_code == 200
    all_facts = {f["id"]: f for f in seed_res.json()}

    # 2. Insert target job
    job = Job(
        title="Senior RTL & UVM Verification Engineer",
        company="Silicon Dynamics",
        location="Austin, TX",
        external_id="sd-9912",
        url="https://jobs.example.com/sd-9912",
        description="Looking for an expert in SystemVerilog, UVM, and PCIe architecture.",
        raw_payload={"requirements": ["SystemVerilog", "UVM", "PCIe", "Logic Synthesis", "SVA"]},
        canonical_hash="semi-test-hash-1234",
    )
    db_session.add(job)

    db_session.commit()
    db_session.refresh(job)

    # 3. Tailor resume for Semiconductor profile
    tailor_res = client.post(
        f"{settings.API_V1_STR}/resumes/tailor",
        json={
            "profile_type": "semiconductor",
            "job_id": job.id,
            "version_name": "Silicon Dynamics - Senior RTL Role",
        },
        headers=auth_headers,
    )
    assert tailor_res.status_code == 201
    resume = tailor_res.json()

    assert resume["ats_score"] is not None
    assert resume["ats_score"] >= 65
    assert "Silicon engineering" in resume["summary"]
    assert len(resume["selected_facts"]) > 0

    # ZERO HALLUCINATION INVARIANT TEST:
    # Every single bullet item must map directly to a human-verified fact ID in all_facts
    for item in resume["selected_facts"]:
        fact_id = item["fact_id"]
        assert fact_id in all_facts, f"Hallucinated fact detected! {fact_id} is not in candidate facts repository."
        assert all_facts[fact_id]["verified"] is True, f"Unverified fact included in resume! Fact {fact_id} must be verified."
        assert len(item["source_fact_ids"]) > 0
        assert item["source_fact_ids"][0] == fact_id

    # 4. Test Export Endpoints
    export_res = client.get(f"{settings.API_V1_STR}/resumes/{resume['id']}/export", headers=auth_headers)
    assert export_res.status_code == 200
    export_data = export_res.json()

    assert "PROFESSIONAL SUMMARY" in export_data["plain_text"]
    assert "Silicon Dynamics" in export_data["plain_text"]
    assert "<!DOCTYPE html>" in export_data["html_content"]
    assert "Opporbyte Verified ATS Document" in export_data["html_content"]


def test_resume_requires_verified_facts(client, auth_headers, db_session):
    """Resume tailoring must fail gracefully if no verified facts exist."""
    job = Job(
        title="Full Stack Software Engineer",
        company="CloudScale",
        location="Remote",
        external_id="cs-101",
        url="https://jobs.example.com/cs-101",
        description="FastAPI, React, TypeScript developer needed.",
        raw_payload={"requirements": ["FastAPI", "React", "TypeScript"]},
        canonical_hash="software-test-hash-5678",
    )

    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)

    # Attempt tailoring without seeding any facts
    tailor_res = client.post(
        f"{settings.API_V1_STR}/resumes/tailor",
        json={"profile_type": "software", "job_id": job.id},
        headers=auth_headers,
    )
    assert tailor_res.status_code == 400
    assert "No verified candidate facts found" in tailor_res.json()["detail"]
