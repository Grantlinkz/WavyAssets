import { describe, it, expect, beforeEach } from "vitest"
import { useVipCardsStore } from "../../src/store/useVipCardsStore"
import type { VipCardItem } from "../../src/api/vipCards"

describe("VIP Cards Store Logic", () => {
  const mockCard: VipCardItem = {
    id: "CARD-8492",
    userId: "USR-9942-CH",
    userName: "Baron Philippe de Rothschild",
    userCif: "USR-9942-CH",
    userTier: "Family Office Tier",
    cardNumberLast4: "8492",
    maskedPan: "•••• •••• •••• 8492",
    cardType: "PHYSICAL",
    tier: "OBSIDIAN",
    substrate: "Obsidian 42g Tungsten",
    isFrozen: false,
    dailySpendLimit: 500000,
    shippingStatus: "DELIVERED",
    destination: "Registered Address (Zurich)",
    issuedAt: "2026-09-20T10:00:00Z",
    updatedAt: "2026-09-28T09:00:00Z",
  }

  beforeEach(() => {
    useVipCardsStore.setState({
      searchQuery: "",
      statusFilter: "ALL",
      isMintModalOpen: false,
      selectedCard: null,
      draftMint: {
        userId: "",
        cardholderName: "HELENE VON BERNSTORFF",
        tier: "OBSIDIAN",
        substrate: "Obsidian 42g Tungsten",
        dailySpendLimit: 500000,
        cardType: "PHYSICAL",
        destination: "Registered Address (Seestrasse 142, Zurich)",
      },
    })
  })

  it("updates search query and status filter correctly", () => {
    const store = useVipCardsStore.getState()
    store.setSearchQuery("Rothschild")
    store.setStatusFilter("LOCKED")

    expect(useVipCardsStore.getState().searchQuery).toBe("Rothschild")
    expect(useVipCardsStore.getState().statusFilter).toBe("LOCKED")
  })

  it("controls mint modal visibility and selected card", () => {
    const store = useVipCardsStore.getState()
    expect(store.isMintModalOpen).toBe(false)
    expect(store.selectedCard).toBeNull()

    store.setIsMintModalOpen(true)
    store.setSelectedCard(mockCard)

    expect(useVipCardsStore.getState().isMintModalOpen).toBe(true)
    expect(useVipCardsStore.getState().selectedCard?.id).toBe("CARD-8492")
  })

  it("updates draft mint form parameters", () => {
    const store = useVipCardsStore.getState()
    store.setDraftMint({
      cardholderName: "ALEXANDRE DE ROTHSCHILD",
      dailySpendLimit: 750000,
      substrate: "Silver Titanium",
      tier: "TITANIUM",
    })

    const state = useVipCardsStore.getState()
    expect(state.draftMint.cardholderName).toBe("ALEXANDRE DE ROTHSCHILD")
    expect(state.draftMint.dailySpendLimit).toBe(750000)
    expect(state.draftMint.substrate).toBe("Silver Titanium")
    expect(state.draftMint.tier).toBe("TITANIUM")
  })

  it("resets draft mint form to default values", () => {
    const store = useVipCardsStore.getState()
    store.setDraftMint({ cardholderName: "TEST USER", dailySpendLimit: 100000 })
    store.resetDraftMint()

    const state = useVipCardsStore.getState()
    expect(state.draftMint.cardholderName).toBe("")
    expect(state.draftMint.dailySpendLimit).toBe(500000)
    expect(state.draftMint.substrate).toBe("Obsidian 42g Tungsten")
  })
})
