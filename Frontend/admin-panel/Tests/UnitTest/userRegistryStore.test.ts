// Vitest globals enabled
import { useUserRegistryStore } from "../../src/store/useUserRegistryStore"
import type { SovereignUser } from "../../src/api/users"

const mockUser: SovereignUser = {
  id: "USR-CH-ZURICH-01",
  fullLegalName: "Helvetia Vault Holding AG",
  email: "custody@helvetia-vault.ch",
  institutionName: "Helvetia Family Office",
  accessTier: "INSTITUTIONAL",
  status: "ACTIVE",
  kycStatus: "APPROVED",
  balances: {
    availableCash: 24500000,
    investedCapital: 68000000,
    totalVaultBalance: 92500000,
    currency: "CHF",
  },
  riskScore: 12,
  country: "CH",
  joinedAt: "2026-08-15T09:00:00Z",
  lastActiveAt: "2026-09-27T18:30:00Z",
}

describe("useUserRegistryStore", () => {
  beforeEach(() => {
    useUserRegistryStore.setState({
      searchQuery: "",
      selectedTier: "ALL",
      selectedStatus: "ALL",
      selectedUser: null,
      isCreateUserModalOpen: false,
      isSuspendUserModalOpen: false,
      isDirectFundingModalOpen: false,
    })
  })

  it("initializes with default filter states and closed modals", () => {
    const state = useUserRegistryStore.getState()
    expect(state.searchQuery).toBe("")
    expect(state.selectedTier).toBe("ALL")
    expect(state.selectedStatus).toBe("ALL")
    expect(state.selectedUser).toBeNull()
    expect(state.isCreateUserModalOpen).toBe(false)
    expect(state.isSuspendUserModalOpen).toBe(false)
    expect(state.isDirectFundingModalOpen).toBe(false)
  })

  it("updates search query, tier filter, and status filter", () => {
    const { setSearchQuery, setSelectedTier, setSelectedStatus } = useUserRegistryStore.getState()
    
    setSearchQuery("Helvetia")
    expect(useUserRegistryStore.getState().searchQuery).toBe("Helvetia")

    setSelectedTier("INSTITUTIONAL")
    expect(useUserRegistryStore.getState().selectedTier).toBe("INSTITUTIONAL")

    setSelectedStatus("ACTIVE")
    expect(useUserRegistryStore.getState().selectedStatus).toBe("ACTIVE")
  })

  it("manages CreateUserModal lifecycle", () => {
    const { openCreateUserModal, closeCreateUserModal } = useUserRegistryStore.getState()

    openCreateUserModal()
    expect(useUserRegistryStore.getState().isCreateUserModalOpen).toBe(true)

    closeCreateUserModal()
    expect(useUserRegistryStore.getState().isCreateUserModalOpen).toBe(false)
  })

  it("manages SuspendUserModal lifecycle and selected user state", () => {
    const { openSuspendModal, closeSuspendModal } = useUserRegistryStore.getState()

    openSuspendModal(mockUser)
    expect(useUserRegistryStore.getState().isSuspendUserModalOpen).toBe(true)
    expect(useUserRegistryStore.getState().selectedUser?.id).toBe("USR-CH-ZURICH-01")

    closeSuspendModal()
    expect(useUserRegistryStore.getState().isSuspendUserModalOpen).toBe(false)
    expect(useUserRegistryStore.getState().selectedUser).toBeNull()
  })

  it("manages DirectFundingModal lifecycle and selected user state", () => {
    const { openFundingModal, closeFundingModal } = useUserRegistryStore.getState()

    openFundingModal(mockUser)
    expect(useUserRegistryStore.getState().isDirectFundingModalOpen).toBe(true)
    expect(useUserRegistryStore.getState().selectedUser?.fullLegalName).toBe("Helvetia Vault Holding AG")

    closeFundingModal()
    expect(useUserRegistryStore.getState().isDirectFundingModalOpen).toBe(false)
    expect(useUserRegistryStore.getState().selectedUser).toBeNull()
  })
})
