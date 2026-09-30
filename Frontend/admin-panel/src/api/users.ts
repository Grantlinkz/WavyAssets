import { apiClient } from "./client"

export type UserTier = "PRIVATE_WEALTH" | "INSTITUTIONAL" | "RETAIL" | "TIER_1" | "TIER_2" | "TIER_3"
export type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION" | "FROZEN"
export type BalanceType = "AVAILABLE_CASH" | "INVESTED_CAPITAL"

export interface UserBalances {
  availableCash: number
  investedCapital: number
  totalVaultBalance: number
  currency: string
}

export interface SupremeUser {
  id: string
  fullLegalName: string
  email: string
  institutionName?: string
  accessTier: UserTier
  status: UserStatus
  kycStatus: "APPROVED" | "PENDING" | "REJECTED" | "UNDER_REVIEW"
  balances: UserBalances
  riskScore: number // 0 - 100
  country: string
  joinedAt: string
  lastActiveAt: string
}

export interface CreateUserPayload {
  fullLegalName: string
  email: string
  institutionName?: string
  accessTier: UserTier
  initialFunding?: number
  currency?: string
  auditReason?: string
  passphrase?: string
}

export interface UpdateUserPayload {
  fullLegalName?: string
  email?: string
  accessTier?: UserTier
  kycTier?: string
  isCorporate?: boolean
  isActive?: boolean
  passphrase?: string
}

export interface SuspendUserPayload {
  userId: string
  reason: string
  action: "SUSPEND" | "ACTIVATE"
  killActiveSessions: boolean
}

export interface DirectFundingPayload {
  userId: string
  amount: number
  targetBalance: BalanceType
  direction: "CREDIT" | "DEBIT"
  currency: string
  auditJustification: string
  complianceReferenceId: string
}

export interface EmailUserPayload {
  subject: string
  message: string
}

export function normalizeSupremeUser(raw: Record<string, unknown>): SupremeUser {
  const rawBalances = (raw.balances && typeof raw.balances === "object" ? raw.balances : {}) as Record<string, unknown>
  const availableCash = Number(raw.availableCash ?? rawBalances.availableCash ?? 0)
  const investedCapital = Number(raw.investedCapital ?? rawBalances.investedCapital ?? 0)
  const totalVaultBalance = Number(
    raw.totalBalance ?? rawBalances.totalVaultBalance ?? availableCash + investedCapital
  )
  const currency = (rawBalances.currency as string) || "USD"

  const rawStatus = String(raw.status || (raw.isActive === false ? "SUSPENDED" : "ACTIVE")).toUpperCase()
  const status: UserStatus =
    rawStatus.includes("SUSPEND") || rawStatus.includes("LOCK")
      ? "SUSPENDED"
      : rawStatus.includes("PEND")
      ? "PENDING_VERIFICATION"
      : rawStatus.includes("FROZ")
      ? "FROZEN"
      : "ACTIVE"

  return {
    id: String(raw.id || ""),
    fullLegalName: String(raw.fullLegalName || raw.fullName || raw.name || "Anonymous Client"),
    email: String(raw.email || ""),
    institutionName: (raw.institutionName as string) || (raw.isCorporate ? "Corporate Entity" : undefined),
    accessTier: ((raw.accessTier || raw.tier || "PRIVATE_WEALTH") as UserTier),
    status,
    kycStatus: ((raw.kycStatus || (raw.kycTier === "TIER_3" ? "APPROVED" : "PENDING")) as SupremeUser["kycStatus"]),
    balances: {
      availableCash,
      investedCapital,
      totalVaultBalance,
      currency,
    },
    riskScore: typeof raw.riskScore === "number" ? raw.riskScore : 12,
    country: (raw.country as string) || "Switzerland",
    joinedAt: String(raw.joinedAt || raw.createdAt || new Date().toISOString()),
    lastActiveAt: String(raw.lastActiveAt || raw.updatedAt || new Date().toISOString()),
  }
}

