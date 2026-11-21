# PhishLens — REST API Reference (v1.0 — Phase 2)

Base URL: `http://localhost:8000/api/v1`

---

## 1. Endpoints

### 1.1 URL Phishing Inspection
`POST /api/v1/scan/url`

Performs deterministic, local, zero-network URL inspection. Evaluates 14 structural features, scores independent rules, and returns an actionable threat assessment report.

**Request Payload:**
```json
{
  "url": "https://secure-login-verify-account.example.com",
  "deep_analysis": false
}
```

**Response `200 OK`:**
```json
{
  "scan_id": "7f8b92d1-4e8c-48a2-9721-998ef2b3a199",
  "url": "https://secure-login-verify-account.example.com",
  "status": "completed",
  "risk_score": 35,
  "risk_level": "SUSPICIOUS",
  "analysis_type": "rule_based",
  "summary": "Moderate risk score (35/100) detected with indicators: Suspicious Security Keywords in Hostname, Multiple Hostname Hyphens. The target exhibits unusual structural or lexical attributes warranting heightened caution.",
  "features": {
    "url_length": 47,
    "hostname_length": 39,
    "num_subdomains": 2,
    "is_ip_address": false,
    "is_https": true,
    "has_at_symbol": false,
    "suspicious_keywords": {
      "in_hostname": ["account", "login", "secure", "verify"],
      "in_path": [],
      "in_query": [],
      "total": 4
    },
    "is_shortened_url": false,
    "has_punycode": false,
    "num_special_characters": 5,
    "num_percent_encoded": 0,
    "has_unusual_port": false,
    "hostname_hyphens": 3,
    "suspicious_brand_keywords": {
      "in_hostname": [],
      "in_path": [],
      "in_query": [],
      "total": 0
    }
  },
  "indicators": [
    {
      "rule_id": "URL_007",
      "name": "Suspicious Security Keywords in Hostname",
      "severity": "high",
      "description": "High-risk security or authentication keywords are embedded directly within the domain name labels.",
      "score": 20,
      "evidence": "Matched keywords in hostname: account, login, secure, verify"
    },
    {
      "rule_id": "URL_006",
      "name": "Multiple Hostname Hyphens",
      "severity": "medium",
      "description": "The hostname contains multiple hyphens, a technique frequently used to simulate official domain combinations.",
      "score": 15,
      "evidence": "Hyphen count in host: 3"
    }
  ],
  "analyzed_at": "2026-11-22T04:15:00.000000+00:00"
}
```

**Error `400 Bad Request` (Unsupported Scheme):**
```json
{
  "detail": "Unsupported Scheme: Unsupported URL scheme 'ftp'. Only HTTP and HTTPS are accepted."
}
```

**Error `400 Bad Request` (Invalid Port):**
```json
{
  "detail": "Invalid Port: Port number 99999 is out of valid range (1–65535)."
}
```

---

### 1.2 Platform Health Check
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
    "uptime_seconds": 320.12,
    "database": "connected",
    "timestamp": "2026-11-22T04:15:00Z",
    "capabilities": [
      "url_inspection_v1",
      "email_heuristics_v1",
      "ssrf_protection_guard",
      "threat_database_sync"
    ]
  },
  "timestamp": "2026-11-22T04:15:00Z"
}
```

---

### 1.3 List Scan Audit Records
`GET /api/v1/scans?limit=20&offset=0&risk_level=HIGH`

Retrieves persisted scan history records saved from user submissions.

**Response `200 OK`:**
```json
{
  "status": "success",
  "message": "Retrieved 10 scan records.",
  "data": {
    "total": 10,
    "items": [
      {
        "id": "7f8b92d1-4e8c-48a2-9721-998ef2b3a199",
        "target": "https://secure-login-verify-account.example.com",
        "scan_type": "URL",
        "risk_level": "SUSPICIOUS",
        "threat_score": 35,
        "engine_status": "completed",
        "created_at": "2026-11-22T04:15:00Z"
      }
    ]
  },
  "timestamp": "2026-11-22T04:15:00Z"
}
```

---

### 1.4 Email Phishing Analysis
`POST /api/v1/scan/email`

*(Queued for future NLP milestone)* Returns `HTTP 501 Not Implemented`.
