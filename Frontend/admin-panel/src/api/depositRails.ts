import { apiClient } from "./client"

export interface FiatDepositRailConfig {
  id?: string
  beneficiaryName: string
  depositoryBank: string
  clearingRail: string
  swissIban: string
  bicSwift: string
  memoFormat: string
  updatedAt?: string
  updatedBy?: string
}

export interface CryptoDepositRailConfig {
  id: string
  asset: string
  name: string
  network: string
  vaultAddress: string
  minDepositUsd: number
  confirmations: number
  confirmationTimeEst: string
  isActive: boolean
  updatedAt?: string
  updatedBy?: string
}

export interface DepositRailsTelemetry {
  broadcasterConnected: boolean
  wsLatencyMs: number
  activeTerminalsCount: number
  hsmStatus: string
  configVersion: string
}

export interface DepositRailsData {
  fiatRail: FiatDepositRailConfig
  cryptoRails: CryptoDepositRailConfig[]
  telemetry: DepositRailsTelemetry
}

export async function fetchDepositRails(): Promise<DepositRailsData> {
  return apiClient<DepositRailsData>("/deposit-rails")
}

export async function updateFiatRail(
  payload: FiatDepositRailConfig
): Promise<{ success: boolean; fiatRail: FiatDepositRailConfig; message: string }> {
  return apiClient<{ success: boolean; fiatRail: FiatDepositRailConfig; message: string }>(
    "/deposit-rails/fiat",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  )
}

export async function updateCryptoRail(
  payload: CryptoDepositRailConfig
): Promise<{ success: boolean; cryptoRail: CryptoDepositRailConfig; message: string }> {
  const cleanPayload = {
    asset: payload.asset,
    network: payload.network,
    vaultAddress: payload.vaultAddress,
    minDepositUsd: payload.minDepositUsd,
    confirmations: payload.confirmations,
    isActive: payload.isActive,
  }
  return apiClient<{ success: boolean; cryptoRail: CryptoDepositRailConfig; message: string }>(
    "/deposit-rails/crypto",
    {
      method: "PUT",
      body: JSON.stringify(cleanPayload),
    }
  )
}

export async function testClientMeshConnection(): Promise<{
  success: boolean
  latencyMs: number
  activeTerminals: number
  message: string
}> {
  return apiClient<{
    success: boolean
    latencyMs: number
    activeTerminals: number
    message: string
  }>("/deposit-rails/test-mesh", {
    method: "POST",
  })
}

export async function flushInvalidationCache(): Promise<{
  success: boolean
  flushedNodesCount: number
  message: string
}> {
  return apiClient<{
    success: boolean
    flushedNodesCount: number
    message: string
  }>("/deposit-rails/flush-cache", {
    method: "POST",
  })
}
