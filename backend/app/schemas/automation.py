"""Only fixed public ATS providers and board identifiers are configurable."""

from typing import Literal
from pydantic import BaseModel, Field


class SourceConfiguration(BaseModel):
    provider: Literal["greenhouse", "ashby", "lever"]
    board_token: str = Field(pattern=r"^[A-Za-z0-9_-]{1,64}$")
    rate_limit_per_minute: int = Field(default=30, ge=1, le=60)
    sync_interval_minutes: int | None = Field(default=None, ge=15, le=10080)
    is_active: bool = True


class SyncRequest(BaseModel):
    source_id: str
    profile_type: Literal["software", "semiconductor"]
    limit: int = Field(default=25, ge=1, le=100)
    idempotency_key: str = Field(min_length=8, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
