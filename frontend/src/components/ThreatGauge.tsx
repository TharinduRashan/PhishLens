import React from "react";

interface ThreatGaugeProps {
  score: number;
  size?: number;
  enginePending?: boolean;
}

export const ThreatGauge: React.FC<ThreatGaugeProps> = ({
  score,
  size = 160,
  enginePending = false,
}) => {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 270 degree arc
  const arcLength = circumference * 0.75;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = enginePending
    ? arcLength
    : arcLength - (clampedScore / 100) * arcLength;

  const getColor = (s: number) => {
    if (enginePending) return "#64748B";
    if (s <= 24) return "#22C55E";
    if (s <= 59) return "#F59E0B";
    return "#EF4444";
  };

  const getLabel = (s: number) => {
    if (enginePending) return "PENDING ENGINE";
    if (s <= 24) return "LOW RISK (0–24)";
    if (s <= 59) return "SUSPICIOUS (25–59)";
    return "HIGH RISK (60–100)";
  };

  const currentColor = getColor(clampedScore);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        width={size}
        height={size}
        className="rotate-[135deg] transform"
      >
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1E2B42"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        {/* Active Value Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={currentColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        {enginePending ? (
          <>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
              Phase 1
            </span>
            <span className="text-sm font-medium text-slate-muted">Queued</span>
          </>
        ) : (
          <>
            <span className="font-mono text-3xl font-extrabold text-slate-main">
              {clampedScore}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-muted">
              / 100
            </span>
          </>
        )}
      </div>

      <div className="mt-2 text-center">
        <span
          className="text-xs font-bold tracking-widest uppercase font-mono"
          style={{ color: currentColor }}
        >
          {getLabel(clampedScore)}
        </span>
      </div>
    </div>
  );
};
