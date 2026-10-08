"""ResumeVersion model for ATS-tailored and master resume generation."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class ResumeVersion(Base):
    """Generated or customized resume version grounded in verified facts."""
    __tablename__ = "resume_versions"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    profile_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("career_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    version_name: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    selected_facts: Mapped[List[Dict[str, Any]]] = mapped_column(
        JSON, default=list, nullable=False
    )
    ats_score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    pdf_storage_path: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    is_master: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    profile: Mapped["CareerProfile"] = relationship("CareerProfile", back_populates="resumes")
    job: Mapped[Optional["Job"]] = relationship("Job", back_populates="resumes")
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="resume_version"
    )

    def __repr__(self) -> str:
        return f"<ResumeVersion id={self.id} name={self.version_name}>"
