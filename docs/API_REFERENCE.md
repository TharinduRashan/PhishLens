# PhishLens — REST API Reference (v1.0)

Base URL: `http://localhost:8000/api/v1`

---

## 1. Endpoints

### 1.1 Platform Health Check
`GET /api/v1/health`

Returns operational telemetry, uptime, database connectivity, and registered capabilities.

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "PhishLens platform services are operational.",
  "data": {
    "status": "healthy",
    "version": "0.1.0",
    "environment": "development",
    "uptime_seconds": 128.45,
    "database": "connected",
    "timestamp": "2026-11-22T03:00:00Z",
    "capabilities": [
      "url_inspection_v1",
      "email_heuristics_v1",
      "ssrf_protection_guard",
      "threat_database_sync"
    ]
  },
  "timestamp": "2026-11-22T03:00:00Z"
}
```

---

### 1.2 URL Phishing Inspection
`POST /api/v1/scan/url`

Submits target URL for validation and zero-fetch inspection.

**Request Payload:**
```json
{
  "url": "https://secure-login-portal-auth.top/signin",
  "deep_analysis": false
}
```

**Response `501 Not Implemented` (Phase 1 Queued Engine):**
```json
{
  "status": "not_implemented",
  "message": "Phase 1: Project Foundation. URL successfully passed syntax and SSRF security validations. The real-time threat intelligence and ML detection engine will be activated in Phase 2.",
  "data": {
    "scan_id": "8f9024f2-95f2-4e4b-88a9-46294719bb44",
    "target": "https://secure-login-portal-auth.top/signin",
    "scan_type": "URL",
    "risk_level": "UNKNOWN",
    "threat_score": 0,
    "summary": "URL 'secure-login-portal-auth.top' successfully validated against SSRF and syntax rules...",
    "indicators": [
      {
        "code": "HEUR-HOMOGRAPH",
        "name": "IDN Homograph & Punycode Check",
        "severity": "HIGH",
        "description": "Checks for visually ambiguous unicode homoglyphs mimicking authentic brands.",
        "detected": false
      }
    ],
    "engine_status": "engine_pending",
    "phase": "Phase 1: Project Foundation",
    "analyzed_at": "2026-11-22T03:00:00Z"
  },
  "timestamp": "2026-11-22T03:00:00Z"
}
```

**Error `422 Unprocessable Content` (SSRF Violation):**
```json
{
  "status": "error",
  "error_type": "SSRFProtectionViolation",
  "message": "SSRF Shield Block: Target host '127.0.0.1' is an internal or local reserved host."
}
```

---

### 1.3 Email Phishing Analysis
`POST /api/v1/scan/email`

Submits email content and headers for spear-phishing heuristics.

**Request Payload:**
```json
{
  "content": "Urgent: Your corporate credentials have expired. Verify immediately at https://...",
  "sender": "security@alert-corp-support.com",
  "subject": "Action Required"
}
```

**Response `501 Not Implemented`:**
```json
{
  "status": "not_implemented",
  "message": "Phase 1: Project Foundation. Email sanitized and tokenized. Natural Language Phishing heuristics and DKIM/SPF verifiers are scheduled for Phase 2.",
  "data": {
    "scan_id": "31b2ec51-3fa4-498c-8f19-b2230198aa77",
    "target": "Action Required",
    "scan_type": "EMAIL",
    "risk_level": "UNKNOWN",
    "threat_score": 0,
    "indicators": [],
    "engine_status": "engine_pending",
    "phase": "Phase 1: Project Foundation",
    "analyzed_at": "2026-11-22T03:00:00Z"
  },
  "timestamp": "2026-11-22T03:00:00Z"
}
```

---

### 1.4 List Scan Records
`GET /api/v1/scans?limit=20&offset=0&risk_level=MALICIOUS`

Retrieves audit history with optional risk and type filtering.

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Retrieved 10 scan records.",
  "data": {
    "total": 1428,
    "items": [
      {
        "id": "scan-9f81a-2026",
        "target": "https://paypa1-account-verification-auth.top/signin",
        "scan_type": "URL",
        "risk_level": "MALICIOUS",
        "threat_score": 94,
        "engine_status": "flagged",
        "created_at": "2026-11-22T02:45:10Z"
      }
    ]
  },
  "timestamp": "2026-11-22T03:00:00Z"
}
```
