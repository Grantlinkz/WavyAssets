// Vitest globals enabled
import { renderToString } from "react-dom/server"
import { AdminSidebar } from "../../src/components/layout/AdminSidebar"
import { useAdminNavStore } from "../../src/store/useAdminNavStore"

describe("Navigation Shell Integration", () => {
  beforeEach(() => {
    useAdminNavStore.setState({
      activeRoute: "overview",
      isCommandPaletteOpen: false,
      isEmergencyStopModalOpen: false,
    })
  })

  it("renders admin sidebar with institutional nav links and enclave badge", () => {
    const html = renderToString(<AdminSidebar />)
    expect(html).toContain('data-testid="admin-sidebar"')
    expect(html).toContain("Enclave: Zurich Depository (CH-8400)")
    expect(html).toContain('data-testid="nav-overview"')
    expect(html).toContain('data-testid="nav-inquiries"')
    expect(html).toContain('data-testid="nav-user-directory"')
    expect(html).toContain('data-testid="nav-compliance"')
    expect(html).toContain('data-testid="nav-treasury"')
    expect(html).toContain('data-testid="nav-deposit-rails"')
    expect(html).toContain('data-testid="nav-vip-cards"')
    expect(html).toContain('data-testid="nav-audit-log"')
  })

  it("updates active route in state store upon navigation", () => {
    expect(useAdminNavStore.getState().activeRoute).toBe("overview")

    useAdminNavStore.getState().setActiveRoute("inquiries")
    expect(useAdminNavStore.getState().activeRoute).toBe("inquiries")

    useAdminNavStore.getState().setActiveRoute("compliance")
    expect(useAdminNavStore.getState().activeRoute).toBe("compliance")
  })

  it("manages command palette and emergency modal visibility state", () => {
    const store = useAdminNavStore.getState()
    expect(store.isCommandPaletteOpen).toBe(false)
    expect(store.isEmergencyStopModalOpen).toBe(false)

    store.setCommandPaletteOpen(true)
    expect(useAdminNavStore.getState().isCommandPaletteOpen).toBe(true)

    store.setEmergencyStopModalOpen(true)
    expect(useAdminNavStore.getState().isEmergencyStopModalOpen).toBe(true)
  })
})