import { PlatformHealth, ScanHistoryItem, ScanResult, URLScanResponse } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ApiResponseWrapper<T> {
  status: string;
  message: string;
  data: T;
  timestamp: string;
}

export async function fetchHealth(): Promise<PlatformHealth | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body: ApiResponseWrapper<PlatformHealth> = await res.json();
    return body.data;
  } catch (error) {
    return null;
  }
}

export async function submitUrlScan(
  url: string,
  deepAnalysis = false
): Promise<URLScanResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/scan/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, deep_analysis: deepAnalysis }),
  });

  const body = await res.json();

  if (!res.ok) {
    const detailMsg = body.detail || body.message || `Scan request failed with HTTP ${res.status}`;
    throw new Error(detailMsg);
  }

  return body as URLScanResponse;
}

export async function submitEmailScan(
  content: string,
  sender?: string,
  subject?: string
): Promise<{ success: boolean; data: ScanResult; isPhase1Queued: boolean; rawMessage?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/scan/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, sender, subject }),
    });

    const body = await res.json();

    if (res.status === 501) {
      return {
        success: true,
        data: body.data,
        isPhase1Queued: true,
        rawMessage: body.message,
      };
    }

    if (!res.ok) {
      throw new Error(body.message || body.detail || `Scan request failed with HTTP ${res.status}`);
    }

    return {
      success: true,
      data: body.data,
      isPhase1Queued: false,
      rawMessage: body.message,
    };
  } catch (error: any) {
    throw error;
  }
}

export async function fetchScans(
  limit = 20,
  offset = 0,
  riskLevel?: string,
  scanType?: string
): Promise<{ total: number; items: ScanHistoryItem[] }> {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (riskLevel && riskLevel !== "ALL") params.append("risk_level", riskLevel);
    if (scanType && scanType !== "ALL") params.append("scan_type", scanType);

    const res = await fetch(`${API_BASE_URL}/api/v1/scans?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) return { total: 0, items: [] };
    const body: ApiResponseWrapper<{ total: number; items: ScanHistoryItem[] }> = await res.json();
    return body.data;
  } catch (error) {
    return { total: 0, items: [] };
  }
}
