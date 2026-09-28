import { create } from "zustand"
import type { KycDossier, KycDossierStatus } from "../api/compliance"

export type ComplianceFilter = "ALL" | KycDossierStatus

export interface ComplianceState {
  activeFilter: ComplianceFilter
  selectedDossier: KycDossier | null
  isSplitInspectorOpen: boolean
  activeDocumentIndex: number

  // Actions
  setActiveFilter: (filter: ComplianceFilter) => void
  openInspector: (dossier: KycDossier) => void
  closeInspector: () => void
  setSelectedDossier: (dossier: KycDossier | null) => void
  setActiveDocumentIndex: (index: number) => void
}

export const useComplianceStore = create<ComplianceState>((set) => ({
  activeFilter: "ALL",
  selectedDossier: null,
  isSplitInspectorOpen: false,
  activeDocumentIndex: 0,

  setActiveFilter: (filter) => set({ activeFilter: filter }),
  openInspector: (dossier) =>
    set({
      selectedDossier: dossier,
      isSplitInspectorOpen: true,
      activeDocumentIndex: 0,
    }),
  closeInspector: () =>
    set({
      isSplitInspectorOpen: false,
      selectedDossier: null,
      activeDocumentIndex: 0,
    }),
  setSelectedDossier: (dossier) => set({ selectedDossier: dossier }),
  setActiveDocumentIndex: (index) => set({ activeDocumentIndex: index }),
}))
