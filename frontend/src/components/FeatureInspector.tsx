import React from "react";
import { URLFeatures } from "@/lib/types";
import { Layers, ShieldCheck, AlertCircle, Hash, Globe, Lock, Cpu, Link as LinkIcon } from "lucide-react";

interface FeatureInspectorProps {
  features: URLFeatures;
}

export const FeatureInspector: React.FC<FeatureInspectorProps> = ({ features }) => {
  if (!features) return null;

  return (
    <div className="p-5 rounded-xl border border-slate-border bg-card space-y-4">
      <div className="flex items-center justify-between border-b border-slate-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-slate-main uppercase tracking-wider">
            Extracted Structural & Lexical Features
          </h3>
        </div>
        <span className="text-[11px] font-mono font-semibold text-slate-muted">
          14 Telemetry Vectors
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
        {/* Feature 1: URL Length */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">1. Total URL Length</span>
          <div className="mt-1 font-mono text-sm font-bold text-slate-main">
            {features.url_length} <span className="text-slate-subtle text-[11px]">chars</span>
          </div>
        </div>

        {/* Feature 2: Host Length */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">2. Hostname Length</span>
          <div className="mt-1 font-mono text-sm font-bold text-slate-main">
            {features.hostname_length} <span className="text-slate-subtle text-[11px]">chars</span>
          </div>
        </div>

        {/* Feature 3: Subdomains */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">3. Subdomain Count</span>
          <div className="mt-1 font-mono text-sm font-bold text-slate-main">
            {features.num_subdomains}
          </div>
        </div>

        {/* Feature 4: IP Address Host */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">4. IP Address Host</span>
          <div className="mt-1 font-mono text-sm font-bold">
            {features.is_ip_address ? (
              <span className="text-threat-danger">YES (IPv4/v6)</span>
            ) : (
              <span className="text-threat-safe">NO (Domain)</span>
            )}
          </div>
        </div>

        {/* Feature 5: HTTPS Protocol */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">5. HTTPS Encryption</span>
          <div className="mt-1 font-mono text-sm font-bold">
            {features.is_https ? (
              <span className="text-threat-safe">YES (TLS Active)</span>
            ) : (
              <span className="text-threat-warning">NO (Plain HTTP)</span>
            )}
          </div>
        </div>

        {/* Feature 6: @ Symbol Presence */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">6. &apos;@&apos; Symbol Authority</span>
          <div className="mt-1 font-mono text-sm font-bold">
            {features.has_at_symbol ? (
              <span className="text-threat-danger">DETECTED</span>
            ) : (
              <span className="text-threat-safe">NONE</span>
            )}
          </div>
        </div>

        {/* Feature 7: URL Shortener */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">7. URL Shortener</span>
          <div className="mt-1 font-mono text-sm font-bold">
            {features.is_shortened_url ? (
              <span className="text-threat-warning">YES (Shortened)</span>
            ) : (
              <span className="text-threat-safe">NO</span>
            )}
          </div>
        </div>

        {/* Feature 8: Punycode / IDN */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">8. Punycode Host</span>
          <div className="mt-1 font-mono text-sm font-bold">
            {features.has_punycode ? (
              <span className="text-threat-warning">YES (IDN)</span>
            ) : (
              <span className="text-threat-safe">NO</span>
            )}
          </div>
        </div>

        {/* Feature 9: Hyphens in Hostname */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">9. Hostname Hyphens</span>
          <div className="mt-1 font-mono text-sm font-bold text-slate-main">
            {features.hostname_hyphens}
          </div>
        </div>

        {/* Feature 10: Unusual Port */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">10. Unusual Network Port</span>
          <div className="mt-1 font-mono text-sm font-bold">
            {features.has_unusual_port ? (
              <span className="text-threat-warning">YES</span>
            ) : (
              <span className="text-threat-safe">Standard (80/443)</span>
            )}
          </div>
        </div>

        {/* Feature 11: Percent Encoded Sequences */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">11. Percent Sequences</span>
          <div className="mt-1 font-mono text-sm font-bold text-slate-main">
            {features.num_percent_encoded} <span className="text-slate-subtle text-[11px]">(%xx)</span>
          </div>
        </div>

        {/* Feature 12: Special Characters */}
        <div className="p-3 rounded-lg bg-background-secondary border border-slate-border/50">
          <span className="text-[10px] text-slate-subtle uppercase block font-mono">12. Special Characters</span>
          <div className="mt-1 font-mono text-sm font-bold text-slate-main">
            {features.num_special_characters}
          </div>
        </div>
      </div>

      {/* Keywords Breakdown (Distinguishing Hostname, Path, Query) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {/* Suspicious Keywords Group */}
        <div className="p-3.5 rounded-lg bg-background-secondary/80 border border-slate-border/60 text-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block mb-2">
            13. Suspicious Security Keywords Breakdown
          </span>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-muted">In Hostname:</span>
              <span className="font-semibold text-slate-main">
                {features.suspicious_keywords.in_hostname.length > 0 ? (
                  <span className="text-threat-danger">
                    {features.suspicious_keywords.in_hostname.join(", ")}
                  </span>
                ) : (
                  <span className="text-slate-subtle">None</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">In Path:</span>
              <span className="font-semibold text-slate-main">
                {features.suspicious_keywords.in_path.length > 0 ? (
                  <span className="text-threat-warning">
                    {features.suspicious_keywords.in_path.join(", ")}
                  </span>
                ) : (
                  <span className="text-slate-subtle">None</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">In Query:</span>
              <span className="font-semibold text-slate-main">
                {features.suspicious_keywords.in_query.length > 0 ? (
                  <span className="text-slate-muted">
                    {features.suspicious_keywords.in_query.join(", ")}
                  </span>
                ) : (
                  <span className="text-slate-subtle">None</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Brand Keywords Group */}
        <div className="p-3.5 rounded-lg bg-background-secondary/80 border border-slate-border/60 text-xs">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent block mb-2">
            14. Targeted Brand Keyword Breakdown
          </span>
          <div className="space-y-1.5 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-muted">In Hostname:</span>
              <span className="font-semibold text-slate-main">
                {features.suspicious_brand_keywords.in_hostname.length > 0 ? (
                  <span className="text-threat-danger">
                    {features.suspicious_brand_keywords.in_hostname.join(", ")}
                  </span>
                ) : (
                  <span className="text-slate-subtle">None</span>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-muted">In Path / Query:</span>
              <span className="font-semibold text-slate-main">
                {[
                  ...features.suspicious_brand_keywords.in_path,
                  ...features.suspicious_brand_keywords.in_query,
                ].length > 0 ? (
                  <span className="text-slate-muted">
                    {[
                      ...features.suspicious_brand_keywords.in_path,
                      ...features.suspicious_brand_keywords.in_query,
                    ].join(", ")}
                  </span>
                ) : (
                  <span className="text-slate-subtle">None</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
