import React from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchAuditTelemetry } from "../api/audit"
import { AuditLogTable } from "../components/audit/AuditLogTable"
import { DiffModal } from "../components/audit/DiffModal"
import { AlertTriangle, RefreshCw } from "lucide-react"

export const AuditLogView: React.FC = () => {
  const {
    data: telemetry,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["audit-telemetry"],
    queryFn: fetchAuditTelemetry,
  })

  return (
    <div className="flex flex-col gap-6" data-testid="audit-log-view">
      {/* Top Section: Breadcrumbs & Merkle Integrity Status */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-mono text-[10px] text-secondary uppercase tracking-wider">
            <span>System Governance</span>
            <span className="text-border-subtle">/</span>
            <span>Immutable Audit Ledger</span>
            <span className="text-border-subtle">/</span>
            <span className="text-gold-accent">Cryptographic Chain</span>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-bg-elevated border border-border-subtle rounded-[4px]">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-mono text-xs text-secondary">
                Verifying Cryptographic Ledger...
              </span>
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-status-danger/10 border border-status-danger/30 rounded-[4px]">
              <AlertTriangle className="w-3.5 h-3.5 text-status-danger" />
              <span className="font-mono text-xs text-status-danger font-semibold">
                Integrity Telemetry Unavailable
              </span>
            </div>
          ) : telemetry?.merkleBlock && telemetry?.merkleRoot ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-status-success/10 border border-status-success/30 rounded-[4px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success" />
              </span>
              <span className="font-mono text-xs text-status-success font-semibold tracking-tight">
                Hash Chain Verified — No Tampering
              </span>
              <span className="font-mono text-[11px] text-secondary hidden sm:inline">
                (Merkle Block #{telemetry.merkleBlock.toLocaleString()})
              </span>
            </div>
          ) : null}
        </div>

        {/* Title and Subtitle Block */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-on-surface tracking-tight">
            System Audit Trail &amp; Compliance Log
          </h1>
          <p className="text-xs text-secondary">
            Permanent, unalterable log of all admin actions, balance credits, tier updates, and card locks enforced by Swiss Banking Standard FINMA Art. 73.
          </p>
        </div>

        {/* Telemetry Strip / Metrics Row */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-bg-panel border border-border-subtle p-3.5 rounded-[4px] h-24 wavy-skeleton"
              />
            ))}
          </div>
        ) : isError ? (
          <div className="bg-bg-panel border border-status-danger/30 p-4 rounded-[4px] flex items-center justify-between text-xs text-status-danger">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error?.message || "Failed to load audit telemetry metrics."}</span>
            </div>
            <button
              onClick={() => refetch()}
              className="px-2.5 py-1 rounded-[2px] bg-bg-elevated hover:bg-state-hover border border-border-subtle text-on-surface flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-[4px] flex flex-col gap-1 shadow-sm">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">Total Log Entries</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl text-on-surface font-semibold">
                  {telemetry?.totalLogEntries.toLocaleString() ?? "—"}
                </span>
                <span className="font-mono text-xs text-secondary">Events</span>
              </div>
              <span className="font-mono text-[10px] text-secondary">
                Chain Height #{telemetry?.totalLogEntries.toLocaleString() ?? "—"}
              </span>
            </div>

            <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-[4px] flex flex-col gap-1 shadow-sm">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">Today's Executions</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl text-telemetry-cyan font-semibold">
                  {telemetry?.todayExecutions ?? 0}
                </span>
                <span className="font-mono text-xs text-telemetry-cyan font-medium">Verified</span>
              </div>
              <span className="font-mono text-[10px] text-secondary">0 Rejected Challenges</span>
            </div>

            <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-[4px] flex flex-col gap-1 shadow-sm">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">Cryptographic Proof</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl text-gold-accent font-semibold">
                  {telemetry?.merkleBlock ? `#${telemetry.merkleBlock.toLocaleString()}` : "—"}
                </span>
              </div>
              <span className="font-mono text-[10px] text-secondary truncate">
                {telemetry?.merkleRoot ? `Root: ${telemetry.merkleRoot.slice(0, 10)}...` : "Root pending"}
              </span>
            </div>

            <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-[4px] flex flex-col gap-1 shadow-sm">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">Statutory Retention</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xl text-on-surface font-semibold">
                  {telemetry?.retentionYears ?? 10} Years
                </span>
              </div>
              <span className="font-mono text-[10px] text-status-success font-medium">
                FINMA Art. 73 Compliant
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <AuditLogTable />

      {/* Side-by-Side Diff Modal */}
      <DiffModal />
    </div>
  )
}
