import { create } from "zustand"
import { getOperatorSession } from "../api/auth"

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
  login: (operator: Operator, token?: string) => void
  logout: () => void
  setLoginModalOpen: (open: boolean) => void
  hasPermission: (permission: AdminPermission) => boolean
  rehydrateSession: () => Promise<void>
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

export const useAdminAuthStore = create<AdminAuthState>((set, get) => {
  let storedOperator: Operator | null = null

  try {
    const rawOp = typeof localStorage !== "undefined" ? localStorage.getItem("wavy_admin_operator") : null
    if (rawOp) {
      storedOperator = JSON.parse(rawOp)
    }
  } catch {
    storedOperator = null
  }

  const store: AdminAuthState = {
    operator: storedOperator,
    token: null,
    isAuthenticated: Boolean(storedOperator),
    isLoginModalOpen: false,

    login: (operator: Operator, token?: string) => {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("wavy_admin_operator", JSON.stringify(operator))
      }
      set({
        operator,
        token: token || null,
        isAuthenticated: true,
        isLoginModalOpen: false,
      })
    },

    logout: () => {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("wavy_admin_operator")
        localStorage.removeItem("wavy_admin_token")
      }
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

    rehydrateSession: async () => {
      try {
        const res = await getOperatorSession()
        if (res?.operator) {
          set({
            operator: res.operator,
            isAuthenticated: true,
          })
          if (typeof localStorage !== "undefined") {
            localStorage.setItem("wavy_admin_operator", JSON.stringify(res.operator))
          }
        }
      } catch {
        // Keep unauthenticated
      }
    },
  }

  // Rehydrate operator from /auth/me when the store loads in browser
  if (typeof window !== "undefined") {
    store.rehydrateSession().catch(() => {
      // Ignore initial rehydrate failure
    })
  }

  return store
})
