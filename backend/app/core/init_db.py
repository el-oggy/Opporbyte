"""Database initialization and single-user bootstrap utility."""

import logging
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.user import User
from app.models.profile import CareerProfile
from app.schemas.profile import (
    SEMICONDUCTOR_DEFAULT_INTERESTS,
    SOFTWARE_DEFAULT_INTERESTS,
    ProfileTypeEnum,
)

logger = logging.getLogger("opporbyte.init_db")
logging.basicConfig(level=logging.INFO)


def init_db(db: Session) -> User:
    """Create tables and bootstrap the initial single-user account and profiles."""
    logger.info("Initializing database schema...")
    Base.metadata.create_all(bind=engine)

    # Check if the primary user already exists
    stmt = select(User).where(User.email == settings.FIRST_USER_EMAIL)
    existing_user = db.scalar(stmt)

    if not existing_user:
        logger.info(f"Creating initial user: {settings.FIRST_USER_EMAIL}")
        first_user = User(
            email=settings.FIRST_USER_EMAIL,
            hashed_password=get_password_hash(settings.FIRST_USER_PASSWORD),
            full_name="Lead Engineer",
            is_active=True,
            is_superuser=True,
        )
        db.add(first_user)
        db.commit()
        db.refresh(first_user)
        user = first_user
    else:
        logger.info(f"Initial user already exists: {existing_user.email}")
        user = existing_user

    # Ensure the two independent career profiles exist
    # 1. Semiconductor profile
    semi_stmt = select(CareerProfile).where(
        CareerProfile.user_id == user.id,
        CareerProfile.profile_type == ProfileTypeEnum.SEMICONDUCTOR.value,
    )
    semi_profile = db.scalar(semi_stmt)
    if not semi_profile:
        logger.info("Creating default Semiconductor career profile...")
        semi_profile = CareerProfile(
            user_id=user.id,
            profile_type=ProfileTypeEnum.SEMICONDUCTOR.value,
            title="Semiconductor & Hardware Systems",
            summary="Specialized profile targeting VLSI, RTL Design, FPGA, and ASIC engineering roles.",
            target_job_titles=SEMICONDUCTOR_DEFAULT_INTERESTS,
            technical_skills=[],  # Not prepopulating personal qualifications
            experience_level="Mid-level",
            projects=[],          # Not prepopulating personal qualifications
            preferred_locations=["Austin, TX", "San Jose, CA", "Bangalore, India", "Remote"],
            work_preference=["remote", "hybrid", "on-site"],
            employment_type=["full-time"],
            salary_expectation={"min_salary": 0, "currency": "USD", "target_salary": 0},
            excluded_companies=[],
            matching_threshold=75,
        )
        db.add(semi_profile)

    # 2. Software profile
    soft_stmt = select(CareerProfile).where(
        CareerProfile.user_id == user.id,
        CareerProfile.profile_type == ProfileTypeEnum.SOFTWARE.value,
    )
    soft_profile = db.scalar(soft_stmt)
    if not soft_profile:
        logger.info("Creating default Software Engineering career profile...")
        soft_profile = CareerProfile(
            user_id=user.id,
            profile_type=ProfileTypeEnum.SOFTWARE.value,
            title="Software Engineering & Systems",
            summary="Specialized profile targeting Frontend, Backend, Full Stack, and Systems roles.",
            target_job_titles=SOFTWARE_DEFAULT_INTERESTS,
            technical_skills=[],  # Not prepopulating personal qualifications
            experience_level="Mid-level",
            projects=[],          # Not prepopulating personal qualifications
            preferred_locations=["Remote", "San Francisco, CA", "New York, NY", "Bangalore, India"],
            work_preference=["remote", "hybrid"],
            employment_type=["full-time"],
            salary_expectation={"min_salary": 0, "currency": "USD", "target_salary": 0},
            excluded_companies=[],
            matching_threshold=75,
        )
        db.add(soft_profile)

    db.commit()
    logger.info("Database bootstrap completed successfully.")
    return user


if __name__ == "__main__":
    with SessionLocal() as db_session:
        init_db(db_session)
