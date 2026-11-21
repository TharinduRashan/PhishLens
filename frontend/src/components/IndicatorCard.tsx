import React from "react";
import { DetectionIndicator } from "@/lib/types";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

interface IndicatorCardProps {
  indicator: DetectionIndicator;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator }) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL":
        return "bg-threat-danger/10 text-threat-danger border-threat-danger/30";
      case "HIGH":
        return "bg-threat-danger/10 text-threat-danger border-threat-danger/20";
      case "MEDIUM":
        return "bg-threat-warning/10 text-threat-warning border-threat-warning/30";
      case "LOW":
        return "bg-threat-safe/10 text-threat-safe border-threat-safe/30";
      case "INFO":
      default:
        return "bg-primary/10 text-primary border-primary/30";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-border/50 bg-background-secondary/60 hover:border-slate-border transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {indicator.detected ? (
            <AlertCircle className="w-5 h-5 text-threat-danger" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-threat-safe" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-main">
              {indicator.name}
            </span>
            <span className="font-mono text-[10px] text-slate-subtle bg-card px-1.5 py-0.5 rounded border border-slate-border/40">
              {indicator.code}
            </span>
          </div>
          <p className="text-xs text-slate-muted mt-1 leading-relaxed max-w-xl">
            {indicator.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getSeverityBadge(
            indicator.severity
          )}`}
        >
          {indicator.severity}
        </span>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
            indicator.detected
              ? "bg-threat-danger/20 text-threat-danger"
              : "bg-threat-safe/10 text-threat-safe"
          }`}
        >
          {indicator.detected ? "Triggered" : "Passed"}
        </span>
      </div>
    </div>
  );
};
