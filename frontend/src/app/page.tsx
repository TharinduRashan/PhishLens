"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  Search,
  ArrowRight,
  ShieldCheck,
  Eye,
  Lock,
  Cpu,
  Terminal,
  Zap,
  Layers,
  FileCheck2,
  AlertTriangle,
  Globe,
  Database,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [quickUrl, setQuickUrl] = useState("");

  const handleHeroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    router.push(`/scanner?target=${encodeURIComponent(quickUrl.trim())}`);
  };

  const sampleTargets = [
    "paypa1-security-verification.top",
    "secure.github.com/login",
    "appleid-support-recover.info",
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 border-b border-slate-border/80 cyber-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading, Subhead, Quick Scanner */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-primary/30 text-xs font-mono text-slate-muted">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>Next-Gen Threat Intelligence Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-main leading-[1.15]">
                Don&apos;t Trust Every Link. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
                  Verify It.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-muted max-w-2xl leading-relaxed">
                PhishLens empowers security teams and vigilant users with instant, zero-fetch URL inspection,
                homograph deobfuscation, and deep heuristic analysis. See the threat behind the link before it strikes.
              </p>

              {/* URL Scanning Input Box */}
              <form
                onSubmit={handleHeroSubmit}
                className="p-2 sm:p-2.5 rounded-xl bg-card border border-slate-border shadow-2xl max-w-xl"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1 flex items-center pl-3">
                    <Search className="w-5 h-5 text-slate-subtle shrink-0" />
                    <input
                      type="text"
                      value={quickUrl}
                      onChange={(e) => setQuickUrl(e.target.value)}
                      placeholder="Paste suspicious URL (e.g. https://account-verify...)"
                      className="w-full bg-transparent px-3 py-2 text-sm text-slate-main placeholder-slate-subtle focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold tracking-wide transition-all shadow-md shadow-primary/25 shrink-0"
                  >
                    <span>Scan URL</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>

              {/* Sample Quick Try Pills */}
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-subtle">
                <span className="font-mono text-[11px]">Quick samples:</span>
                {sampleTargets.map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => {
                      setQuickUrl(target);
                    }}
                    className="font-mono text-[11px] px-2 py-0.5 rounded bg-card-hover border border-slate-border text-slate-muted hover:text-accent transition-colors"
                  >
                    {target}
                  </button>
                ))}
              </div>

              {/* Quick Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-border/50 max-w-lg">
                <div>
                  <div className="text-xl font-bold font-mono text-slate-main">Zero-Fetch</div>
                  <div className="text-xs text-slate-subtle">Safe Sandbox Isolation</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-accent">100% SSRF</div>
                  <div className="text-xs text-slate-subtle">Boundary Guardrails</div>
                </div>
                <div>
                  <div className="text-xl font-bold font-mono text-primary">Sub-second</div>
                  <div className="text-xs text-slate-subtle">Heuristic Pipeline</div>
                </div>
              </div>
            </div>

            {/* Right Column: Security-Focused Interactive Terminal Graphic */}
            <div className="lg:col-span-5">
              <div className="rounded-xl border border-slate-border bg-card shadow-2xl p-5 relative overflow-hidden">
                {/* Terminal Header */}
                <div className="flex items-center justify-between border-b border-slate-border/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-threat-danger/80" />
                    <span className="w-3 h-3 rounded-full bg-threat-warning/80" />
                    <span className="w-3 h-3 rounded-full bg-threat-safe/80" />
                    <span className="ml-2 font-mono text-xs text-slate-muted">
                      phishlens://inspector-v1
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-accent px-1.5 py-0.5 rounded bg-accent/10 border border-accent/20">
                    REAL-TIME RADAR
                  </span>
                </div>

                {/* Simulated Lens Scan View */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-2.5 rounded bg-background-secondary border border-slate-border/50">
                    <div className="text-slate-subtle text-[10px] uppercase">Inspected Target</div>
                    <div className="text-accent truncate font-semibold">
                      https://paypa1-account-verification-auth.top/signin
                    </div>
                  </div>

                  <div className="space-y-1.5 py-2">
                    <div className="flex justify-between items-center text-slate-muted text-[11px]">
                      <span>[1] SSRF Guard Boundary</span>
                      <span className="text-threat-safe font-bold">PASS (No Internal IP)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-muted text-[11px]">
                      <span>[2] IDN Homoglyph Check</span>
                      <span className="text-threat-danger font-bold">FLAGGED (&apos;1&apos; for &apos;l&apos;)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-muted text-[11px]">
                      <span>[3] Lexical Entropy</span>
                      <span className="text-threat-warning font-bold">4.82 bits (Elevated)</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-muted text-[11px]">
                      <span>[4] Blacklist Intelligence</span>
                      <span className="text-threat-danger font-bold">MATCH (Active Campaign)</span>
                    </div>
                  </div>

                  {/* Threat Verdict Box */}
                  <div className="p-3 rounded-lg border border-threat-danger/30 bg-threat-danger/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-threat-danger font-bold uppercase tracking-wider">
                        Threat Score
                      </div>
                      <div className="text-2xl font-black text-threat-danger">
                        94 <span className="text-xs font-normal">/ 100</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 rounded bg-threat-danger text-white text-[11px] font-bold tracking-wider">
                        MALICIOUS
                      </span>
                      <div className="text-[10px] text-slate-muted mt-1">Brand Spoof Detected</div>
                    </div>
                  </div>
                </div>

                {/* Footer simulation */}
                <div className="mt-4 pt-3 border-t border-slate-border/40 flex items-center justify-between text-[10px] font-mono text-slate-subtle">
                  <span>Engine: Zero-Fetch Sandbox</span>
                  <span className="text-threat-safe font-semibold">Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background-secondary/40 border-b border-slate-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded bg-accent/10 border border-accent/20">
              Enterprise Defense Features
            </span>
            <h2 className="text-3xl font-extrabold text-slate-main mt-4 sm:text-4xl">
              Engineered for Precision Threat Neutralization
            </h2>
            <p className="text-slate-muted mt-3 text-sm sm:text-base">
              Traditional scanners fetch malicious pages and expose your infrastructure. PhishLens applies static,
              behavioral, and linguistic telemetry safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border border-slate-border bg-card hover:border-primary/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-main mb-2">
                SSRF & Zero-Fetch Isolation
              </h3>
              <p className="text-xs text-slate-muted leading-relaxed">
                Guaranteed zero outbound HTTP connections to user targets. Strict IP validation blocks internal networks,
                loopback hosts, and cloud metadata APIs from SSRF vectors.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border border-slate-border bg-card hover:border-primary/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-main mb-2">
                IDN Homograph Deobfuscation
              </h3>
              <p className="text-xs text-slate-muted leading-relaxed">
                Deconstructs internationalized domain names (Punycode) to detect visually deceptive unicode characters
                mimicking trusted financial and tech organizations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border border-slate-border bg-card hover:border-primary/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-threat-warning/10 border border-threat-warning/20 flex items-center justify-center text-threat-warning group-hover:scale-105 transition-transform mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-main mb-2">
                Shannon Entropy & DGA Profiling
              </h3>
              <p className="text-xs text-slate-muted leading-relaxed">
                Evaluates algorithmic randomness across domain labels to flag Domain Generation Algorithms (DGA)
                commonly utilized by malware botnets and advanced persistent threats.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border border-slate-border bg-card hover:border-primary/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-main mb-2">
                Email Heuristic Decomposition
              </h3>
              <p className="text-xs text-slate-muted leading-relaxed">
                Parses email subject, sender authenticity indicators, urgency sentiment, and hidden hyperlink redirections
                to expose spear-phishing attempts.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl border border-slate-border bg-card hover:border-primary/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-105 transition-transform mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-main mb-2">
                Threat Feed Correlation
              </h3>
              <p className="text-xs text-slate-muted leading-relaxed">
                Correlates targets against known phishing blocklists, newly registered domains (NRDs), and suspicious
                TLD registries.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl border border-slate-border bg-card hover:border-primary/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-threat-safe/10 border border-threat-safe/20 flex items-center justify-center text-threat-safe group-hover:scale-105 transition-transform mb-4">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-main mb-2">
                Developer-First REST API
              </h3>
              <p className="text-xs text-slate-muted leading-relaxed">
                Standardized JSON schemas, rigorous validation, clear error contracts, and OpenAPI documentation
                designed for enterprise SIEM and SOAR integrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-b border-slate-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary px-2.5 py-1 rounded bg-primary/10 border border-primary/20">
              Inspection Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-main mt-4 sm:text-4xl">
              How PhishLens Verifies Every Link
            </h2>
            <p className="text-slate-muted mt-3 text-sm sm:text-base">
              A 3-stage security architecture that evaluates risk without exposing client or server endpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-xl border border-slate-border bg-card relative">
              <span className="font-mono text-3xl font-black text-primary/30 absolute top-4 right-4">
                01
              </span>
              <div className="w-9 h-9 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-main mb-2">
                Ingestion & SSRF Boundary Check
              </h3>
              <p className="text-xs text-slate-muted leading-relaxed">
                The target URL is normalized according to RFC 3986. Private subnets (RFC 1918), loopbacks (127.0.0.1),
                and AWS/GCP cloud metadata endpoints are immediately quarantined.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-xl border border-slate-border bg-card relative">
              <span className="font-mono text-3xl font-black text-accent/30 absolute top-4 right-4">
                02
              </span>
              <div className="w-9 h-9 rounded bg-accent/10 border border-accent/30 flex items-center justify-center text-accent font-bold text-sm mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-main mb-2">
                Multi-Vector Behavioral Heuristics
              </h3>
              <p className="text-xs text-slate-muted leading-relaxed">
                The engine evaluates domain lexical randomness, homoglyph lookalikes, suspicious subdomain depth, and
                email coercion keywords across dedicated detection pipelines.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl border border-slate-border bg-card relative">
              <span className="font-mono text-3xl font-black text-threat-safe/30 absolute top-4 right-4">
                03
              </span>
              <div className="w-9 h-9 rounded bg-threat-safe/10 border border-threat-safe/30 flex items-center justify-center text-threat-safe font-bold text-sm mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-main mb-2">
                Unified Threat Score & Actionable Audit
              </h3>
              <p className="text-xs text-slate-muted leading-relaxed">
                PhishLens consolidates findings into a standardized 0–100 risk score and produces actionable indicator
                telemetry formatted for human analysts and automated workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Threat Detection Capabilities Matrix */}
      <section className="py-20 bg-background-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent px-2.5 py-1 rounded bg-accent/10 border border-accent/20">
                Threat Matrix
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-main mt-3">
                Detected Attack Vectors
              </h2>
            </div>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-accent transition-colors"
            >
              <span>Explore live interactive scanner</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-lg border border-slate-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-main">Brand Impersonation</span>
                <span className="text-[10px] font-mono text-threat-danger font-bold">CRITICAL</span>
              </div>
              <p className="text-xs text-slate-muted">
                Fakery targeting major banking, cloud providers, and SaaS login portals using deceptive typography.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-main">Credential Harvesters</span>
                <span className="text-[10px] font-mono text-threat-danger font-bold">CRITICAL</span>
              </div>
              <p className="text-xs text-slate-muted">
                Fake password reset pages, MFA token interception traps, and unauthorized authorization forms.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-main">DGA Domain Networks</span>
                <span className="text-[10px] font-mono text-threat-warning font-bold">HIGH</span>
              </div>
              <p className="text-xs text-slate-muted">
                High-entropy algorithmic domains used for disposable C2 command-and-control channels.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-slate-border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-main">Spear-Phishing Emails</span>
                <span className="text-[10px] font-mono text-threat-warning font-bold">HIGH</span>
              </div>
              <p className="text-xs text-slate-muted">
                Urgent payroll notices, CEO fraud wire transfers, and mismatched anchor hyperlinks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 border-t border-slate-border/80 bg-gradient-to-b from-card to-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-main">
            Start Securing Inbound Traffic Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-muted max-w-xl mx-auto">
            Experience the Phase 1 Foundation of PhishLens. Inspect suspicious URLs safely, review detailed
            heuristics, and explore the future enterprise API.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/scanner"
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold tracking-wide transition-all shadow-md shadow-primary/20"
            >
              Open URL Scanner
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 rounded-lg bg-card-hover border border-slate-border hover:border-slate-muted text-slate-main text-xs font-semibold tracking-wide transition-all"
            >
              View Telemetry Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
