"""Common schemas and API response wrappers."""

from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard unified API response wrapper."""
    success: bool = True
    message: str = "Operation successful"
    data: Optional[T] = None


class HealthCheckResponse(BaseModel):
    """Health check payload."""
    status: str
    app_name: str
    version: str
    environment: str
    database_connected: bool
