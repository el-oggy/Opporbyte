"""Tests for AI Matching Engine heuristic weights and domain ranking."""

import pytest
from app.services.matching.heuristic_engine import HeuristicMatchingEngine


@pytest.mark.asyncio
async def test_matching_heuristic_weights_calculation():
    engine = HeuristicMatchingEngine()

    profile_data = {
        "profile_id": "test-semi-profile",
        "profile_type": "semiconductor",
        "target_job_titles": ["RTL Design", "ASIC", "VLSI"],
        "technical_skills": ["SystemVerilog", "UVM", "Synopsys Design Compiler"],
        "experience_level": "Senior",
        "preferred_locations": ["Austin, TX"],
        "work_preference": ["remote", "hybrid"],
        "excluded_companies": [],
        "matching_threshold": 75,
        "company": "AMD",
        "work_mode": "hybrid",
    }

    job_description = (
        "Senior RTL Design Engineer. "
        "Must have extensive experience with SystemVerilog, UVM verification, and Synopsys Design Compiler."
    )

    result = await engine.evaluate_job_match(
        job_description=job_description,
        profile_data=profile_data,
        verified_facts=[],
    )

    # Required skills (40%), Experience (25%), Alignment (20%), Preferences (15%)
    assert result.breakdown.required_skills_score >= 80
    assert result.breakdown.overall_score >= 80
    assert result.breakdown.classification.value == "strong"
    assert "SystemVerilog" in result.matched_skills


@pytest.mark.asyncio
async def test_blacklisted_company_eligibility():
    engine = HeuristicMatchingEngine()

    profile_data = {
        "profile_id": "test-semi-profile",
        "profile_type": "semiconductor",
        "target_job_titles": ["RTL Design"],
        "technical_skills": ["SystemVerilog"],
        "experience_level": "Senior",
        "preferred_locations": [],
        "work_preference": ["remote"],
        "excluded_companies": ["BlacklistedCorp"],
        "matching_threshold": 75,
        "company": "BlacklistedCorp Inc",
        "work_mode": "remote",
    }

    result = await engine.evaluate_job_match(
        job_description="RTL Design Engineer at BlacklistedCorp Inc",
        profile_data=profile_data,
        verified_facts=[],
    )

    assert result.eligibility.eligible is False
    assert result.eligibility.requires_human_review is True
    assert "BlacklistedCorp" in result.eligibility.review_reasons[0]


def test_evaluate_and_get_matches_api(client, auth_headers):
    # 1. Evaluate matches for semiconductor
    eval_res = client.post(
        "/api/v1/matches/evaluate",
        json={"profile_type": "semiconductor"},
        headers=auth_headers,
    )
    assert eval_res.status_code == 200
    assert eval_res.json()["success"] is True

    # 2. Get matches for semiconductor
    semi_matches_res = client.get("/api/v1/matches?profile_type=semiconductor", headers=auth_headers)
    assert semi_matches_res.status_code == 200
    semi_matches = semi_matches_res.json()
    assert len(semi_matches) > 0

    # Top match for semiconductor should be a semiconductor role (e.g. AMD or NVIDIA or Qualcomm)
    top_semi = semi_matches[0]
    assert any(term in top_semi["job"]["title"].lower() for term in ["rtl", "asic", "fpga", "physical"])

    # 3. Evaluate and get matches for software
    client.post(
        "/api/v1/matches/evaluate",
        json={"profile_type": "software"},
        headers=auth_headers,
    )
    soft_matches_res = client.get("/api/v1/matches?profile_type=software", headers=auth_headers)
    assert soft_matches_res.status_code == 200
    soft_matches = soft_matches_res.json()
    assert len(soft_matches) > 0

    # Top match for software should be a software role (e.g. Stripe or Datadog or Cloudflare)
    top_soft = soft_matches[0]
    assert any(term in top_soft["job"]["title"].lower() for term in ["backend", "full stack", "systems", "engineer"])
