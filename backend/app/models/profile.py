"""CareerProfile entity model supporting independent Semiconductor and Software profiles."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List
from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CareerProfile(Base):
    __tablename__ = "career_profiles"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Profile type: "semiconductor" or "software"
    profile_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=True, default="")

    # Core Career Preferences & Configuration
    target_job_titles: Mapped[List[str]] = mapped_column(
        JSON, default=list, nullable=False
    )
    technical_skills: Mapped[List[str]] = mapped_column(
        JSON, default=list, nullable=False
    )
    experience_level: Mapped[str] = mapped_column(
        String(50), default="Mid-level", nullable=False
    )
    projects: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSON, default=list, nullable=False
    )
    preferred_locations: Mapped[List[str]] = mapped_column(
        JSON, default=list, nullable=False
    )
    work_preference: Mapped[List[str]] = mapped_column(
        JSON, default=lambda: ["remote", "hybrid"], nullable=False
    )
    employment_type: Mapped[List[str]] = mapped_column(
        JSON, default=lambda: ["full-time"], nullable=False
    )
    salary_expectation: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        default=lambda: {"min_salary": 0, "currency": "USD", "target_salary": 0},
        nullable=False,
    )
    excluded_companies: Mapped[List[str]] = mapped_column(
        JSON, default=list, nullable=False
    )
    matching_threshold: Mapped[int] = mapped_column(
        Integer, default=75, nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Table constraints: unique profile per user and profile_type
    __table_args__ = (
        UniqueConstraint("user_id", "profile_type", name="uq_user_profile_type"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="profiles")
    profile_facts: Mapped[list["ProfileFact"]] = relationship(
        "ProfileFact", back_populates="profile", cascade="all, delete-orphan"
    )
    matches: Mapped[list["JobMatch"]] = relationship(
        "JobMatch", back_populates="profile", cascade="all, delete-orphan"
    )
    resumes: Mapped[list["ResumeVersion"]] = relationship(
        "ResumeVersion", back_populates="profile", cascade="all, delete-orphan"
    )
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="profile"
    )

    def __repr__(self) -> str:
        return f"<CareerProfile id={self.id} type={self.profile_type}>"
