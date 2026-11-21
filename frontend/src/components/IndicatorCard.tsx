import React from "react";
import { RuleIndicator } from "@/lib/types";
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";

interface IndicatorCardProps {
  indicator: RuleIndicator | any;
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator }) => {
  const severity = (indicator.severity || "info").toLowerCase();

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-threat-danger/20 text-threat-danger border-threat-danger/40";
      case "high":
        return "bg-threat-danger/10 text-threat-danger border-threat-danger/30";
      case "medium":
        return "bg-threat-warning/10 text-threat-warning border-threat-warning/30";
      case "low":
        return "bg-threat-safe/10 text-threat-safe border-threat-safe/30";
      case "info":
      default:
        return "bg-primary/10 text-primary border-primary/30";
    }
  };

  const ruleId = indicator.rule_id || indicator.code || "RULE";

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-border/50 bg-background-secondary/60 hover:border-slate-border transition-colors">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {severity === "critical" || severity === "high" ? (
            <ShieldAlert className="w-5 h-5 text-threat-danger" />
          ) : severity === "medium" ? (
            <AlertTriangle className="w-5 h-5 text-threat-warning" />
          ) : (
            <AlertCircle className="w-5 h-5 text-threat-safe" />
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-slate-main">
              {indicator.name}
            </span>
            <span className="font-mono text-[10px] text-accent bg-card px-1.5 py-0.5 rounded border border-slate-border/60 font-bold">
              {ruleId}
            </span>
            {indicator.score !== undefined && (
              <span className="font-mono text-[10px] text-slate-muted bg-background px-1.5 py-0.5 rounded border border-slate-border">
                +{indicator.score} pts
              </span>
            )}
          </div>
          <p className="text-xs text-slate-muted mt-1 leading-relaxed max-w-xl">
            {indicator.description}
          </p>
          {indicator.evidence && (
            <div className="mt-1.5 font-mono text-[11px] text-accent/90 bg-background/80 px-2 py-0.5 rounded border border-slate-border/40 inline-block">
              Evidence: <span className="text-slate-main font-semibold">{indicator.evidence}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getSeverityBadge(
            severity
          )}`}
        >
          {severity}
        </span>
      </div>
    </div>
  );
};
