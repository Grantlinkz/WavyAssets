import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Eye,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Shield,
} from "lucide-react"
import {
  fetchKycQueue,
  type KycDossier,
  type KycDossierStatus,
} from "../../api/compliance"
import { useComplianceStore, type ComplianceFilter } from "../../store/useComplianceStore"
import { SkeletonTable } from "../common/SkeletonTable"
import { formatTimestamp } from "../../lib/formatters"

const FILTER_TABS: { label: string; value: ComplianceFilter }[] = [
  { label: "All Queue", value: "ALL" },
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "In Inspection", value: "IN_INSPECTION" },
  { label: "Escalated FINMA", value: "ESCALATED_FINMA" },
  { label: "Approved", value: "APPROVED" },
]

export const KycQueueTable: React.FC = () => {
  const { activeFilter, setActiveFilter, openInspector } = useComplianceStore()
  const [searchQuery, setSearchQuery] = useState("")

  const {
    data: dossiers,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<KycDossier[], Error>({
    queryKey: ["compliance", activeFilter],
    queryFn: () => fetchKycQueue(activeFilter),
  })

  const safeDossiers = Array.isArray(dossiers) ? dossiers : []
  const filteredDossiers = safeDossiers.filter((d) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      d.dossierNumber.toLowerCase().includes(q) ||
      d.userName.toLowerCase().includes(q) ||
      d.userEmail.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q)
    )
  })

  const getStatusChip = (status: KycDossierStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-status-success/15 text-status-success border border-status-success/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
            APPROVED
          </span>
        )
      case "ESCALATED_FINMA":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-status-danger/15 text-status-danger border border-status-danger/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-danger animate-pulse" />
            ESCALATED FINMA
          </span>
        )
      case "IN_INSPECTION":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-telemetry-cyan/15 text-telemetry-cyan border border-telemetry-cyan/30">
            <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan" />
            IN INSPECTION
          </span>
        )
      case "PENDING_REVIEW":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            PENDING REVIEW
          </span>
        )
    }
  }

  const getRiskChip = (score: number) => {
    if (score < 25) {
      return (
        <span className="font-mono text-[11px] text-status-success flex items-center gap-1">
          <Shield className="w-3 h-3 text-status-success" />
          <span>{score} (Clean)</span>
        </span>
      )
    }
    if (score < 60) {
      return (
        <span className="font-mono text-[11px] text-amber-400 flex items-center gap-1">
          <Shield className="w-3 h-3 text-amber-400" />
          <span>{score} (Review)</span>
        </span>
      )
    }
    return (
      <span className="font-mono text-[11px] text-status-danger flex items-center gap-1 font-bold">
        <Shield className="w-3 h-3 text-status-danger" />
        <span>{score} (Elevated)</span>
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-4" data-testid="kyc-queue-container">
      {/* Search and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-bg-panel border border-border-subtle rounded-[4px] p-3">
        <div className="flex items-center gap-2 flex-1 max-w-md relative">
          <Search className="w-3.5 h-3.5 text-secondary absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dossier #, principal name, or country..."
            className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 text-xs text-on-surface focus:border-gold-accent focus:outline-none"
            data-testid="kyc-search-input"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-3 py-1 rounded-[2px] font-mono text-[11px] transition-colors cursor-pointer border ${
                activeFilter === tab.value
                  ? "bg-bg-canvas text-gold-accent border-gold-accent/40 font-semibold"
                  : "bg-transparent text-secondary border-transparent hover:bg-state-hover/50 hover:text-on-surface"
              }`}
              data-testid={`filter-${tab.value.toLowerCase()}`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-secondary hover:text-on-surface transition-colors cursor-pointer disabled:opacity-50 ml-1"
            title="Refresh Dossier Queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-gold-accent" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table */}
      {isLoading ? (
        <SkeletonTable rows={8} />
      ) : isError ? (
        <div
          className="w-full min-h-[540px] bg-bg-panel border border-border-subtle rounded-[4px] p-8 flex flex-col items-center justify-center text-center"
          data-testid="kyc-queue-error"
        >
          <div className="w-12 h-12 rounded-full bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-on-surface mb-1">
            KYC Compliance Queue Ingestion Error
          </h3>
          <p className="text-xs text-secondary max-w-md mb-4 font-mono">
            {error?.message || "Failed to load verification dossiers from compliance enclave."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-xs text-on-surface font-medium flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </button>
        </div>
      ) : filteredDossiers.length === 0 ? (
        <div
          className="w-full min-h-[540px] bg-bg-panel border border-border-subtle rounded-[4px] p-8 flex flex-col items-center justify-center text-center"
          data-testid="kyc-queue-empty"
        >
          <div className="w-12 h-12 rounded-full bg-gold-accent/10 border border-gold-accent/30 flex items-center justify-center text-gold-accent mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-on-surface mb-1">
            Compliance Queue Clean
          </h3>
          <p className="text-xs text-secondary max-w-md mb-4">
            No users match current status filter. All pending FINMA AML submissions have been processed.
          </p>
          <button
            onClick={() => setActiveFilter("ALL")}
            className="px-4 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-xs text-secondary hover:text-on-surface font-medium cursor-pointer"
          >
            View All Users
          </button>
        </div>
      ) : (
        <div className="w-full bg-bg-panel border border-border-subtle rounded-[4px] overflow-hidden">
          <div className="overflow-x-auto min-h-[540px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-bg-canvas/60 border-b border-border-subtle text-secondary font-mono uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Dossier ID / Received</th>
                  <th className="py-2.5 px-3">Applicant Entity</th>
                  <th className="py-2.5 px-3">Entity Type</th>
                  <th className="py-2.5 px-3">Requested Tier Elevation</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Risk Rating</th>
                  <th className="py-2.5 px-3">Sanctions / PEP</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 font-sans">
                {filteredDossiers.map((dossier, idx) => (
                  <tr
                    key={dossier.id}
                    className={`hover:bg-state-hover/50 transition-colors ${
                      idx % 2 === 1 ? "bg-bg-canvas/30" : "bg-transparent"
                    }`}
                    data-testid={`dossier-row-${dossier.id}`}
                  >
                    {/* Dossier # & Time */}
                    <td className="py-2 px-3">
                      <div className="font-mono text-on-surface font-semibold text-[11px]">
                        {dossier.dossierNumber}
                      </div>
                      <div className="text-[10px] text-secondary font-mono">
                        {formatTimestamp(dossier.submittedAt).substring(0, 16)}
                      </div>
                    </td>

                    {/* Applicant */}
                    <td className="py-2 px-3">
                      <div className="font-semibold text-on-surface flex items-center gap-1.5">
                        <span>{dossier.userName}</span>
                        <span className="font-mono text-[9px] px-1 py-0.2 bg-bg-elevated border border-border-subtle text-secondary rounded-[2px]">
                          {dossier.country}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-secondary">{dossier.userEmail}</div>
                    </td>

                    {/* Entity Type */}
                    <td className="py-2 px-3">
                      <span className="font-mono text-secondary text-[11px]">
                        {dossier.entityType.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Tier Transition */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-secondary">{dossier.currentTier}</span>
                        <ArrowRight className="w-3 h-3 text-gold-accent" />
                        <span className="text-gold-accent font-bold px-1.5 py-0.2 bg-gold-accent/10 border border-gold-accent/30 rounded-[2px]">
                          {dossier.requestedTier}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3">{getStatusChip(dossier.status)}</td>

                    {/* Risk Rating */}
                    <td className="py-2 px-3">{getRiskChip(dossier.riskScore)}</td>

                    {/* PEP / Sanctions */}
                    <td className="py-2 px-3">
                      {dossier.pepCheckPassed && dossier.sanctionListClear ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-status-success">
                          <ShieldCheck className="w-3 h-3 text-status-success" />
                          <span>Clear</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-status-danger bg-status-danger/10 px-1.5 py-0.5 rounded border border-status-danger/30">
                          <ShieldAlert className="w-3 h-3 text-status-danger" />
                          <span>
                            {!dossier.pepCheckPassed && !dossier.sanctionListClear
                              ? "PEP/Sanctions Hit"
                              : !dossier.pepCheckPassed
                              ? "PEP Hit"
                              : "Sanctions Hit"}
                          </span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => openInspector(dossier)}
                        className="px-2.5 py-1 rounded-[2px] bg-bg-elevated hover:bg-state-hover border border-border-subtle text-gold-accent hover:border-gold-accent/40 font-mono text-[11px] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        data-testid={`inspect-dossier-${dossier.id}`}
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect Dossier</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
