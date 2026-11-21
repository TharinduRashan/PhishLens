"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ThreatGauge } from "@/components/ThreatGauge";
import { RiskBadge } from "@/components/RiskBadge";
import { IndicatorCard } from "@/components/IndicatorCard";
import { FeatureInspector } from "@/components/FeatureInspector";
import { submitUrlScan } from "@/lib/api";
import { URLScanResponse } from "@/lib/types";
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Info,
  Clock,
  Terminal,
  Cpu,
  Layers,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

function ScannerContent() {
  const searchParams = useSearchParams();
  const initialTarget = searchParams.get("target") || "";

  const [inputUrl, setInputUrl] = useState(initialTarget);
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<URLScanResponse | null>(null);

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

    const lower = trimmed.toLowerCase();
    if (
      lower.startsWith("file:") ||
      lower.startsWith("ftp:") ||
      lower.startsWith("javascript:") ||
      lower.startsWith("gopher:") ||
      lower.startsWith("data:")
    ) {
      return "Unsupported Scheme: Only HTTP and HTTPS protocols are accepted.";
    }

    return null;
  };

  const executeScan = async (urlToScan: string, deep: boolean) => {
    const clientErr = validateInput(urlToScan);
    if (clientErr) {
      setValidationError(clientErr);
      return;
    }
    setValidationError(null);
    setLoading(true);
    setScanResult(null);

    try {
      const response = await submitUrlScan(urlToScan, deep);
      setScanResult(response);
    } catch (err: any) {
      setValidationError(err.message || "Failed to execute scan. Target syntax or scheme error.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeScan(inputUrl, deepAnalysis);
  };

  const sampleUrls = [
    {
      label: "Brand Impersonation (High Risk)",
      url: "https://paypa1-security-verification-account-auth.top/signin",
    },
    {
      label: "Raw IP Host (Suspicious)",
      url: "http://192.0.2.1/login",
    },
    {
      label: "Authority @ Obfuscation (High Risk)",
      url: "https://google.com@attacker-site.xyz/auth",
    },
    {
      label: "Legitimate Corporate (Low Risk)",
      url: "https://aws.amazon.com/security",
    },
    {
      label: "URL Shortener (Suspicious)",
      url: "https://bit.ly/3x8QzL",
    },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-main tracking-tight">
                Zero-Fetch URL Threat Scanner
              </h1>
              <span className="px-2 py-0.5 rounded bg-threat-safe/10 border border-threat-safe/30 text-threat-safe font-mono text-[10px] font-bold">
                Phase 2 Engine Live
              </span>
            </div>
            <p className="text-xs text-slate-muted">
              Deterministic, zero-network URL inspection based on lexical features, punycode parsing, and transparent heuristics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-card border border-slate-border text-slate-muted font-mono text-xs font-semibold">
              Rule-Based Engine (Offline)
            </span>
          </div>
        </div>

        {/* Input Form Section */}
        <div className="p-5 rounded-xl border border-slate-border bg-card shadow-lg">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-main mb-2">
                Target URL To Analyze
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

            {/* Preset Samples */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-subtle font-mono text-[11px]">Detection presets:</span>
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-primary/20 shrink-0"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Target...</span>
                  </>
                ) : (
                  <>
                    <span>Inspect Target</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-8 rounded-xl border border-slate-border bg-card flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
              <div className="absolute inset-2 border-3 border-accent/20 border-b-accent rounded-full animate-spin [animation-direction:reverse]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-main uppercase tracking-wider">
                Executing Deterministic Rule Evaluation
              </h3>
              <p className="text-xs text-slate-muted mt-1 max-w-sm">
                Parsing IDNA host, evaluating 14 structural features, scoring threat indicators offline...
              </p>
            </div>
          </div>
        )}

        {/* Scan Result Display */}
        {scanResult && !loading && (
          <div className="space-y-6">
            {/* Rule-based Engine vs Future AI Engine Distinction Banner */}
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-start gap-3">
              <Cpu className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-slate-main uppercase tracking-wider flex items-center gap-2">
                  <span>Engine Telemetry: Deterministic Rule-Based Analysis</span>
                  <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary font-mono text-[10px]">
                    Phase 2 Engine
                  </span>
                </div>
                <p className="text-slate-muted leading-relaxed">
                  This analysis was performed locally using lexical rules, structural URL decomposition, and calibrated
                  scoring weights without remote network queries. Machine learning and neural NLP models are scheduled for future integration.
                </p>
              </div>
            </div>

            {/* Primary Result Overview Card */}
            <div className="p-6 rounded-xl border border-slate-border bg-card grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Score Gauge */}
              <div className="md:col-span-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-border/60 pb-6 md:pb-0 md:pr-6">
                <ThreatGauge score={scanResult.risk_score} size={150} />
                <div className="mt-3">
                  <RiskBadge level={scanResult.risk_level} size="lg" />
                </div>
              </div>

              {/* Right Summary Details */}
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2 text-[11px] font-mono text-slate-subtle">
                  <span>
                    Scan ID: <strong className="text-slate-muted">{scanResult.scan_id}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(scanResult.analyzed_at).toUTCString()}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-subtle">
                    Normalized URL Target
                  </h3>
                  <p className="font-mono text-sm text-accent break-all font-semibold mt-0.5">
                    {scanResult.url}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-background-secondary border border-slate-border/50">
                  <h4 className="text-xs font-bold text-slate-main uppercase tracking-wider mb-1">
                    Analysis Verdict Summary
                  </h4>
                  <p className="text-xs text-slate-muted leading-relaxed">
                    {scanResult.summary}
                  </p>
                </div>

                {/* Metadata Pills */}
                <div className="flex items-center gap-2 flex-wrap pt-1 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-background border border-slate-border text-slate-muted">
                    Engine: <strong>{scanResult.analysis_type}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-background border border-slate-border text-slate-muted">
                    Indicators Triggered: <strong>{scanResult.indicators.length}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-background border border-slate-border text-slate-muted">
                    Status: <strong className="text-threat-safe">{scanResult.status}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Extracted 14 Features Inspector */}
            {scanResult.features && <FeatureInspector features={scanResult.features} />}

            {/* Detected Indicators List */}
            <div className="p-6 rounded-xl border border-slate-border bg-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-border/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider">
                    Triggered Detection Rules & Evidence
                  </h3>
                  <p className="text-xs text-slate-muted mt-0.5">
                    Specific security heuristics flagged by the deterministic engine
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-muted">
                  {scanResult.indicators.length} Indicators Flagged
                </span>
              </div>

              {scanResult.indicators.length === 0 ? (
                <div className="p-6 text-center text-slate-muted text-xs font-mono border border-dashed border-slate-border/60 rounded-lg">
                  No threat indicators or suspicious patterns were detected on this target.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {scanResult.indicators.map((ind) => (
                    <IndicatorCard key={ind.rule_id} indicator={ind} />
                  ))}
                </div>
              )}
            </div>

            {/* Objective Methodology & Disclaimer */}
            <div className="p-5 rounded-xl border border-slate-border bg-background-secondary/40 space-y-2 text-xs text-slate-muted leading-relaxed">
              <h4 className="text-xs font-bold text-slate-main uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Info size={14} className="text-primary" />
                <span>Detection Methodology & Boundaries</span>
              </h4>
              <p>
                • <strong>LOW RISK (0–24):</strong> No prominent suspicious patterns observed. Does not guarantee absolute safety.
              </p>
              <p>
                • <strong>SUSPICIOUS (25–59):</strong> Notable structural anomalies (e.g. shortening service, unusual port, or mild keyword stuffing). Caution advised.
              </p>
              <p>
                • <strong>HIGH RISK (60–100):</strong> Multiple severe indicators (e.g. IP host, @ authority obfuscation, IDN punycode, or brand targeting). Strongly indicates phishing posture, though false positives can occur in unlisted legitimate architectures.
              </p>
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
