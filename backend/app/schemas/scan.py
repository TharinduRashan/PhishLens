from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "LOW"
    SUSPICIOUS = "SUSPICIOUS"
    HIGH = "HIGH"
    # Legacy / alias compatibility
    SAFE = "SAFE"
    MALICIOUS = "MALICIOUS"
    UNKNOWN = "UNKNOWN"


class ScanType(str, Enum):
    URL = "URL"
    EMAIL = "EMAIL"


class IndicatorSeverity(str, Enum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RuleIndicatorSchema(BaseModel):
    """Detection rule finding returned by the analysis engine."""
    rule_id: str = Field(..., description="Unique rule code, e.g. URL_001")
    name: str = Field(..., description="Human-readable rule name")
    severity: str = Field(..., description="Severity level: low, medium, high, critical")
    description: str = Field(..., description="Detailed technical description")
    score: int = Field(..., description="Score contribution")
    evidence: str = Field(..., description="Matched token or parameter value")


class URLScanRequest(BaseModel):
    """Payload to initiate a URL phishing inspection."""
    url: str = Field(
        ...,
        min_length=1,
        max_length=4096,
        description="Target URL to be analyzed for phishing and malware threats",
        json_schema_extra={"example": "https://secure-login-verify-account.example.com"}
    )
    deep_analysis: bool = Field(
        default=False,
        description="Optional flag for secondary analysis passes"
    )


class URLScanResponse(BaseModel):
    """Direct, transparent Phase 2 URL analysis report."""
    scan_id: str = Field(..., description="Unique UUID tracking the scan execution")
    url: str = Field(..., description="Target normalized URL")
    status: str = Field("completed", description="Execution status of analysis")
    risk_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Calculated risk score from 0 (lowest) to 100 (highest)"
    )
    risk_level: str = Field(..., description="Risk classification: LOW, SUSPICIOUS, or HIGH")
    analysis_type: str = Field("rule_based", description="Engine pipeline type")
    summary: str = Field(..., description="Objective heuristic finding overview")
    features: Dict[str, Any] = Field(
        default_factory=dict,
        description="Structured lexical and structural extracted features"
    )
    indicators: List[RuleIndicatorSchema] = Field(
        default_factory=list,
        description="Individual triggered detection indicators"
    )
    analyzed_at: str = Field(..., description="ISO-8601 UTC timestamp")


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


class DetectionIndicator(BaseModel):
    """Specific technical check or behavioral heuristic indicator (for Email/Legacy)."""
    code: str = Field(..., description="Unique machine-readable indicator code")
    name: str = Field(..., description="Human-readable indicator label")
    severity: str = Field(..., description="Severity classification")
    description: str = Field(..., description="Technical breakdown of the indicator")
    detected: bool = Field(..., description="Whether the heuristic flagged on the target")


class ScanResultPayload(BaseModel):
    """Legacy or wrapped scan result payload."""
    scan_id: str = Field(..., description="Unique UUID tracking the scan execution")
    target: str = Field(..., description="Normalized target (sanitized URL or email snippet)")
    scan_type: ScanType = Field(..., description="Inspection modality")
    risk_level: str = Field(..., description="Calculated threat verdict")
    threat_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="Consolidated risk score from 0 to 100"
    )
    summary: str = Field(..., description="Executive threat overview")
    indicators: List[DetectionIndicator] = Field(
        default_factory=list,
        description="Granular detection indicators and telemetry"
    )
    engine_status: str = Field("completed", description="Execution status")
    phase: str = Field("Phase 2: URL Detection Engine", description="Milestone")
    analyzed_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="UTC timestamp"
    )


class ScanHistoryItem(BaseModel):
    """Compact summary item for scan history tables and logs."""
    id: str = Field(..., description="Unique scan identifier")
    target: str = Field(..., description="Inspected target (URL or email preview)")
    scan_type: ScanType = Field(..., description="URL or EMAIL")
    risk_level: str = Field(..., description="Risk verdict")
    threat_score: int = Field(..., ge=0, le=100, description="Score 0-100")
    engine_status: str = Field(..., description="Analysis status")
    created_at: datetime = Field(..., description="Scan timestamp")


class ScanHistoryResponse(BaseModel):
    """Paginated or listed scan history records."""
    total: int = Field(..., description="Total available records")
    items: List[ScanHistoryItem] = Field(default_factory=list, description="List of scan records")
