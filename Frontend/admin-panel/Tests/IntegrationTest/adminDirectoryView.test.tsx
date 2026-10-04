import { describe, it, expect, beforeEach } from "vitest"
import { renderToString } from "react-dom/server"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AdminDirectoryView } from "../../src/views/AdminDirectoryView"
import { CreateAdminModal } from "../../src/components/admins/CreateAdminModal"
import { useAdminAuthStore } from "../../src/store/useAdminAuthStore"
import { useAdminDirectoryStore } from "../../src/store/useAdminDirectoryStore"
import type { AdminPersonnel } from "../../src/api/admins"

describe("Admin Directory & Super Admin RBAC Integration", () => {
  let queryClient: QueryClient

  const mockAdmins: AdminPersonnel[] = [
    {
      id: "admin-super-1",
      fullName: "Alexander Wright",
      email: "alexander@wavyassets.ch",
      role: "SUPER_ADMIN",
      isActive: true,
      createdAt: "2026-01-15T10:00:00Z",
      updatedAt: "2026-01-15T10:00:00Z",
      permissions: ["canFreezePlatform", "canApproveDualSignOff"],
      roleDescription:
        "Full root governance across treasury, security parameters, personnel directory, and institutional compliance.",
    },
    {
      id: "admin-treasury-1",
      fullName: "Marc B. Widmer",
      email: "marc@wavyassets.ch",
      role: "TREASURY_OFFICER",
      isActive: true,
      createdAt: "2026-02-01T12:00:00Z",
      updatedAt: "2026-02-01T12:00:00Z",
      permissions: ["canApproveDualSignOff", "canCreditDeposit"],
      roleDescription:
        "Liquidity rebalancing, settlement verification, FINMA Art. 14 dual sign-offs, and cold vault matrix control.",
    },
    {
      id: "admin-desk-1",
      fullName: "Sophie Dupont",
      email: "sophie@wavyassets.ch",
      role: "DESK_LEAD",
      isActive: false,
      createdAt: "2026-03-10T14:30:00Z",
      updatedAt: "2026-03-10T14:30:00Z",
      permissions: ["canConvertLeads"],
      roleDescription:
        "Direct capital funding, client onboarding, OTC execution, and account oversight.",
    },
  ]

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(["admins", "ALL", "ALL", ""], mockAdmins)

    // Set Super Admin operator as active by default
    useAdminAuthStore.setState({
      isAuthenticated: true,
      operator: {
        id: "admin-super-1",
        name: "Alexander Wright",
        initials: "AW",
        email: "alexander@wavyassets.ch",
        role: "SUPER_ADMIN",
      },
    })
  })

  it("renders Admin Directory header, metrics ribbon, and personnel table", () => {
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <AdminDirectoryView />
      </QueryClientProvider>
    )

    expect(html).toContain("Institutional Administrative Directory &amp; RBAC Governance")
    expect(html).toContain("Total Personnel")
    expect(html).toContain("Active Clearance")
    expect(html).toContain("Suspended Access")
    expect(html).toContain("Super Admins")
    expect(html).toContain("Alexander Wright")
    expect(html).toContain("SUPER ADMIN")
    expect(html).toContain("Marc B. Widmer")
    expect(html).toContain("TREASURY OFFICER")
    expect(html).toContain("Sophie Dupont")
    expect(html).toContain("SUSPENDED")
    expect(html).toContain("Register New Personnel")
  })

  it("displays role scope description explaining what personnel can do", () => {
    const html = renderToString(
      <QueryClientProvider client={queryClient}>
        <AdminDirectoryView />
      </QueryClientProvider>
    )

    expect(html).toContain("Full root governance across treasury")
    expect(html).toContain("Liquidity rebalancing, settlement verification")
  })

  it("enforces Super Admin authorization on create modal and personnel registration", () => {
    useAdminDirectoryStore.setState({ isCreateModalOpen: true })

    // 1. As Super Admin: input fields and submit button active
    const superAdminHtml = renderToString(
      <QueryClientProvider client={queryClient}>
        <CreateAdminModal isOpen={true} isSuperAdmin={true} />
      </QueryClientProvider>
    )

    expect(superAdminHtml).toContain("Register Administrative Personnel")
    expect(superAdminHtml).toContain("data-testid=\"submit-create-admin-btn\"")
    expect(superAdminHtml).not.toContain("Super Admin Clearance Required")

    // 2. As Desk Lead: inputs disabled and clearance restriction warning displayed
    useAdminAuthStore.setState({
      operator: {
        id: "admin-desk-1",
        name: "Sophie Dupont",
        initials: "SD",
        email: "sophie@wavyassets.ch",
        role: "DESK_LEAD",
      },
    })

    const nonSuperAdminHtml = renderToString(
      <QueryClientProvider client={queryClient}>
        <CreateAdminModal isOpen={true} isSuperAdmin={false} />
      </QueryClientProvider>
    )

    expect(nonSuperAdminHtml).toContain("Super Admin Clearance Required")
    expect(nonSuperAdminHtml).toContain("Under FINMA Article 14 governance, only active Super Administrators may register")
  })
})
