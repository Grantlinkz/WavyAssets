import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Inbox,
  CheckCheck,
  FileText,
  AlertTriangle,
  XCircle,
} from "lucide-react"
import {
  fetchPendingDeposits,
  approveDeposit,
  rejectDeposit,
  type PendingDeposit,
} from "../../api/treasury"
import { useTreasuryStore } from "../../store/useTreasuryStore"
import { SkeletonTable } from "../common/SkeletonTable"
import { formatCurrency, formatTimestamp } from "../../lib/formatters"

export const PendingDepositsTable: React.FC = () => {
  const queryClient = useQueryClient()
  const { railFilter, searchQuery, openReceiptModal } = useTreasuryStore()
  const [actionError, setActionError] = useState<string | null>(null)

  const {
    data: deposits,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PendingDeposit[], Error>({
    queryKey: ["pending-deposits", railFilter, searchQuery],
    queryFn: () =>
      fetchPendingDeposits({
        rail: railFilter !== "ALL" ? railFilter : undefined,
        search: searchQuery || undefined,
      }),
  })

  const approveMutation = useMutation({
    mutationFn: (transactionId: string) => {
      return approveDeposit({ transactionId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-deposits"] })
      queryClient.invalidateQueries({ queryKey: ["settlement-ledger"] })
      queryClient.invalidateQueries({ queryKey: ["overview-metrics"] })
      setActionError(null)
    },
    onError: (err: Error) => {
      setActionError(err.message || "Failed to credit deposit balance.")
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (transactionId: string) => {
      return rejectDeposit({
        transactionId,
        reason: "Rejected by treasury operator due to receipt/memo discrepancy",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-deposits"] })
      setActionError(null)
    },
    onError: (err: Error) => {
      setActionError(err.message || "Failed to reject deposit.")
    },
  })

  if (isLoading) {
    return (
      <div className="bg-bg-panel border border-border-subtle rounded-lg overflow-hidden min-h-[540px]">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-telemetry-cyan animate-pulse" />
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Incoming Capital Inflows &amp; Wire Verification
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
          Unable to Load Inbound Deposits
        </h3>
        <p className="font-body-sm text-secondary max-w-md mb-4">
          {error?.message || "Communication with deposit clearance rail failed."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="px-3 py-1.5 bg-bg-elevated hover:bg-state-hover border border-border-subtle rounded text-body-sm text-on-surface transition-colors"
        >
          Retry Connection
        </button>
      </div>
    )
  }

  const items = deposits || []
  const totalPendingInflow = items.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className="bg-bg-panel border border-border-subtle rounded-lg overflow-hidden min-h-[540px] flex flex-col">
      {/* Table Header Panel */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-telemetry-cyan animate-pulse" />
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Incoming Capital Inflows &amp; Wire Verification
          </h2>
          <span className="bg-telemetry-cyan/10 text-telemetry-cyan border border-telemetry-cyan/30 font-label-caps text-label-caps px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
            {items.length} Pending Confirmation
          </span>
        </div>
        <div className="font-numeric-table text-body-sm text-secondary">
          Pending Inflow:{" "}
          <span className="text-telemetry-cyan font-semibold font-mono tabular-nums">
            {formatCurrency(totalPendingInflow, "USD")}
          </span>
        </div>
      </div>

      {actionError && (
        <div className="mx-4 mt-3 p-2 bg-status-danger/10 border border-status-danger/30 rounded text-status-danger text-body-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            className="text-secondary hover:text-on-surface"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Incoming Deposits Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse" data-testid="deposits-table">
          <thead>
            <tr className="bg-bg-canvas border-b border-border-subtle font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              <th className="py-2.5 px-3">Inflow Time</th>
              <th className="py-2.5 px-3">Depositor / Beneficiary</th>
              <th className="py-2.5 px-3">Rail &amp; Memo Match</th>
              <th className="py-2.5 px-3 text-right">Declared Sum</th>
              <th className="py-2.5 px-3 text-center">Wire Receipt</th>
              <th className="py-2.5 px-3 text-right">Settlement Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle text-body-md">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-secondary">
                  <div className="flex flex-col items-center justify-center">
                    <Inbox className="w-8 h-8 text-telemetry-cyan mb-2" />
                    <span className="font-title-sm text-on-surface">No Pending Inflows</span>
                    <span className="font-body-sm text-secondary mt-0.5">
                      All incoming wire and crypto settlements have been cleared and credited.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isRowApproving = approveMutation.isPending && approveMutation.variables === item.id
                const isRowRejecting = rejectMutation.isPending && rejectMutation.variables === item.id
                const isAnyMutationPending = approveMutation.isPending || rejectMutation.isPending
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-state-hover transition-colors group"
                    data-testid={`deposit-row-${item.id}`}
                  >
                    {/* Time */}
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

                    {/* Depositor / Entity */}
                    <td className="py-3 px-3 align-top">
                      <div className="flex flex-col">
                        <span className="font-title-sm text-body-sm text-on-surface">
                          {item.userName}
                        </span>
                        <span className="font-mono tabular-nums text-body-sm text-secondary">
                          {item.userCif} • {item.senderName}
                        </span>
                      </div>
                    </td>

                    {/* Rail & Routing */}
                    <td className="py-3 px-3 align-top">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-bg-elevated px-1.5 py-0.2 rounded border border-border-subtle font-mono text-[11px] text-gold-accent font-semibold">
                            {item.railType}
                          </span>
                          <span className="font-body-sm text-on-surface font-medium truncate max-w-[160px]">
                            {item.senderBank}
                          </span>
                        </div>
                        <span className="font-mono text-[11px] text-secondary mt-0.5">
                          Memo: <span className="text-on-surface font-medium">{item.wireMemo}</span>
                        </span>
                      </div>
                    </td>

                    {/* Declared Sum */}
                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      <span className="font-mono tabular-nums text-body-sm text-status-success font-bold">
                        +{formatCurrency(item.amount, item.currency)}
                      </span>
                    </td>

                    {/* Wire Proof Receipt */}
                    <td className="py-3 px-3 align-top text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openReceiptModal(item)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-bg-elevated hover:bg-state-hover border border-border-subtle hover:border-gold-accent text-secondary hover:text-on-surface font-title-sm text-body-sm rounded transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-gold-accent" />
                        <span>Inspect Receipt</span>
                      </button>
                    </td>

                    {/* Settlement Action */}
                    <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isAnyMutationPending}
                          onClick={() => rejectMutation.mutate(item.id)}
                          className="px-2 py-1 bg-bg-canvas hover:bg-status-danger/10 border border-border-subtle hover:border-status-danger text-secondary hover:text-status-danger text-body-sm rounded transition-colors disabled:opacity-50"
                          title="Reject Inbound Deposit"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isAnyMutationPending}
                          onClick={() => approveMutation.mutate(item.id)}
                          className="px-2.5 py-1 bg-status-success hover:bg-status-success/90 text-on-surface font-title-sm text-body-sm rounded flex items-center gap-1 font-semibold transition-colors disabled:opacity-50"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>
                            {isRowApproving ? "Crediting..." : isRowRejecting ? "Rejecting..." : "Approve & Credit"}
                          </span>
                        </button>
                      </div>
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
