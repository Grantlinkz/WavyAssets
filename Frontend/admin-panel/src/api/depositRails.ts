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
  const res = await apiClient<Record<string, unknown>>("/deposit-rails")
  const fiatRail = (res.fiatRail || res.fiat) as FiatDepositRailConfig | undefined
  const cryptoRails = (res.cryptoRails || res.crypto) as CryptoDepositRailConfig[] | undefined
  const telemetry = res.telemetry as DepositRailsTelemetry | undefined

  return {
    fiatRail: fiatRail || {
      beneficiaryName: "Grant Global Holdings AG / Escrow Treuhand Zurich",
      depositoryBank: "UBS Switzerland AG (Zurich Enclave)",
      clearingRail: "Swiss SIC RTGS / Fedwire DvP",
      swissIban: "CH93 0023 8812 4019 8821 0",
      bicSwift: "UBSWCHZH80A",
      memoFormat: "WY-{USER_REF}-TREASURY-03",
    },
    cryptoRails: cryptoRails || [],
    telemetry: telemetry || {
      broadcasterConnected: true,
      wsLatencyMs: 14,
      activeTerminalsCount: 1429,
      hsmStatus: "Gemalto SafeNet Luna 7",
      configVersion: "v4.88.2-CH",
    },
  }
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
    id: payload.id || undefined,
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

export async function deleteCryptoRail(
  id: string
): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>(
    `/deposit-rails/crypto/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
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
