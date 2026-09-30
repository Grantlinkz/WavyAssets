import React from "react"
import { useQuery } from "@tanstack/react-query"
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertTriangle,
  Building,
} from "lucide-react"
import {
  fetchPendingWithdrawals,
  type PendingWithdrawal,
} from "../../api/treasury"
import { useTreasuryStore } from "../../store/useTreasuryStore"
import { SkeletonTable } from "../common/SkeletonTable"
import { formatCurrency, formatTimestamp, truncateHash } from "../../lib/formatters"

export const PendingWithdrawalsTable: React.FC = () => {
  const {
    railFilter,
    searchQuery,
    selectedWithdrawal,
    openSignOff,
  } = useTreasuryStore()

  const {
    data: withdrawals,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PendingWithdrawal[], Error>({
    queryKey: ["pending-withdrawals", railFilter, searchQuery],
    queryFn: () =>
      fetchPendingWithdrawals({
        rail: railFilter !== "ALL" ? railFilter : undefined,
        search: searchQuery || undefined,
      }),
  })

  if (isLoading) {
    return (
      <div className="bg-bg-panel border border-border-subtle rounded-lg overflow-hidden min-h-[540px]">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-warning animate-ping" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              High-Value Outgoing Withdrawals Awaiting Co-Signature
            </h2>
          </div>
        </div>
        <SkeletonTable rows={6} columns={6} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-bg-panel border border-border-subtle rounded-lg p-6 min-h-[540px] flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-10 h-10 text-status-danger mb-3" />
        <h3 className="font-headline-md text-on-surface mb-1">
          Unable to Load Outgoing Withdrawals
        </h3>
        <p className="font-body-sm text-secondary max-w-md mb-4">
          {error?.message || "Communication with treasury settlement queue failed."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 bg-bg-elevated hover:bg-state-hover border border-border-subtle rounded text-body-sm text-on-surface transition-colors"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  const items = withdrawals || []
  const totalPendingValue = items.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="bg-bg-panel border border-border-subtle rounded-lg overflow-hidden min-h-[540px] flex flex-col">
      {/* Table Header Panel */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-status-warning animate-pulse" />
          <h2 className="font-headline-md text-headline-md text-on-surface">
            High-Value Outgoing Withdrawals Awaiting Co-Signature
          </h2>
          <span className="bg-status-warning/10 text-status-warning border border-status-warning/30 font-label-caps text-label-caps px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
            {items.length} Pending
          </span>
        </div>
        <div className="font-numeric-table text-body-sm text-secondary">
          Pending Value:{" "}
          <span className="text-status-warning font-semibold font-mono tabular-nums">
            {formatCurrency(totalPendingValue, "USD")}
          </span>
        </div>
      </div>

      {/* Outgoing Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse" data-testid="withdrawals-table">
          <thead>
            <tr className="bg-bg-canvas border-b border-border-subtle font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              <th className="py-2.5 px-3">Req Time</th>
              <th className="py-2.5 px-3">Client / Entity</th>
              <th className="py-2.5 px-3">Destination Rail</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
              <th className="py-2.5 px-3">Approval Progress</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-body-md">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-secondary">
                  <div className="flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-status-success mb-2" />
                    <span className="font-title-sm text-on-surface">No Pending Withdrawals</span>
                    <span className="font-body-sm text-secondary mt-0.5">
                      All high-value treasury settlement requests have been co-signed and released.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isSelected = selectedWithdrawal?.id === item.id
                return (
                  <tr
                    key={item.id}
                    onClick={() => openSignOff(item)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-bg-elevated border-l-2 border-gold-accent"
                        : "hover:bg-state-hover"
                    }`}
                    data-testid={`withdrawal-row-${item.id}`}
                  >
                    {/* Req Time */}
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono tabular-nums text-body-sm text-on-surface font-semibold">
                          {formatTimestamp(item.createdAt).split(" ")[1] || "00:00"}
                        </span>
                        <span className="font-mono tabular-nums text-[11px] text-secondary/70">
                          {formatTimestamp(item.createdAt).split(" ")[0] || "Today"}
                        </span>
                      </div>
                    </td>

                    {/* Client / Entity */}
                    <td className="py-3 px-3 align-top">
                      <div className="flex flex-col">
                        <span className="font-title-sm text-body-sm text-on-surface flex items-center gap-1.5">
                          {item.userName || "Institutional Client"}
                          {item.userTier === "INSTITUTIONAL" && (
                            <span className="bg-gold-accent/10 text-gold-accent border border-gold-accent/30 text-[10px] px-1 py-0.2 rounded font-semibold uppercase">
                              INST
                            </span>
                          )}
                        </span>
                        <span className="font-mono tabular-nums text-body-sm text-secondary">
                          {item.userCif || "CIF-INST-001"}
                        </span>
                      </div>
                    </td>

                    {/* Destination Details */}
                    <td className="py-3 px-3 align-top">
                      <div className="flex flex-col">
                        <span className="font-body-sm text-on-surface font-medium flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-secondary shrink-0" />
                          <span>{item.targetInstitution || item.settlementRail || "Direct Settlement Bridge"}</span>
                        </span>
                        <span className="font-mono text-body-sm text-secondary truncate max-w-[220px]">
                          {truncateHash(item.beneficiaryIbanOrAddress || "CH93 0023 8812 4019 8821 0", 8, 6)}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="font-mono tabular-nums text-body-sm text-gold-accent font-bold">
                          {formatCurrency(item.amount, item.currency)}
                        </span>
                        {item.requiresDualSignOff && (
                          <span className="font-label-caps text-[10px] text-status-warning uppercase">
                            Dual-Sign Required
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Approval Progress */}
                    <td className="py-3 px-3 align-top whitespace-nowrap">
                      {item.currentSignOffCount === 1 ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-status-warning/10 border border-status-warning/30 text-status-warning text-body-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-status-warning animate-pulse" />
                          <span className="font-mono tabular-nums font-semibold">1/2 Signed</span>
                          <span className="text-[11px] text-secondary">(Officer #2 Needed)</span>
                        </div>
                      ) : item.currentSignOffCount >= 2 || item.status === "SETTLED" ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-status-success/10 border border-status-success/30 text-status-success text-body-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="font-mono tabular-nums font-semibold">2/2 Released</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-bg-canvas border border-border-subtle text-secondary text-body-sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-mono tabular-nums">0/2 Pending</span>
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          openSignOff(item)
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-bg-elevated hover:bg-state-hover border border-gold-accent/50 text-gold-accent hover:border-gold-accent font-title-sm text-body-sm rounded transition-colors"
                      >
                        <span>Co-Sign</span>
                        <ChevronRight className="w-3.5 h-3.5" />
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
