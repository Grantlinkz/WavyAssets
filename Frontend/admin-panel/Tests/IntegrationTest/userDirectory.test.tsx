// Vitest globals enabled
import { useUserRegistryStore } from "../../src/store/useUserRegistryStore"
import { useAdminAuthStore, type Operator } from "../../src/store/useAdminAuthStore"
import type { SupremeUser } from "../../src/api/users"
import { formatCurrency } from "../../src/lib/formatters"

const mockSupremeUser: SupremeUser = {
  id: "USR-ZURICH-8801",
  fullLegalName: "St. Gotthard Supreme Vault SA",
  email: "treasury@st-gotthard.ch",
  institutionName: "Gotthard Multi-Family Office",
  accessTier: "INSTITUTIONAL",
  status: "ACTIVE",
  kycStatus: "APPROVED",
  balances: {
    availableCash: 12500000,
    investedCapital: 45000000,
    totalVaultBalance: 57500000,
    currency: "CHF",
  },
  riskScore: 14,
  country: "CH",
  joinedAt: "2026-07-01T10:00:00Z",
  lastActiveAt: "2026-09-27T19:00:00Z",
}

describe("User Directory & Ledger Governance Integration", () => {
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

  it("formats segregated balances with tabular lining figures accurately", () => {
    const { availableCash, investedCapital, totalVaultBalance, currency } = mockSupremeUser.balances
    
    expect(formatCurrency(availableCash, currency)).toBe("CHF 12,500,000.00")
    expect(formatCurrency(investedCapital, currency)).toBe("CHF 45,000,000.00")
    expect(formatCurrency(totalVaultBalance, currency)).toBe("CHF 57,500,000.00")
    expect(availableCash + investedCapital).toBe(totalVaultBalance)
  })

  it("manages DirectFundingModal workflow and selects Supreme entity", () => {
    expect(useUserRegistryStore.getState().isDirectFundingModalOpen).toBe(false)
    expect(useUserRegistryStore.getState().selectedUser).toBeNull()

    useUserRegistryStore.getState().openFundingModal(mockSupremeUser)
    expect(useUserRegistryStore.getState().isDirectFundingModalOpen).toBe(true)
    expect(useUserRegistryStore.getState().selectedUser?.id).toBe("USR-ZURICH-8801")
    expect(useUserRegistryStore.getState().selectedUser?.balances.availableCash).toBe(12500000)

    useUserRegistryStore.getState().closeFundingModal()
    expect(useUserRegistryStore.getState().isDirectFundingModalOpen).toBe(false)
    expect(useUserRegistryStore.getState().selectedUser).toBeNull()
  })

  it("manages SuspendUserModal workflow and toggles Supreme kill-switch", () => {
    expect(useUserRegistryStore.getState().isSuspendUserModalOpen).toBe(false)

    useUserRegistryStore.getState().openSuspendModal(mockSupremeUser)
    expect(useUserRegistryStore.getState().isSuspendUserModalOpen).toBe(true)
    expect(useUserRegistryStore.getState().selectedUser?.status).toBe("ACTIVE")

    useUserRegistryStore.getState().closeSuspendModal()
    expect(useUserRegistryStore.getState().isSuspendUserModalOpen).toBe(false)
  })

  it("enforces RBAC permissions for ledger modifications", () => {
    // Treasury Officer can direct fund but cannot suspend user
    const treasuryOp: Operator = {
      id: "op-treasury-01",
      name: "Eleanor Vance",
      initials: "EV",
      email: "e.vance@wavyassets.ch",
      role: "TREASURY_OFFICER",
    }
    useAdminAuthStore.getState().login(treasuryOp, "jwt_token")
    expect(useAdminAuthStore.getState().hasPermission("canDirectFund")).toBe(true)
    expect(useAdminAuthStore.getState().hasPermission("canSuspendUser")).toBe(false)

    // Compliance Officer can suspend user but cannot direct fund
    const complianceOp: Operator = {
      id: "op-comp-01",
      name: "Marcella Thorne",
      initials: "MT",
      email: "m.thorne@wavyassets.ch",
      role: "COMPLIANCE_OFFICER",
    }
    useAdminAuthStore.getState().login(complianceOp, "jwt_token")
    expect(useAdminAuthStore.getState().hasPermission("canSuspendUser")).toBe(true)
    expect(useAdminAuthStore.getState().hasPermission("canDirectFund")).toBe(false)

    // Super Admin can execute both operations
    const superAdminOp: Operator = {
      id: "op-super-01",
      name: "Alexander Wright",
      initials: "AW",
      email: "a.wright@wavyassets.ch",
      role: "SUPER_ADMIN",
    }
    useAdminAuthStore.getState().login(superAdminOp, "jwt_token")
    expect(useAdminAuthStore.getState().hasPermission("canDirectFund")).toBe(true)
    expect(useAdminAuthStore.getState().hasPermission("canSuspendUser")).toBe(true)
  })
})
