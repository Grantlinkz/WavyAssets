import { apiClient } from "./client"

export interface EmergencyStatus {
  isFrozen: boolean
  frozenAt?: string
  frozenBy?: string
  officerName?: string
  officerRole?: string
  reason?: string
  activeSessionsKilled?: number
  cardsFrozen?: number
  railsPaused?: boolean
}

export interface FreezePayload {
  verificationPhrase: string
  justification: string
  officerToken?: string
}

export interface UnfreezePayload {
  justification: string
  securityPasscode: string
}

export async function fetchEmergencyStatus(): Promise<EmergencyStatus> {
  return apiClient<EmergencyStatus>("/emergency/status")
}

export async function executePlatformFreeze(payload: FreezePayload): Promise<EmergencyStatus> {
  return apiClient<EmergencyStatus>("/emergency/freeze", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function executePlatformUnfreeze(payload: UnfreezePayload): Promise<EmergencyStatus> {
  return apiClient<EmergencyStatus>("/emergency/unfreeze", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}
