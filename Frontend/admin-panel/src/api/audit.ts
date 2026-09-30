import { apiClient } from "./client"

export type AuditCategory = "ALL" | "CREDIT" | "LOCK" | "KYC" | "RAIL" | "VIP_CARD"

export interface AuditLogEntry {
  id: string
  timestamp: string
  officerId: string
  officerName: string
  officerDepartment: string
  action: string
  actionCategory: AuditCategory
  targetEntity: string
  targetId: string
  targetLabel: string
  reason: string
  nodeOrigin: string
  ledgerState: string
  sha256Hash: string
  merkleBlock: number
  diffBefore?: Record<string, unknown> | null
  diffAfter?: Record<string, unknown> | null
  deltaAmount?: number
  deltaCurrency?: string
}

export interface AuditTelemetry {
  totalLogEntries: number
  todayExecutions: number
  merkleRoot: string
  merkleBlock: number
  retentionYears: number
}

export async function fetchAuditLogs(params?: {
  search?: string
  category?: string
  officer?: string
  dateRange?: string
}): Promise<AuditLogEntry[]> {
  const queryParts: string[] = []
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params?.category && params.category !== "ALL") queryParts.push(`category=${encodeURIComponent(params.category)}`)
  if (params?.officer && params.officer !== "ALL") queryParts.push(`officer=${encodeURIComponent(params.officer)}`)
  if (params?.dateRange) queryParts.push(`dateRange=${encodeURIComponent(params.dateRange)}`)

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : ""
  const res = await apiClient<AuditLogEntry[] | { logs?: AuditLogEntry[]; items?: AuditLogEntry[] }>(`/audit/logs${queryString}`)
  if (Array.isArray(res)) return res
  if (res && typeof res === "object") {
    if ("logs" in res && Array.isArray(res.logs)) return res.logs
    if ("items" in res && Array.isArray(res.items)) return res.items
  }
  return []
}

export async function fetchAuditLogById(id: string): Promise<AuditLogEntry> {
  return apiClient<AuditLogEntry>(`/audit/logs/${id}`)
}

export async function fetchAuditTelemetry(): Promise<AuditTelemetry> {
  return apiClient<AuditTelemetry>("/audit/telemetry")
}

export async function verifyMerkleProof(id: string): Promise<{ verified: boolean; proofHash: string; merkleRoot: string }> {
  return apiClient<{ verified: boolean; proofHash: string; merkleRoot: string }>(`/audit/verify/${id}`, {
    method: "POST",
  })
}
