"""Test CareerProfile management and profile isolation."""

from app.core.config import settings
from app.schemas.profile import (
    SEMICONDUCTOR_DEFAULT_INTERESTS,
    SOFTWARE_DEFAULT_INTERESTS,
)


def test_list_profiles(client, auth_headers):
    """Test retrieving all profiles returns both Semiconductor and Software."""
    response = client.get(f"{settings.API_V1_STR}/profiles", headers=auth_headers)
    assert response.status_code == 200
    profiles = response.json()
    assert len(profiles) == 2
    types = {p["profile_type"] for p in profiles}
    assert "semiconductor" in types
    assert "software" in types


def test_get_semiconductor_profile_defaults(client, auth_headers):
    """Verify Semiconductor profile contains default target interests without prepopulating qualifications."""
    response = client.get(
        f"{settings.API_V1_STR}/profiles/semiconductor", headers=auth_headers
    )
    assert response.status_code == 200
    profile = response.json()
    assert profile["profile_type"] == "semiconductor"
    # Interests should match specification
    assert set(SEMICONDUCTOR_DEFAULT_INTERESTS).issubset(set(profile["target_job_titles"]))
    # No personal qualifications should be invented or prepopulated
    assert profile["technical_skills"] == []
    assert profile["projects"] == []


def test_get_software_profile_defaults(client, auth_headers):
    """Verify Software profile contains default target interests without prepopulating qualifications."""
    response = client.get(
        f"{settings.API_V1_STR}/profiles/software", headers=auth_headers
    )
    assert response.status_code == 200
    profile = response.json()
    assert profile["profile_type"] == "software"
    assert set(SOFTWARE_DEFAULT_INTERESTS).issubset(set(profile["target_job_titles"]))
    assert profile["technical_skills"] == []
    assert profile["projects"] == []


def test_profile_isolation_and_independent_persistence(client, auth_headers):
    """Verify editing the Semiconductor profile does NOT affect the Software profile."""
    # 1. Update Semiconductor profile
    semi_update = {
        "title": "Principal RTL & Verification Lead",
        "technical_skills": ["SystemVerilog", "UVM", "Synopsys Design Compiler", "Verilator"],
        "experience_level": "Senior",
        "matching_threshold": 85,
        "salary_expectation": {"min_salary": 160000, "target_salary": 190000, "currency": "USD"},
    }
    semi_res = client.put(
        f"{settings.API_V1_STR}/profiles/semiconductor",
        json=semi_update,
        headers=auth_headers,
    )
    assert semi_res.status_code == 200
    updated_semi = semi_res.json()
    assert updated_semi["title"] == "Principal RTL & Verification Lead"
    assert "SystemVerilog" in updated_semi["technical_skills"]
    assert updated_semi["matching_threshold"] == 85

    # 2. Check Software profile remains isolated and unchanged
    soft_res = client.get(
        f"{settings.API_V1_STR}/profiles/software", headers=auth_headers
    )
    assert soft_res.status_code == 200
    soft_profile = soft_res.json()
    # Skills must still be empty, title must still be original
    assert soft_profile["title"] == "Software Engineering & Systems"
    assert soft_profile["technical_skills"] == []
    assert soft_profile["matching_threshold"] == 75

    # 3. Update Software profile independently
    soft_update = {
        "title": "Staff Full Stack & Distributed Systems Engineer",
        "technical_skills": ["Next.js", "FastAPI", "PostgreSQL", "Tailwind CSS", "Redis"],
        "experience_level": "Staff",
        "matching_threshold": 90,
    }
    soft_put_res = client.put(
        f"{settings.API_V1_STR}/profiles/software",
        json=soft_update,
        headers=auth_headers,
    )
    assert soft_put_res.status_code == 200
    updated_soft = soft_put_res.json()
    assert updated_soft["title"] == "Staff Full Stack & Distributed Systems Engineer"
    assert "Next.js" in updated_soft["technical_skills"]
    assert updated_soft["matching_threshold"] == 90

    # 4. Re-verify Semiconductor profile did not get affected by Software profile changes
    recheck_semi = client.get(
        f"{settings.API_V1_STR}/profiles/semiconductor", headers=auth_headers
    ).json()
    assert recheck_semi["title"] == "Principal RTL & Verification Lead"
    assert "SystemVerilog" in recheck_semi["technical_skills"]
    assert "Next.js" not in recheck_semi["technical_skills"]
    assert recheck_semi["matching_threshold"] == 85
