# PhishLens 🛡️🔍

> **"See the threat behind the link."**

PhishLens is a commercial-grade, AI-powered phishing detection and threat intelligence platform built for modern security teams and vigilant users. Operating under a **Zero-Fetch Sandbox** paradigm, PhishLens neutralizes phishing risks, deobfuscates homoglyph attacks, and evaluates spear-phishing heuristics without triggering remote code execution or exposing infrastructure.

---

## 🚀 Key Capabilities

- **Zero-Fetch URL Scanner**: Inspects target syntax, Shannon entropy, and IDN Punycode homoglyphs without initiating dangerous outbound HTTP connections.
- **SSRF Protection Shield**: Automatically rejects loopback addresses (`127.0.0.1`, `::1`), private networks (RFC 1918), and cloud metadata endpoints (`169.254.169.254`).
- **Email Heuristics Analyzer**: Identifies psychological coercion, urgent call-to-action triggers, and mismatched hyperlink anchors.
- **Enterprise Telemetry Dashboard**: Visualizes threat distributions, scan velocity timelines, and attack vector ratios using interactive Recharts.
- **Searchable Scan Audit**: Comprehensive historical audit logs filterable by risk level, modality, and domain query.
- **Developer-First REST API**: Fully validated Pydantic v2 schemas, typed endpoints, and OpenAPI integration.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0 |
| **Database** | PostgreSQL (Production) / SQLite auto-fallback (Zero-Config Development) |
| **Testing** | Pytest, Pytest-Asyncio, Unittest |

---

## 📐 Monorepo Architecture

```
phishlens/
├── frontend/                     # Next.js 14 App Router, TypeScript, Tailwind
│   ├── src/
│   │   ├── app/                  # Application Routes (/, /dashboard, /scanner, /email-analyzer, /history, /docs)
│   │   ├── components/           # Atomic UI Components (ThreatGauge, RiskBadge, IndicatorCard, etc.)
│   │   └── lib/                  # TypeScript Types, API Handlers, Demonstration Datasets
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
├── backend/                      # Python FastAPI Application
│   ├── app/
│   │   ├── api/v1/endpoints/     # REST Endpoints (health, scans)
│   │   ├── core/                 # App Settings & SSRF Security Guardrails
│   │   ├── db/                   # Database Sessions & SQLite Auto-Fallback
│   │   ├── models/               # SQLAlchemy ORM Models
│   │   ├── schemas/              # Pydantic Request & Response Envelopes
│   │   └── services/             # URL & Email Preprocessing Engines
│   ├── tests/                    # Pytest Suite (23 Passing Tests)
│   └── requirements.txt
├── docs/                         # Technical Specifications
│   ├── ARCHITECTURE.md           # Zero-Fetch & Security Design
│   └── API_REFERENCE.md          # REST API Specification
├── README.md
└── .gitignore
```

---

## 🎨 Design System

PhishLens follows a commercial cybersecurity SaaS aesthetic:
- **Background**: `#080D18` (Obsidian Blue)
- **Secondary Background**: `#101827`
- **Cards & Surfaces**: `#141F30`
- **Primary Brand Blue**: `#3988FF`
- **Accent Cyan**: `#35D5E8`
- **Safe Verdict**: `#22C55E`
- **Suspicious Verdict**: `#F59E0B`
- **Malicious Threat**: `#EF4444`

---

## ⚙️ Quickstart & Setup Guide

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & pip

### 1. Backend Setup

```bash
cd backend

# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure environment (SQLite is used automatically if Postgres is omitted)
cp .env.example .env

# 3. Run automated test suite
python -m pytest -v

# 4. Start FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be accessible at:
- API Base: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/api/v1/docs`
- Health Probe: `http://localhost:8000/api/v1/health`

### 2. Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Start Next.js development server
npm run dev
```

Frontend will be accessible at:
- Web Application: `http://localhost:3000`

---

## 🛡️ Security Architecture & SSRF Guardrails

PhishLens adheres strictly to defensive cybersecurity engineering:
1. **Never Fetch Untrusted Targets**: We analyze canonical strings, entropy distributions, and DNS reputation without rendering remote payloads.
2. **SSRF Guard**: Resolves and quarantines `127.0.0.1`, RFC 1918 subnets (`10.0.0.0/8`, `192.168.0.0/16`), and AWS/GCP instance metadata (`169.254.169.254`).
3. **No Credential Logging**: Sensitive inputs and emails are tokenized and hashed with salted SHA-256 before logging.

---

## 📍 Phase 1 vs Phase 2 Roadmap

| Feature / Milestone | Phase 1 (Foundation) | Phase 2 (Engine Activation) |
| :--- | :---: | :---: |
| Next.js App Router Architecture | ✅ Completed | 🔄 Ongoing |
| Dark Cybersecurity Design System | ✅ Completed | 🔄 Ongoing |
| URL Scanner & Email Analyzer UI | ✅ Completed | 🔄 Ongoing |
| SSRF Isolation Guardrail | ✅ Completed | 🔄 Ongoing |
| FastAPI Pydantic v2 Contracts | ✅ Completed | 🔄 Ongoing |
| HTTP 501 Protocol Handshake | ✅ Completed | — |
| Live ML & IDN Punycode Engine | ⏱️ Queued | 🚀 Phase 2 |
| SIEM / SOAR Webhook Integrations | ⏱️ Queued | 🚀 Phase 2 |

---

## 📄 License

Proprietary — Developed for professional developer portfolio demonstration.
