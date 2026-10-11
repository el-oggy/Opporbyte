"""Durable control extensions for the existing JobSource and TaskRun models."""

from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class SyncSource(Base):
    __tablename__ = "sync_sources"

    source_id: Mapped[str] = mapped_column(String(36), ForeignKey("job_sources.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    provider: Mapped[str] = mapped_column(String(30))
    board_token: Mapped[str] = mapped_column(String(64))
    # Configuration only: no scheduler is activated by setting this field.
    sync_interval_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    active_task_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    lease_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    next_request_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class SyncRun(Base):
    __tablename__ = "sync_runs"

    task_id: Mapped[str] = mapped_column(String(36), ForeignKey("task_runs.id", ondelete="CASCADE"), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True)
    source_id: Mapped[str] = mapped_column(String(36), ForeignKey("sync_sources.source_id", ondelete="CASCADE"), index=True)
    profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("career_profiles.id", ondelete="CASCADE"))
    idempotency_key: Mapped[str] = mapped_column(String(64))
    cancel_requested: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    __table_args__ = (UniqueConstraint("user_id", "idempotency_key", name="uq_sync_user_key"),)
