# PhishLens 🛡️🔍

> **"See the threat behind the link."**

PhishLens is a commercial-grade, AI-powered phishing detection and threat intelligence platform built for modern security teams and vigilant users. Operating under a **Zero-Fetch Sandbox** paradigm, PhishLens neutralizes phishing risks, deobfuscates homoglyph attacks, and evaluates spear-phishing heuristics without triggering remote code execution or exposing infrastructure.

---

## 🚀 Key Capabilities (Phase 2 Live)

- **Deterministic URL Threat Engine**: Fully local, zero-network, sub-millisecond URL inspection using 14 lexical and structural features.
- **Transparent Heuristic Rules**: 14 independent rules with configurable weights, severity classifications, and direct evidence reporting.
- **SSRF Protection Shield**: Strictly offline. Never makes HTTP requests, browser automation, or DNS lookups against target domains.
- **Punycode & IDNA Deobfuscation**: Detects internationalized domain name homoglyphs and `xn--` prefix obfuscation.
- **Granular Keyword Context**: Distinguishes security and brand keywords located in the hostname vs. path vs. query string.
- **Enterprise Telemetry Dashboard**: Visualizes threat distributions, scan velocity timelines, and attack vector ratios using interactive Recharts.
- **Developer-First REST API**: Fully validated Pydantic v2 schemas, typed endpoints, and OpenAPI integration.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Detection Engine** | Pure Python deterministic offline pipeline (`URLParser`, `FeatureExtractor`, `RuleEngine`, `RiskScorer`) |
| **Database** | PostgreSQL (Production) / SQLite auto-fallback (Zero-Config Development) |
| **Testing** | Pytest, Pytest-Asyncio, Unittest (42 passing tests) |

---

## 📐 Monorepo Architecture

```
phishlens/
├── frontend/                     # Next.js 14 App Router, TypeScript, Tailwind
│   ├── src/
│   │   ├── app/                  # Application Routes (/, /dashboard, /scanner, /email-analyzer, /history, /docs)
│   │   ├── components/           # UI Components (ThreatGauge, RiskBadge, IndicatorCard, FeatureInspector)
│   │   └── lib/                  # TypeScript Types, API Handlers, Baseline Datasets
│   ├── package.json
│   └── tailwind.config.ts
├── backend/                      # Python FastAPI Application
│   ├── app/
│   │   ├── api/v1/endpoints/     # REST Endpoints (health, scans)
│   │   ├── core/                 # App Settings & SSRF Security Guardrails
│   │   ├── db/                   # Database Sessions & SQLite Auto-Fallback
│   │   ├── models/               # SQLAlchemy ORM Models (ScanRecord, ThreatIndicatorRecord)
│   │   ├── schemas/              # Pydantic Request & Response Envelopes (URLScanResponse, etc.)
│   │   └── services/
│   │       ├── detection/        # Phase 2 Deterministic URL Threat Engine
│   │       │   ├── url_parser.py        # Strict parsing, IDNA normalization, port validation
│   │       │   ├── feature_extractor.py # 14 lexical & structural vectors
│   │       │   ├── rule_engine.py       # Independent rule evaluators & weights
│   │       │   ├── risk_scorer.py       # Boundary scoring & non-exaggerated summaries
│   │       │   └── analyzer.py          # Decoupled engine orchestrator
│   │       ├── email_service.py  # Email heuristics service
│   │       └── url_service.py    # URL service adapter
│   ├── tests/                    # Pytest Suite (42 Passing Tests)
│   └── requirements.txt
├── docs/                         # Technical Specifications
│   ├── ARCHITECTURE.md           # Zero-Fetch & Security Design
│   └── API_REFERENCE.md          # REST API Specification (Phase 2 Update)
├── README.md
└── .gitignore
```

---

## 🔍 Feature Extraction & Detection Rules

The engine extracts **14 independent features** per URL:
1. `url_length`: Total normalized URL length.
2. `hostname_length`: Character length of the host label.
3. `num_subdomains`: Depth of subdomain nesting.
4. `is_ip_address`: Whether the host is a raw IPv4 or IPv6 address.
5. `is_https`: Whether the connection uses TLS.
6. `has_at_symbol`: Presence of `@` userinfo obfuscation.
7. `suspicious_keywords`: Categorized matches in hostname, path, and query.
8. `is_shortened_url`: Matches against recognized link shortener domains.
9. `has_punycode`: Detection of `xn--` IDNA encoding.
10. `num_special_characters`: Count of delimiter and punctuation symbols.
11. `num_percent_encoded`: Count of `%xx` escape sequences.
12. `has_unusual_port`: Explicit non-standard ports (outside 80/443).
13. `hostname_hyphens`: Number of hyphens in the host.
14. `suspicious_brand_keywords`: Targeted brand tokens in hostname, path, and query.

### Risk Scoring Thresholds
- **0 – 24 (LOW RISK):** No significant indicators. *(Note: Low risk does not prove safety).*
- **25 – 59 (SUSPICIOUS):** Notable structural anomalies warranting caution.
- **60 – 100 (HIGH RISK):** Compounded severe threats. *(Note: High risk indicates suspicion, not legal proof).*

---

## ⚙️ Quickstart & Setup Guide

### 1. Run the Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Base: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/api/v1/docs`
- Health Probe: `http://localhost:8000/api/v1/health`

### 2. Run the Frontend
```bash
cd frontend
npm.cmd run dev
```
- Web Application: `http://localhost:3000`
- Scanner UI: `http://localhost:3000/scanner`

### 3. Run the Test Suite (42 Tests)
```bash
cd backend
python -m pytest -v
```

---

## ⚠️ Limitations & False-Positive Considerations

1. **Brand Impersonation Heuristics:** Simple substring matching is used as an exploratory heuristic. Legitimate multi-tenant subdomains or partners might trigger brand rules.
2. **URL Shorteners:** Link shorteners are labeled suspicious due to destination opacity, but many are benign.
3. **Zero-Fetch Boundary:** Because PhishLens never makes outbound network calls, it cannot inspect landing page content, dynamic redirects, or DOM Cloaking. These will be addressed with controlled sandbox isolation in future milestones.
