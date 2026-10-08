"""Profile service for managing Semiconductor and Software career profiles."""

from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.profile import CareerProfile
from app.schemas.profile import (
    ProfileTypeEnum,
    ProfileUpdate,
    SEMICONDUCTOR_DEFAULT_INTERESTS,
    SOFTWARE_DEFAULT_INTERESTS,
)


class ProfileService:
    @staticmethod
    def get_profiles_for_user(db: Session, user_id: str) -> List[CareerProfile]:
        """Retrieve all career profiles for a given user."""
        return (
            db.query(CareerProfile)
            .filter(CareerProfile.user_id == user_id)
            .order_by(CareerProfile.created_at.asc())
            .all()
        )

    @staticmethod
    def get_profile_by_type(
        db: Session, user_id: str, profile_type: str
    ) -> Optional[CareerProfile]:
        """Fetch a specific career profile by type (semiconductor or software)."""
        return (
            db.query(CareerProfile)
            .filter(
                CareerProfile.user_id == user_id,
                CareerProfile.profile_type == profile_type.lower(),
            )
            .first()
        )

    @staticmethod
    def update_profile(
        db: Session, user_id: str, profile_type: str, data: ProfileUpdate
    ) -> Optional[CareerProfile]:
        """Update fields on a specific profile while ensuring strict profile isolation."""
        profile = ProfileService.get_profile_by_type(db, user_id, profile_type)
        if not profile:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        # Handle projects serialization if needed
        if "projects" in update_dict and update_dict["projects"] is not None:
            update_dict["projects"] = [
                p.model_dump() if hasattr(p, "model_dump") else p
                for p in data.projects
            ]
        # Handle salary_expectation serialization
        if "salary_expectation" in update_dict and update_dict["salary_expectation"] is not None:
            update_dict["salary_expectation"] = (
                data.salary_expectation.model_dump()
                if hasattr(data.salary_expectation, "model_dump")
                else update_dict["salary_expectation"]
            )

        for field, value in update_dict.items():
            setattr(profile, field, value)

        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile

    @staticmethod
    def ensure_default_profiles(db: Session, user_id: str) -> List[CareerProfile]:
        """Ensure both Semiconductor and Software profiles exist for a user."""
        profiles = []
        for p_type, title, summary, interests in [
            (
                ProfileTypeEnum.SEMICONDUCTOR.value,
                "Semiconductor & Hardware Systems",
                "Specialized profile targeting VLSI, RTL Design, FPGA, and ASIC engineering roles.",
                SEMICONDUCTOR_DEFAULT_INTERESTS,
            ),
            (
                ProfileTypeEnum.SOFTWARE.value,
                "Software Engineering & Systems",
                "Specialized profile targeting Frontend, Backend, Full Stack, and Systems roles.",
                SOFTWARE_DEFAULT_INTERESTS,
            ),
        ]:
            existing = (
                db.query(CareerProfile)
                .filter(
                    CareerProfile.user_id == user_id,
                    CareerProfile.profile_type == p_type,
                )
                .first()
            )
            if not existing:
                new_profile = CareerProfile(
                    user_id=user_id,
                    profile_type=p_type,
                    title=title,
                    summary=summary,
                    target_job_titles=interests,
                    technical_skills=[],
                    experience_level="Mid-level",
                    projects=[],
                    preferred_locations=[],
                    work_preference=["remote", "hybrid"],
                    employment_type=["full-time"],
                    salary_expectation={"min_salary": 0, "currency": "USD", "target_salary": 0},
                    excluded_companies=[],
                    matching_threshold=75,
                )
                db.add(new_profile)
                db.commit()
                db.refresh(new_profile)
                profiles.append(new_profile)
            else:
                profiles.append(existing)
        return profiles
