"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  MailCheck,
  History,
  FileCode,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      desc: "Overview & Telemetry",
    },
    {
      name: "URL Scanner",
      href: "/scanner",
      icon: Search,
      desc: "Zero-Fetch Deep Scan",
    },
    {
      name: "Email Analyzer",
      href: "/email-analyzer",
      icon: MailCheck,
      desc: "Header & Body Heuristics",
    },
    {
      name: "Scan History",
      href: "/history",
      icon: History,
      desc: "Audit Logs & Records",
    },
    {
      name: "API Documentation",
      href: "/docs",
      icon: FileCode,
      desc: "Developer Schemas",
    },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0 bg-background-secondary/60 border-b md:border-b-0 md:border-r border-slate-border/80 flex flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Navigation Category Label */}
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-subtle px-3 block mb-2">
            Platform Modules
          </span>
          <nav className="space-y-1">
            {links.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all ${
                    isActive
                      ? "bg-card text-accent border border-accent/30 font-semibold shadow-sm"
                      : "text-slate-muted hover:text-slate-main hover:bg-card/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={16}
                      className={isActive ? "text-accent" : "text-slate-subtle"}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-main">{item.name}</span>
                      <span className="text-[10px] text-slate-subtle">{item.desc}</span>
                    </div>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-accent" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Security Shield Callout */}
        <div className="p-3.5 rounded-lg bg-card border border-slate-border/70 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={14} className="text-primary" />
            <span className="font-bold text-slate-main text-[11px] uppercase tracking-wide">
              SSRF Protection Active
            </span>
          </div>
          <p className="text-[11px] text-slate-muted leading-relaxed">
            Zero-fetch architecture blocks internal IP addresses, loopback hosts, and metadata endpoints.
          </p>
        </div>
      </div>

      {/* Backend Status footer pill */}
      <div className="pt-4 border-t border-slate-border/40 text-[11px] font-mono text-slate-subtle flex items-center justify-between">
        <span>Engine: Phase 1</span>
        <span className="text-accent font-semibold">v0.1.0</span>
      </div>
    </aside>
  );
};
