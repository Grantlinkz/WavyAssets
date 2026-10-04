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
  referenceId?: string
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

export function normalizePendingDeposit(raw: Record<string, unknown>): PendingDeposit {
  const user = (raw.user && typeof raw.user === "object" ? raw.user : {}) as Record<string, unknown>
  const id = String(raw.id || `dep-${Math.random().toString(36).slice(2, 8)}`)
  const userId = String(raw.userId || user.id || "")
  const userName = String(raw.userName || user.fullName || raw.counterparty || "Institutional Depositor")
  const userCif = String(raw.userCif || (userId ? `CIF-${userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}` : "CIF-INST-001"))
  const railType = String(raw.railType || raw.rail || "SWISS_SIC")
  const amount = Number(raw.amount) || 0
  const currency = String(raw.currency || "USD")
  const senderName = String(raw.senderName || raw.counterparty || userName)
  const senderBank = String(raw.senderBank || (railType === "SWISS_SIC" ? "UBS Switzerland AG" : "Bank of America NA"))
  const senderIbanOrAddress = String(raw.senderIbanOrAddress || raw.accountNumber || "CH44 0024 0240 1234 5678 9")
  const wireMemo = String(raw.wireMemo || raw.description || "Inbound Capital Segregation")
  const status = (String(raw.status || "PENDING").toUpperCase()) as PendingDeposit["status"]
  const createdAt = String(raw.createdAt || new Date().toISOString())

  return {
    id,
    userId,
    userName,
    userCif,
    railType,
    amount,
    currency,
    senderName,
    senderBank,
    senderIbanOrAddress,
    wireMemo,
    proofReceiptUrl: raw.proofReceiptUrl as string | undefined,
    txHash: raw.txHash as string | undefined,
    status: status === "SETTLED" ? "SETTLED" : status === "FAILED" ? "FAILED" : "PENDING",
    createdAt,
  }
}

export function normalizePendingWithdrawal(raw: Record<string, unknown>): PendingWithdrawal {
  const user = (raw.user && typeof raw.user === "object" ? raw.user : {}) as Record<string, unknown>
  const id = String(raw.id || `wth-${Math.random().toString(36).slice(2, 8)}`)
  const referenceId = String(raw.referenceId || id)
  const userId = String(raw.userId || user.id || "")
  const userName = String(raw.userName || user.fullName || raw.counterparty || "Institutional Client")
  const userCif = String(raw.userCif || (userId ? `CIF-${userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}` : "CIF-INST-001"))
  const userTier = String(raw.userTier || user.tier || "INSTITUTIONAL")
  const settlementRail = String(raw.settlementRail || raw.rail || "SWISS_SIC")
  const routingMode = String(raw.routingMode || "RTGS / Direct Bridge")

  const desc = String(raw.description || "")
  let targetInstitution = String(raw.targetInstitution || "")
  if (!targetInstitution) {
    if (desc.includes("to UBS")) {
      targetInstitution = "UBS Switzerland AG"
    } else if (desc.includes("Bank Wire Transfer to ")) {
      targetInstitution = desc.split("Bank Wire Transfer to ")[1]?.split(" (")[0] || "Bank Wire Transfer"
    } else if (desc.includes("Crypto Disbursement (")) {
      targetInstitution = desc.split("Crypto Disbursement (")[1]?.split(")")[0] || "Crypto Vault Rail"
    } else if (settlementRail === "SWISS_SIC") {
      targetInstitution = "UBS Switzerland AG"
    } else if (settlementRail === "FEDWIRE") {
      targetInstitution = "Federal Reserve Fedwire"
    } else {
      targetInstitution = settlementRail
    }
  }

  const beneficiaryIbanOrAddress = String(raw.beneficiaryIbanOrAddress || raw.accountNumber || "CH93 0023 8812 4019 8821 0")
  const beneficiaryName = String(raw.beneficiaryName || raw.counterparty || userName)
  const amount = Number(raw.amount) || 0
  const currency = String(raw.currency || "USD")
  const requiresDualSignOff = Boolean(raw.requiresDualSignOff ?? (amount > 100000))
  const currentSignOffCount = Number(raw.currentSignOffCount ?? raw.signOffCount ?? 0)
  const requiredSignOffCount = Number(raw.requiredSignOffCount ?? raw.requiredSignOffsCount ?? (requiresDualSignOff ? 2 : 1))
  const rawStatus = String(raw.status || "PENDING_APPROVAL").toUpperCase()
  const status: PendingWithdrawal["status"] =
    rawStatus.includes("SECOND") || (currentSignOffCount === 1 && requiresDualSignOff)
      ? "PENDING_SECOND_SIGN_OFF"
      : rawStatus.includes("SETTLE") || currentSignOffCount >= requiredSignOffCount
      ? "SETTLED"
      : rawStatus.includes("REJECT")
      ? "REJECTED"
      : "PENDING_APPROVAL"

  return {
    id,
    referenceId,
    userId,
    userName,
    userCif,
    userTier,
    settlementRail,
    routingMode,
    targetInstitution,
    beneficiaryIbanOrAddress,
    beneficiaryName,
    amount,
    currency,
    requiresDualSignOff,
    currentSignOffCount,
    requiredSignOffCount,
    status,
    isWhitelistedDestination: Boolean(raw.isWhitelistedDestination ?? true),
    availableCash: Number(raw.availableCash || 0),
    createdAt: String(raw.createdAt || new Date().toISOString()),
  }
}


