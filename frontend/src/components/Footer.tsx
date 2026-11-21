import React from "react";
import Link from "next/link";
import { ShieldCheck, Terminal, Lock, Globe } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-border/80 bg-background-secondary/50 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded bg-card border border-primary/40 flex items-center justify-center text-primary">
                <ShieldCheck className="w-4 h-4 text-accent" />
              </div>
              <span className="font-bold text-slate-main text-base">
                Phish<span className="text-primary">Lens</span>
              </span>
            </div>
            <p className="text-xs text-slate-muted leading-relaxed mb-4">
              Commercial-grade AI-assisted phishing detection, behavioral URL inspection, and threat intelligence platform.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-card border border-slate-border text-[11px] font-mono text-slate-muted">
              <Terminal size={12} className="text-accent" />
              <span>Phase 1: Project Foundation</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-main uppercase tracking-wider mb-3">
              Detection Engines
            </h4>
            <ul className="space-y-2 text-xs text-slate-muted">
              <li>
                <Link href="/scanner" className="hover:text-accent transition-colors">
                  Zero-Fetch URL Scanner
                </Link>
              </li>
              <li>
                <Link href="/email-analyzer" className="hover:text-accent transition-colors">
                  Email Heuristics Analyzer
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-accent transition-colors">
                  Threat Telemetry Dashboard
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-accent transition-colors">
                  Audit Scan History
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Architecture */}
          <div>
            <h4 className="text-xs font-bold text-slate-main uppercase tracking-wider mb-3">
              Architecture & Safety
            </h4>
            <ul className="space-y-2 text-xs text-slate-muted">
              <li className="flex items-center gap-1.5">
                <Lock size={12} className="text-primary" />
                <span>SSRF Protection Shield</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Globe size={12} className="text-accent" />
                <span>Zero-Execution Protocol</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Terminal size={12} className="text-threat-safe" />
                <span>RFC 3986 Normalization</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-threat-warning" />
                <span>Privacy-Preserving Hashing</span>
              </li>
            </ul>
          </div>

          {/* Documentation & Standards */}
          <div>
            <h4 className="text-xs font-bold text-slate-main uppercase tracking-wider mb-3">
              Developer Ecosystem
            </h4>
            <ul className="space-y-2 text-xs text-slate-muted">
              <li>
                <Link href="/docs" className="hover:text-accent transition-colors">
                  API Reference & Schemas
                </Link>
              </li>
              <li>
                <Link href="/docs#status-codes" className="hover:text-accent transition-colors">
                  HTTP 501 Protocol Integration
                </Link>
              </li>
              <li>
                <span className="text-slate-subtle">
                  FastAPI OpenAPI Spec v1
                </span>
              </li>
              <li>
                <span className="text-slate-subtle">
                  Next.js App Router v14
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-subtle">
          <div>
            &copy; 2026 PhishLens Platform. Professional Cybersecurity Portfolio Project.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-slate-muted">
              Tagline: &quot;See the threat behind the link.&quot;
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
