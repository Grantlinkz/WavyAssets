import { apiClient } from "./client"

export interface OverviewMetrics {
  totalVaultBalance: number
  vaultBalanceChange24h: number
  liquidSettlementCapital: number
  activeLiquidityRailsCount: number
  actionQueuePending: number
  actionQueueWarning: string
  netSettlement24h: number
  settledTransactionsCount24h: number
  nodeTelemetry: {
    shardLatencyMs: number
    activeShards: number
    coldStoreActive: boolean
  }
  badgeCounts?: BadgeCounts
}

export interface SettlementRecord {
  id: string
  timestamp: string
  type: "DEPOSIT_WIRE" | "WITHDRAWAL" | "INTERNAL_SETTLEMENT" | "VAULT_SWAP"
  entity: string
  accountNumber: string
  amount: number
  currency: string
  status: "SETTLED" | "PENDING_DUAL_SIG" | "PROCESSING" | "BLOCKED"
  rail: string
}

export async function fetchOverviewMetrics(): Promise<OverviewMetrics> {
  return apiClient<OverviewMetrics>("/overview/metrics")
}

export async function fetchSettlementLedger(
  timeHorizon = "24h",
  currency = "ALL"
): Promise<SettlementRecord[]> {
  const query = new URLSearchParams({ timeHorizon, currency }).toString()
  return apiClient<SettlementRecord[]>(`/overview/settlements?${query}`)
}

export interface BadgeCounts {
  urgentActions: number
  newInquiries: number
  totalUsers: number
  pendingCompliance: number
  treasurySignOffs: number
  activeCards: number
}

export async function fetchBadgeCounts(): Promise<BadgeCounts> {
  return apiClient<BadgeCounts>("/overview/badge-counts")
}

