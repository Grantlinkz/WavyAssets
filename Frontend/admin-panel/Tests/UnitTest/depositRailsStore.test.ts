import { describe, it, expect, beforeEach } from "vitest"
import { useDepositRailsStore } from "../../src/store/useDepositRailsStore"

describe("Deposit Rails Store Logic", () => {
  beforeEach(() => {
    useDepositRailsStore.setState({
      isQrModalOpen: false,
      qrModalData: null,
      isTestingMesh: false,
      testMeshResult: null,
      isFlushingCache: false,
      flushCacheMessage: null,
      fiatFormDraft: null,
    })
  })

  it("handles QR code modal state correctly", () => {
    const store = useDepositRailsStore.getState()
    expect(store.isQrModalOpen).toBe(false)
    expect(store.qrModalData).toBeNull()

    store.openQrModal({
      asset: "USDC",
      network: "Ethereum ERC-20",
      address: "0x71C2B81F28b693240eF8681A127397B1cda44982",
    })

    const updated = useDepositRailsStore.getState()
    expect(updated.isQrModalOpen).toBe(true)
    expect(updated.qrModalData?.asset).toBe("USDC")
    expect(updated.qrModalData?.address).toContain("0x71C2")

    store.closeQrModal()
    expect(useDepositRailsStore.getState().isQrModalOpen).toBe(false)
  })

  it("updates test mesh diagnostic state", () => {
    const store = useDepositRailsStore.getState()
    store.setIsTestingMesh(true)
    expect(useDepositRailsStore.getState().isTestingMesh).toBe(true)

    store.setTestMeshResult({
      success: true,
      latencyMs: 14,
      activeTerminals: 1429,
      message: "Mesh online",
    })

    const updated = useDepositRailsStore.getState()
    expect(updated.testMeshResult?.latencyMs).toBe(14)
    expect(updated.testMeshResult?.activeTerminals).toBe(1429)
  })

  it("handles cache flushing and fiat drafts", () => {
    const store = useDepositRailsStore.getState()
    store.setIsFlushingCache(true)
    store.setFlushCacheMessage("12 edge nodes flushed")

    expect(useDepositRailsStore.getState().isFlushingCache).toBe(true)
    expect(useDepositRailsStore.getState().flushCacheMessage).toBe("12 edge nodes flushed")

    store.setFiatFormDraft({ swissIban: "CH93 0023 8812" })
    expect(useDepositRailsStore.getState().fiatFormDraft?.swissIban).toBe("CH93 0023 8812")
  })
})
