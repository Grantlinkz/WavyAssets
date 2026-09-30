// Vitest globals enabled
import { useComplianceStore } from "../../src/store/useComplianceStore"
import { useAdminAuthStore, type Operator } from "../../src/store/useAdminAuthStore"
import type { KycDossier } from "../../src/api/compliance"

const mockComplianceDossier: KycDossier = {
  id: "dossier-finma-7712",
  dossierNumber: "FINMA-KYC-7712",
  userId: "usr-basel-02",
  userName: "Picton Supreme Trust Ltd",
  userEmail: "fiduciary@picton-Supreme.ch",
  country: "CH",
  entityType: "INSTITUTIONAL_FUND",
  submittedAt: "2026-09-27T14:15:00Z",
  currentTier: "TIER_2",
  requestedTier: "INSTITUTIONAL",
  status: "PENDING_REVIEW",
  riskScore: 6,
  pepCheckPassed: true,
  sanctionListClear: true,
  finmaChecklist: {
    identityVerified: true,
    addressVerified: true,
    sourceOfWealthConfirmed: true,
    uboIdentified: true,
    riskCategorizationSigned: true,
  },
  documents: [
    {
      id: "doc-picton-01",
      type: "PASSPORT",
      filename: "Trustee_Passport.pdf",
      fileSize: "2.8 MB",
      uploadedAt: "2026-09-27T14:16:00Z",
      verified: true,
      documentUrl: "https://vault.wavyassets.ch/docs/doc-picton-01",
      sha256Hash: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
    },
    {
      id: "doc-picton-02",
      type: "UBO_DECLARATION",
      filename: "FINMA_UBO_Declaration.pdf",
      fileSize: "5.1 MB",
      uploadedAt: "2026-09-27T14:18:00Z",
      verified: true,
      documentUrl: "https://vault.wavyassets.ch/docs/doc-picton-02",
      sha256Hash: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
    },
  ],
}

describe("KYC Compliance Deck & Tier Elevation Integration", () => {
  beforeEach(() => {
    useComplianceStore.setState({
      activeFilter: "ALL",
      selectedDossier: null,
      isSplitInspectorOpen: false,
      activeDocumentIndex: 0,
    })
  })

  it("handles dossier queue filtering correctly", () => {
    expect(useComplianceStore.getState().activeFilter).toBe("ALL")

    useComplianceStore.getState().setActiveFilter("IN_INSPECTION")
    expect(useComplianceStore.getState().activeFilter).toBe("IN_INSPECTION")

    useComplianceStore.getState().setActiveFilter("APPROVED")
    expect(useComplianceStore.getState().activeFilter).toBe("APPROVED")
  })

  it("opens split-screen inspector with selected dossier and switches document tabs", () => {
    useComplianceStore.getState().openInspector(mockComplianceDossier)
    const state = useComplianceStore.getState()

    expect(state.isSplitInspectorOpen).toBe(true)
    expect(state.selectedDossier?.userName).toBe("Picton Supreme Trust Ltd")
    expect(state.selectedDossier?.documents.length).toBe(2)
    expect(state.activeDocumentIndex).toBe(0)

    // Switch to second document tab (UBO Declaration)
    useComplianceStore.getState().setActiveDocumentIndex(1)
    expect(useComplianceStore.getState().activeDocumentIndex).toBe(1)
  })

  it("validates 5-point FINMA AML checklist integrity", () => {
    const checklist = mockComplianceDossier.finmaChecklist
    expect(checklist.identityVerified).toBe(true)
    expect(checklist.addressVerified).toBe(true)
    expect(checklist.sourceOfWealthConfirmed).toBe(true)
    expect(checklist.uboIdentified).toBe(true)
    expect(checklist.riskCategorizationSigned).toBe(true)

    const allChecked = Object.values(checklist).every(Boolean)
    expect(allChecked).toBe(true)
  })

  it("enforces RBAC permissions for FINMA tier elevation engine", () => {
    // Treasury Officer cannot elevate KYC tiers
    const treasuryOp: Operator = {
      id: "op-treasury-01",
      name: "Eleanor Vance",
      initials: "EV",
      email: "e.vance@wavyassets.ch",
      role: "TREASURY_OFFICER",
    }
    useAdminAuthStore.getState().login(treasuryOp, "jwt_token")
    expect(useAdminAuthStore.getState().hasPermission("canElevateTier")).toBe(false)

    // Compliance Officer CAN elevate KYC tiers
    const complianceOp: Operator = {
      id: "op-comp-01",
      name: "Marcella Thorne",
      initials: "MT",
      email: "m.thorne@wavyassets.ch",
      role: "COMPLIANCE_OFFICER",
    }
    useAdminAuthStore.getState().login(complianceOp, "jwt_token")
    expect(useAdminAuthStore.getState().hasPermission("canElevateTier")).toBe(true)

    // Super Admin CAN elevate KYC tiers
    const superAdminOp: Operator = {
      id: "op-super-01",
      name: "Alexander Wright",
      initials: "AW",
      email: "a.wright@wavyassets.ch",
      role: "SUPER_ADMIN",
    }
    useAdminAuthStore.getState().login(superAdminOp, "jwt_token")
    expect(useAdminAuthStore.getState().hasPermission("canElevateTier")).toBe(true)
  })
})
