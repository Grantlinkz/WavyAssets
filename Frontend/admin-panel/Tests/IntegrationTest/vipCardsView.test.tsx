import { describe, it, expect, beforeEach } from "vitest"
import { renderToString } from "react-dom/server"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { VipCardsView } from "../../src/views/VipCardsView"
import { MintVipCardModal } from "../../src/components/vip-cards/MintVipCardModal"
import { VipCard3DPreview } from "../../src/components/vip-cards/VipCard3DPreview"
import { useVipCardsStore } from "../../src/store/useVipCardsStore"

describe("VIP Cards & Metal Minting Integration", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
    useVipCardsStore.setState({
      searchQuery: "",
      statusFilter: "ALL",
      isMintModalOpen: false,
      selectedCard: null,
      draftMint: {
        userId: "USR-3104-CH",
        cardholderName: "HELENE VON BERNSTORFF",
        tier: "OBSIDIAN",
        substrate: "Obsidian 42g Tungsten",
        dailySpendLimit: 500000,
        cardType: "PHYSICAL",
        destination: "Registered Address (Seestrasse 142, Zurich)",
      },
    })
  })

  it("renders VIP cards command deck header, telemetry and KPI metrics", () => {
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <VipCardsView />
      </QueryClientProvider>
    )

    expect(html).toContain("VIP Obsidian Metal Cards")
    expect(html).toContain("VISA Infinite / Direct Core Active")
    expect(html).toContain("Unminted Tungsten Blanks")
    expect(html).toContain("Swiss Armored Courier Operational")
    expect(html).toContain("+ Mint New VIP Card")
    expect(html).toContain("Active Card Portfolio")
    expect(html).toContain("24h Settlement Volume")
    expect(html).toContain("Terminal Killswitches")
  })

  it("renders 3D metallic card preview with accurate engravings and chip specifications", () => {
    const html = renderToString(
      <VipCard3DPreview
        cardholderName="HELENE VON BERNSTORFF"
        substrate="Obsidian 42g Tungsten"
        maskedPan="•••• •••• •••• 5590"
        expiryDate="09/31"
      />
    )

    expect(html).toContain("HELENE VON BERNSTORFF")
    expect(html).toContain("•••• •••• •••• 5590")
    expect(html).toContain("09/31")
    expect(html).toContain("Obsidian 42g Tungsten")
    expect(html).toContain("42.00 grams")
    expect(html).toContain("5-Axis CNC Mill")
    expect(html).toContain("Vapor PVD DLC")
    expect(html).toContain("VISA")
    expect(html).toContain("INFINITE")
  })

  it("renders alternate titanium metal substrate specifications", () => {
    const html = renderToString(
      <VipCard3DPreview
        cardholderName="BARON DE ROTHSCHILD"
        substrate="Silver Titanium"
      />
    )

    expect(html).toContain("Silver Titanium")
    expect(html).toContain("18.00 grams")
    expect(html).toContain("Aerospace Grade 5 Ti")
  })

  it("renders mint VIP card modal when open", () => {
    useVipCardsStore.setState({ isMintModalOpen: true })

    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <MintVipCardModal isOpen={true} />
      </QueryClientProvider>
    )

    expect(html).toContain("Mint New Obsidian VIP Metal Card")
    expect(html).toContain("Laser-Engraved Name")
    expect(html).toContain("Substrate &amp; Metal Alloy Grade")
    expect(html).toContain("Obsidian 42g")
    expect(html).toContain("Supreme 28g")
    expect(html).toContain("Titanium 18g")
    expect(html).toContain("Authorized Daily Limit")
    expect(html).toContain("Secure Armored Destination")
    expect(html).toContain("Mint &amp; Issue Card")
  })
})
