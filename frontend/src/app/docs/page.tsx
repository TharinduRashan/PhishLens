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
  -d '{"url": "https://secure-login-phish.net/account", "deep_analysis": false}'`,
      python: `import requests

payload = {
    "url": "https://secure-login-phish.net/account",
    "deep_analysis": False
}

# Note: Phase 1 returns HTTP 501 Not Implemented with structured preview
response = requests.post("http://localhost:8000/api/v1/scan/url", json=payload)
print("Status:", response.status_code)
print("Data:", response.json())`,
      typescript: `const response = await fetch("http://localhost:8000/api/v1/scan/url", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    url: "https://secure-login-phish.net/account",
    deep_analysis: false
  })
});

// Phase 1 yields HTTP 501 with structured queued telemetry
const result = await response.json();
console.log(result);`,
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
            <span className="text-slate-subtle text-xs font-mono">Phase 1 Foundation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-main tracking-tight">
            PhishLens Threat Intelligence API
          </h1>
          <p className="text-xs sm:text-sm text-slate-muted mt-2 leading-relaxed">
            RESTful cybersecurity APIs for automated URL inspection, spear-phishing heuristics, and SIEM telemetry integration.
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

        {/* Endpoint 1: Health */}
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

        {/* Endpoint 2: POST /api/v1/scan/url */}
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
            <span className="text-xs text-slate-muted">Submit URL for Inspection</span>
          </div>

          <p className="text-xs text-slate-muted">
            Validates target URL syntax and executes strict SSRF isolation boundary checks.
          </p>

          {/* Phase 1 Protocol Note */}
          <div className="p-3 rounded-lg bg-threat-warning/10 border border-threat-warning/20 text-xs text-threat-warning space-y-1">
            <strong>Phase 1 Contract:</strong> URL syntax and SSRF checks are enforced immediately.
            The endpoint returns <code>HTTP 501 Not Implemented</code> with a structured Phase 1 preview, confirming that
            the input pipeline is established while the live ML detection model is queued for Phase 2.
          </div>

          <div className="relative rounded-lg bg-background border border-slate-border/80 p-3.5 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => handleCopy("url", codeSnippets.scanUrl[activeLang])}
              className="absolute top-2.5 right-2.5 p-1 rounded bg-card text-slate-muted hover:text-white"
            >
              {copiedKey === "url" ? <Check size={14} className="text-threat-safe" /> : <Copy size={14} />}
            </button>
            <pre className="text-slate-main">{codeSnippets.scanUrl[activeLang]}</pre>
          </div>
        </section>

        {/* Endpoint 3: POST /api/v1/scan/email */}
        <section className="p-5 rounded-xl border border-slate-border bg-card space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-border/50 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-primary/10 border border-primary/30 text-primary font-mono text-xs font-bold">
                POST
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-slate-main">
                /api/v1/scan/email
              </span>
            </div>
            <span className="text-xs text-slate-muted">Submit Email for Heuristics</span>
          </div>

          <p className="text-xs text-slate-muted">
            Sanitizes email body and headers, checking for spear-phishing urgency patterns and link anchor divergence.
          </p>

          <div className="relative rounded-lg bg-background border border-slate-border/80 p-3.5 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => handleCopy("email", codeSnippets.scanEmail[activeLang])}
              className="absolute top-2.5 right-2.5 p-1 rounded bg-card text-slate-muted hover:text-white"
            >
              {copiedKey === "email" ? <Check size={14} className="text-threat-safe" /> : <Copy size={14} />}
            </button>
            <pre className="text-slate-main">{codeSnippets.scanEmail[activeLang]}</pre>
          </div>
        </section>

        {/* Endpoint 4: GET /api/v1/scans */}
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
            Retrieves paginated scan history with optional filters for <code>risk_level</code> and <code>scan_type</code>.
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

        {/* Security & SSRF Policy Details */}
        <section id="status-codes" className="p-5 rounded-xl border border-slate-border bg-background-secondary/40 space-y-3">
          <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider flex items-center gap-2">
            <Lock size={15} className="text-primary" />
            <span>Security Architecture & SSRF Policy</span>
          </h3>
          <div className="text-xs text-slate-muted space-y-2 leading-relaxed">
            <p>
              PhishLens enforces a strict <strong>Zero-Fetch Sandbox Model</strong>:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Outbound network connections to user-submitted targets are never initiated by the server.</li>
              <li>IPv4 and IPv6 loopback (<code>127.0.0.1</code>, <code>::1</code>) and RFC 1918 subnets are quarantined.</li>
              <li>Cloud hypervisor metadata IPs (<code>169.254.169.254</code>) trigger immediate <code>HTTP 422</code> blocks.</li>
              <li>Target contents and sensitive emails are masked using salted SHA-256 signatures in log storage.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
