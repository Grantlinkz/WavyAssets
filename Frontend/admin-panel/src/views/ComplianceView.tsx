import React from "react"
import { ShieldCheck } from "lucide-react"
import { KycQueueTable } from "../components/compliance/KycQueueTable"
import { SplitScreenDocInspector } from "../components/compliance/SplitScreenDocInspector"

export const ComplianceView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6" data-testid="compliance-view">
      {/* View Header with Title */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold-accent" />
            <span>KYC & AML Compliance Review Deck</span>
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            Dossier verification queue, split-screen document inspector, and FINMA AMLA Article 14 tier elevation engine
          </p>
        </div>
      </div>

      {/* Compliance Queue Table */}
      <KycQueueTable />

      {/* Split-Screen Document Inspector Modal */}
      <SplitScreenDocInspector />
    </div>
  )
}

export default ComplianceView
