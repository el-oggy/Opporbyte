"""Application entity model managing application lifecycle with deduplication enforcement."""

import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Application(Base):
    """Job application tracking record.
    
    Enforces a strict unique constraint on (user_id, job_id) so that a user
    cannot create duplicate applications for the same job, even if that job
    matches both the Semiconductor and Software career profiles.
    """
    __tablename__ = "applications"

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
    resume_version_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("resume_versions.id", ondelete="SET NULL"),
        nullable=True,
    )

    # Status: "draft", "ready_for_review", "approved", "submitted", "interviewing", "offer", "rejected"
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False, index=True)

    # Submission method: "manual", "authorized_portal", "recruiter_outreach", "email"
    submission_method: Mapped[str] = mapped_column(String(50), default="manual", nullable=False)
    submitted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

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

    # CRITICAL: Prevent duplicate applications to the same canonical job across all profiles
    __table_args__ = (
        UniqueConstraint("user_id", "job_id", name="uq_user_job_application"),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="applications")
    job: Mapped["Job"] = relationship("Job", back_populates="applications")
    profile: Mapped["CareerProfile"] = relationship("CareerProfile", back_populates="applications")
    resume_version: Mapped[Optional["ResumeVersion"]] = relationship(
        "ResumeVersion", back_populates="applications"
    )

    def __repr__(self) -> str:
        return f"<Application id={self.id} job_id={self.job_id} status={self.status}>"
