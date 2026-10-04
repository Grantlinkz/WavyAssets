import { apiClient } from "./client"

export type KycTier = "TIER_1" | "TIER_2" | "TIER_3" | "INSTITUTIONAL"
export type KycDossierStatus = "PENDING_REVIEW" | "IN_INSPECTION" | "APPROVED" | "REJECTED" | "ESCALATED_FINMA"
export type DocumentType =
  | "PASSPORT"
  | "PROOF_OF_ADDRESS"
  | "ARTICLES_OF_INCORPORATION"
  | "UBO_DECLARATION"
  | "SOURCE_OF_WEALTH"

export interface ComplianceDocument {
  id: string
  type: string
  rawDocType?: string
  filename: string
  fileSize: string
  uploadedAt: string
  verified: boolean
  status?: "VERIFIED" | "REJECTED" | "PENDING"
  rejectionReason?: string
  rejectedAt?: string
  version?: number
  isLatestVersion?: boolean
  documentUrl: string
  sha256Hash: string
}

export interface FinmaChecklist {
  identityVerified: boolean
  addressVerified: boolean
  sourceOfWealthConfirmed: boolean
  uboIdentified: boolean
  riskCategorizationSigned: boolean
}

export interface KycDossier {
  id: string
  dossierNumber: string
  userId: string
  userName: string
  userEmail: string
  country: string
  entityType: "INDIVIDUAL" | "CORPORATE" | "FAMILY_OFFICE" | "INSTITUTIONAL_FUND"
  submittedAt: string
  currentTier: KycTier
  requestedTier: KycTier
  status: KycDossierStatus
  riskScore: number // 0 - 100
  pepCheckPassed: boolean
  sanctionListClear: boolean
  finmaChecklist: FinmaChecklist
  documents: ComplianceDocument[]
  reviewerNotes?: string
  lastReviewedAt?: string
}

export interface TierElevationPayload {
  dossierId: string
  targetTier: KycTier
  finmaSignOffNotes: string
  officerId: string
}

export interface DossierRejectionPayload {
  dossierId: string
  reason: string
  officerId: string
}

