import { create } from "zustand"

export type AdminRole =
  | "SUPER_ADMIN"
  | "TREASURY_OFFICER"
  | "COMPLIANCE_OFFICER"
  | "CONCIERGE"
  | "DESK_LEAD"

export interface Operator {
  id: string
  name: string
  initials: string
  email: string
  role: AdminRole
}

export interface AdminAuthState {
  operator: Operator | null
  token: string | null
  isAuthenticated: boolean
  isLoginModalOpen: boolean
  
  // Actions
  login: (operator: Operator, token: string) => void
  logout: () => void
  setLoginModalOpen: (open: boolean) => void
  hasPermission: (permission: AdminPermission) => boolean
}

export type AdminPermission =
  | "canFreezePlatform"
  | "canApproveDualSignOff"
  | "canCreditDeposit"
  | "canElevateTier"
  | "canDirectFund"
  | "canSuspendUser"
  | "canManageDepositRails"
  | "canMintVipCards"
  | "canConvertLeads"

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "canFreezePlatform",
    "canApproveDualSignOff",
    "canCreditDeposit",
    "canElevateTier",
    "canDirectFund",
    "canSuspendUser",
    "canManageDepositRails",
    "canMintVipCards",
    "canConvertLeads",
  ],
  TREASURY_OFFICER: [
    "canApproveDualSignOff",
    "canCreditDeposit",
    "canDirectFund",
    "canManageDepositRails",
  ],
  COMPLIANCE_OFFICER: [
    "canElevateTier",
    "canSuspendUser",
  ],
  CONCIERGE: [
    "canMintVipCards",
    "canConvertLeads",
  ],
  DESK_LEAD: [
    "canConvertLeads",
  ],
}

// Default Operator session for staging / instant verification
const DEFAULT_OPERATOR: Operator = {
  id: "op-eleanor-vance-01",
  name: "Eleanor Vance",
  initials: "EV",
  email: "e.vance@wavyassets.ch",
  role: "TREASURY_OFFICER",
}

export const useAdminAuthStore = create<AdminAuthState>((set, get) => {
  // Initialize from storage or default institutional session
  let storedOperator: Operator | null = DEFAULT_OPERATOR
  let storedToken: string | null = "jwt_live_session_token_ch_zurich_enclave"

  try {
    const rawOp = localStorage.getItem("wavy_admin_operator")
    const rawToken = localStorage.getItem("wavy_admin_token")
    if (rawOp && rawToken) {
      storedOperator = JSON.parse(rawOp)
      storedToken = rawToken
    }
  } catch {
    // Keep DEFAULT_OPERATOR on storage parse failure
  }

  return {
    operator: storedOperator,
    token: storedToken,
    isAuthenticated: Boolean(storedOperator && storedToken),
    isLoginModalOpen: false,

    login: (operator: Operator, token: string) => {
      localStorage.setItem("wavy_admin_operator", JSON.stringify(operator))
      localStorage.setItem("wavy_admin_token", token)
      set({
        operator,
        token,
        isAuthenticated: true,
        isLoginModalOpen: false,
      })
    },

    logout: () => {
      localStorage.removeItem("wavy_admin_operator")
      localStorage.removeItem("wavy_admin_token")
      set({
        operator: null,
        token: null,
        isAuthenticated: false,
      })
    },

    setLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),

    hasPermission: (permission: AdminPermission) => {
      const { operator } = get()
      if (!operator) return false
      return ROLE_PERMISSIONS[operator.role]?.includes(permission) ?? false
    },
  }
})
