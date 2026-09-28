import { create } from "zustand"
import type { AuditCategory, AuditLogEntry } from "../api/audit"

interface AuditState {
  searchQuery: string
  selectedCategory: AuditCategory
  selectedOfficer: string
  selectedDateRange: string
  selectedLogForDiff: AuditLogEntry | null
  isDiffModalOpen: boolean
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: AuditCategory) => void
  setSelectedOfficer: (officer: string) => void
  setSelectedDateRange: (dateRange: string) => void
  openDiffModal: (log: AuditLogEntry) => void
  closeDiffModal: () => void
}

export const useAuditStore = create<AuditState>((set) => ({
  searchQuery: "",
  selectedCategory: "ALL",
  selectedOfficer: "ALL",
  selectedDateRange: "Today",
  selectedLogForDiff: null,
  isDiffModalOpen: false,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedOfficer: (selectedOfficer) => set({ selectedOfficer }),
  setSelectedDateRange: (selectedDateRange) => set({ selectedDateRange }),
  openDiffModal: (log) => set({ selectedLogForDiff: log, isDiffModalOpen: true }),
  closeDiffModal: () => set({ isDiffModalOpen: false, selectedLogForDiff: null }),
}))
