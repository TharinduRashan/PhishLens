export type RiskLevel =
  | "LOW"
  | "SUSPICIOUS"
  | "HIGH"
  | "SAFE"
  | "MALICIOUS"
  | "UNKNOWN";

export type ScanType = "URL" | "EMAIL";

export interface RuleIndicator {
  rule_id: string;
  name: string;
  severity: "low" | "medium" | "high" | "critical" | string;
  description: string;
  score: number;
  evidence: string;
}

export interface KeywordOccurrenceGroup {
  in_hostname: string[];
  in_path: string[];
  in_query: string[];
  total: number;
}

export interface URLFeatures {
  url_length: number;
  hostname_length: number;
  num_subdomains: number;
  is_ip_address: boolean;
  is_https: boolean;
  has_at_symbol: boolean;
  suspicious_keywords: KeywordOccurrenceGroup;
  is_shortened_url: boolean;
  has_punycode: boolean;
  num_special_characters: number;
  num_percent_encoded: number;
  has_unusual_port: boolean;
  hostname_hyphens: number;
  suspicious_brand_keywords: KeywordOccurrenceGroup;
}

export interface URLScanResponse {
  scan_id: string;
  url: string;
  status: string;
  risk_score: number;
  risk_level: "LOW" | "SUSPICIOUS" | "HIGH";
  analysis_type: string;
  summary: string;
  features: URLFeatures;
  indicators: RuleIndicator[];
  analyzed_at: string;
}

// Legacy / common indicators for backward compatibility
export interface DetectionIndicator {
  code: string;
  name: string;
  severity: string;
  description: string;
  detected: boolean;
}

export interface ScanResult {
  scan_id: string;
  target: string;
  scan_type: ScanType;
  risk_level: RiskLevel;
  threat_score: number;
  summary: string;
  indicators: DetectionIndicator[];
  engine_status: string;
  phase: string;
  analyzed_at: string;
}

export interface ScanHistoryItem {
  id: string;
  target: string;
  scan_type: ScanType;
  risk_level: RiskLevel;
  threat_score: number;
  engine_status: string;
  created_at: string;
}

export interface PlatformHealth {
  status: string;
  version: string;
  environment: string;
  uptime_seconds: number;
  database: string;
  timestamp: string;
  capabilities: string[];
}
