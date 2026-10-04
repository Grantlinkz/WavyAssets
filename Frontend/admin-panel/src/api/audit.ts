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
  const res = await apiClient<unknown>(`/audit/logs${queryString}`)
  let rawList: Record<string, unknown>[] = []
  if (Array.isArray(res)) {
    rawList = res as Record<string, unknown>[]
  } else if (res && typeof res === "object") {
    const obj = res as Record<string, unknown>
    if ("logs" in obj && Array.isArray(obj.logs)) {
      rawList = obj.logs as Record<string, unknown>[]
    } else if ("items" in obj && Array.isArray(obj.items)) {
      rawList = obj.items as Record<string, unknown>[]
    }
  }
  return rawList.map((l: Record<string, unknown>) => {
    const admin = l.admin as Record<string, unknown> | undefined
    const categoryStr = String(l.actionCategory || "")
    const computedCategory: AuditCategory =
      categoryStr === "CREDIT" ||
      categoryStr === "LOCK" ||
      categoryStr === "KYC" ||
      categoryStr === "RAIL" ||
      categoryStr === "VIP_CARD"
        ? (categoryStr as AuditCategory)
        : String(l.action || "").includes("CREDIT")
        ? "CREDIT"
        : String(l.action || "").includes("LOCK")
        ? "LOCK"
        : String(l.action || "").includes("KYC")
        ? "KYC"
        : "ALL"

    return {
      ...(l as unknown as AuditLogEntry),
      timestamp: String(l.timestamp || (l.createdAt ? new Date(String(l.createdAt)).toISOString().replace("T", " ").substring(0, 19) : "")),
      officerName: String(l.officerName || admin?.fullName || "System Officer"),
      officerDepartment: String(l.officerDepartment || (admin?.role ? String(admin.role).replace(/_/g, " ") : "Operations")),
      targetLabel: String(l.targetLabel || l.targetEntity || "Client Entity"),
      nodeOrigin: String(l.nodeOrigin || (l.ipAddressHash ? `SHA256:${String(l.ipAddressHash).substring(0, 8)}` : "Node CH-ZUR-01")),
      ledgerState: String(l.ledgerState || "COMMITTED"),
      actionCategory: computedCategory,
    }
  })
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
