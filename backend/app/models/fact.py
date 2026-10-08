"""CandidateFact and ProfileFact models for verified fact repository."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CandidateFact(Base):
    """Canonical repository of user's verified career facts."""
    __tablename__ = "candidate_facts"

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
    # Category: "skill", "experience", "education", "project", "certification", "achievement"
    category: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    source: Mapped[str] = mapped_column(String(100), default="manual", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="facts")
    profile_associations: Mapped[list["ProfileFact"]] = relationship(
        "ProfileFact", back_populates="fact", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<CandidateFact id={self.id} title={self.title} category={self.category}>"


class ProfileFact(Base):
    """Association linking candidate facts to specific profiles with contextual weighting."""
    __tablename__ = "profile_facts"

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
    fact_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("candidate_facts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    relevance_weight: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    is_highlighted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    __table_args__ = (
        UniqueConstraint("profile_id", "fact_id", name="uq_profile_fact"),
    )

    # Relationships
    profile: Mapped["CareerProfile"] = relationship("CareerProfile", back_populates="profile_facts")
    fact: Mapped["CandidateFact"] = relationship("CandidateFact", back_populates="profile_associations")

    def __repr__(self) -> str:
        return f"<ProfileFact profile_id={self.profile_id} fact_id={self.fact_id}>"
