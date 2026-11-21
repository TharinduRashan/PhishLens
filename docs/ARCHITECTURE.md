# PhishLens — Architecture Specification (Phase 2)

**Tagline:** *See the threat behind the link.*  
**Milestone:** Phase 2 — Deterministic URL Detection Engine

---

## 1. System Overview

PhishLens is an enterprise-grade phishing detection and threat intelligence platform built for modern security teams. Rather than naively fetching and executing untrusted links (which introduces Remote Code Execution, malware delivery, and SSRF hazards), PhishLens operates on a **Zero-Fetch Sandbox** paradigm.

In Phase 2, the placeholder HTTP 501 endpoint has been superseded by a **deterministic, local, zero-network rule-based detection engine**:

```
[ User Submitted URL ]
           │
           ▼
[ URLParser ] (Strict RFC 3986 Parsing, IDNA/Punycode, Port & Scheme Validation)
           │
           ▼
[ FeatureExtractor ] (Extracts 14 Lexical & Structural Vectors)
   ├─ Distinguishes Hostname vs. Path vs. Query Strings
   ├─ Counts Lengths, Subdomains, Percent-Encodings, Special Characters
   └─ Maps Documented Suspicious Security Keywords & Brand Tokens
           │
           ▼
[ RuleEngine ] (Evaluates 14 Independent Configurable Detection Rules)
   ├─ URL_001: IP Address Host (Score: 25)
   ├─ URL_002: Userinfo @ Authority Obfuscation (Score: 25)
   ├─ URL_003: Punycode / IDN Host (Score: 15)
   ├─ URL_004: Excessive URL Length (Score: 10-15)
   ├─ URL_005: Abnormal Hostname Depth & Subdomains (Score: 15)
   ├─ URL_006: Multiple Hostname Hyphens (Score: 15-20)
   ├─ URL_007: Suspicious Keywords in Hostname (Score: 20)
   ├─ URL_008: Suspicious Keywords in Path/Query (Score: 5)
   ├─ URL_009: Targeted Brand in Hostname (Score: 25)
   ├─ URL_010: URL Shortener Service (Score: 10)
   ├─ URL_011: Insecure HTTP Protocol (Score: 10)
   ├─ URL_012: Non-Standard Web Port (Score: 15)
   ├─ URL_013: High Percent-Encoding Density (Score: 10)
   └─ URL_014: High Special Character Density (Score: 10)
           │
           ▼
[ RiskScorer ] (Dampening Curve, Clamping to [0, 100], Objective Summary)
   ├─ 0–24:   LOW RISK
   ├─ 25–59:  SUSPICIOUS
   └─ 60–100: HIGH RISK
           │
           ▼
[ Database Record & Real-Time API Response (HTTP 200 OK) ]
```

---

## 2. Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── health.py        # System health & telemetry
│   │       │   └── scans.py         # POST /scan/url (200), POST /scan/email (501), GET /scans
│   │       └── api.py
│   ├── core/
│   │   ├── config.py                # Environment settings & SSRF blocked ranges
│   │   └── security.py              # Log sanitization & hashing
│   ├── db/
│   │   └── session.py               # SQLite / PostgreSQL auto-fallback sessionmaker
│   ├── models/
│   │   └── scan.py                  # ScanRecord & ThreatIndicatorRecord ORM models
│   ├── schemas/
│   │   ├── common.py                # APIResponse envelope & HealthResponse
│   │   └── scan.py                  # URLScanRequest, URLScanResponse, RuleIndicatorSchema
│   ├── services/
│   │   ├── detection/               # Phase 2 Deterministic URL Engine
│   │   │   ├── url_parser.py        # Strict parsing, IDNA normalization, port validation
│   │   │   ├── feature_extractor.py # 14 lexical & structural vectors
│   │   │   ├── rule_engine.py       # Independent rule evaluators & weights
│   │   │   ├── risk_scorer.py       # Boundary scoring & non-exaggerated summaries
│   │   │   └── analyzer.py          # Decoupled engine orchestrator
│   │   ├── email_service.py         # Email heuristics preprocessor
│   │   └── url_service.py           # Service adapter layer
│   └── main.py                      # FastAPI lifespan, CORS, and exception handlers
└── tests/
    ├── test_detection_engine.py     # Parser, features, rules, scoring & zero-network proof
    ├── test_scans.py                # API endpoint HTTP responses & validation
    ├── test_health.py               # Health probe checks
    └── test_api_endpoints.py        # Route unit tests
```

---

## 3. The 14 Extracted Feature Vectors

| # | Feature Name | Type | Description |
|---|---|---|---|
| 1 | `url_length` | Integer | Total length of canonical normalized URL |
| 2 | `hostname_length` | Integer | Total character length of domain/host |
| 3 | `num_subdomains` | Integer | Count of subdomain levels preceding root domain |
| 4 | `is_ip_address` | Boolean | `true` if host is raw IPv4 or IPv6 address |
| 5 | `is_https` | Boolean | `true` if scheme is `https`, `false` if `http` |
| 6 | `has_at_symbol` | Boolean | `true` if userinfo or `@` authority symbol is present |
| 7 | `suspicious_keywords` | Object | Keyword occurrences mapped to `in_hostname`, `in_path`, `in_query` |
| 8 | `is_shortened_url` | Boolean | Matches known shortening services (bit.ly, t.co, etc.) |
| 9 | `has_punycode` | Boolean | Detects IDN encoding (`xn--` or converted non-ASCII) |
| 10 | `num_special_characters` | Integer | Count of delimiter and special symbols |
| 11 | `num_percent_encoded` | Integer | Count of `%xx` escape sequences in target |
| 12 | `has_unusual_port` | Boolean | `true` if explicit port is outside standard 80/443 |
| 13 | `hostname_hyphens` | Integer | Count of hyphens (`-`) embedded in the host label |
| 14 | `suspicious_brand_keywords` | Object | High-value brand names in `in_hostname`, `in_path`, `in_query` |

---

## 4. Scoring Methodology & Boundaries

The risk scoring engine produces an integer score bounded strictly between $0$ and $100$.

### Threshold Classifications
- **0 – 24 (LOW RISK):** Minimal or baseline indicators observed. Does not guarantee safety.
- **25 – 59 (SUSPICIOUS):** Notable structural anomalies (e.g. shortening service, unusual port, hyphen stuffing).
- **60 – 100 (HIGH RISK):** Compounded severe threats (e.g. IP host, `@` authority spoofing, brand targeting).

### Diminishing Returns Dampening
When the raw indicator sum exceeds 60, dampening is applied to avoid saturation from overlapping rules:
$$\text{Score} = \min\left(100, 60 + \lfloor (\text{RawSum} - 60) \times 0.85 \rfloor\right)$$

---

## 5. Security & Zero-Network Guarantee

- **Zero Outbound Connections:** The analyzer never opens TCP sockets, never resolves DNS records via system resolvers, and never renders DOM trees.
- **Verified Offline Test Suite:** Automated test `test_zero_network_request_guarantee` monkeypatches `socket.socket`, `socket.gethostbyname`, `socket.create_connection`, and `urllib.request.urlopen` to raise an assertion error if any network operation is attempted.
