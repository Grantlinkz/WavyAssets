import { create } from "zustand"
import { getOperatorSession, refreshAdminToken } from "../api/auth"
import { setAuthToken } from "../api/client"

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
  const store: AdminAuthState = {
    operator: null,
    token: null,
    isAuthenticated: false,
    isLoginModalOpen: false,

    login: (operator: Operator, token?: string) => {
      const activeToken = token || null
      setAuthToken(activeToken)
      set({
        operator,
        token: activeToken,
        isAuthenticated: true,
        isLoginModalOpen: false,
      })
    },

    logout: () => {
      setAuthToken(null)
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
        }
      } catch {
        // If getting current session failed, attempt refresh rotation via HttpOnly cookie
        try {
          const refreshRes = await refreshAdminToken()
          if (refreshRes?.accessToken) {
            setAuthToken(refreshRes.accessToken)
            const op = refreshRes.operator || get().operator
            if (op) {
              set({
                operator: op,
                token: refreshRes.accessToken,
                isAuthenticated: true,
              })
            } else {
              const profileRes = await getOperatorSession()
              if (profileRes?.operator) {
                set({
                  operator: profileRes.operator,
                  token: refreshRes.accessToken,
                  isAuthenticated: true,
                })
              }
            }
          }
        } catch {
          // If refresh also failed, only reset if no active session exists
          if (!get().token) {
            set({
              operator: null,
              token: null,
              isAuthenticated: false,
            })
          }
        }
      }
    },
  }

  return store
})