export async function fetchUsers(params?: {
  search?: string
  tier?: string
  status?: string
}): Promise<SupremeUser[]> {
  const queryParts: string[] = []
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params?.tier && params.tier !== "ALL") queryParts.push(`tier=${encodeURIComponent(params.tier)}`)
  if (params?.status && params.status !== "ALL") queryParts.push(`status=${encodeURIComponent(params.status)}`)

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : ""
  const res = await apiClient<Record<string, unknown> | Record<string, unknown>[]>(`/users${queryString}`)

  let rawList: Record<string, unknown>[] = []
  if (Array.isArray(res)) {
    rawList = res
  } else if (res && typeof res === "object") {
    if ("items" in res && Array.isArray(res.items)) {
      rawList = res.items as Record<string, unknown>[]
    } else if ("users" in res && Array.isArray(res.users)) {
      rawList = res.users as Record<string, unknown>[]
    }
  }

  return rawList.map(normalizeSupremeUser)
}

export async function fetchUserById(id: string): Promise<SupremeUser> {
  const res = await apiClient<Record<string, unknown>>(`/users/${encodeURIComponent(id)}`)
  return normalizeSupremeUser(res)
}

export async function createUser(payload: CreateUserPayload): Promise<SupremeUser> {
  const res = await apiClient<Record<string, unknown>>("/users", {
    method: "POST",
    body: JSON.stringify({
      fullName: payload.fullLegalName,
      email: payload.email,
      tier: payload.accessTier,
      startingCashBalance: payload.initialFunding || 0,
      passphrase: payload.passphrase,
      isCorporate: !!payload.institutionName,
    }),
  })
  return normalizeSupremeUser(res)
}

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<SupremeUser> {
  const res = await apiClient<Record<string, unknown>>(`/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      fullName: payload.fullLegalName,
      email: payload.email,
      tier: payload.accessTier,
      kycTier: payload.kycTier,
      isCorporate: payload.isCorporate,
      isActive: payload.isActive,
      passphrase: payload.passphrase,
    }),
  })
  return normalizeSupremeUser(res)
}

export async function suspendUser(
  payload: SuspendUserPayload
): Promise<{ success: boolean; user: SupremeUser; message: string }> {
  const res = await apiClient<Record<string, unknown>>(
    `/users/${encodeURIComponent(payload.userId)}/suspend`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  )
  const userData = (res.user && typeof res.user === "object" ? res.user : res) as Record<string, unknown>
  return {
    success: true,
    user: normalizeSupremeUser(userData),
    message: (res.message as string) || "User status updated",
  }
}

export async function directFundUser(
  payload: DirectFundingPayload
): Promise<{ success: boolean; user?: SupremeUser; transactionId?: string; message: string }> {
  const res = await apiClient<Record<string, unknown>>(
    `/users/${encodeURIComponent(payload.userId)}/fund`,
    {
      method: "POST",
      body: JSON.stringify({
        accountType: payload.targetBalance,
        direction: payload.direction || "CREDIT",
        amount: payload.amount,
        currency: payload.currency || "USD",
        auditReason: payload.auditJustification,
        referenceId: payload.complianceReferenceId,
      }),
    }
  )
  return {
    success: true,
    user: res.user && typeof res.user === "object" ? normalizeSupremeUser(res.user as Record<string, unknown>) : undefined,
    transactionId: (res.transactionId as string) || (res.referenceId as string),
    message: (res.message as string) || `Successfully adjusted user balance (${payload.direction})`,
  }
}

export async function deleteUser(
  id: string,
  confirmationKey: string
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>(`/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: {
      "x-confirmation-key": confirmationKey,
    },
    body: JSON.stringify({ confirmationKey }),
  })
}

export async function emailUser(
  id: string,
  payload: EmailUserPayload
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>(`/users/${encodeURIComponent(id)}/email`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
