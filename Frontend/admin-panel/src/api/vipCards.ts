import { apiClient } from "./client"

export type VipCardSubstrate = "Obsidian 42g Tungsten" | "Black Supreme Stainless" | "Silver Titanium" | "Celebrity 24K Gold & Diamond"
export type VipCardTier = "OBSIDIAN" | "Supreme" | "TITANIUM" | "CELEBRITY"
export type VipCardType = "PHYSICAL" | "VIRTUAL"
export type VipShippingStatus = "DELIVERED" | "IN_TRANSIT" | "VAULT_CUSTODY"

export interface VipCardItem {
  id: string
  userId: string
  userName: string
  userCif: string
  userTier: string
  cardNumberLast4: string
  maskedPan: string
  cardType: VipCardType
  tier: VipCardTier
  substrate: VipCardSubstrate
  isFrozen: boolean
  dailySpendLimit: number
  shippingStatus: VipShippingStatus
  destination: string
  issuedAt: string
  updatedAt: string
  validDate?: string
  celebrityCardholderLabel?: string | null
  frozenByAdmin?: boolean
}

export interface VipCardsTelemetry {
  activeCards: number
  authorizedDailyCapacity: number
  volume24h: number
  authRate24h: number
  lockedCards: number
  vaultInventoryBlanks: number
}

export interface MintVipCardPayload {
  userId: string
  cardholderName: string
  tier: VipCardTier
  substrate: VipCardSubstrate
  dailySpendLimit: number
  cardType: VipCardType
  destination: string
  operatorNotes?: string
}

function normalizeVipCard(raw: Record<string, unknown>): VipCardItem {
  const user = (raw.user as Record<string, unknown>) || {}
  const userName = (raw.userName as string) || (user.fullName as string) || (raw.cardholderName as string) || "VIP Member"
  const userCif = (raw.userCif as string) || `CIF-${(String(raw.userId || raw.id || "0000")).slice(0, 8).toUpperCase()}`
  const userTier = (raw.userTier as string) || (user.tier ? `${user.tier} Tier` : "Institutional Tier")
  const cardNumberLast4 = (raw.cardNumberLast4 as string) || "0000"
  const maskedPan = (raw.maskedPan as string) || `•••• •••• •••• ${cardNumberLast4}`
  const tier = (raw.tier as VipCardTier) || "OBSIDIAN"
  const substrate: VipCardSubstrate =
    (raw.substrate as VipCardSubstrate) ||
    (tier === "CELEBRITY"
      ? "Celebrity 24K Gold & Diamond"
      : tier === "TITANIUM"
      ? "Silver Titanium"
      : tier === "Supreme"
      ? "Black Supreme Stainless"
      : "Obsidian 42g Tungsten")

  return {
    id: String(raw.id || ""),
    userId: String(raw.userId || user.id || ""),
    userName,
    userCif,
    userTier,
    cardNumberLast4,
    maskedPan,
    cardType: (raw.cardType as VipCardType) || "PHYSICAL",
    tier,
    substrate,
    isFrozen: Boolean(raw.isFrozen),
    dailySpendLimit: Number(raw.dailySpendLimit || 0),
    shippingStatus: (raw.shippingStatus as VipShippingStatus) || (raw.cardType === "VIRTUAL" ? "DELIVERED" : "IN_TRANSIT"),
    destination: (raw.destination as string) || (raw.cardType === "VIRTUAL" ? "Digital NFC Enclave" : "Vault Custody / Registered Address"),
    issuedAt: String(raw.issuedAt || raw.createdAt || raw.updatedAt || new Date().toISOString()),
    updatedAt: String(raw.updatedAt || new Date().toISOString()),
    validDate: (raw.validDate as string) || "12/29",
    celebrityCardholderLabel: (raw.celebrityCardholderLabel as string) || null,
    frozenByAdmin: Boolean(raw.frozenByAdmin ?? raw.isFrozen),
  }
}

export async function fetchVipCards(params?: {
  search?: string
  status?: string
  limit?: number
  page?: number
}): Promise<VipCardItem[]> {
  const queryParts: string[] = []
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params?.status && params.status !== "ALL") queryParts.push(`status=${encodeURIComponent(params.status)}`)
  if (params?.limit) queryParts.push(`limit=${params.limit}`)
  if (params?.page) queryParts.push(`page=${params.page}`)

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : ""
  const res = await apiClient<unknown>(`/vip-cards${queryString}`)
  let rawList: Record<string, unknown>[] = []
  if (Array.isArray(res)) {
    rawList = res as Record<string, unknown>[]
  } else if (res && typeof res === "object" && "cards" in res && Array.isArray((res as { cards: unknown[] }).cards)) {
    rawList = (res as { cards: Record<string, unknown>[] }).cards
  }

  return rawList.map(normalizeVipCard)
}

export async function fetchVipCardsTelemetry(): Promise<VipCardsTelemetry> {
  return apiClient<VipCardsTelemetry>("/vip-cards/telemetry")
}

export async function mintVipCard(payload: MintVipCardPayload): Promise<VipCardItem> {
  const res = await apiClient<Record<string, unknown>>("/vip-cards/mint", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return normalizeVipCard(res)
}

export async function toggleVipCardFreeze(
  id: string,
  isFrozen: boolean,
  reason?: string
): Promise<VipCardItem> {
  return apiClient<VipCardItem>(`/vip-cards/${encodeURIComponent(id)}/toggle-freeze`, {
    method: "PATCH",
    body: JSON.stringify({ isFrozen, reason }),
  })
}

export async function updateVipCardLimit(
  id: string,
  dailySpendLimit: number
): Promise<VipCardItem> {
  return apiClient<VipCardItem>(`/vip-cards/${encodeURIComponent(id)}/limit`, {
    method: "PATCH",
    body: JSON.stringify({ dailySpendLimit }),
  })
}

export async function deleteVipCard(
  id: string
): Promise<{ success: boolean; deletedCardId: string }> {
  return apiClient<{ success: boolean; deletedCardId: string }>(
    `/vip-cards/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  )
}
