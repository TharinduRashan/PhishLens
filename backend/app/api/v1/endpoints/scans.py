from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.core.security import InvalidURLError, SSRFProtectionError
from app.db.session import get_db
from app.models.scan import ScanRecord
from app.schemas.common import APIResponse
from app.schemas.scan import (
    URLScanRequest,
    EmailScanRequest,
    ScanResultPayload,
    ScanHistoryResponse,
    ScanHistoryItem,
    RiskLevel,
    ScanType,
)
from app.services.url_service import URLInspectionService
from app.services.email_service import EmailInspectionService

router = APIRouter()


@router.post(
    "/scan/url",
    response_model=APIResponse[ScanResultPayload],
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Submit URL for Threat Inspection",
    description=(
        "Validates and sanitizes a target URL against SSRF and syntax rules. "
        "In Phase 1, validates request structures and returns HTTP 501 Not Implemented "
        "with details on the queued Phase 2 detection engine."
    ),
    responses={
        501: {"description": "Detection engine scheduled for Phase 2 integration"},
        400: {"description": "Invalid URL structure or scheme"},
        422: {"description": "Target address blocked by SSRF protection guardrails"},
    }
)
def scan_url(
    payload: URLScanRequest,
    db: Session = Depends(get_db)
):
    try:
        inspection = URLInspectionService.process_url_submission(
            raw_url=payload.url,
            deep_analysis=payload.deep_analysis
        )
    except SSRFProtectionError as ssrf_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"SSRF Shield Block: {str(ssrf_err)}"
        )
    except InvalidURLError as url_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"URL Validation Failed: {str(url_err)}"
        )

    # In Phase 1: Return explicit HTTP 501 Not Implemented response
    # clearly communicating that active heuristics are scheduled for Phase 2.
    response_data = {
        "status": "not_implemented",
        "message": (
            "Phase 1: Project Foundation. URL successfully passed syntax and SSRF security validations. "
            "The real-time threat intelligence and ML detection engine will be activated in Phase 2."
        ),
        "data": inspection,
        "timestamp": inspection["analyzed_at"],
    }
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content=response_data
    )


@router.post(
    "/scan/email",
    response_model=APIResponse[ScanResultPayload],
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Submit Email Content for Phishing Analysis",
    description=(
        "Accepts email body and headers, sanitizes contents, and returns HTTP 501 Not Implemented "
        "indicating that Phase 1 foundation is active and NLP heuristics are queued for Phase 2."
    ),
    responses={
        501: {"description": "NLP detection engine scheduled for Phase 2 integration"},
        400: {"description": "Invalid email payload"},
    }
)
def scan_email(
    payload: EmailScanRequest,
    db: Session = Depends(get_db)
):
    if not payload.content or len(payload.content.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email content must contain at least 5 characters."
        )

    inspection = EmailInspectionService.process_email_submission(
        content=payload.content,
        sender=payload.sender,
        subject=payload.subject
    )

    response_data = {
        "status": "not_implemented",
        "message": (
            "Phase 1: Project Foundation. Email sanitized and tokenized. "
            "Natural Language Phishing heuristics and DKIM/SPF verifiers are scheduled for Phase 2."
        ),
        "data": inspection,
        "timestamp": inspection["analyzed_at"],
    }
    return JSONResponse(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        content=response_data
    )


@router.get(
    "/scans",
    response_model=APIResponse[ScanHistoryResponse],
    summary="List Scan Records",
    description="Retrieves persisted or demonstrated scan history records."
)
def list_scans(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    risk_level: Optional[RiskLevel] = None,
    scan_type: Optional[ScanType] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ScanRecord)
    if risk_level:
        query = query.filter(ScanRecord.risk_level == risk_level.value)
    if scan_type:
        query = query.filter(ScanRecord.scan_type == scan_type.value)

    total = query.count()
    records = query.order_by(ScanRecord.created_at.desc()).offset(offset).limit(limit).all()

    items = [
        ScanHistoryItem(
            id=r.id,
            target=r.target,
            scan_type=ScanType(r.scan_type),
            risk_level=RiskLevel(r.risk_level),
            threat_score=r.threat_score,
            engine_status=r.engine_status,
            created_at=r.created_at
        )
        for r in records
    ]

    return APIResponse(
        status="success",
        message=f"Retrieved {len(items)} scan records.",
        data=ScanHistoryResponse(total=total, items=items)
    )
