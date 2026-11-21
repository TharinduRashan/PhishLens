"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ThreatGauge } from "@/components/ThreatGauge";
import { RiskBadge } from "@/components/RiskBadge";
import { IndicatorCard } from "@/components/IndicatorCard";
import { submitUrlScan } from "@/lib/api";
import { ScanResult } from "@/lib/types";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Terminal,
  ExternalLink,
  Lock,
  Layers,
  ArrowRight,
} from "lucide-react";

function ScannerContent() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get("target") || "";

  const [inputUrl, setInputUrl] = useState(initialTarget);
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [phase1Message, setPhase1Message] = useState<string | null>(null);

  // Auto-run scan if target passed via search parameter
  useEffect(() => {
    if (initialTarget) {
      setInputUrl(initialTarget);
      executeScan(initialTarget, deepAnalysis);
    }
  }, [initialTarget]);

  const validateInput = (url: string): string | null => {
    const trimmed = url.trim();
    if (!trimmed) {
      return "Please enter a target URL to analyze.";
    }
    if (trimmed.length < 3) {
      return "URL is too short.";
    }

    const lower = trimmed.toLowerCase();
    if (
      lower.includes("localhost") ||
      lower.includes("127.0.0.1") ||
      lower.includes("192.168.") ||
      lower.includes("10.") ||
      lower.includes("169.254.")
    ) {
      return "SSRF Shield Guardrail: Localhost, private IP addresses, and cloud metadata targets are restricted.";
    }

    if (lower.startsWith("file://") || lower.startsWith("ftp://") || lower.startsWith("javascript:")) {
      return "Protocol Violation: Only HTTP and HTTPS protocols are accepted.";
    }

    return null;
  };

  const executeScan = async (urlToScan: string, deep: boolean) => {
    const error = validateInput(urlToScan);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setLoading(true);
    setScanResult(null);
    setPhase1Message(null);

    try {
      const response = await submitUrlScan(urlToScan, deep);
      setScanResult(response.data);
      if (response.isPhase1Queued && response.rawMessage) {
        setPhase1Message(response.rawMessage);
      }
    } catch (err: any) {
      setValidationError(err.message || "Failed to execute scan. Please verify target syntax.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(inputUrl, deepAnalysis);
  };

  const sampleUrls = [
    { label: "Homograph Spoof", url: "https://paypa1-account-verification-auth.top/signin" },
    { label: "Legitimate Corporate", url: "https://aws.amazon.com/security" },
    { label: "High-Entropy DGA", url: "https://x8q91z-security-cloud-gate.xyz/recover" },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-main tracking-tight">
              Zero-Fetch URL Threat Scanner
            </h1>
            <p className="text-xs text-slate-muted mt-1">
              Static, lexical, and behavioral URL inspection without remote code execution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-threat-safe/10 border border-threat-safe/20 text-threat-safe font-mono text-xs font-semibold">
              SSRF Shield Active
            </span>
          </div>
        </div>

        {/* Input Form Section */}
        <div className="p-5 rounded-xl border border-slate-border bg-card shadow-lg">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-main mb-2">
                Target URL
              </label>
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-subtle absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="https://example-suspicious-domain.com/login?token=..."
                  className="w-full bg-background border border-slate-border rounded-lg pl-11 pr-4 py-3 text-sm text-slate-main placeholder-slate-subtle focus:outline-none focus:border-primary font-mono transition-colors"
                />
              </div>
            </div>

            {/* Validation Error Message */}
            {validationError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-threat-danger/10 border border-threat-danger/30 text-xs text-threat-danger">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Deep Scan Toggle & Quick Samples */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-muted">
                <input
                  type="checkbox"
                  checked={deepAnalysis}
                  onChange={(e) => setDeepAnalysis(e.target.checked)}
                  className="rounded border-slate-border bg-background text-primary focus:ring-0"
                />
                <span>Include secondary threat intelligence feeds</span>
              </label>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-subtle font-mono text-[11px]">Test samples:</span>
                {sampleUrls.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => {
                      setInputUrl(s.url);
                      executeScan(s.url, deepAnalysis);
                    }}
                    className="font-mono text-[11px] px-2 py-1 rounded bg-card-hover border border-slate-border text-slate-muted hover:text-accent transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-primary/20"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Executing Heuristic Inspection...</span>
                  </>
                ) : (
                  <>
                    <span>Inspect Target</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Loading State Skeleton */}
        {loading && (
          <div className="p-8 rounded-xl border border-slate-border bg-card flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-2 border-4 border-accent/20 border-b-accent rounded-full animate-spin [animation-direction:reverse]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider">
                Deconstructing Target
              </h3>
              <p className="text-xs text-slate-muted mt-1 max-w-sm">
                Parsing RFC 3986 canonical tokens, measuring Shannon entropy, verifying IDN unicode homoglyphs...
              </p>
            </div>
          </div>
        )}

        {/* Scan Result Display */}
        {scanResult && !loading && (
          <div className="space-y-6">
            {/* Phase 1 Explanatory Callout */}
            {phase1Message && (
              <div className="p-4 rounded-xl border border-accent/30 bg-accent/5 flex items-start gap-3">
                <Terminal className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-main uppercase tracking-wider flex items-center gap-2">
                    <span>Phase 1 Project Foundation Status</span>
                    <span className="px-1.5 py-0.2 rounded bg-accent/20 text-accent font-mono text-[10px]">
                      Verified Clean Handshake
                    </span>
                  </div>
                  <p className="text-slate-muted leading-relaxed">
                    {phase1Message}
                  </p>
                </div>
              </div>
            )}

            {/* Primary Result Overview Card */}
            <div className="p-6 rounded-xl border border-slate-border bg-card grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Score Gauge */}
              <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-border/60 pb-6 md:pb-0 md:pr-6">
                <ThreatGauge
                  score={scanResult.threat_score}
                  size={150}
                  enginePending={scanResult.engine_status === "engine_pending"}
                />
                <div className="mt-3">
                  <RiskBadge level={scanResult.risk_level} size="lg" />
                </div>
              </div>

              {/* Right Summary Details */}
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[11px] font-mono text-slate-subtle">
                    Scan ID: <strong className="text-slate-muted">{scanResult.scan_id}</strong>
                  </span>
                  <span className="text-[11px] font-mono text-slate-subtle flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(scanResult.analyzed_at).toUTCString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-subtle">
                    Inspected Target
                  </h3>
                  <p className="font-mono text-sm text-accent break-all font-semibold mt-0.5">
                    {scanResult.target}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-background-secondary border border-slate-border/50">
                  <h4 className="text-xs font-bold text-slate-main uppercase tracking-wider mb-1">
                    Executive Analysis Summary
                  </h4>
                  <p className="text-xs text-slate-muted leading-relaxed">
                    {scanResult.summary}
                  </p>
                </div>

                {/* Metadata Pills */}
                <div className="flex items-center gap-2 flex-wrap pt-1 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-background border border-slate-border text-slate-muted">
                    Modality: <strong>{scanResult.scan_type}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-background border border-slate-border text-slate-muted">
                    Engine Status: <strong>{scanResult.engine_status}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-background border border-slate-border text-slate-muted">
                    Phase: <strong>{scanResult.phase}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Granular Detection Indicators List */}
            <div className="p-6 rounded-xl border border-slate-border bg-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-border/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider">
                    Detection Indicators & Heuristics Breakdown
                  </h3>
                  <p className="text-xs text-slate-muted mt-0.5">
                    Individual security telemetry evaluated against target domain
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-muted">
                  {scanResult.indicators.length} Telemetry Probes
                </span>
              </div>

              <div className="space-y-2.5">
                {scanResult.indicators.map((ind) => (
                  <IndicatorCard key={ind.code} indicator={ind} />
                ))}
              </div>
            </div>

            {/* Explanation of Detected Issues Guide */}
            <div className="p-5 rounded-xl border border-slate-border bg-background-secondary/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-main uppercase tracking-wider flex items-center gap-2">
                <Info size={14} className="text-primary" />
                <span>Detection Heuristics Explanation Guide</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-muted">
                <div className="p-3 rounded bg-card border border-slate-border/40">
                  <strong className="text-slate-main block mb-1">IDN Homograph Checks:</strong>
                  Identifies lookalike internationalized characters (e.g. Cyrillic &apos;а&apos; substituting Latin &apos;a&apos;)
                  designed to spoof human eyes while registering distinct DNS records.
                </div>
                <div className="p-3 rounded bg-card border border-slate-border/40">
                  <strong className="text-slate-main block mb-1">Shannon Entropy Scoring:</strong>
                  High randomness indices in domain names indicate programmatic creation by botnet command algorithms (DGA).
                </div>
                <div className="p-3 rounded bg-card border border-slate-border/40">
                  <strong className="text-slate-main block mb-1">SSRF Guardrail Boundary:</strong>
                  Verifies that resolution never points to RFC 1918 private subnets or internal server resources.
                </div>
                <div className="p-3 rounded bg-card border border-slate-border/40">
                  <strong className="text-slate-main block mb-1">Threat Intelligence Aggregation:</strong>
                  Correlates hashes against community malware repositories and zero-day phishing feeds.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 p-8 text-slate-muted text-xs font-mono">
          Loading PhishLens Scanner...
        </div>
      }
    >
      <ScannerContent />
    </Suspense>
  );
}
