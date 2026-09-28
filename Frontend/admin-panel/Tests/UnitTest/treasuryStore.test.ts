import { describe, it, expect, beforeEach } from "vitest"
import { useTreasuryStore } from "../../src/store/useTreasuryStore"
import type { PendingDeposit, PendingWithdrawal } from "../../src/api/treasury"

describe("Treasury Store Logic", () => {
  const mockWithdrawal: PendingWithdrawal = {
    id: "WTH-8921",
    userId: "USR-001",
    userName: "Baron Philippe de Rothschild",
    userCif: "CIF-9942",
    userTier: "INSTITUTIONAL",
    settlementRail: "SIC",
    routingMode: "Direct Central Clearing",
    targetInstitution: "UBS Switzerland AG",
    beneficiaryIbanOrAddress: "CH93 0023 8812 4019 8821 0",
    beneficiaryName: "Baron Philippe de Rothschild",
    amount: 1500000,
    currency: "USD",
    requiresDualSignOff: true,
    currentSignOffCount: 1,
    requiredSignOffCount: 2,
    status: "PENDING_SECOND_SIGN_OFF",
    isWhitelistedDestination: true,
    availableCash: 8450200,
    createdAt: "2026-09-28T13:05:00Z",
  }

  const mockDeposit: PendingDeposit = {
    id: "DEP-4011",
    userId: "USR-002",
    userName: "Geneva Capital Ltd",
    userCif: "CIF-1120",
    railType: "SIC",
    amount: 850000,
    currency: "USD",
    senderName: "Geneva Capital Remittance",
    senderBank: "Credit Suisse AG",
    senderIbanOrAddress: "CH28 0024 0000 1234 5678 9",
    wireMemo: "WY-GCAP-TREASURY-03",
    status: "PENDING",
    createdAt: "2026-09-28T12:40:00Z",
  }

  beforeEach(() => {
    useTreasuryStore.setState({
      activeTab: "withdrawals",
      railFilter: "ALL",
      searchQuery: "",
      selectedWithdrawal: null,
      selectedDeposit: null,
      isSignOffOpen: false,
      isReceiptModalOpen: false,
    })
  })

  it("updates active tab correctly", () => {
    const store = useTreasuryStore.getState()
    expect(store.activeTab).toBe("withdrawals")

    store.setActiveTab("deposits")
    expect(useTreasuryStore.getState().activeTab).toBe("deposits")

    store.setActiveTab("both")
    expect(useTreasuryStore.getState().activeTab).toBe("both")
  })

  it("filters by settlement rail and search query", () => {
    const store = useTreasuryStore.getState()
    store.setRailFilter("SIC")
    store.setSearchQuery("Rothschild")

    expect(useTreasuryStore.getState().railFilter).toBe("SIC")
    expect(useTreasuryStore.getState().searchQuery).toBe("Rothschild")
  })

  it("opens and closes sign-off panel with selected withdrawal", () => {
    const store = useTreasuryStore.getState()
    expect(store.isSignOffOpen).toBe(false)
    expect(store.selectedWithdrawal).toBeNull()

    store.openSignOff(mockWithdrawal)
    expect(useTreasuryStore.getState().isSignOffOpen).toBe(true)
    expect(useTreasuryStore.getState().selectedWithdrawal?.id).toBe("WTH-8921")

    store.closeSignOff()
    expect(useTreasuryStore.getState().isSignOffOpen).toBe(false)
  })

  it("opens and closes wire receipt inspection modal", () => {
    const store = useTreasuryStore.getState()
    expect(store.isReceiptModalOpen).toBe(false)
    expect(store.selectedDeposit).toBeNull()

    store.openReceiptModal(mockDeposit)
    expect(useTreasuryStore.getState().isReceiptModalOpen).toBe(true)
    expect(useTreasuryStore.getState().selectedDeposit?.id).toBe("DEP-4011")

    store.closeReceiptModal()
    expect(useTreasuryStore.getState().isReceiptModalOpen).toBe(false)
    expect(useTreasuryStore.getState().selectedDeposit).toBeNull()
  })
})
