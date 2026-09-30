import { create } from "zustand"
import type { SupremeUser } from "../api/users"

export interface UserRegistryState {
  searchQuery: string
  selectedTier: string
  selectedStatus: string
  selectedUser: SupremeUser | null
  
  // Modals
  isCreateUserModalOpen: boolean
  isSuspendUserModalOpen: boolean
  isDirectFundingModalOpen: boolean
  isEditUserModalOpen: boolean
  isDeleteUserModalOpen: boolean
  isEmailUserModalOpen: boolean

  // Actions
  setSearchQuery: (query: string) => void
  setSelectedTier: (tier: string) => void
  setSelectedStatus: (status: string) => void
  setSelectedUser: (user: SupremeUser | null) => void
  
  openCreateUserModal: () => void
  closeCreateUserModal: () => void
  
  openSuspendModal: (user: SupremeUser) => void
  closeSuspendModal: () => void
  
  openFundingModal: (user: SupremeUser) => void
  closeFundingModal: () => void

  openEditUserModal: (user: SupremeUser) => void
  closeEditUserModal: () => void

  openDeleteUserModal: (user: SupremeUser) => void
  closeDeleteUserModal: () => void

  openEmailUserModal: (user: SupremeUser) => void
  closeEmailUserModal: () => void
}

export const useUserRegistryStore = create<UserRegistryState>((set) => ({
  searchQuery: "",
  selectedTier: "ALL",
  selectedStatus: "ALL",
  selectedUser: null,

  isCreateUserModalOpen: false,
  isSuspendUserModalOpen: false,
  isDirectFundingModalOpen: false,
  isEditUserModalOpen: false,
  isDeleteUserModalOpen: false,
  isEmailUserModalOpen: false,

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

  openEditUserModal: (user) => set({ selectedUser: user, isEditUserModalOpen: true }),
  closeEditUserModal: () => set({ isEditUserModalOpen: false, selectedUser: null }),

  openDeleteUserModal: (user) => set({ selectedUser: user, isDeleteUserModalOpen: true }),
  closeDeleteUserModal: () => set({ isDeleteUserModalOpen: false, selectedUser: null }),

  openEmailUserModal: (user) => set({ selectedUser: user, isEmailUserModalOpen: true }),
  closeEmailUserModal: () => set({ isEmailUserModalOpen: false, selectedUser: null }),
}))
