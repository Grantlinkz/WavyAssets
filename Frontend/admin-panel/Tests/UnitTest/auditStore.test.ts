import { describe, it, expect, beforeEach } from "vitest"
import { useAuditStore } from "../../src/store/useAuditStore"
import type { AuditLogEntry } from "../../src/api/audit"

describe("Audit Store Logic", () => {
  const mockAuditEntry: AuditLogEntry = {
    id: "AUD-0812",
    timestamp: "2026-09-28 13:42:19",
    officerId: "ADM-01",
    officerName: "Eleanor Vance",
    officerDepartment: "Treasury",
    action: "Balance Credit",
    actionCategory: "CREDIT",
    targetEntity: "LedgerAccount",
    targetId: "USR-9942-CH",
    targetLabel: "Philippe de Rothschild",
    reason: "Inbound Fedwire cleared from UBS Geneva.",
    nodeOrigin: "Zurich DC1",
    ledgerState: "SETTLED",
    sha256Hash: "7f8a92b8d03541c41e892c900bb912f",
    merkleBlock: 19842109,
    deltaAmount: 1500000,
    deltaCurrency: "USD",
  }

  beforeEach(() => {
    useAuditStore.setState({
      searchQuery: "",
      selectedCategory: "ALL",
      selectedOfficer: "ALL",
      selectedDateRange: "Today",
      selectedLogForDiff: null,
      isDiffModalOpen: false,
    })
  })

  it("updates search query, category, officer and date range", () => {
    const store = useAuditStore.getState()
    store.setSearchQuery("UBS Geneva")
    store.setSelectedCategory("CREDIT")
    store.setSelectedOfficer("Eleanor Vance")
    store.setSelectedDateRange("Past 7 Days")

    const state = useAuditStore.getState()
    expect(state.searchQuery).toBe("UBS Geneva")
    expect(state.selectedCategory).toBe("CREDIT")
    expect(state.selectedOfficer).toBe("Eleanor Vance")
    expect(state.selectedDateRange).toBe("Past 7 Days")
  })

  it("opens and closes diff modal with selected audit log", () => {
    const store = useAuditStore.getState()
    expect(store.isDiffModalOpen).toBe(false)
    expect(store.selectedLogForDiff).toBeNull()

    store.openDiffModal(mockAuditEntry)

    const openState = useAuditStore.getState()
    expect(openState.isDiffModalOpen).toBe(true)
    expect(openState.selectedLogForDiff?.id).toBe("AUD-0812")
    expect(openState.selectedLogForDiff?.sha256Hash).toBe("7f8a92b8d03541c41e892c900bb912f")

    store.closeDiffModal()

    const closeState = useAuditStore.getState()
    expect(closeState.isDiffModalOpen).toBe(false)
    expect(closeState.selectedLogForDiff).toBeNull()
  })
})
