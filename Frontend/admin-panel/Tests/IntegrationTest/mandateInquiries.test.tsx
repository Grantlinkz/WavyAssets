// Vitest globals enabled
import { useAdminNavStore } from "../../src/store/useAdminNavStore"
import { useAdminAuthStore, type Operator } from "../../src/store/useAdminAuthStore"
import type { LeadInquiry } from "../../src/api/inquiries"

const mockInquiry: LeadInquiry = {
  id: "inq-01",
  dossierId: "MND-8821",
  receivedAt: "2026-09-27 10:14 UTC",
  company: "Apex Supreme Capital AG",
  trustScore: 98,
  isDomainVerified: true,
  contactName: "Marcella Thorne",
  email: "m.thorne@apexsov.ch",
  telegram: "@m_thorne_apex",
  location: "Zurich, Switzerland",
  assetInterest: "Direct Multi-Sig Depository",
  bracket: "CHF 50M+",
  declaredCapital: "CHF 120,000,000",
  custodyPreference: "MPC Sharded Cold Storage",
  investmentWindow: "Immediate (Q4 2026)",
  status: "NEW",
  source: "Institutional Landing Portal",
  ipAddress: "193.134.12.8",
}

describe("Mandate Inquiries Workflow Integration", () => {
  beforeEach(() => {
    useAdminNavStore.setState({
      selectedInquiry: null,
      isLeadDetailDrawerOpen: false,
      isConvertModalOpen: false,
    })
  })

  it("opens and closes lead detail drawer with selected inquiry dossier", () => {
    expect(useAdminNavStore.getState().isLeadDetailDrawerOpen).toBe(false)
    expect(useAdminNavStore.getState().selectedInquiry).toBeNull()

    useAdminNavStore.getState().openLeadDrawer(mockInquiry)
    expect(useAdminNavStore.getState().isLeadDetailDrawerOpen).toBe(true)
    expect(useAdminNavStore.getState().selectedInquiry?.dossierId).toBe("MND-8821")

    useAdminNavStore.getState().closeLeadDrawer()
    expect(useAdminNavStore.getState().isLeadDetailDrawerOpen).toBe(false)
    expect(useAdminNavStore.getState().selectedInquiry).toBeNull()
  })

  it("opens and closes lead conversion modal", () => {
    useAdminNavStore.getState().openConvertModal(mockInquiry)
    expect(useAdminNavStore.getState().isConvertModalOpen).toBe(true)
    expect(useAdminNavStore.getState().selectedInquiry?.company).toBe("Apex Supreme Capital AG")

    useAdminNavStore.getState().closeConvertModal()
    expect(useAdminNavStore.getState().isConvertModalOpen).toBe(false)
  })

  it("enforces RBAC permissions for mandate conversion action", () => {
    // Treasury officer cannot convert leads
    const treasuryOp: Operator = {
      id: "op-treasury-01",
      name: "Eleanor Vance",
      initials: "EV",
      email: "e.vance@wavyassets.ch",
      role: "TREASURY_OFFICER",
    }
    useAdminAuthStore.getState().login(treasuryOp, "mock_token")
    expect(useAdminAuthStore.getState().hasPermission("canConvertLeads")).toBe(false)

    // Desk lead can convert leads
    const deskLeadOp: Operator = {
      id: "op-desk-01",
      name: "Soren Lindqvist",
      initials: "SL",
      email: "s.lindqvist@wavyassets.ch",
      role: "DESK_LEAD",
    }
    useAdminAuthStore.getState().login(deskLeadOp, "mock_token")
    expect(useAdminAuthStore.getState().hasPermission("canConvertLeads")).toBe(true)

    // Super admin can convert leads
    const superAdminOp: Operator = {
      id: "op-admin-01",
      name: "Alexander Wright",
      initials: "AW",
      email: "a.wright@wavyassets.ch",
      role: "SUPER_ADMIN",
    }
    useAdminAuthStore.getState().login(superAdminOp, "mock_token")
    expect(useAdminAuthStore.getState().hasPermission("canConvertLeads")).toBe(true)
  })
})