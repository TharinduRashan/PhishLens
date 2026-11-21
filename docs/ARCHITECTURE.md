# PhishLens — Architecture Specification (Phase 1)

**Tagline:** *See the threat behind the link.*  
**Milestone:** Phase 1 — Project Foundation

---

## 1. System Overview

PhishLens is an enterprise-grade phishing detection and threat intelligence platform built for modern security teams. Rather than naively fetching and rendering untrusted links (which introduces Remote Code Execution and SSRF hazards), PhishLens operates on a **Zero-Fetch Sandbox** philosophy:

```
[ User Input (URL/Email) ]
           │
           ▼
[ Canonical Normalization & RFC 3986 Sanitization ]
           │
           ▼
[ SSRF Shield (IP/Subnet & Protocol Boundary Check) ]
           │
           ├── Block internal / loopback / metadata (422)
           │
           ▼
[ Phase 1 Foundation Pipeline Handshake (501 / Queued Telemetry) ]
           │
           ▼ (Scheduled Phase 2)
[ Multi-Vector Heuristics & ML Detection Engines ]
   ├─ IDN Punycode Homoglyph Detector
   ├─ Shannon Entropy & DGA Profiler
   ├─ NLP Sentiment & Urgency Analyzer
   └─ Threat Intelligence Feed Cross-Correlation
```

---

## 2. Monorepo Organization

```
phishlens/
├── frontend/                     # Next.js 14 App Router, TypeScript, Tailwind
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Global dark cybersecurity theme & layout
│   │   │   ├── page.tsx          # Landing page (hero, features, scanner)
│   │   │   ├── dashboard/page.tsx# Analytics dashboard & Recharts
│   │   │   ├── scanner/page.tsx  # Zero-fetch URL inspection interface
│   │   │   ├── email-analyzer/page.tsx # NLP & spear-phishing heuristics
│   │   │   ├── history/page.tsx  # Searchable audit history & detail view
│   │   │   └── docs/page.tsx     # Developer API interactive documentation
│   │   ├── components/           # Reusable atomic UI components
│   │   └── lib/                  # Types, API client, demonstration datasets
│   ├── package.json
│   └── tailwind.config.ts
├── backend/                      # Python FastAPI, SQLAlchemy, Pydantic
│   ├── app/
│   │   ├── api/v1/               # Versioned REST routers & endpoints
│   │   │   ├── endpoints/
│   │   │   │   ├── health.py     # System telemetry & database probe
│   │   │   │   └── scans.py      # URL / email inspection & listing
│   │   │   └── api.py
│   │   ├── core/                 # Config, settings, SSRF security guardrails
│   │   ├── db/                   # Database engine, sessionmaker, fallback
│   │   ├── models/               # SQLAlchemy schema definitions
│   │   ├── schemas/              # Pydantic v2 request/response models
│   │   └── services/             # URL & email preprocessing services
│   ├── tests/                    # Pytest & unit test suite
│   ├── requirements.txt
│   └── run_tests.py
├── docs/                         # System architecture & API specifications
│   ├── ARCHITECTURE.md
│   └── API_REFERENCE.md
├── README.md
└── .gitignore
```

---

## 3. Security Guardrails

### 3.1 Zero-Fetch Guarantee
User-submitted URLs are never visited or fetched over raw TCP/HTTP sockets from backend workers. This eliminates Server-Side Request Forgery (SSRF) and prevents alerting threat actors of scanner probing.

### 3.2 SSRF Guardrail Boundary
Before any target is processed, the hostname is resolved and verified:
- **Loopback IPs:** `127.0.0.0/8`, `::1`
- **Private Subnets:** `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
- **Cloud Metadata Endpoints:** `169.254.169.254`, `fe80::/10`
- **Unauthorized Protocols:** Only `http` and `https` schemes are admitted (`file://`, `gopher://`, `ftp://` rejected).

### 3.3 Privacy-Preserving Logging
Raw email bodies and credentials are never stored in plain text server logs. Content is summarized via salted SHA-256 hashes and token length indicators.

---

## 4. Phase 1 Execution Model

Under Phase 1:
1. Endpoints `/api/v1/scan/url` and `/api/v1/scan/email` strictly validate incoming request payloads.
2. In accordance with platform integrity requirements, successful validation responds with **HTTP 501 Not Implemented**, returning a structured Phase 1 preview confirming pipeline receipt while designating the detection engine as `engine_pending`.
3. The frontend displays actionable telemetry indicators, status badges, and threat gauges communicating the Phase 1 state transparently.
