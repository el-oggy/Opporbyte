"""JobSource, Job, and JobMatch models for job discovery and AI matching."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from sqlalchemy import (
    Boolean,
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


class JobSource(Base):
    """Permitted job source provider registry (Greenhouse, Ashby, Lever, etc.)."""
    __tablename__ = "job_sources"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    base_url: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    rate_limit_per_minute: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    last_polled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    jobs: Mapped[list["Job"]] = relationship("Job", back_populates="source")

    def __repr__(self) -> str:
        return f"<JobSource name={self.name} active={self.is_active}>"


class Job(Base):
    """Canonical job posting entity with deduplication hashing."""
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    source_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("job_sources.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    external_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    canonical_hash: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    company: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    employment_type: Mapped[str] = mapped_column(String(50), default="Full-time", nullable=False)
    work_mode: Mapped[str] = mapped_column(String(50), default="remote", nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    url: Mapped[str] = mapped_column(String(1024), nullable=False)
    raw_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    source: Mapped[Optional["JobSource"]] = relationship("JobSource", back_populates="jobs")
    matches: Mapped[list["JobMatch"]] = relationship(
        "JobMatch", back_populates="job", cascade="all, delete-orphan"
    )
    resumes: Mapped[list["ResumeVersion"]] = relationship(
        "ResumeVersion", back_populates="job"
    )
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="job"
    )

    def __repr__(self) -> str:
        return f"<Job id={self.id} title={self.title} company={self.company}>"


class JobMatch(Base):
    """AI compatibility and relevance evaluation linking a Job to a CareerProfile."""
    __tablename__ = "job_matches"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    job_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    profile_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("career_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Heuristic scoring components (0-100)
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)
    required_skills_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # Weight 40%
    experience_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)        # Weight 25%
    alignment_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)         # Weight 20%
    preferences_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)       # Weight 15%

    # Classification: "strong" (80-100), "potential" (60-79), "low" (0-59)
    classification: Mapped[str] = mapped_column(String(50), nullable=False)

    # Detailed fact-grounded explanation
    match_evidence: Mapped[Dict[str, Any]] = mapped_column(
        JSON,
        default=dict,
        nullable=False,
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("job_id", "profile_id", name="uq_job_profile_match"),
    )

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="matches")
    profile: Mapped["CareerProfile"] = relationship("CareerProfile", back_populates="matches")

    def __repr__(self) -> str:
        return f"<JobMatch job_id={self.job_id} profile_id={self.profile_id} score={self.overall_score}>"
