"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ThreatGauge } from "@/components/ThreatGauge";
import { RiskBadge } from "@/components/RiskBadge";
import { IndicatorCard } from "@/components/IndicatorCard";
import { submitEmailScan } from "@/lib/api";
import { ScanResult } from "@/lib/types";
import {
  Mail,
  ShieldAlert,
  ArrowRight,
  AlertTriangle,
  Terminal,
  Clock,
  Info,
  CheckCircle,
} from "lucide-react";

export default function EmailAnalyzerPage() {
  const [content, setContent] = useState("");
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [phase1Message, setPhase1Message] = useState<string | null>(null);

  const sampleEmails = [
    {
      label: "Urgent Wire Fraud",
      sender: "ceo-office@exec-management-notice.info",
      subject: "CONFIDENTIAL: Immediate Vendor Wire Authorization",
      content:
        "Please execute an urgent payment of $42,500 for our new European contractor. Account details are attached in the encrypted portal below. Do not contact me via phone as I am boarding an international flight. Verification link: https://portal-exec-invoice-wire.xyz/login",
    },
    {
      label: "Credential Harvest",
      sender: "security@account-lockout-support-mail.net",
      subject: "Action Required: Suspicious Login Detected",
      content:
        "We detected an unauthorized login attempt from an unknown device in Moscow. To prevent permanent termination of your corporate access, verify your password and 2FA token within the next 30 minutes at: https://identity-sso-verify-access.top/auth",
    },
    {
      label: "Legitimate Newsletter",
      sender: "updates@techcommunity.org",
      subject: "Weekly Engineering Digest: November Edition",
      content:
        "Welcome to this week's engineering newsletter! We explore zero-trust network design, compiler optimization strategies, and distributed tracing best practices.",
    },
  ];

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 5) {
      setErrorMsg("Please provide email body content (minimum 5 characters).");
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    setScanResult(null);
    setPhase1Message(null);

    try {
      const response = await submitEmailScan(content, sender || undefined, subject || undefined);
      setScanResult(response.data);
      if (response.isPhase1Queued && response.rawMessage) {
        setPhase1Message(response.rawMessage);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze email content.");
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: (typeof sampleEmails)[0]) => {
    setSender(sample.sender);
    setSubject(sample.subject);
    setContent(sample.content);
    if (errorMsg) setErrorMsg(null);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-main tracking-tight">
              Email Heuristic & Phishing Analyzer
            </h1>
            <p className="text-xs text-slate-muted mt-1">
              Analyze email text, headers, and psychological urgency triggers for spear-phishing patterns.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-accent font-mono text-xs font-semibold">
            NLP Engine Ready
          </span>
        </div>

        {/* Input Form Section */}
        <div className="p-5 rounded-xl border border-slate-border bg-card shadow-lg">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-main mb-1.5">
                  Sender (Optional / From: Header)
                </label>
                <input
                  type="text"
                  value={sender}
                  onChange={(e) => setSender(e.target.value)}
                  placeholder="e.g. security@banking-alert.com"
                  className="w-full bg-background border border-slate-border rounded-lg px-3.5 py-2.5 text-xs text-slate-main placeholder-slate-subtle focus:outline-none focus:border-primary font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-main mb-1.5">
                  Subject Line (Optional)
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Urgent: Account Restricted"
                  className="w-full bg-background border border-slate-border rounded-lg px-3.5 py-2.5 text-xs text-slate-main placeholder-slate-subtle focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-main">
                  Email Body Content & Raw Text <span className="text-threat-danger">*</span>
                </label>
                <span className="text-[11px] font-mono text-slate-subtle">
                  {content.length} characters
                </span>
              </div>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Paste the email content, suspicious message text, or raw RFC 822 email headers here..."
                className="w-full bg-background border border-slate-border rounded-lg p-3.5 text-xs text-slate-main placeholder-slate-subtle focus:outline-none focus:border-primary font-mono leading-relaxed"
              />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-threat-danger/10 border border-threat-danger/30 text-xs text-threat-danger">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sample Selector & Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-subtle font-mono text-[11px]">Load samples:</span>
                {sampleEmails.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => loadSample(sample)}
                    className="font-mono text-[11px] px-2.5 py-1 rounded bg-card-hover border border-slate-border text-slate-muted hover:text-accent transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-primary/20 shrink-0"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing Content...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Email</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="p-8 rounded-xl border border-slate-border bg-card flex flex-col items-center justify-center space-y-3 text-center">
            <div className="w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin" />
            <h3 className="text-xs font-bold text-slate-main uppercase tracking-wider">
              Tokenizing & Evaluating Linguistics
            </h3>
            <p className="text-xs text-slate-muted max-w-sm">
              Checking coercive urgency sentiment, DKIM/SPF alignment, and embedded link destinations...
            </p>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && !loading && (
          <div className="space-y-6">
            {/* Phase 1 Callout */}
            {phase1Message && (
              <div className="p-4 rounded-xl border border-accent/30 bg-accent/5 flex items-start gap-3">
                <Terminal className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <div className="font-bold text-slate-main uppercase tracking-wider flex items-center gap-2">
                    <span>Phase 1 Architecture Status</span>
                    <span className="px-1.5 py-0.2 rounded bg-accent/20 text-accent font-mono text-[10px]">
                      Sanitization Contract Verified
                    </span>
                  </div>
                  <p className="text-slate-muted leading-relaxed">
                    {phase1Message}
                  </p>
                </div>
              </div>
            )}

            {/* Overview */}
            <div className="p-6 rounded-xl border border-slate-border bg-card grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
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
                    Inspected Target / Subject
                  </h3>
                  <p className="text-sm font-semibold text-slate-main mt-0.5 truncate">
                    {scanResult.target}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-background-secondary border border-slate-border/50">
                  <h4 className="text-xs font-bold text-slate-main uppercase tracking-wider mb-1">
                    Heuristic Verdict Overview
                  </h4>
                  <p className="text-xs text-slate-muted leading-relaxed">
                    {scanResult.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-background border border-slate-border text-slate-muted">
                    Modality: <strong>{scanResult.scan_type}</strong>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-background border border-slate-border text-slate-muted">
                    Pipeline: <strong>{scanResult.phase}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Granular Heuristics */}
            <div className="p-6 rounded-xl border border-slate-border bg-card space-y-4">
              <div className="flex items-center justify-between border-b border-slate-border/60 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider">
                    Email Security Indicators & Behavioral Heuristics
                  </h3>
                  <p className="text-xs text-slate-muted mt-0.5">
                    Evaluated against spear-phishing and social engineering indicators
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-muted">
                  {scanResult.indicators.length} Probes
                </span>
              </div>

              <div className="space-y-2.5">
                {scanResult.indicators.map((ind) => (
                  <IndicatorCard key={ind.code} indicator={ind} />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
