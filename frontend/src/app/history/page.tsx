"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/Sidebar";
import { RiskBadge } from "@/components/RiskBadge";
import { fetchScans } from "@/lib/api";
import { DEMO_RECENT_SCANS } from "@/lib/mockData";
import { ScanHistoryItem } from "@/lib/types";
import {
  Search,
  Filter,
  History,
  Clock,
  ExternalLink,
  X,
  Terminal,
  RefreshCw,
  Database,
} from "lucide-react";

export default function HistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [selectedScan, setSelectedScan] = useState<ScanHistoryItem | null>(null);
  const [dbScans, setDbScans] = useState<ScanHistoryItem[]>([]);
  const [isLiveFromBackend, setIsLiveFromBackend] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadRecords = () => {
    setLoading(true);
    fetchScans(50, 0)
      .then((res) => {
        if (res && res.items && res.items.length > 0) {
          setDbScans(res.items);
          setIsLiveFromBackend(true);
        } else {
          // If no database scans recorded yet, use historical demonstration records
          setDbScans(DEMO_RECENT_SCANS);
          setIsLiveFromBackend(false);
        }
      })
      .catch(() => {
        setDbScans(DEMO_RECENT_SCANS);
        setIsLiveFromBackend(false);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRecords();
  }, []);

  // Filtered scans list
  const filteredScans = useMemo(() => {
    return dbScans.filter((scan) => {
      const matchesSearch =
        scan.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scan.id.toLowerCase().includes(searchTerm.toLowerCase());

      const normRisk = (scan.risk_level || "").toUpperCase();
      let matchesRisk = true;
      if (riskFilter !== "ALL") {
        if (riskFilter === "LOW") {
          matchesRisk = normRisk === "LOW" || normRisk === "SAFE";
        } else if (riskFilter === "SUSPICIOUS") {
          matchesRisk = normRisk === "SUSPICIOUS";
        } else if (riskFilter === "HIGH") {
          matchesRisk = normRisk === "HIGH" || normRisk === "MALICIOUS";
        }
      }

      const matchesType =
        typeFilter === "ALL" || scan.scan_type === typeFilter;

      return matchesSearch && matchesRisk && matchesType;
    });
  }, [dbScans, searchTerm, riskFilter, typeFilter]);

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-border/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-main tracking-tight">
                Security Audit & Scan History
              </h1>
              {isLiveFromBackend ? (
                <span className="px-2 py-0.5 rounded bg-threat-safe/10 border border-threat-safe/30 text-threat-safe font-mono text-[10px] font-bold">
                  Live Backend Sync
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-card border border-slate-border text-slate-muted font-mono text-[10px] font-bold">
                  Demo Baseline Dataset
                </span>
              )}
            </div>
            <p className="text-xs text-slate-muted">
              Audit log of submitted and analyzed URL threats. Real scans executed via URL Scanner are persisted to the database.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadRecords}
              className="px-2.5 py-1.5 rounded-lg bg-card hover:bg-card-hover border border-slate-border text-xs text-slate-muted hover:text-white inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <span className="text-xs font-mono text-slate-muted bg-card px-3 py-1.5 rounded-lg border border-slate-border">
              {filteredScans.length} Records
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 rounded-xl border border-slate-border bg-card space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-subtle absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search target by domain, path, or scan ID..."
                className="w-full bg-background border border-slate-border rounded-lg pl-9 pr-4 py-2 text-xs text-slate-main placeholder-slate-subtle focus:outline-none focus:border-primary font-mono"
              />
            </div>

            {/* Risk Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <span className="text-[11px] font-mono text-slate-subtle uppercase mr-1">Risk:</span>
              {["ALL", "LOW", "SUSPICIOUS", "HIGH"].map((risk) => (
                <button
                  key={risk}
                  type="button"
                  onClick={() => setRiskFilter(risk)}
                  className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-all shrink-0 ${
                    riskFilter === risk
                      ? "bg-primary text-white shadow-sm"
                      : "bg-background border border-slate-border text-slate-muted hover:text-slate-main"
                  }`}
                >
                  {risk}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-subtle uppercase mr-1">Type:</span>
              {["ALL", "URL", "EMAIL"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-all shrink-0 ${
                    typeFilter === t
                      ? "bg-accent text-background font-bold shadow-sm"
                      : "bg-background border border-slate-border text-slate-muted hover:text-slate-main"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scans Table */}
        <div className="rounded-xl border border-slate-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-background-secondary/80 border-b border-slate-border/80 text-slate-subtle font-mono uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Scan ID</th>
                  <th className="py-3 px-4 font-semibold">Target / Domain</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Risk Classification</th>
                  <th className="py-3 px-4 font-semibold">Score</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                  <th className="py-3 px-4 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-border/40 font-mono">
                {filteredScans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-subtle font-sans">
                      No scan records found matching active filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredScans.map((scan) => (
                    <tr
                      key={scan.id}
                      onClick={() => setSelectedScan(scan)}
                      className="hover:bg-card-hover/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-muted font-mono text-[11px] truncate max-w-[120px]">
                        {scan.id}
                      </td>
                      <td className="py-3 px-4 text-slate-main max-w-[280px] truncate font-sans font-medium">
                        {scan.target}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-slate-border text-slate-muted">
                          {scan.scan_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <RiskBadge level={scan.risk_level} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold ${
                            scan.threat_score >= 60
                              ? "text-threat-danger"
                              : scan.threat_score >= 25
                              ? "text-threat-warning"
                              : "text-threat-safe"
                          }`}
                        >
                          {scan.threat_score} / 100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-subtle text-[11px]">
                        {new Date(scan.created_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedScan(scan);
                          }}
                          className="px-2.5 py-1 rounded bg-background border border-slate-border hover:border-accent text-slate-muted hover:text-accent transition-colors text-[11px]"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inspection Modal/Drawer */}
        {selectedScan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="w-full max-w-lg p-6 rounded-xl border border-slate-border bg-card shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-accent" />
                  <span className="font-mono text-xs font-bold text-slate-main truncate max-w-xs">
                    Audit Telemetry: {selectedScan.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="p-1 rounded text-slate-muted hover:text-white hover:bg-background"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-subtle block">
                    Inspected Target
                  </span>
                  <p className="font-mono text-accent text-sm break-all font-semibold mt-0.5">
                    {selectedScan.target}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-background-secondary border border-slate-border/50">
                  <div>
                    <span className="text-[10px] text-slate-subtle uppercase block">Risk Level</span>
                    <div className="mt-1">
                      <RiskBadge level={selectedScan.risk_level} size="sm" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-subtle uppercase block">Risk Score</span>
                    <span className="font-mono text-base font-bold text-slate-main mt-0.5 block">
                      {selectedScan.threat_score} / 100
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-subtle uppercase block">Modality</span>
                    <span className="font-mono text-slate-main mt-0.5 block">
                      {selectedScan.scan_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-subtle uppercase block">Status</span>
                    <span className="font-mono text-threat-safe mt-0.5 block">
                      {selectedScan.engine_status}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
                  <span className="text-[10px] text-slate-subtle uppercase font-bold block mb-1">
                    Analysis Record Summary
                  </span>
                  <p className="text-slate-muted text-[11px] leading-relaxed">
                    Evaluated via Phase 2 deterministic detection pipeline without external network connections.
                    Features, lexical weights, and boundary indicators verified.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="px-4 py-2 rounded-lg bg-background border border-slate-border text-xs font-semibold text-slate-main hover:bg-card-hover"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
