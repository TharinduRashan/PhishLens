import json
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


def test_url_scan_phase_1_response(db_session):
    """Verify URL submission returns Phase 1 501 Not Implemented with structured preview."""
    req = URLScanRequest(url="https://secure-portal-update.com/login", deep_analysis=False)
    response = scan_url(payload=req, db=db_session)
    assert response.status_code == 501
    payload = json.loads(response.body.decode("utf-8"))
    assert payload["status"] == "not_implemented"
    assert "data" in payload
    assert payload["data"]["target"] == "https://secure-portal-update.com/login"
    assert payload["data"]["engine_status"] == "engine_pending"
    assert len(payload["data"]["indicators"]) >= 4


def test_ssrf_prevention_loopback(db_session):
    """Ensure localhost and loopback targets are rejected by SSRF guard."""
    req = URLScanRequest(url="http://127.0.0.1:8080/admin")
    with pytest.raises(HTTPException) as exc:
        scan_url(payload=req, db=db_session)
    assert exc.value.status_code == 422
    assert "SSRF Shield Block" in exc.value.detail


def test_ssrf_prevention_private_network(db_session):
    """Ensure RFC1918 private targets are rejected by SSRF guard."""
    req = URLScanRequest(url="http://192.168.1.1/router")
    with pytest.raises(HTTPException) as exc:
        scan_url(payload=req, db=db_session)
    assert exc.value.status_code == 422
    assert "SSRF Shield Block" in exc.value.detail


def test_ssrf_prevention_cloud_metadata(db_session):
    """Ensure AWS/GCP cloud metadata IP (169.254.169.254) is rejected."""
    req = URLScanRequest(url="http://169.254.169.254/latest/meta-data/")
    with pytest.raises(HTTPException) as exc:
        scan_url(payload=req, db=db_session)
    assert exc.value.status_code == 422
    assert "SSRF Shield Block" in exc.value.detail


def test_invalid_protocol_rejected(db_session):
    """Ensure dangerous protocols like file:// or ftp:// are blocked."""
    req = URLScanRequest(url="file:///etc/passwd")
    with pytest.raises(HTTPException) as exc:
        scan_url(payload=req, db=db_session)
    assert exc.value.status_code == 400
    assert "URL Validation Failed" in exc.value.detail


def test_email_scan_phase_1_response(db_session):
    """Verify email submission triggers Phase 1 501 with structured telemetry."""
    req = EmailScanRequest(
        content="Dear customer, your bank credentials have expired. Click here to confirm identity.",
        sender="security@alert-online-bank.com",
        subject="Action Required: Account Restricted"
    )
    response = scan_email(payload=req, db=db_session)
    assert response.status_code == 501
    payload = json.loads(response.body.decode("utf-8"))
    assert payload["status"] == "not_implemented"
    assert payload["data"]["scan_type"] == "EMAIL"
    assert payload["data"]["engine_status"] == "engine_pending"


def test_email_scan_empty_validation(db_session):
    """Verify empty or ultra-short email triggers Pydantic schema validation error."""
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        EmailScanRequest(content="hi")


def test_scans_list_endpoint(db_session):
    """Verify GET /api/v1/scans returns valid schema structure."""
    res = list_scans(limit=10, offset=0, db=db_session)
    assert res.status == "success"
    assert hasattr(res.data, "items")
    assert hasattr(res.data, "total")
