"""Unit and integration tests for Application Pipeline and Cross-Profile Deduplication."""

import pytest
from app.core.config import settings
from app.models.job import Job


def test_application_lifecycle_and_cross_profile_dedup(client, auth_headers, db_session):
    """Verify application staging, status progression, and cross-profile deduplication invariant."""
    # 1. Insert a test job
    job = Job(
        title="Hardware Systems & Firmware Engineer",
        company="NexSilicon",
        location="San Jose, CA",
        external_id="nex-402",
        url="https://jobs.example.com/nex-402",
        description="Firmware and digital RTL design role.",
        raw_payload={"requirements": ["C++", "Verilog", "Embedded"]},
        canonical_hash="dual-track-hash-9901",
    )
    db_session.add(job)

    db_session.commit()
    db_session.refresh(job)

    # 2. Stage application under Semiconductor profile
    stage_res = client.post(
        f"{settings.API_V1_STR}/applications",
        json={
            "profile_type": "semiconductor",
            "job_id": job.id,
            "submission_method": "authorized_portal",
            "notes": "Targeting Silicon Architecture group.",
        },
        headers=auth_headers,
    )
    assert stage_res.status_code == 201
    app_data = stage_res.json()
    app_id = app_data["id"]
    assert app_data["status"] == "ready_for_review"
    assert app_data["job_title"] == "Hardware Systems & Firmware Engineer"
    assert app_data["profile_type"] == "semiconductor"

    # 3. CRITICAL INVARIANT TEST:
    # Attempt to stage another application for the SAME job under Software profile
    duplicate_res = client.post(
        f"{settings.API_V1_STR}/applications",
        json={
            "profile_type": "software",
            "job_id": job.id,
            "submission_method": "manual",
            "notes": "Trying software track instead.",
        },
        headers=auth_headers,
    )
    assert duplicate_res.status_code == 400
    assert "Cross-profile deduplication prevented" in duplicate_res.json()["detail"]
    assert "Semiconductor" in duplicate_res.json()["detail"]

    # 4. Human-in-the-Loop Status Updates
    # Approve application
    approve_res = client.put(
        f"{settings.API_V1_STR}/applications/{app_id}",
        json={"status": "approved", "notes": "Approved by candidate for submission"},
        headers=auth_headers,
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "approved"

    # Mark as submitted
    submit_res = client.put(
        f"{settings.API_V1_STR}/applications/{app_id}",
        json={"status": "submitted"},
        headers=auth_headers,
    )
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "submitted"
    assert submit_res.json()["submitted_at"] is not None

    # 5. Check Pipeline Metrics
    metrics_res = client.get(f"{settings.API_V1_STR}/applications/metrics", headers=auth_headers)
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert metrics["submitted"] >= 1
    assert metrics["total"] >= 1

    # 6. Delete application
    del_res = client.delete(f"{settings.API_V1_STR}/applications/{app_id}", headers=auth_headers)
    assert del_res.status_code == 204
