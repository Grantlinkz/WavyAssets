import { create } from "zustand"
import type { VipCardItem, VipCardSubstrate, VipCardTier } from "../api/vipCards"

interface VipCardsState {
  searchQuery: string
  statusFilter: "ALL" | "ACTIVE" | "LOCKED" | "IN_TRANSIT"
  isMintModalOpen: boolean
  selectedCard: VipCardItem | null
  draftMint: {
    userId: string
    cardholderName: string
    tier: VipCardTier
    substrate: VipCardSubstrate
    dailySpendLimit: number
    cardType: "PHYSICAL" | "VIRTUAL"
    destination: string
    operatorNotes?: string
  }
  setSearchQuery: (query: string) => void
  setStatusFilter: (filter: "ALL" | "ACTIVE" | "LOCKED" | "IN_TRANSIT") => void
  setIsMintModalOpen: (open: boolean) => void
  setSelectedCard: (card: VipCardItem | null) => void
  setDraftMint: (draft: Partial<VipCardsState["draftMint"]>) => void
  resetDraftMint: () => void
}

const initialDraftMint: VipCardsState["draftMint"] = {
  userId: "",
  cardholderName: "",
  tier: "OBSIDIAN",
  substrate: "Obsidian 42g Tungsten",
  dailySpendLimit: 500000,
  cardType: "PHYSICAL",
  destination: "",
  operatorNotes: "",
}

export const useVipCardsStore = create<VipCardsState>((set) => ({
  searchQuery: "",
  statusFilter: "ALL",
  isMintModalOpen: false,
  selectedCard: null,
  draftMint: { ...initialDraftMint },
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  setIsMintModalOpen: (isMintModalOpen) => set({ isMintModalOpen }),
  setSelectedCard: (selectedCard) => set({ selectedCard }),
  setDraftMint: (draft) =>
    set((state) => ({ draftMint: { ...state.draftMint, ...draft } })),
  resetDraftMint: () => set({ draftMint: { ...initialDraftMint } }),
}))
