import { apiClient } from "./client"

export type InquiryStatus = "NEW" | "IN_REVIEW" | "MANDATE_SENT" | "ARCHIVED"

export interface LeadInquiry {
  id: string
  dossierId: string
  receivedAt: string
  company: string
  trustScore: number
  isDomainVerified: boolean
  contactName: string
  email: string
  telegram: string
  location: string
  assetInterest: string
  bracket: string
  declaredCapital: string
  custodyPreference: string
  investmentWindow: string
  status: InquiryStatus
  source: string
  ipAddress: string
  notes?: string
}

export interface ConvertUserPayload {
  fullName: string
  email: string
  accessTier: string
  initialKycTier: string
  startingCashBalance: number
  inquiryId?: string
}

export async function fetchInquiries(statusFilter?: string): Promise<LeadInquiry[]> {
  const query = statusFilter && statusFilter !== "ALL" ? `?status=${statusFilter}` : ""
  return apiClient<LeadInquiry[]>(`/inquiries${query}`)
}

export async function updateInquiryStatus(
  id: string,
  status: InquiryStatus,
  notes?: string
): Promise<LeadInquiry> {
  return apiClient<LeadInquiry>(`/inquiries/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
  })
}

export async function convertInquiryToUser(
  payload: ConvertUserPayload
): Promise<{ success: boolean; userId: string; message: string }> {
  return apiClient<{ success: boolean; userId: string; message: string }>("/users/convert", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
