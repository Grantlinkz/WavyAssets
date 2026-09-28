import { create } from "zustand"
import type { PendingDeposit, PendingWithdrawal, SettlementRail } from "../api/treasury"

export type TreasuryTab = "withdrawals" | "deposits" | "both"

export interface TreasuryState {
  activeTab: TreasuryTab
  railFilter: SettlementRail
  searchQuery: string
  selectedWithdrawal: PendingWithdrawal | null
  selectedDeposit: PendingDeposit | null
  isSignOffOpen: boolean
  isReceiptModalOpen: boolean

  setActiveTab: (tab: TreasuryTab) => void
  setRailFilter: (rail: SettlementRail) => void
  setSearchQuery: (query: string) => void
  setSelectedWithdrawal: (withdrawal: PendingWithdrawal | null) => void
  setSelectedDeposit: (deposit: PendingDeposit | null) => void
  openSignOff: (withdrawal: PendingWithdrawal) => void
  closeSignOff: () => void
  openReceiptModal: (deposit: PendingDeposit) => void
  closeReceiptModal: () => void
}

export const useTreasuryStore = create<TreasuryState>((set) => ({
  activeTab: "withdrawals",
  railFilter: "ALL",
  searchQuery: "",
  selectedWithdrawal: null,
  selectedDeposit: null,
  isSignOffOpen: false,
  isReceiptModalOpen: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setRailFilter: (railFilter) => set({ railFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedWithdrawal: (selectedWithdrawal) => set({ selectedWithdrawal }),
  setSelectedDeposit: (selectedDeposit) => set({ selectedDeposit }),
  openSignOff: (withdrawal) =>
    set({ selectedWithdrawal: withdrawal, isSignOffOpen: true }),
  closeSignOff: () =>
    set({ isSignOffOpen: false }),
  openReceiptModal: (deposit) =>
    set({ selectedDeposit: deposit, isReceiptModalOpen: true }),
  closeReceiptModal: () =>
    set({ isReceiptModalOpen: false, selectedDeposit: null }),
}))
