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
  let rawList: any[] = []
  if (Array.isArray(res)) {
    rawList = res
  } else if (res && typeof res === "object") {
    if ("logs" in res && Array.isArray(res.logs)) rawList = res.logs
    else if ("items" in res && Array.isArray(res.items)) rawList = res.items
  }
  return rawList.map((l: any) => ({
    ...l,
    timestamp: l.timestamp || (l.createdAt ? new Date(l.createdAt).toISOString().replace("T", " ").substring(0, 19) : ""),
    officerName: l.officerName || l.admin?.fullName || "System Officer",
    officerDepartment: l.officerDepartment || (l.admin?.role ? l.admin.role.replace(/_/g, " ") : "Operations"),
    targetLabel: l.targetLabel || l.targetEntity || "Client Entity",
    nodeOrigin: l.nodeOrigin || (l.ipAddressHash ? `SHA256:${l.ipAddressHash.substring(0, 8)}` : "Node CH-ZUR-01"),
    ledgerState: l.ledgerState || "COMMITTED",
    actionCategory: l.actionCategory || (l.action?.includes("CREDIT") ? "CREDIT" : l.action?.includes("LOCK") ? "LOCK" : l.action?.includes("KYC") ? "KYC" : "ALL"),
  }))
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
