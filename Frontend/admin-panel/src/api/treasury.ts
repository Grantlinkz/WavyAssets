import { apiClient } from "./client"

export type SettlementRail = "ALL" | "SIC" | "Fedwire" | "SEPA" | "USDC" | "USDT" | "BTC" | "ETH"

export interface PendingDeposit {
  id: string
  userId: string
  userName: string
  userCif: string
  railType: string
  amount: number
  currency: string
  senderName: string
  senderBank: string
  senderIbanOrAddress: string
  wireMemo: string
  proofReceiptUrl?: string
  txHash?: string
  status: "PENDING" | "SETTLED" | "FAILED"
  createdAt: string
}

export interface OfficerSignOffRecord {
  officerId?: string
  officerName: string
  officerRole: string
  signedAt: string
  tokenType: string
}

export interface PendingWithdrawal {
  id: string
  userId: string
  userName: string
  userCif: string
  userTier: string
  settlementRail: string
  routingMode: string
  targetInstitution: string
  beneficiaryIbanOrAddress: string
  beneficiaryName: string
  amount: number
  currency: string
  requiresDualSignOff: boolean
  currentSignOffCount: number
  requiredSignOffCount: number
  firstOfficerSignOff?: OfficerSignOffRecord
  secondOfficerSignOff?: OfficerSignOffRecord
  status: "PENDING_APPROVAL" | "PENDING_SECOND_SIGN_OFF" | "SETTLED" | "REJECTED"
  isWhitelistedDestination: boolean
  availableCash: number
  createdAt: string
}

export interface SignOffPayload {
  transactionId: string
  action: "APPROVE" | "REJECT"
  officerToken: string
  complianceAttestations: {
    ibanMatchesMandate: boolean
    liquidityVerified: boolean
    voiceOrHardwareOtpConfirmed: boolean
  }
  notes?: string
}

export interface ApproveDepositPayload {
  transactionId: string
  auditNote?: string
}

export interface RejectDepositPayload {
  transactionId: string
  reason: string
}

export async function fetchPendingDeposits(params?: {
  rail?: string
  search?: string
}): Promise<PendingDeposit[]> {
  const queryParts: string[] = []
  if (params?.rail && params.rail !== "ALL") queryParts.push(`rail=${encodeURIComponent(params.rail)}`)
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : ""
  return apiClient<PendingDeposit[]>(`/treasury/pending-deposits${queryString}`)
}

export async function fetchPendingWithdrawals(params?: {
  rail?: string
  search?: string
}): Promise<PendingWithdrawal[]> {
  const queryParts: string[] = []
  if (params?.rail && params.rail !== "ALL") queryParts.push(`rail=${encodeURIComponent(params.rail)}`)
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : ""
  return apiClient<PendingWithdrawal[]>(`/treasury/pending-withdrawals${queryString}`)
}

export async function approveDeposit(
  payload: ApproveDepositPayload
): Promise<{ success: boolean; transaction: PendingDeposit; message: string }> {
  return apiClient<{ success: boolean; transaction: PendingDeposit; message: string }>(
    `/treasury/deposits/${payload.transactionId}/approve`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export async function rejectDeposit(
  payload: RejectDepositPayload
): Promise<{ success: boolean; transaction: PendingDeposit; message: string }> {
  return apiClient<{ success: boolean; transaction: PendingDeposit; message: string }>(
    `/treasury/deposits/${payload.transactionId}/reject`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export async function signOffWithdrawal(
  payload: SignOffPayload
): Promise<{ success: boolean; transaction: PendingWithdrawal; message: string }> {
  return apiClient<{ success: boolean; transaction: PendingWithdrawal; message: string }>(
    `/treasury/withdrawals/${payload.transactionId}/sign-off`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}

export async function rejectAndRefundWithdrawal(payload: {
  transactionId: string
  reason: string
}): Promise<{ success: boolean; transaction: PendingWithdrawal; message: string }> {
  return apiClient<{ success: boolean; transaction: PendingWithdrawal; message: string }>(
    `/treasury/withdrawals/${payload.transactionId}/reject-and-refund`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}
