import { create } from "zustand"
import type { FiatDepositRailConfig } from "../api/depositRails"

export interface QrModalData {
  asset: string
  network: string
  address: string
}

export interface DepositRailsState {
  isQrModalOpen: boolean
  qrModalData: QrModalData | null
  isTestingMesh: boolean
  testMeshResult: {
    success: boolean
    latencyMs: number
    activeTerminals: number
    message: string
  } | null
  isFlushingCache: boolean
  flushCacheMessage: string | null
  fiatFormDraft: Partial<FiatDepositRailConfig> | null

  openQrModal: (data: QrModalData) => void
  closeQrModal: () => void
  setIsTestingMesh: (isTesting: boolean) => void
  setTestMeshResult: (
    result: {
      success: boolean
      latencyMs: number
      activeTerminals: number
      message: string
    } | null
  ) => void
  setIsFlushingCache: (isFlushing: boolean) => void
  setFlushCacheMessage: (message: string | null) => void
  setFiatFormDraft: (draft: Partial<FiatDepositRailConfig> | null) => void
}

export const useDepositRailsStore = create<DepositRailsState>((set) => ({
  isQrModalOpen: false,
  qrModalData: null,
  isTestingMesh: false,
  testMeshResult: null,
  isFlushingCache: false,
  flushCacheMessage: null,
  fiatFormDraft: null,

  openQrModal: (qrModalData) => set({ isQrModalOpen: true, qrModalData }),
  closeQrModal: () => set({ isQrModalOpen: false, qrModalData: null }),
  setIsTestingMesh: (isTestingMesh) => set({ isTestingMesh }),
  setTestMeshResult: (testMeshResult) => set({ testMeshResult }),
  setIsFlushingCache: (isFlushingCache) => set({ isFlushingCache }),
  setFlushCacheMessage: (flushCacheMessage) => set({ flushCacheMessage }),
  setFiatFormDraft: (fiatFormDraft) => set({ fiatFormDraft }),
}))
