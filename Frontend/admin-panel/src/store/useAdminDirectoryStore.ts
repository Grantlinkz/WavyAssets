import { create } from "zustand"
import type { AdminPersonnel } from "../api/admins"

interface AdminDirectoryState {
  searchQuery: string
  selectedRole: string
  selectedStatus: string
  selectedAdmin: AdminPersonnel | null
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
  isSuspendModalOpen: boolean
  isDeleteModalOpen: boolean

  // Actions
  setSearchQuery: (query: string) => void
  setSelectedRole: (role: string) => void
  setSelectedStatus: (status: string) => void
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (admin: AdminPersonnel) => void
  closeEditModal: () => void
  openSuspendModal: (admin: AdminPersonnel) => void
  closeSuspendModal: () => void
  openDeleteModal: (admin: AdminPersonnel) => void
  closeDeleteModal: () => void
}

export const useAdminDirectoryStore = create<AdminDirectoryState>((set) => ({
  searchQuery: "",
  selectedRole: "ALL",
  selectedStatus: "ALL",
  selectedAdmin: null,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isSuspendModalOpen: false,
  isDeleteModalOpen: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedRole: (selectedRole) => set({ selectedRole }),
  setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openEditModal: (admin) => set({ selectedAdmin: admin, isEditModalOpen: true }),
  closeEditModal: () => set({ isEditModalOpen: false, selectedAdmin: null }),
  openSuspendModal: (admin) => set({ selectedAdmin: admin, isSuspendModalOpen: true }),
  closeSuspendModal: () => set({ isSuspendModalOpen: false, selectedAdmin: null }),
  openDeleteModal: (admin) => set({ selectedAdmin: admin, isDeleteModalOpen: true }),
  closeDeleteModal: () => set({ isDeleteModalOpen: false, selectedAdmin: null }),
}))
