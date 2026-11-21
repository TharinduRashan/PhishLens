import pytest
from fastapi import HTTPException
from app.api.v1.endpoints.scans import scan_url, scan_email, list_scans
from app.db.session import SessionLocal
from app.schemas.scan import URLScanRequest, EmailScanRequest


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_url_scan_phase_2_response(db_session):
    """Verify URL submission returns Phase 2 HTTP 200 OK with deterministic analysis."""
    req = URLScanRequest(url="https://secure-portal-update.com/login", deep_analysis=False)
    response = scan_url(payload=req, db=db_session)
    # Returns dictionary/model corresponding to URLScanResponse
    assert "scan_id" in response
    assert response["status"] == "completed"
    assert response["url"] == "https://secure-portal-update.com/login"
    assert "risk_score" in response
    assert response["risk_level"] in ("LOW", "SUSPICIOUS", "HIGH")
    assert response["analysis_type"] == "rule_based"
    assert "features" in response
    assert "indicators" in response
    assert len(response["indicators"]) > 0


def test_invalid_scheme_rejected(db_session):
    """Ensure dangerous non-http protocols trigger 400 Bad Request."""
    req = URLScanRequest(url="file:///etc/passwd")
    with pytest.raises(HTTPException) as exc:
        scan_url(payload=req, db=db_session)
    assert exc.value.status_code == 400
    assert "Unsupported Scheme" in exc.value.detail


def test_invalid_port_rejected(db_session):
    """Ensure out-of-range port numbers trigger 400 Bad Request."""
    req = URLScanRequest(url="http://example.com:99999/test")
    with pytest.raises(HTTPException) as exc:
        scan_url(payload=req, db=db_session)
    assert exc.value.status_code == 400
    assert "Invalid Port" in exc.value.detail


def test_malformed_url_rejected(db_session):
    """Ensure malformed target triggers 400 Bad Request."""
    req = URLScanRequest(url="https://")
    with pytest.raises(HTTPException) as exc:
        scan_url(payload=req, db=db_session)
    assert exc.value.status_code == 400


def test_email_scan_phase_1_response(db_session):
    """Verify email submission triggers 501 until Phase 3 integration."""
    req = EmailScanRequest(
        content="Dear customer, your bank credentials have expired. Click here to confirm identity.",
        sender="security@alert-online-bank.com",
        subject="Action Required: Account Restricted"
    )
    response = scan_email(payload=req, db=db_session)
    assert response.status_code == 501
    import json
    payload = json.loads(response.body.decode("utf-8"))
    assert payload["status"] == "not_implemented"
    assert payload["data"]["scan_type"] == "EMAIL"


def test_email_scan_empty_validation(db_session):
    """Verify empty or ultra-short email triggers Pydantic schema validation error."""
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        EmailScanRequest(content="hi")


def test_scans_list_endpoint(db_session):
    """Verify GET /api/v1/scans returns valid schema structure and reflects real scans."""
    # First submit a scan
    req = URLScanRequest(url="https://paypal-verify-notice.com/auth")
    scan_url(payload=req, db=db_session)

    res = list_scans(limit=10, offset=0, db=db_session)
    assert res.status == "success"
    assert hasattr(res.data, "items")
    assert res.data.total >= 1
