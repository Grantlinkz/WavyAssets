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

export async function fetchVipCards(params?: {
  search?: string
  status?: string
}): Promise<VipCardItem[]> {
  const queryParts: string[] = []
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`)
  if (params?.status && params.status !== "ALL") queryParts.push(`status=${encodeURIComponent(params.status)}`)

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : ""
  const res = await apiClient<VipCardItem[] | { cards?: VipCardItem[] }>(`/vip-cards${queryString}`)
  if (Array.isArray(res)) return res
  if (res && typeof res === "object" && "cards" in res && Array.isArray(res.cards)) return res.cards
  return []
}

export async function fetchVipCardsTelemetry(): Promise<VipCardsTelemetry> {
  return apiClient<VipCardsTelemetry>("/vip-cards/telemetry")
}

export async function mintVipCard(payload: MintVipCardPayload): Promise<VipCardItem> {
  return apiClient<VipCardItem>("/vip-cards/mint", {
    method: "POST",
    body: JSON.stringify(payload),
  })
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
