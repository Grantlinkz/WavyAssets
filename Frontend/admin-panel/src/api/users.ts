import { apiClient } from "./client"

export type UserTier = "TIER_1" | "TIER_2" | "TIER_3" | "INSTITUTIONAL"
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
  initialFunding: number
  currency: string
  auditReason: string
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
  currency: string
  auditJustification: string
  complianceReferenceId: string
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
  return apiClient<SupremeUser[]>(`/users${queryString}`)
}

export async function fetchUserById(id: string): Promise<SupremeUser> {
  return apiClient<SupremeUser>(`/users/${encodeURIComponent(id)}`)
}

export async function createUser(payload: CreateUserPayload): Promise<SupremeUser> {
  return apiClient<SupremeUser>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function suspendUser(
  payload: SuspendUserPayload
): Promise<{ success: boolean; user: SupremeUser; message: string }> {
  return apiClient<{ success: boolean; user: SupremeUser; message: string }>(
    `/users/${encodeURIComponent(payload.userId)}/suspend`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  )
}

export async function directFundUser(
  payload: DirectFundingPayload
): Promise<{ success: boolean; user: SupremeUser; transactionId: string; message: string }> {
  return apiClient<{ success: boolean; user: SupremeUser; transactionId: string; message: string }>(
    `/users/${encodeURIComponent(payload.userId)}/fund`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )
}
