import React from "react";
import { RiskLevel } from "@/lib/types";
import { ShieldCheck, AlertTriangle, ShieldAlert, HelpCircle } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  size = "md",
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-semibold tracking-wide",
    md: "px-2.5 py-1 text-xs font-bold tracking-wider",
    lg: "px-3.5 py-1.5 text-sm font-bold tracking-wider",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  switch (level) {
    case "SAFE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-threat-safe/30 bg-threat-safe/10 text-threat-safe ${sizeClasses[size]}`}
        >
          {showIcon && <ShieldCheck size={iconSizes[size]} />}
          SAFE
        </span>
      );
    case "SUSPICIOUS":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-threat-warning/30 bg-threat-warning/10 text-threat-warning ${sizeClasses[size]}`}
        >
          {showIcon && <AlertTriangle size={iconSizes[size]} />}
          SUSPICIOUS
        </span>
      );
    case "MALICIOUS":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-threat-danger/30 bg-threat-danger/10 text-threat-danger ${sizeClasses[size]}`}
        >
          {showIcon && <ShieldAlert size={iconSizes[size]} />}
          MALICIOUS
        </span>
      );
    case "UNKNOWN":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-slate-subtle/30 bg-slate-subtle/10 text-slate-muted ${sizeClasses[size]}`}
        >
          {showIcon && <HelpCircle size={iconSizes[size]} />}
          QUEUED / PENDING
        </span>
      );
  }
};
