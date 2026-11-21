from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    SAFE = "SAFE"
    SUSPICIOUS = "SUSPICIOUS"
    MALICIOUS = "MALICIOUS"
    UNKNOWN = "UNKNOWN"


class ScanType(str, Enum):
    URL = "URL"
    EMAIL = "EMAIL"


class IndicatorSeverity(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class DetectionIndicator(BaseModel):
    """Specific technical check or behavioral heuristic indicator."""
    code: str = Field(..., description="Unique machine-readable indicator code")
    name: str = Field(..., description="Human-readable indicator label")
    severity: IndicatorSeverity = Field(..., description="Severity classification")
    description: str = Field(..., description="Technical breakdown of the indicator")
    detected: bool = Field(..., description="Whether the heuristic flagged on the target")


class URLScanRequest(BaseModel):
    """Payload to initiate a URL phishing inspection."""
    url: str = Field(
        ...,
        min_length=3,
        max_length=2048,
        description="Target URL to be analyzed for phishing and malware threats",
        json_schema_extra={"example": "https://secure-login-verify-account.example.com"}
    )
    deep_analysis: bool = Field(
        default=False,
        description="Whether to perform secondary reputation intelligence scans"
    )


class EmailScanRequest(BaseModel):
    """Payload to initiate email threat and phishing heuristics analysis."""
    content: str = Field(
        ...,
        min_length=5,
        max_length=100_000,
        description="Raw or formatted email text / headers to analyze",
        json_schema_extra={"example": "Urgent: Your account has been suspended. Click here to verify credentials immediately."}
    )
    sender: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Optional sender address extracted from From: header"
    )
    subject: Optional[str] = Field(
        default=None,
        max_length=500,
        description="Optional subject line extracted from Subject: header"
    )


class ScanResultPayload(BaseModel):
    """Detailed threat assessment report for an inspected artifact."""
    scan_id: str = Field(..., description="Unique UUID tracking the scan execution")
    target: str = Field(..., description="Normalized target (sanitized URL or email snippet)")
    scan_type: ScanType = Field(..., description="Inspection modality")
    risk_level: RiskLevel = Field(..., description="Calculated threat verdict")
    threat_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Consolidated risk score from 0 (harmless) to 100 (critical danger)"
    )
    summary: str = Field(..., description="Executive threat overview")
    indicators: List[DetectionIndicator] = Field(
        default_factory=list,
        description="Granular detection indicators and telemetry"
    )
    engine_status: str = Field(
        "engine_pending",
        description="Execution status of the automated analysis pipeline"
    )
    phase: str = Field(
        "Phase 1: Project Foundation",
        description="Current engineering milestone of the PhishLens platform"
    )
    analyzed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp of the analysis execution"
    )


class ScanHistoryItem(BaseModel):
    """Compact summary item for scan history tables and logs."""
    id: str = Field(..., description="Unique scan identifier")
    target: str = Field(..., description="Inspected target (URL or email preview)")
    scan_type: ScanType = Field(..., description="URL or EMAIL")
    risk_level: RiskLevel = Field(..., description="Risk verdict")
    threat_score: int = Field(..., ge=0, le=100, description="Score 0-100")
    engine_status: str = Field(..., description="Analysis status")
    created_at: datetime = Field(..., description="Scan timestamp")


class ScanHistoryResponse(BaseModel):
    """Paginated or listed scan history records."""
    total: int = Field(..., description="Total available records")
    items: List[ScanHistoryItem] = Field(default_factory=list, description="List of scan records")
