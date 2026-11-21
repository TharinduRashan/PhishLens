import { ScanHistoryItem } from "./types";

export interface DashboardStats {
  totalScans: number;
  safeUrls: number;
  suspiciousUrls: number;
  maliciousUrls: number;
  avgThreatScore: number;
  blockedAttacks24h: number;
}

export const DEMO_STATS: DashboardStats = {
  totalScans: 1428,
  safeUrls: 964,
  suspiciousUrls: 312,
  maliciousUrls: 152,
  avgThreatScore: 24,
  blockedAttacks24h: 38,
};

export const DEMO_THREAT_DISTRIBUTION = [
  { name: "Safe", count: 964, color: "#22C55E" },
  { name: "Suspicious", count: 312, color: "#F59E0B" },
  { name: "Malicious", count: 152, color: "#EF4444" },
];

export const DEMO_SCAN_TIMELINE = [
  { time: "00:00", safe: 42, suspicious: 12, malicious: 6 },
  { time: "04:00", safe: 28, suspicious: 9, malicious: 4 },
  { time: "08:00", safe: 84, suspicious: 26, malicious: 14 },
  { time: "12:00", safe: 156, suspicious: 48, malicious: 22 },
  { time: "16:00", safe: 198, suspicious: 62, malicious: 31 },
  { time: "20:00", safe: 120, suspicious: 34, malicious: 18 },
];

export const DEMO_TOP_ATTACK_VECTORS = [
  { vector: "IDN Homograph Mimicry", count: 68, percentage: 44.7 },
  { vector: "Credential Harvest Form", count: 42, percentage: 27.6 },
  { vector: "High Shannon Entropy (DGA)", count: 24, percentage: 15.8 },
  { vector: "Suspicious TLD Extension", count: 18, percentage: 11.9 },
];

export const DEMO_RECENT_SCANS: ScanHistoryItem[] = [
  {
    id: "scan-9f81a-2026",
    target: "https://paypa1-account-verification-auth.top/signin",
    scan_type: "URL",
    risk_level: "MALICIOUS",
    threat_score: 94,
    engine_status: "flagged",
    created_at: "2026-11-22T02:45:10Z",
  },
  {
    id: "scan-7e12b-2026",
    target: "https://secure.github.com/login",
    scan_type: "URL",
    risk_level: "SAFE",
    threat_score: 2,
    engine_status: "verified",
    created_at: "2026-11-22T02:38:22Z",
  },
  {
    id: "scan-4d33c-2026",
    target: "Urgent Wire Transfer Authorization & Employee Portal",
    scan_type: "EMAIL",
    risk_level: "MALICIOUS",
    threat_score: 88,
    engine_status: "flagged",
    created_at: "2026-11-22T02:15:40Z",
  },
  {
    id: "scan-3c99d-2026",
    target: "https://onedrive-sharepoint-docs-portal.xyz/download",
    scan_type: "URL",
    risk_level: "SUSPICIOUS",
    threat_score: 64,
    engine_status: "flagged",
    created_at: "2026-11-22T01:50:18Z",
  },
  {
    id: "scan-2b88e-2026",
    target: "https://stripe.com/docs/api",
    scan_type: "URL",
    risk_level: "SAFE",
    threat_score: 0,
    engine_status: "verified",
    created_at: "2026-11-22T01:22:05Z",
  },
  {
    id: "scan-1a77f-2026",
    target: "Quarterly Compensation Adjustment Review Notification",
    scan_type: "EMAIL",
    risk_level: "SUSPICIOUS",
    threat_score: 55,
    engine_status: "flagged",
    created_at: "2026-11-22T00:58:33Z",
  },
  {
    id: "scan-0f66a-2026",
    target: "https://aws.amazon.com/console",
    scan_type: "URL",
    risk_level: "SAFE",
    threat_score: 1,
    engine_status: "verified",
    created_at: "2026-11-21T23:40:12Z",
  },
  {
    id: "scan-9e55b-2026",
    target: "https://appleid-security-lockout-support.info/recover",
    scan_type: "URL",
    risk_level: "MALICIOUS",
    threat_score: 98,
    engine_status: "flagged",
    created_at: "2026-11-21T22:14:09Z",
  },
];
