// Vitest globals enabled
import { useAdminAuthStore, type Operator } from "../../src/store/useAdminAuthStore"

describe("useAdminAuthStore", () => {
  beforeEach(() => {
    localStorage.clear()
    const { logout } = useAdminAuthStore.getState()
    logout()
  })

  it("should initialize unauthenticated after logout", () => {
    const state = useAdminAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.operator).toBeNull()
    expect(state.token).toBeNull()
  })

  it("should authenticate operator and persist in store", () => {
    const operator: Operator = {
      id: "op-test-1",
      name: "Alexander Wright",
      initials: "AW",
      email: "a.wright@wavyassets.ch",
      role: "SUPER_ADMIN",
    }
    const token = "jwt_super_admin_test_token"

    useAdminAuthStore.getState().login(operator, token)

    const state = useAdminAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.operator?.name).toBe("Alexander Wright")
    expect(state.operator?.role).toBe("SUPER_ADMIN")
    expect(state.token).toBe(token)
  })

  it("should correctly evaluate SUPER_ADMIN RBAC permissions", () => {
    const operator: Operator = {
      id: "op-super",
      name: "Alexander Wright",
      initials: "AW",
      email: "a.wright@wavyassets.ch",
      role: "SUPER_ADMIN",
    }
    useAdminAuthStore.getState().login(operator, "token")

    const { hasPermission } = useAdminAuthStore.getState()
    expect(hasPermission("canFreezePlatform")).toBe(true)
    expect(hasPermission("canApproveDualSignOff")).toBe(true)
    expect(hasPermission("canCreditDeposit")).toBe(true)
    expect(hasPermission("canElevateTier")).toBe(true)
    expect(hasPermission("canDirectFund")).toBe(true)
    expect(hasPermission("canSuspendUser")).toBe(true)
    expect(hasPermission("canManageDepositRails")).toBe(true)
    expect(hasPermission("canMintVipCards")).toBe(true)
    expect(hasPermission("canConvertLeads")).toBe(true)
  })

  it("should restrict TREASURY_OFFICER permissions to treasury ops", () => {
    const operator: Operator = {
      id: "op-treasury",
      name: "Eleanor Vance",
      initials: "EV",
      email: "e.vance@wavyassets.ch",
      role: "TREASURY_OFFICER",
    }
    useAdminAuthStore.getState().login(operator, "token")

    const { hasPermission } = useAdminAuthStore.getState()
    expect(hasPermission("canCreditDeposit")).toBe(true)
    expect(hasPermission("canApproveDualSignOff")).toBe(true)
    expect(hasPermission("canDirectFund")).toBe(true)
    expect(hasPermission("canFreezePlatform")).toBe(false)
    expect(hasPermission("canElevateTier")).toBe(false)
    expect(hasPermission("canMintVipCards")).toBe(false)
  })

  it("should restrict COMPLIANCE_OFFICER permissions to KYC and suspension", () => {
    const operator: Operator = {
      id: "op-compliance",
      name: "Marcella Thorne",
      initials: "MT",
      email: "m.thorne@wavyassets.ch",
      role: "COMPLIANCE_OFFICER",
    }
    useAdminAuthStore.getState().login(operator, "token")

    const { hasPermission } = useAdminAuthStore.getState()
    expect(hasPermission("canElevateTier")).toBe(true)
    expect(hasPermission("canSuspendUser")).toBe(true)
    expect(hasPermission("canCreditDeposit")).toBe(false)
    expect(hasPermission("canFreezePlatform")).toBe(false)
  })
})
