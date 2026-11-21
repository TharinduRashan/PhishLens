"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DEMO_SCAN_TIMELINE, DEMO_THREAT_DISTRIBUTION } from "@/lib/mockData";

export const ThreatDistributionChart: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-72 w-full flex items-center justify-center text-slate-subtle text-xs font-mono">
        Loading telemetry visualizer...
      </div>
    );
  }

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-card border border-slate-border rounded-lg shadow-xl text-xs font-mono">
          <p className="text-slate-muted mb-1 font-sans font-bold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center gap-2 my-0.5">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-muted">{entry.name}:</span>
              <span className="font-bold text-slate-main">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 24h Scan Velocity Timeline */}
      <div className="lg:col-span-2 p-5 rounded-xl border border-slate-border/70 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider">
              24-Hour Scan Velocity & Classification
            </h3>
            <p className="text-xs text-slate-muted mt-0.5">
              Hourly volume of verified URLs and threat classifications (Demo Dataset)
            </p>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-primary/10 text-primary border border-primary/20 rounded">
            LIVE TELEMETRY
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEMO_SCAN_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2B42" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip content={customTooltip} />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                formatter={(val) => <span className="text-slate-muted">{val}</span>}
              />
              <Bar dataKey="safe" name="Safe" fill="#22C55E" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="suspicious" name="Suspicious" fill="#F59E0B" radius={[3, 3, 0, 0]} stackId="a" />
              <Bar dataKey="malicious" name="Malicious" fill="#EF4444" radius={[3, 3, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Aggregate Threat Ratio */}
      <div className="p-5 rounded-xl border border-slate-border/70 bg-card flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider">
            Threat Breakdown Ratio
          </h3>
          <p className="text-xs text-slate-muted mt-0.5">
            Aggregated classification distribution
          </p>
        </div>

        <div className="h-48 w-full my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DEMO_THREAT_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
              >
                {DEMO_THREAT_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#141F30" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2 bg-background-secondary border border-slate-border rounded text-xs font-mono">
                        <span style={{ color: data.color }} className="font-bold">
                          {data.name}:{" "}
                        </span>
                        <span className="text-slate-main">{data.count} scans</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-border/40 text-center">
          {DEMO_THREAT_DISTRIBUTION.map((item) => (
            <div key={item.name} className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-subtle">
                {item.name}
              </span>
              <span className="font-mono text-xs font-extrabold" style={{ color: item.color }}>
                {Math.round((item.count / 1428) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
