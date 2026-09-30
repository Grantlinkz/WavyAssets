import React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Eye,
  Lock,
  Mail,
  Send,
  Building,
  MessageSquare,
} from "lucide-react"
import { fetchInquiries, type LeadInquiry, type InquiryStatus } from "../../api/inquiries"
import { useAdminNavStore } from "../../store/useAdminNavStore"
import { SkeletonTable } from "../common/SkeletonTable"

export interface InquiriesTableProps {
  statusFilter: string
  searchQuery: string
  isDecrypted?: boolean
}

export const InquiriesTable: React.FC<InquiriesTableProps> = ({
  statusFilter,
  searchQuery,
  isDecrypted = true,
}) => {
  const { openLeadDrawer } = useAdminNavStore()

  const {
    data: inquiries,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<LeadInquiry[], Error>({
    queryKey: ["inquiries", statusFilter],
    queryFn: () => fetchInquiries(statusFilter),
  })

  if (isLoading) {
    return <SkeletonTable rows={8} />
  }

  if (isError) {
    return (
      <div
        className="w-full min-h-[540px] bg-bg-panel border border-border-subtle rounded-[4px] p-8 flex flex-col items-center justify-center text-center"
        data-testid="inquiries-error"
      >
        <div className="w-12 h-12 rounded-full bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface mb-1">
          Mandate Inquiries Ingestion Error
        </h3>
        <p className="text-xs text-secondary max-w-md mb-4 font-mono">
          {error?.message || "Failed to load investor inquiries from institutional inbox."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-bg-elevated hover:bg-state-hover border border-border-subtle text-xs font-mono text-on-surface rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-telemetry-cyan" />
          <span>Retry Loading Inquiries</span>
        </button>
      </div>
    )
  }

  const allItems = inquiries || []
  const filtered = allItems.filter((item) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      item.company.toLowerCase().includes(q) ||
      item.contactName.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.telegram.toLowerCase().includes(q) ||
      item.dossierId.toLowerCase().includes(q)
    )
  })

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-telemetry-cyan/10 border border-telemetry-cyan/30 text-telemetry-cyan text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan animate-pulse" />
            <span>NEW INTAKE</span>
          </span>
        )
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-status-warning/10 border border-status-warning/40 text-status-warning text-[10px] font-mono">
            IN REVIEW
          </span>
        )
      case "MANDATE_SENT":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-gold-accent/10 border border-gold-accent/40 text-gold-accent text-[10px] font-mono">
            MANDATE SENT
          </span>
        )
      case "ARCHIVED":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-bg-canvas border border-border-subtle text-secondary text-[10px] font-mono">
            ARCHIVED
          </span>
        )
    }
  }

  return (
    <div
      className="bg-bg-panel border border-border-subtle rounded-[4px] overflow-hidden flex flex-col shadow-sm"
      data-testid="inquiries-table"
    >
      {/* Table Header Controls */}
      <div className="px-4 py-3 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 bg-bg-elevated/40">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-gold-accent" />
          <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-on-surface">
            Institutional Lead Ingestion Feed
          </h2>
          <span className="text-[11px] font-mono text-secondary ml-2">
            ({filtered.length} Dossiers Listed)
          </span>
        </div>

        {isFetching && (
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-telemetry-cyan">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Syncing Shard...</span>
          </div>
        )}
      </div>

      {/* High Density Table */}
      <div className="overflow-x-auto min-h-[460px]">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-canvas/50 text-[11px] font-mono uppercase text-secondary tracking-wider">
              <th className="py-2.5 px-4 font-medium">Dossier / Received</th>
              <th className="py-2.5 px-4 font-medium">Institutional Entity</th>
              <th className="py-2.5 px-4 font-medium">Principal Contact</th>
              <th className="py-2.5 px-4 font-medium">Capital Interest</th>
              <th className="py-2.5 px-4 font-medium">Custody Architecture</th>
              <th className="py-2.5 px-4 font-medium">Workflow Status</th>
              <th className="py-2.5 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-secondary font-mono">
                  No mandate inquiries matching current filters.
                </td>
              </tr>
            ) : (
              filtered.map((inquiry, index) => {
                const isEven = index % 2 === 0
                return (
                  <tr
                    key={inquiry.id}
                    onClick={() => openLeadDrawer(inquiry)}
                    className={`transition-colors hover:bg-state-hover cursor-pointer ${
                      isEven ? "bg-bg-panel" : "bg-[#0C101A]"
                    }`}
                    data-testid={`inquiry-row-${inquiry.id}`}
                  >
                    {/* Dossier ID / Received */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-semibold text-gold-accent text-xs">
                        {inquiry.dossierId}
                      </div>
                      <div className="text-[10px] text-secondary font-mono mt-0.5">
                        {inquiry.receivedAt}
                      </div>
                    </td>

                    {/* Company / Trust Score */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-on-surface">
                          {inquiry.company}
                        </span>
                        {inquiry.isDomainVerified && (
                          <span
                            title={`Domain verified trust score ${inquiry.trustScore}%`}
                            className="inline-flex items-center text-[10px] font-mono text-status-success bg-status-success/10 border border-status-success/30 px-1 rounded-[2px]"
                          >
                            <ShieldCheck className="w-3 h-3 mr-0.5" />
                            {inquiry.trustScore}%
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-secondary mt-0.5">
                        {inquiry.location}
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="text-on-surface font-medium">
                        {isDecrypted ? inquiry.contactName : "••••••••"}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-secondary font-mono mt-0.5">
                        <span className="flex items-center gap-1 hover:text-gold-accent">
                          <Mail className="w-3 h-3 text-secondary" />
                          <span>{isDecrypted ? inquiry.email : "••••••••"}</span>
                        </span>
                        <span className="flex items-center gap-1 text-telemetry-cyan">
                          <Send className="w-3 h-3" />
                          <span>{isDecrypted ? inquiry.telegram : "••••••••"}</span>
                        </span>
                      </div>
                      {inquiry.notes && (
                        <div className="flex items-center gap-1 text-[10px] text-gold-accent font-sans mt-1 max-w-[220px] truncate" title={inquiry.notes}>
                          <MessageSquare className="w-3 h-3 shrink-0" />
                          <span className="truncate italic">"{inquiry.notes}"</span>
                        </div>
                      )}
                    </td>

                    {/* Capital Interest */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-semibold text-status-success">
                        {inquiry.declaredCapital}
                      </div>
                      <div className="text-[11px] text-secondary mt-0.5">
                        {inquiry.assetInterest} • {inquiry.bracket}
                      </div>
                    </td>

                    {/* Custody Architecture */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-on-surface">
                        <Lock className="w-3 h-3 text-gold-accent" />
                        <span>{inquiry.custodyPreference}</span>
                      </div>
                      <div className="text-[10px] font-mono text-secondary mt-0.5">
                        Window: {inquiry.investmentWindow}
                      </div>
                    </td>

                    {/* Workflow Status */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {getStatusBadge(inquiry.status)}
                    </td>

                    {/* Action Button */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          openLeadDrawer(inquiry)
                        }}
                        className="px-2.5 py-1 rounded-[4px] bg-bg-elevated hover:bg-state-hover border border-border-subtle text-secondary hover:text-on-surface text-xs font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}