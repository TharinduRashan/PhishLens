"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import {
  FileCode,
  Terminal,
  Copy,
  Check,
  ShieldAlert,
  Server,
  Lock,
  ExternalLink,
  Layers,
  Cpu,
} from "lucide-react";

export default function DocsPage() {
  const [activeLang, setActiveLang] = useState<"curl" | "python" | "typescript">("curl");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const codeSnippets = {
    health: {
      curl: `curl -X GET http://localhost:8000/api/v1/health \\
  -H "Accept: application/json"`,
      python: `import requests

res = requests.get("http://localhost:8000/api/v1/health")
print(res.status_code, res.json())`,
      typescript: `const response = await fetch("http://localhost:8000/api/v1/health");
const health = await response.json();
console.log(health);`,
    },
    scanUrl: {
      curl: `curl -X POST http://localhost:8000/api/v1/scan/url \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://secure-login-verify-account.example.com"}'`,
      python: `import requests

payload = {
    "url": "https://secure-login-verify-account.example.com"
}

# Phase 2: Returns HTTP 200 OK with deterministic analysis
response = requests.post("http://localhost:8000/api/v1/scan/url", json=payload)
print("Status:", response.status_code)
print("Result:", response.json())`,
      typescript: `const response = await fetch("http://localhost:8000/api/v1/scan/url", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://secure-login-verify-account.example.com"
  })
});

const result = await response.json();
console.log(result.risk_score, result.risk_level);`,
    },
    scanEmail: {
      curl: `curl -X POST http://localhost:8000/api/v1/scan/email \\
  -H "Content-Type: application/json" \\
  -d '{"content": "Urgent: Your account credentials have expired. Verify immediately.", "sender": "security@alert-banking.com", "subject": "Account Notice"}'`,
      python: `import requests

response = requests.post(
    "http://localhost:8000/api/v1/scan/email",
    json={
        "content": "Urgent: Verify your payroll credentials immediately.",
        "sender": "payroll@spoofed-hr-portal.com",
        "subject": "Action Required"
    }
)
print(response.status_code, response.json())`,
      typescript: `const response = await fetch("http://localhost:8000/api/v1/scan/email", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    content: "Urgent: Verify your payroll credentials immediately.",
    sender: "payroll@spoofed-hr-portal.com",
    subject: "Action Required"
  })
});
const result = await response.json();`,
    },
    listScans: {
      curl: `curl -X GET "http://localhost:8000/api/v1/scans?limit=20&offset=0" \\
  -H "Accept: application/json"`,
      python: `import requests

response = requests.get("http://localhost:8000/api/v1/scans?limit=10")
print(response.json())`,
      typescript: `const response = await fetch("http://localhost:8000/api/v1/scans?limit=10");
const scans = await response.json();`,
    },
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden max-w-5xl">
        {/* Header */}
        <div className="border-b border-slate-border/60 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-mono text-[11px] font-bold">
              API v1.0
            </span>
            <span className="text-threat-safe text-xs font-mono font-bold">Phase 2: URL Engine Live</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-main tracking-tight">
            PhishLens Threat Intelligence API
          </h1>
          <p className="text-xs sm:text-sm text-slate-muted mt-2 leading-relaxed">
            RESTful cybersecurity APIs for deterministic, zero-network URL inspection, feature telemetry, and transparent risk scoring.
          </p>
        </div>

        {/* Language Tabs Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-subtle uppercase mr-2">Language:</span>
          {(["curl", "python", "typescript"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                activeLang === lang
                  ? "bg-primary text-white shadow-sm"
                  : "bg-card border border-slate-border text-slate-muted hover:text-slate-main"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Endpoint 1: POST /api/v1/scan/url */}
        <section className="p-5 rounded-xl border border-slate-border bg-card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-border/50 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-xs font-bold">
                POST
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-main">
                /api/v1/scan/url
              </span>
            </div>
            <span className="text-xs font-mono text-threat-safe font-semibold">200 OK (Phase 2 Active)</span>
          </div>

          <p className="text-xs text-slate-muted">
            Executes deterministic local analysis of target URL. Extracts 14 lexical and structural features and evaluates
            independent detection rules offline without making remote network calls.
          </p>

          <div className="relative rounded-lg bg-background border border-slate-border/80 p-3.5 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => handleCopy("url", codeSnippets.scanUrl[activeLang])}
              className="absolute top-2.5 right-2.5 p-1 rounded bg-card text-slate-muted hover:text-white"
            >
              {copiedKey === "url" ? <Check size={14} className="text-threat-safe" /> : <Copy size={14} />}
            </button>
            <pre className="text-slate-main">{codeSnippets.scanUrl[activeLang]}</pre>
          </div>

          {/* Response Structure Documentation */}
          <div className="p-4 rounded-lg bg-background-secondary border border-slate-border/60 text-xs font-mono space-y-2">
            <span className="text-[10px] text-accent font-bold uppercase tracking-wider block">
              Sample 200 OK Response Payload
            </span>
            <pre className="text-slate-main text-[11px] overflow-x-auto">{`{
  "scan_id": "7f8b92d1-4e8c-48a2-9721-998ef2b3a199",
  "url": "https://secure-login-verify-account.example.com",
  "status": "completed",
  "risk_score": 35,
  "risk_level": "SUSPICIOUS",
  "analysis_type": "rule_based",
  "summary": "Moderate risk score (35/100) detected with indicators: Suspicious Security Keywords in Hostname...",
  "features": {
    "url_length": 47,
    "hostname_length": 39,
    "num_subdomains": 2,
    "is_ip_address": false,
    "is_https": true,
    "has_at_symbol": false,
    "suspicious_keywords": { "in_hostname": ["account", "login", "secure", "verify"], "total": 4 },
    "is_shortened_url": false,
    "has_punycode": false,
    "num_special_characters": 5,
    "num_percent_encoded": 0,
    "has_unusual_port": false,
    "hostname_hyphens": 3
  },
  "indicators": [
    {
      "rule_id": "URL_007",
      "name": "Suspicious Security Keywords in Hostname",
      "severity": "high",
      "description": "High-risk security or authentication keywords are embedded directly within the domain name labels.",
      "score": 20,
      "evidence": "Matched keywords in hostname: account, login, secure, verify"
    }
  ],
  "analyzed_at": "2026-11-22T04:00:00Z"
}`}</pre>
          </div>
        </section>

        {/* Endpoint 2: GET /api/v1/health */}
        <section className="p-5 rounded-xl border border-slate-border bg-card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-border/50 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-threat-safe/10 border border-threat-safe/30 text-threat-safe font-mono text-xs font-bold">
                GET
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-main">
                /api/v1/health
              </span>
            </div>
            <span className="text-xs text-slate-muted">Platform Operational Status</span>
          </div>

          <p className="text-xs text-slate-muted">
            Returns backend system health, uptime duration, database engine status, and active platform capability flags.
          </p>

          <div className="relative rounded-lg bg-background border border-slate-border/80 p-3.5 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => handleCopy("health", codeSnippets.health[activeLang])}
              className="absolute top-2.5 right-2.5 p-1 rounded bg-card text-slate-muted hover:text-white"
            >
              {copiedKey === "health" ? <Check size={14} className="text-threat-safe" /> : <Copy size={14} />}
            </button>
            <pre className="text-slate-main">{codeSnippets.health[activeLang]}</pre>
          </div>
        </section>

        {/* Endpoint 3: GET /api/v1/scans */}
        <section className="p-5 rounded-xl border border-slate-border bg-card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-border/50 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-threat-safe/10 border border-threat-safe/30 text-threat-safe font-mono text-xs font-bold">
                GET
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-main">
                /api/v1/scans
              </span>
            </div>
            <span className="text-xs text-slate-muted">List Scan Audit Records</span>
          </div>

          <p className="text-xs text-slate-muted">
            Retrieves real persisted scan history records with filtering support for <code>risk_level</code> and <code>scan_type</code>.
          </p>

          <div className="relative rounded-lg bg-background border border-slate-border/80 p-3.5 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => handleCopy("list", codeSnippets.listScans[activeLang])}
              className="absolute top-2.5 right-2.5 p-1 rounded bg-card text-slate-muted hover:text-white"
            >
              {copiedKey === "list" ? <Check size={14} className="text-threat-safe" /> : <Copy size={14} />}
            </button>
            <pre className="text-slate-main">{codeSnippets.listScans[activeLang]}</pre>
          </div>
        </section>

        {/* Scoring Methodology & Boundaries */}
        <section className="p-5 rounded-xl border border-slate-border bg-background-secondary/40 space-y-3">
          <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider flex items-center gap-2 font-mono">
            <Lock size={15} className="text-primary" />
            <span>Risk Scoring Thresholds & Guidelines</span>
          </h3>
          <div className="text-xs text-slate-muted space-y-2 leading-relaxed">
            <p>
              The Phase 2 risk scoring engine operates transparently using strict thresholds:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 font-mono">
              <div className="p-3 rounded bg-card border border-threat-safe/30">
                <span className="text-threat-safe font-bold block">0 – 24: LOW RISK</span>
                <span className="text-[11px] text-slate-muted mt-1 block">
                  No significant suspicious markers. Caution still advised.
                </span>
              </div>
              <div className="p-3 rounded bg-card border border-threat-warning/30">
                <span className="text-threat-warning font-bold block">25 – 59: SUSPICIOUS</span>
                <span className="text-[11px] text-slate-muted mt-1 block">
                  Moderate anomalies (e.g. shortening, non-standard port).
                </span>
              </div>
              <div className="p-3 rounded bg-card border border-threat-danger/30">
                <span className="text-threat-danger font-bold block">60 – 100: HIGH RISK</span>
                <span className="text-[11px] text-slate-muted mt-1 block">
                  Compounded threats (IP host, @ authority spoofing, brand targeting).
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-subtle">
              * Important: A low score does not guarantee a URL is harmless; a high score indicates significant structural risk, not legal proof of malicious intent.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
