from datetime import datetime, timezone
from typing import Generic, Optional, TypeVar
from pydantic import BaseModel, Field

DataT = TypeVar("DataT")


class APIResponse(BaseModel, Generic[DataT]):
    """Standardized response envelope for all PhishLens API endpoints."""
    status: str = Field(..., description="Status indicator: success, error, or pending")
    message: str = Field(..., description="Human-readable status summary")
    data: Optional[DataT] = Field(None, description="Response payload")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC ISO-8601 timestamp"
    )


class HealthResponse(BaseModel):
    """Health check payload."""
    status: str = Field("healthy", description="Application operational status")
    version: str = Field(..., description="Platform semantic version")
    environment: str = Field(..., description="Operational environment")
    uptime_seconds: float = Field(..., description="Backend process uptime in seconds")
    database: str = Field(..., description="Database connectivity status")
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="Server timestamp"
    )
    capabilities: list[str] = Field(
        default_factory=lambda: [
            "url_inspection_v1",
            "email_heuristics_v1",
            "ssrf_protection_guard",
            "threat_database_sync"
        ]
    )