export function normalizeKycDossier(raw: Record<string, unknown>): KycDossier {
  const id = String(raw.id || raw.userId || `dossier-${Math.random().toString(36).slice(2, 8)}`)
  const shortId = id.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase()
  const dossierNumber = String(raw.dossierNumber || `FINMA-KYC-${shortId}`)
  const userName = String(raw.userName || raw.fullName || "Institutional Client")
  const userEmail = String(raw.userEmail || raw.email || "client@swissvault.ch")
  const country = String(raw.country || "Switzerland")
  const entityType = (raw.entityType || (raw.isCorporate ? "CORPORATE" : "INDIVIDUAL")) as KycDossier["entityType"]
  const currentTier = (raw.currentTier || raw.tier || "PRIVATE_WEALTH") as KycDossier["currentTier"]
  const requestedTier = (raw.requestedTier || "INSTITUTIONAL") as KycDossier["requestedTier"]
  const status = (raw.status || (raw.unverifiedCount === 0 ? "APPROVED" : "PENDING_REVIEW")) as KycDossier["status"]
  const riskScore = typeof raw.riskScore === "number" ? raw.riskScore : 12

  const rawDocs = raw.documents as Record<string, unknown>[] | undefined
  const documents: ComplianceDocument[] = Array.isArray(rawDocs)
    ? rawDocs.map((d) => {
        const isVer = Boolean(d.verified ?? d.isVerified)
        const docStat = (d.status as ComplianceDocument["status"]) || (isVer ? "VERIFIED" : "PENDING")
        return {
          id: String(d.id || `doc-${Math.random().toString(36).slice(2, 8)}`),
          type: (d.type || d.docType || "PASSPORT") as DocumentType,
          filename: String(d.filename || `${(String(d.docType || "doc")).toLowerCase()}_${shortId}.pdf`),
          fileSize: String(d.fileSize || "2.4 MB"),
          uploadedAt: String(d.uploadedAt || new Date().toISOString()),
          verified: isVer,
          status: docStat,
          rejectionReason: d.rejectionReason as string | undefined,
          documentUrl: String(d.documentUrl || d.fileUrl || "/api/v1/compliance/dossiers/passport.pdf"),
          sha256Hash: String(d.sha256Hash || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"),
        }
      })
    : [
        {
          id: `doc-${shortId}-1`,
          type: "PASSPORT" as DocumentType,
          filename: `passport_${shortId}.pdf`,
          fileSize: "2.4 MB",
          uploadedAt: new Date().toISOString(),
          verified: status === "APPROVED",
          status: status === "APPROVED" ? "VERIFIED" : status === "REJECTED" ? "REJECTED" : "PENDING",
          documentUrl: "/api/v1/compliance/dossiers/passport.pdf",
          sha256Hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        },
      ]

  return {
    id,
    dossierNumber,
    userId: String(raw.userId || id.replace("dossier-", "")),
    userName,
    userEmail,
    country,
    entityType,
    submittedAt: String(raw.submittedAt || new Date().toISOString()),
    currentTier,
    requestedTier,
    status,
    riskScore,
    pepCheckPassed: Boolean(raw.pepCheckPassed ?? true),
    sanctionListClear: Boolean(raw.sanctionListClear ?? true),
    finmaChecklist: (raw.finmaChecklist as FinmaChecklist) || {
      identityVerified: status === "APPROVED",
      addressVerified: true,
      sourceOfWealthConfirmed: true,
      uboIdentified: true,
      riskCategorizationSigned: true,
    },
    documents,
    reviewerNotes: raw.reviewerNotes as string | undefined,
    lastReviewedAt: raw.lastReviewedAt as string | undefined,
  }
}

export async function fetchKycQueue(status?: string): Promise<KycDossier[]> {
  const query = status && status !== "ALL" ? `?status=${encodeURIComponent(status)}` : ""
  try {
    let rawList: Record<string, unknown>[] = []
    try {
      const res = await apiClient<Record<string, unknown> | Record<string, unknown>[]>(`/compliance/dossiers${query}`)
      if (Array.isArray(res)) rawList = res
      else if (res && typeof res === "object") {
        if ("dossiers" in res && Array.isArray(res.dossiers)) rawList = res.dossiers as Record<string, unknown>[]
        else if ("queue" in res && Array.isArray(res.queue)) rawList = res.queue as Record<string, unknown>[]
      }
    } catch {
      // Fallback to /compliance/queue
      const res = await apiClient<Record<string, unknown> | Record<string, unknown>[]>(`/compliance/queue${query}`)
      if (Array.isArray(res)) rawList = res
      else if (res && typeof res === "object") {
        if ("queue" in res && Array.isArray(res.queue)) rawList = res.queue as Record<string, unknown>[]
        else if ("dossiers" in res && Array.isArray(res.dossiers)) rawList = res.dossiers as Record<string, unknown>[]
      }
    }
    return rawList.map(normalizeKycDossier)
  } catch (err) {
    console.error("fetchKycQueue error:", err)
    return []
  }
}

export async function fetchDossierById(dossierId: string): Promise<KycDossier> {
  const res = await apiClient<Record<string, unknown>>(`/compliance/dossiers/${encodeURIComponent(dossierId)}`)
  return normalizeKycDossier(res)
}

export async function elevateUserTier(
  payload: TierElevationPayload
): Promise<{ success: boolean; dossier: KycDossier; message: string }> {
  return apiClient<{ success: boolean; dossier: KycDossier; message: string }>(
    `/compliance/dossiers/${encodeURIComponent(payload.dossierId)}/elevate`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export async function rejectKycDossier(
  payload: DossierRejectionPayload
): Promise<{ success: boolean; dossier: KycDossier; message: string }> {
  return apiClient<{ success: boolean; dossier: KycDossier; message: string }>(
    `/compliance/dossiers/${encodeURIComponent(payload.dossierId)}/reject`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export async function updateFinmaChecklist(
  dossierId: string,
  checklist: Partial<FinmaChecklist>
): Promise<{ success: boolean; checklist: FinmaChecklist }> {
  return apiClient<{ success: boolean; checklist: FinmaChecklist }>(
    `/compliance/dossiers/${encodeURIComponent(dossierId)}/checklist`,
    {
      method: "PATCH",
      body: JSON.stringify({ checklist }),
    }
  )
}

export async function verifyComplianceDocument(payload: {
  documentId: string
  isVerified: boolean
  rejectionReason?: string
}): Promise<{
  documentId: string
  isVerified: boolean
  docType: string
  userId: string
  message: string
}> {
  return apiClient<{
    documentId: string
    isVerified: boolean
    docType: string
    userId: string
    message: string
  }>(`/compliance/verify-document`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
