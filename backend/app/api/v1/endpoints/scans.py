import hashlib
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.scan import ScanRecord, ThreatIndicatorRecord
from app.schemas.common import APIResponse
from app.schemas.scan import (
    URLScanRequest,
    URLScanResponse,
    EmailScanRequest,
    ScanResultPayload,
    ScanHistoryResponse,
    ScanHistoryItem,
    RiskLevel,
    ScanType,
)
from app.services.url_service import URLInspectionService
from app.services.email_service import EmailInspectionService
from app.services.detection.url_parser import (
    URLValidationError,
    UnsupportedSchemeError,
    InvalidHostnameError,
    InvalidPortError,
)

router = APIRouter()


@router.post(
    "/scan/url",
    response_model=URLScanResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze URL for Phishing & Threats",
    description=(
        "Executes Phase 2 deterministic, zero-network URL threat analysis. "
        "Extracts structural, lexical, and behavioral features and applies transparent "
        "rule-based risk heuristics."
    ),
    responses={
        200: {
            "description": "Deterministic rule-based analysis completed successfully",
            "model": URLScanResponse,
        },
        400: {"description": "Malformed URL, unsupported scheme, or invalid port"},
        422: {"description": "Validation error or unparseable target"},
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
    except UnsupportedSchemeError as scheme_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported Scheme: {str(scheme_err)}"
        )
    except InvalidPortError as port_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Port: {str(port_err)}"
        )
    except (InvalidHostnameError, URLValidationError) as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"URL Validation Failed: {str(val_err)}"
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unable to process URL: {str(exc)}"
        )

    # Persist real scan audit record to database
    try:
        scan_id = inspection["scan_id"]
        target_url = inspection["url"]
        target_hash = hashlib.sha256(target_url.encode("utf-8")).hexdigest()[:16]

        record = ScanRecord(
            id=scan_id,
            target=target_url,
            target_hash=target_hash,
            scan_type="URL",
            risk_level=inspection["risk_level"],
            threat_score=inspection["risk_score"],
            engine_status=inspection["status"],
            summary=inspection["summary"],
        )
        db.add(record)

        # Store indicators
        for ind in inspection.get("indicators", []):
            db.add(
                ThreatIndicatorRecord(
                    scan_id=scan_id,
                    code=ind["rule_id"],
                    name=ind["name"],
                    severity=ind["severity"].upper(),
                    description=ind["description"],
                    detected=True,
                )
            )
        db.commit()
    except Exception:
        # Non-blocking DB write failure for resilience
        db.rollback()

    return inspection


@router.post(
    "/scan/email",
    response_model=APIResponse[ScanResultPayload],
    status_code=status.HTTP_501_NOT_IMPLEMENTED,
    summary="Submit Email Content for Phishing Analysis",
    description=(
        "Accepts email body and headers, sanitizes contents, and returns HTTP 501 Not Implemented "
        "indicating that NLP email heuristics are queued for future milestone integration."
    ),
    responses={
        501: {"description": "NLP detection engine scheduled for future integration"},
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
            "Email sanitized and tokenized. "
            "Natural Language Phishing heuristics and DKIM/SPF verifiers are scheduled for subsequent integration."
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
    risk_level: Optional[str] = None,
    scan_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(ScanRecord)
    if risk_level and risk_level.upper() != "ALL":
        query = query.filter(ScanRecord.risk_level == risk_level.upper())
    if scan_type and scan_type.upper() != "ALL":
        query = query.filter(ScanRecord.scan_type == scan_type.upper())

    total = query.count()
    records = query.order_by(ScanRecord.created_at.desc()).offset(offset).limit(limit).all()

    items = [
        ScanHistoryItem(
            id=r.id,
            target=r.target,
            scan_type=ScanType.URL if r.scan_type == "URL" else ScanType.EMAIL,
            risk_level=r.risk_level,
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
