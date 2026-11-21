export type RiskLevel = "SAFE" | "SUSPICIOUS" | "MALICIOUS" | "UNKNOWN";
export type ScanType = "URL" | "EMAIL";
export type IndicatorSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface DetectionIndicator {
  code: string;
  name: string;
  severity: IndicatorSeverity;
  description: string;
  detected: boolean;
}

export interface ScanResult {
  scan_id: string;
  target: string;
  scan_type: ScanType;
  risk_level: RiskLevel;
  threat_score: number; // 0 - 100
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
