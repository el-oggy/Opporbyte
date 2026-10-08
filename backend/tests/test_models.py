"""Test database model constraints, relationships, and application deduplication."""

import pytest
from sqlalchemy.exc import IntegrityError

from app.models.application import Application
from app.models.job import Job, JobSource
from app.models.profile import CareerProfile
from app.models.user import User


def test_prevent_duplicate_application_across_profiles(db_session):
    """Verify that a candidate cannot apply twice to the same canonical job,

    even if the job matched both Semiconductor and Software career profiles.
    """
    user = db_session.query(User).first()
    assert user is not None

    # Fetch user's semiconductor and software profiles
    semi_profile = (
        db_session.query(CareerProfile)
        .filter(CareerProfile.user_id == user.id, CareerProfile.profile_type == "semiconductor")
        .first()
    )
    soft_profile = (
        db_session.query(CareerProfile)
        .filter(CareerProfile.user_id == user.id, CareerProfile.profile_type == "software")
        .first()
    )
    assert semi_profile is not None
    assert soft_profile is not None

    # Create a canonical job that matches both hardware and software domains (e.g. Embedded Firmware Engineer)
    job = Job(
        title="Embedded Systems / Firmware Engineer",
        company="NVIDIA",
        location="Santa Clara, CA",
        canonical_hash="nvidia-embedded-firmware-engineer-santa-clara",
        employment_type="Full-time",
        work_mode="hybrid",
        description="Develop firmware and RTL validation tools.",
        url="https://nvidia.com/jobs/12345",
    )
    db_session.add(job)
    db_session.commit()
    db_session.refresh(job)

    # 1. Create first application linked to the Semiconductor profile
    app_1 = Application(
        user_id=user.id,
        job_id=job.id,
        profile_id=semi_profile.id,
        status="ready_for_review",
        submission_method="manual",
    )
    db_session.add(app_1)
    db_session.commit()

    # 2. Attempt to create a second application for the same job linked to the Software profile
    app_2 = Application(
        user_id=user.id,
        job_id=job.id,
        profile_id=soft_profile.id,
        status="draft",
        submission_method="manual",
    )
    db_session.add(app_2)

    # Must raise IntegrityError due to UniqueConstraint("user_id", "job_id", name="uq_user_job_application")
    with pytest.raises(IntegrityError):
        db_session.commit()

    db_session.rollback()
