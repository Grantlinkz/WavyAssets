// Vitest globals enabled
import { useComplianceStore } from "../../src/store/useComplianceStore"
import type { KycDossier } from "../../src/api/compliance"

const mockDossier: KycDossier = {
  id: "dossier-finma-01",
  dossierNumber: "FINMA-KYC-9921",
  userId: "usr-geneva-01",
  userName: "Lombard Odier Nominees SA",
  userEmail: "compliance@lombard-nominees.ch",
  country: "CH",
  entityType: "CORPORATE",
  submittedAt: "2026-09-27T11:20:00Z",
  currentTier: "TIER_1",
  requestedTier: "INSTITUTIONAL",
  status: "PENDING_REVIEW",
  riskScore: 8,
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
      id: "doc-01",
      type: "PASSPORT",
      filename: "Geneva_Board_Passport.pdf",
      fileSize: "3.2 MB",
      uploadedAt: "2026-09-27T11:21:00Z",
      verified: true,
      documentUrl: "https://vault.wavyassets.ch/docs/doc-01",
      sha256Hash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
    },
    {
      id: "doc-02",
      type: "ARTICLES_OF_INCORPORATION",
      filename: "Articles_Of_Incorporation_CH.pdf",
      fileSize: "8.4 MB",
      uploadedAt: "2026-09-27T11:22:00Z",
      verified: true,
      documentUrl: "https://vault.wavyassets.ch/docs/doc-02",
      sha256Hash: "b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01a",
    },
  ],
}

describe("useComplianceStore", () => {
  beforeEach(() => {
    useComplianceStore.setState({
      activeFilter: "ALL",
      selectedDossier: null,
      isSplitInspectorOpen: false,
      activeDocumentIndex: 0,
    })
  })

  it("initializes with default ALL filter and closed inspector", () => {
    const state = useComplianceStore.getState()
    expect(state.activeFilter).toBe("ALL")
    expect(state.selectedDossier).toBeNull()
    expect(state.isSplitInspectorOpen).toBe(false)
    expect(state.activeDocumentIndex).toBe(0)
  })

  it("updates active filter", () => {
    const { setActiveFilter } = useComplianceStore.getState()
    
    setActiveFilter("PENDING_REVIEW")
    expect(useComplianceStore.getState().activeFilter).toBe("PENDING_REVIEW")

    setActiveFilter("ESCALATED_FINMA")
    expect(useComplianceStore.getState().activeFilter).toBe("ESCALATED_FINMA")
  })

  it("manages split-screen inspector open and close state", () => {
    const { openInspector, closeInspector } = useComplianceStore.getState()

    openInspector(mockDossier)
    const openedState = useComplianceStore.getState()
    expect(openedState.isSplitInspectorOpen).toBe(true)
    expect(openedState.selectedDossier?.dossierNumber).toBe("FINMA-KYC-9921")
    expect(openedState.activeDocumentIndex).toBe(0)

    closeInspector()
    const closedState = useComplianceStore.getState()
    expect(closedState.isSplitInspectorOpen).toBe(false)
    expect(closedState.selectedDossier).toBeNull()
  })

  it("switches active document index in split document viewer", () => {
    const { openInspector, setActiveDocumentIndex } = useComplianceStore.getState()

    openInspector(mockDossier)
    setActiveDocumentIndex(1)
    expect(useComplianceStore.getState().activeDocumentIndex).toBe(1)
  })
})
