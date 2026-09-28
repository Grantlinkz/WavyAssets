import { describe, it, expect, beforeEach } from "vitest"
import { renderToString } from "react-dom/server"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { EmergencyFreezeModal } from "../../src/components/emergency/EmergencyFreezeModal"
import { PlatformLockdownBanner } from "../../src/components/emergency/PlatformLockdownBanner"
import { useAdminNavStore } from "../../src/store/useAdminNavStore"
import { useEmergencyStore, REQUIRED_FREEZE_PHRASE } from "../../src/store/useEmergencyStore"

describe("Emergency Platform Freeze Integration", () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    useAdminNavStore.setState({ isEmergencyStopModalOpen: false })
    useEmergencyStore.setState({
      isPlatformFrozen: false,
      freezeStatus: null,
      verificationInput: "",
      justificationInput: "",
    })
  })

  it("does not render modal when isEmergencyStopModalOpen is false", () => {
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <EmergencyFreezeModal />
      </QueryClientProvider>
    )

    expect(html).toBe("")
  })

  it("renders emergency freeze modal with DEFCON 1 alerts and sequence checklist", () => {
    useAdminNavStore.setState({ isEmergencyStopModalOpen: true })

    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <EmergencyFreezeModal isOpen={true} />
      </QueryClientProvider>
    )

    expect(html).toContain("Emergency Platform Freeze")
    expect(html).toContain("FINMA ART. 88")
    expect(html).toContain("DEFCON CUSTODY LEVEL 1")
    expect(html).toContain("Immediate Operational Execution Sequence:")
    expect(html).toContain("Terminate Sessions")
    expect(html).toContain("Lock VIP Cards")
    expect(html).toContain("Freeze Settlement Rails")
    expect(html).toContain("Enforce Read-Only APIs")
    expect(html).toContain("Executive Dispatch")
    expect(html).toContain(REQUIRED_FREEZE_PHRASE)
    expect(html).toContain("Execute Platform Freeze")
  })

  it("renders disabled execute button when verification phrase and reason are empty", () => {
    useAdminNavStore.setState({ isEmergencyStopModalOpen: true })

    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <EmergencyFreezeModal isOpen={true} />
      </QueryClientProvider>
    )

    expect(html).toContain("disabled")
    expect(html).toContain("Awaiting Input")
  })

  it("renders platform lockdown banner when isPlatformFrozen is true", () => {
    useEmergencyStore.setState({
      isPlatformFrozen: true,
      freezeStatus: {
        isFrozen: true,
        reason: "Suspected HSM anomaly on Zurich node",
      },
    })

    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <PlatformLockdownBanner isFrozen={true} />
      </QueryClientProvider>
    )

    expect(html).toContain("DEFCON 1 ACTIVE LOCKDOWN:")
    expect(html).toContain("Platform emergency freeze active per FINMA Art. 88")
    expect(html).toContain("Lift Freeze (Dual-Key)")
  })
})
