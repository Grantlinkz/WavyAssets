import { create } from "zustand"
import type { EmergencyStatus } from "../api/emergency"

export const REQUIRED_FREEZE_PHRASE = "CONFIRM EMERGENCY PLATFORM FREEZE"
export const MIN_JUSTIFICATION_LENGTH = 30

interface EmergencyState {
  isPlatformFrozen: boolean
  freezeStatus: EmergencyStatus | null
  verificationInput: string
  justificationInput: string
  setIsPlatformFrozen: (frozen: boolean) => void
  setFreezeStatus: (status: EmergencyStatus | null) => void
  setVerificationInput: (input: string) => void
  setJustificationInput: (input: string) => void
  resetForm: () => void
}

export const useEmergencyStore = create<EmergencyState>((set) => ({
  isPlatformFrozen: false,
  freezeStatus: null,
  verificationInput: "",
  justificationInput: "",
  setIsPlatformFrozen: (isPlatformFrozen) => set({ isPlatformFrozen }),
  setFreezeStatus: (freezeStatus) =>
    set({
      freezeStatus,
      isPlatformFrozen: freezeStatus?.isFrozen ?? false,
    }),
  setVerificationInput: (verificationInput) => set({ verificationInput }),
  setJustificationInput: (justificationInput) => set({ justificationInput }),
  resetForm: () =>
    set({
      verificationInput: "",
      justificationInput: "",
    }),
}))
