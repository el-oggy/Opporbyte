"""Authentication schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class LoginRequest(BaseModel):
    """User credentials for logging in."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Safe user profile response without credentials."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    """JWT response structure."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
