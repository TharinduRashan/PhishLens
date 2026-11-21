"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { RiskBadge } from "@/components/RiskBadge";
import { ThreatDistributionChart } from "@/components/ThreatDistributionChart";
import {
  DEMO_STATS,
  DEMO_RECENT_SCANS,
  DEMO_TOP_ATTACK_VECTORS,
} from "@/lib/mockData";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Search,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Info,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [quickUrl, setQuickUrl] = useState("");

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickUrl.trim()) return;
    router.push(`/scanner?target=${encodeURIComponent(quickUrl.trim())}`);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Top Header & Demo Notice Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-main tracking-tight">
              Security Telemetry Dashboard
            </h1>
            <p className="text-xs text-slate-muted mt-1">
              Consolidated real-time threat detection metrics and scan velocity telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded bg-accent/10 border border-accent/20 text-accent font-mono text-xs font-semibold">
              Demo Environment
            </span>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold tracking-wide transition-all"
            >
              <Search size={14} />
              <span>New Scan</span>
            </Link>
          </div>
        </div>

        {/* Demo Data Disclaimer Alert */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-primary/20 text-xs text-slate-muted">
          <Info size={16} className="text-primary shrink-0" />
          <span>
            <strong className="text-slate-main">Demonstration Data Notice:</strong> Dashboard statistics and recent scan logs
            below represent simulated enterprise threat telemetry for Phase 1 architectural evaluation.
          </span>
        </div>

        {/* Overview Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Scans */}
          <div className="p-4 rounded-xl border border-slate-border bg-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Total Scans</span>
              <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Search size={14} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold font-mono text-slate-main">
                {DEMO_STATS.totalScans.toLocaleString()}
              </div>
              <div className="text-[11px] text-threat-safe mt-1 flex items-center gap-1 font-mono">
                <span>+12.4%</span>
                <span className="text-slate-subtle">vs previous period</span>
              </div>
            </div>
          </div>

          {/* Safe URLs */}
          <div className="p-4 rounded-xl border border-slate-border bg-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Safe URLs</span>
              <div className="w-7 h-7 rounded bg-threat-safe/10 border border-threat-safe/20 flex items-center justify-center text-threat-safe">
                <ShieldCheck size={14} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold font-mono text-threat-safe">
                {DEMO_STATS.safeUrls.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-subtle mt-1 font-mono">
                {Math.round((DEMO_STATS.safeUrls / DEMO_STATS.totalScans) * 100)}% verified clean
              </div>
            </div>
          </div>

          {/* Suspicious URLs */}
          <div className="p-4 rounded-xl border border-slate-border bg-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Suspicious URLs</span>
              <div className="w-7 h-7 rounded bg-threat-warning/10 border border-threat-warning/20 flex items-center justify-center text-threat-warning">
                <AlertTriangle size={14} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold font-mono text-threat-warning">
                {DEMO_STATS.suspiciousUrls.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-subtle mt-1 font-mono">
                {Math.round((DEMO_STATS.suspiciousUrls / DEMO_STATS.totalScans) * 100)}% requires review
              </div>
            </div>
          </div>

          {/* Malicious URLs */}
          <div className="p-4 rounded-xl border border-slate-border bg-card flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-muted">
              <span className="text-xs font-bold uppercase tracking-wider">Malicious URLs</span>
              <div className="w-7 h-7 rounded bg-threat-danger/10 border border-threat-danger/20 flex items-center justify-center text-threat-danger">
                <ShieldAlert size={14} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold font-mono text-threat-danger">
                {DEMO_STATS.maliciousUrls.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-subtle mt-1 font-mono">
                {DEMO_STATS.blockedAttacks24h} blocked in last 24h
              </div>
            </div>
          </div>
        </div>

        {/* Quick URL Scanner Section */}
        <div className="p-5 rounded-xl border border-slate-border bg-gradient-to-r from-card to-background-secondary">
          <div className="max-w-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-main mb-1">
              Quick Inbound Link Verification
            </h2>
            <p className="text-xs text-slate-muted mb-3">
              Run zero-fetch isolation scan to analyze unknown URL parameters and homoglyph risk.
            </p>
            <form onSubmit={handleQuickScan} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={quickUrl}
                  onChange={(e) => setQuickUrl(e.target.value)}
                  placeholder="https://suspicious-target.com/login"
                  className="w-full bg-background border border-slate-border rounded-lg px-3.5 py-2 text-xs text-slate-main placeholder-slate-subtle focus:outline-none focus:border-primary font-mono"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-all shrink-0 inline-flex items-center justify-center gap-1.5"
              >
                <span>Execute Scan</span>
                <ArrowRight size={14} />
              </button>
            </form>
          </div>
        </div>

        {/* Threat Distribution Chart (Recharts) */}
        <ThreatDistributionChart />

        {/* Attack Vector Matrix & Recent Scans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Threat Indicators Breakdown */}
          <div className="p-5 rounded-xl border border-slate-border bg-card">
            <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider mb-1">
              Leading Attack Vectors
            </h3>
            <p className="text-xs text-slate-muted mb-4">
              Breakdown of triggered heuristic flags across 24h
            </p>

            <div className="space-y-3">
              {DEMO_TOP_ATTACK_VECTORS.map((item) => (
                <div key={item.vector} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-main text-xs">{item.vector}</span>
                    <span className="text-accent font-semibold">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Scans Table */}
          <div className="lg:col-span-2 p-5 rounded-xl border border-slate-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider">
                  Recent Scan Stream
                </h3>
                <p className="text-xs text-slate-muted mt-0.5">
                  Latest inspection records analyzed across platform
                </p>
              </div>
              <Link
                href="/history"
                className="text-xs text-primary hover:text-accent font-semibold inline-flex items-center gap-1"
              >
                <span>View Full History</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-border/60 text-slate-subtle font-mono uppercase text-[10px]">
                    <th className="py-2 font-semibold">Target</th>
                    <th className="py-2 font-semibold">Type</th>
                    <th className="py-2 font-semibold">Verdict</th>
                    <th className="py-2 font-semibold">Threat Score</th>
                    <th className="py-2 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-border/40 font-mono">
                  {DEMO_RECENT_SCANS.slice(0, 5).map((scan) => (
                    <tr key={scan.id} className="hover:bg-card-hover/60 transition-colors">
                      <td className="py-3 pr-4 max-w-[220px] truncate text-slate-main font-sans">
                        {scan.target}
                      </td>
                      <td className="py-3 pr-3 text-slate-muted">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-slate-border">
                          {scan.scan_type}
                        </span>
                      </td>
                      <td className="py-3 pr-3">
                        <RiskBadge level={scan.risk_level} size="sm" />
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`font-bold ${
                            scan.threat_score >= 70
                              ? "text-threat-danger"
                              : scan.threat_score >= 30
                              ? "text-threat-warning"
                              : "text-threat-safe"
                          }`}
                        >
                          {scan.threat_score} / 100
                        </span>
                      </td>
                      <td className="py-3 text-slate-subtle text-[11px]">
                        {new Date(scan.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
