"""Add durable source sync controls without altering existing business tables.

Revision ID: 20261011_sync
Revises: 822038d85abc
"""
from alembic import op
import sqlalchemy as sa

revision = "20261011_sync"
down_revision = "822038d85abc"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table("sync_sources",
        sa.Column("source_id", sa.String(36), sa.ForeignKey("job_sources.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("provider", sa.String(30), nullable=False),
        sa.Column("board_token", sa.String(64), nullable=False),
        sa.Column("sync_interval_minutes", sa.Integer(), nullable=True),
        sa.Column("active_task_id", sa.String(36), nullable=True),
        sa.Column("lease_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_request_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_sync_sources_user_id", "sync_sources", ["user_id"])
    op.create_table("sync_runs",
        sa.Column("task_id", sa.String(36), sa.ForeignKey("task_runs.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("source_id", sa.String(36), sa.ForeignKey("sync_sources.source_id", ondelete="CASCADE"), nullable=False),
        sa.Column("profile_id", sa.String(36), sa.ForeignKey("career_profiles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("idempotency_key", sa.String(64), nullable=False),
        sa.Column("cancel_requested", sa.Boolean(), nullable=False),
        sa.UniqueConstraint("user_id", "idempotency_key", name="uq_sync_user_key"),
    )
    op.create_index("ix_sync_runs_user_id", "sync_runs", ["user_id"])
    op.create_index("ix_sync_runs_source_id", "sync_runs", ["source_id"])


def downgrade():
    op.drop_table("sync_runs")
    op.drop_table("sync_sources")
