import React from "react"
import { useQuery } from "@tanstack/react-query"
import { Activity, AlertCircle, ArrowUpRight, ArrowDownLeft, RefreshCw, ShieldAlert, ArrowLeftRight } from "lucide-react"
import { fetchSettlementLedger, type SettlementRecord } from "../../api/overview"
import { SkeletonTable } from "../common/SkeletonTable"
import { formatCurrency, formatTimestamp } from "../../lib/formatters"

export interface SettlementLedgerProps {
  timeHorizon?: string
  currency?: string
}

export const SettlementLedger: React.FC<SettlementLedgerProps> = ({
  timeHorizon = "24h",
  currency = "ALL",
}) => {
  const {
    data: settlements,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<SettlementRecord[], Error>({
    queryKey: ["settlement-ledger", timeHorizon, currency],
    queryFn: () => fetchSettlementLedger(timeHorizon, currency),
  })

  if (isLoading) {
    return <SkeletonTable rows={8} />
  }

  if (isError) {
    return (
      <div
        className="w-full min-h-[540px] bg-bg-panel border border-border-subtle rounded-[4px] p-8 flex flex-col items-center justify-center text-center"
        data-testid="settlement-ledger-error"
      >
        <div className="w-12 h-12 rounded-full bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface mb-1">
          Settlement Rail Ledger Ingestion Error
        </h3>
        <p className="text-xs text-secondary max-w-md mb-4 font-mono">
          {error?.message || "Failed to synchronize clearing buffer from sovereign depository shard."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-bg-elevated hover:bg-state-hover border border-border-subtle text-xs font-mono text-on-surface rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-telemetry-cyan" />
          <span>Retry Settlement Ledger Ingestion</span>
        </button>
      </div>
    )
  }

  const records = settlements || []

  return (
    <div
      className="bg-bg-panel border border-border-subtle rounded-[4px] overflow-hidden flex flex-col shadow-sm"
      data-testid="settlement-ledger"
    >
      {/* Table Telemetry Header */}
      <div className="px-4 py-3 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 bg-bg-elevated/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-telemetry-cyan" />
            <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-on-surface">
              Live Depository Settlement Ledger
            </h2>
          </div>
          <span className="text-[11px] font-mono text-secondary hidden sm:inline">
            ({records.length} Transactions Settled / In Clearing)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-status-success/10 border border-status-success/30 text-status-success font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            <span>SIX SIS Rail: Synchronized</span>
          </span>
          {isFetching && (
            <RefreshCw className="w-3.5 h-3.5 text-telemetry-cyan animate-spin" />
          )}
        </div>
      </div>

      {/* High-Density Ledger Table */}
      <div className="overflow-x-auto min-h-[460px]">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-canvas/50 text-[11px] font-mono uppercase text-secondary tracking-wider">
              <th className="py-2.5 px-4 font-medium">Timestamp (UTC)</th>
              <th className="py-2.5 px-4 font-medium">Tx Ref / Type</th>
              <th className="py-2.5 px-4 font-medium">Counterparty Entity</th>
              <th className="py-2.5 px-4 font-medium">Clearing Rail</th>
              <th className="py-2.5 px-4 font-medium text-right">Settled Amount</th>
              <th className="py-2.5 px-4 font-medium text-right">Clearing Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50 font-mono text-xs">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center text-secondary font-mono">
                  No settlement records found for selected filter parameters.
                </td>
              </tr>
            ) : (
              records.map((record, index) => {
                const isEven = index % 2 === 0
                return (
                  <tr
                    key={record.id}
                    className={`transition-colors hover:bg-state-hover ${
                      isEven ? "bg-bg-panel" : "bg-[#0C101A]"
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-2.5 px-4 text-secondary whitespace-nowrap text-[11px] tabular-nums">
                      {formatTimestamp(record.timestamp)}
                    </td>

                    {/* Tx Ref / Type */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {record.type === "DEPOSIT_WIRE" && (
                          <span className="w-5 h-5 rounded-[2px] bg-status-success/10 text-status-success flex items-center justify-center">
                            <ArrowDownLeft className="w-3 h-3" />
                          </span>
                        )}
                        {record.type === "WITHDRAWAL" && (
                          <span className="w-5 h-5 rounded-[2px] bg-status-warning/10 text-status-warning flex items-center justify-center">
                            <ArrowUpRight className="w-3 h-3" />
                          </span>
                        )}
                        {record.type === "INTERNAL_SETTLEMENT" && (
                          <span className="w-5 h-5 rounded-[2px] bg-telemetry-cyan/10 text-telemetry-cyan flex items-center justify-center">
                            <ArrowLeftRight className="w-3 h-3" />
                          </span>
                        )}
                        {record.type === "VAULT_SWAP" && (
                          <span className="w-5 h-5 rounded-[2px] bg-gold-accent/10 text-gold-accent flex items-center justify-center">
                            <RefreshCw className="w-3 h-3" />
                          </span>
                        )}
                        <div>
                          <span className="font-semibold text-on-surface block text-[11px]">
                            {record.id}
                          </span>
                          <span className="text-[10px] text-secondary">
                            {record.type.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Counterparty Entity */}
                    <td className="py-2.5 px-4 whitespace-nowrap font-sans">
                      <div className="font-medium text-on-surface text-xs">
                        {record.entity}
                      </div>
                      <div className="text-[10px] font-mono text-secondary">
                        {record.accountNumber}
                      </div>
                    </td>

                    {/* Rail */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className="px-1.5 py-0.5 rounded-[2px] bg-bg-canvas border border-border-subtle text-[11px] text-secondary font-mono">
                        {record.rail}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap tabular-nums font-semibold">
                      <span
                        className={
                          record.type === "DEPOSIT_WIRE"
                            ? "text-status-success"
                            : record.type === "WITHDRAWAL"
                            ? "text-on-surface"
                            : "text-gold-accent"
                        }
                      >
                        {record.type === "DEPOSIT_WIRE" ? "+" : record.type === "WITHDRAWAL" ? "-" : ""}
                        {formatCurrency(record.amount, record.currency)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      {record.status === "SETTLED" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-status-success/10 border border-status-success/30 text-status-success text-[10px] font-mono">
                          SETTLED
                        </span>
                      )}
                      {record.status === "PENDING_DUAL_SIG" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-status-warning/10 border border-status-warning/40 text-status-warning text-[10px] font-mono">
                          <ShieldAlert className="w-3 h-3" />
                          <span>DUAL SIG REQ</span>
                        </span>
                      )}
                      {record.status === "PROCESSING" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-telemetry-cyan/10 border border-telemetry-cyan/30 text-telemetry-cyan text-[10px] font-mono">
                          CLEARING
                        </span>
                      )}
                      {record.status === "BLOCKED" && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-status-danger/10 border border-status-danger/40 text-status-danger text-[10px] font-mono">
                          BLOCKED
                        </span>
                      )}
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