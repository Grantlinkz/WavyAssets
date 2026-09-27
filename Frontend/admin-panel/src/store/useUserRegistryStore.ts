import { create } from "zustand"
import type { SovereignUser } from "../api/users"

export interface UserRegistryState {
  searchQuery: string
  selectedTier: string
  selectedStatus: string
  selectedUser: SovereignUser | null
  
  // Modals
  isCreateUserModalOpen: boolean
  isSuspendUserModalOpen: boolean
  isDirectFundingModalOpen: boolean

  // Actions
  setSearchQuery: (query: string) => void
  setSelectedTier: (tier: string) => void
  setSelectedStatus: (status: string) => void
  setSelectedUser: (user: SovereignUser | null) => void
  
  openCreateUserModal: () => void
  closeCreateUserModal: () => void
  
  openSuspendModal: (user: SovereignUser) => void
  closeSuspendModal: () => void
  
  openFundingModal: (user: SovereignUser) => void
  closeFundingModal: () => void
}

export const useUserRegistryStore = create<UserRegistryState>((set) => ({
  searchQuery: "",
  selectedTier: "ALL",
  selectedStatus: "ALL",
  selectedUser: null,

  isCreateUserModalOpen: false,
  isSuspendUserModalOpen: false,
  isDirectFundingModalOpen: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTier: (tier) => set({ selectedTier: tier }),
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  setSelectedUser: (user) => set({ selectedUser: user }),

  openCreateUserModal: () => set({ isCreateUserModalOpen: true }),
  closeCreateUserModal: () => set({ isCreateUserModalOpen: false }),

  openSuspendModal: (user) => set({ selectedUser: user, isSuspendUserModalOpen: true }),
  closeSuspendModal: () => set({ isSuspendUserModalOpen: false, selectedUser: null }),

  openFundingModal: (user) => set({ selectedUser: user, isDirectFundingModalOpen: true }),
  closeFundingModal: () => set({ isDirectFundingModalOpen: false, selectedUser: null }),
}))
