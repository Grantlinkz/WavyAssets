import React from "react"
import { ShieldCheck, FileCheck, Clock, AlertTriangle } from "lucide-react"
import { KycQueueTable } from "../components/compliance/KycQueueTable"
import { SplitScreenDocInspector } from "../components/compliance/SplitScreenDocInspector"

export const ComplianceView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6" data-testid="compliance-view">
      {/* View Header with Title and Telemetry Strip */}
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

        {/* 4-Metric Compliance Telemetry Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3 bg-bg-panel border border-border-subtle rounded-[4px]">
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Pending Dossiers</span>
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="font-mono tabular-nums text-lg font-bold text-on-surface">5 Pending</div>
            <div className="text-[10px] text-amber-400 font-mono mt-0.5">Require Officer Inspection</div>
          </div>

          <div className="p-3 bg-bg-panel border border-border-subtle rounded-[4px]">
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Sanctions / PEP Clear</span>
              <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
            </div>
            <div className="font-mono tabular-nums text-lg font-bold text-status-success">98.4% Clear</div>
            <div className="text-[10px] text-secondary font-mono mt-0.5">Automated Shard Screening</div>
          </div>

          <div className="p-3 bg-bg-panel border border-border-subtle rounded-[4px]">
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">Verification SLA</span>
              <Clock className="w-3.5 h-3.5 text-telemetry-cyan" />
            </div>
            <div className="font-mono tabular-nums text-lg font-bold text-telemetry-cyan">14.2 min</div>
            <div className="text-[10px] text-secondary font-mono mt-0.5">Average Turnaround Time</div>
          </div>

          <div className="p-3 bg-bg-panel border border-border-subtle rounded-[4px]">
            <div className="flex items-center justify-between text-secondary mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider">FINMA Escalations</span>
              <AlertTriangle className="w-3.5 h-3.5 text-status-danger" />
            </div>
            <div className="font-mono tabular-nums text-lg font-bold text-status-danger">2 Active</div>
            <div className="text-[10px] text-status-danger font-mono mt-0.5">Article 14 Dual Sign-Off</div>
          </div>
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
