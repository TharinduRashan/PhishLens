"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Search,
  Mail,
  BarChart3,
  History,
  FileCode,
  Menu,
  X,
  ExternalLink,
  Activity,
} from "lucide-react";
import { fetchHealth } from "@/lib/api";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "online" | "standby">("checking");

  useEffect(() => {
    let isMounted = true;
    fetchHealth()
      .then((data) => {
        if (!isMounted) return;
        if (data && data.status === "healthy") {
          setBackendStatus("online");
        } else {
          setBackendStatus("standby");
        }
      })
      .catch(() => {
        if (isMounted) setBackendStatus("standby");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const navLinks = [
    { name: "URL Scanner", href: "/scanner", icon: Search },
    { name: "Email Analyzer", href: "/email-analyzer", icon: Mail },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Scan History", href: "/history", icon: History },
    { name: "API Docs", href: "/docs", icon: FileCode },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-border/80 bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg bg-card border border-primary/40 flex items-center justify-center text-primary group-hover:border-accent transition-colors shadow-sm shadow-primary/10">
            <ShieldAlert className="w-5 h-5 text-accent" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-main group-hover:text-white transition-colors">
                Phish<span className="text-primary">Lens</span>
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 rounded">
                Phase 1
              </span>
            </div>
            <span className="text-[10px] text-slate-muted hidden sm:block tracking-wide">
              See the threat behind the link
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-card text-accent border border-accent/30 font-semibold"
                    : "text-slate-muted hover:text-slate-main hover:bg-card/50"
                }`}
              >
                <Icon size={14} className={isActive ? "text-accent" : "text-slate-subtle"} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action & API Status Badge */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card border border-slate-border text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus === "online"
                  ? "bg-threat-safe shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                  : backendStatus === "checking"
                  ? "bg-threat-warning animate-pulse"
                  : "bg-slate-subtle"
              }`}
            />
            <span className="text-slate-muted">
              {backendStatus === "online"
                ? "API Online"
                : backendStatus === "checking"
                ? "Connecting..."
                : "API Standby"}
            </span>
          </div>

          <Link
            href="/scanner"
            className="px-3.5 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold tracking-wide transition-all shadow-sm shadow-primary/25"
          >
            Launch Scanner
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-muted hover:text-white hover:bg-card border border-transparent hover:border-slate-border"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-border bg-background-secondary/95 backdrop-blur-md px-4 pt-2 pb-5 space-y-1">
          {navLinks.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-card text-accent border border-accent/30 font-semibold"
                    : "text-slate-muted hover:text-slate-main hover:bg-card"
                }`}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-border flex flex-col gap-2">
            <Link
              href="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 rounded-md bg-primary text-white text-xs font-bold"
            >
              Open URL Scanner
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
