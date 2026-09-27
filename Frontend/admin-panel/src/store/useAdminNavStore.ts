import { create } from "zustand"
import type { LeadInquiry } from "../api/inquiries"

export type AdminRoute =
  | "overview"
  | "inquiries"
  | "user-directory"
  | "compliance"
  | "treasury"
  | "deposit-rails"
  | "vip-cards"
  | "audit-log"

export interface AdminNavState {
  activeRoute: AdminRoute
  isCommandPaletteOpen: boolean
  isEmergencyStopModalOpen: boolean
  
  // Lead Inquiries Drawer & Conversion
  selectedInquiry: LeadInquiry | null
  isLeadDetailDrawerOpen: boolean
  isConvertModalOpen: boolean
  
  // Real-time counter badges
  badgeCounts: {
    urgentActions: number
    newInquiries: number
    totalUsers: number
    pendingCompliance: number
    treasurySignOffs: number
    activeCards: number
  }

  // Actions
  setActiveRoute: (route: AdminRoute) => void
  setCommandPaletteOpen: (open: boolean) => void
  setEmergencyStopModalOpen: (open: boolean) => void
  openLeadDrawer: (inquiry: LeadInquiry) => void
  closeLeadDrawer: () => void
  openConvertModal: (inquiry: LeadInquiry) => void
  closeConvertModal: () => void
  updateBadgeCount: (key: keyof AdminNavState["badgeCounts"], count: number) => void
}

export const useAdminNavStore = create<AdminNavState>((set) => ({
  activeRoute: "overview",
  isCommandPaletteOpen: false,
  isEmergencyStopModalOpen: false,
  selectedInquiry: null,
  isLeadDetailDrawerOpen: false,
  isConvertModalOpen: false,

  badgeCounts: {
    urgentActions: 3,
    newInquiries: 12,
    totalUsers: 1429,
    pendingCompliance: 5,
    treasurySignOffs: 4,
    activeCards: 38,
  },

  setActiveRoute: (route) => set({ activeRoute: route }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setEmergencyStopModalOpen: (open) => set({ isEmergencyStopModalOpen: open }),
  
  openLeadDrawer: (inquiry) => set({ selectedInquiry: inquiry, isLeadDetailDrawerOpen: true }),
  closeLeadDrawer: () => set({ isLeadDetailDrawerOpen: false, selectedInquiry: null }),
  
  openConvertModal: (inquiry) => set({ selectedInquiry: inquiry, isConvertModalOpen: true }),
  closeConvertModal: () => set({ isConvertModalOpen: false }),
  
  updateBadgeCount: (key, count) =>
    set((state) => ({
      badgeCounts: { ...state.badgeCounts, [key]: count },
    })),
}))