export async function fetchPendingDeposits(params?: {
  rail?: string
  search?: string
}): Promise<PendingDeposit[]> {
  const queryParts: string[] = []
  if (params?.rail && params.rail !== "ALL") queryParts.push(`rail=${encodeURIComponent(params.rail)}`)
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : ""
  const res = await apiClient<Record<string, unknown>[] | { deposits?: Record<string, unknown>[]; items?: Record<string, unknown>[] }>(
    `/treasury/pending-deposits${queryString}`
  )
  let rawItems: Record<string, unknown>[] = []
  if (Array.isArray(res)) rawItems = res
  else if (res && typeof res === "object") {
    if ("deposits" in res && Array.isArray(res.deposits)) rawItems = res.deposits
    else if ("items" in res && Array.isArray(res.items)) rawItems = res.items
  }
  return rawItems.map(normalizePendingDeposit)
}

export async function fetchPendingWithdrawals(params?: {
  rail?: string
  search?: string
}): Promise<PendingWithdrawal[]> {
  const queryParts: string[] = []
  if (params?.rail && params.rail !== "ALL") queryParts.push(`rail=${encodeURIComponent(params.rail)}`)
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : ""
  const res = await apiClient<Record<string, unknown>[] | { withdrawals?: Record<string, unknown>[]; items?: Record<string, unknown>[] }>(
    `/treasury/pending-withdrawals${queryString}`
  )
  let rawItems: Record<string, unknown>[] = []
  if (Array.isArray(res)) rawItems = res
  else if (res && typeof res === "object") {
    if ("withdrawals" in res && Array.isArray(res.withdrawals)) rawItems = res.withdrawals
    else if ("items" in res && Array.isArray(res.items)) rawItems = res.items
  }
  return rawItems.map(normalizePendingWithdrawal)
}

export async function approveDeposit(
  payload: ApproveDepositPayload
): Promise<{ success: boolean; transaction: PendingDeposit; message: string }> {
  const { transactionId, ...body } = payload
  return apiClient<{ success: boolean; transaction: PendingDeposit; message: string }>(
    `/treasury/deposits/${transactionId}/approve`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  )
}

export async function rejectDeposit(
  payload: RejectDepositPayload
): Promise<{ success: boolean; transaction: PendingDeposit; message: string }> {
  const { transactionId, ...body } = payload
  return apiClient<{ success: boolean; transaction: PendingDeposit; message: string }>(
    `/treasury/deposits/${transactionId}/reject`,
    {
      method: "POST",
      body: JSON.stringify(body),
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
