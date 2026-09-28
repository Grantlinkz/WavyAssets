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
  type: DocumentType
  filename: string
  fileSize: string
  uploadedAt: string
  verified: boolean
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

export async function fetchKycQueue(status?: string): Promise<KycDossier[]> {
  const query = status && status !== "ALL" ? `?status=${encodeURIComponent(status)}` : ""
  return apiClient<KycDossier[]>(`/compliance/dossiers${query}`)
}

export async function fetchDossierById(dossierId: string): Promise<KycDossier> {
  return apiClient<KycDossier>(`/compliance/dossiers/${encodeURIComponent(dossierId)}`)
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
