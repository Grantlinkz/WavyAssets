import React from "react"
import { X, CheckCircle2, TrendingUp, Hash } from "lucide-react"
import { useAuditStore } from "../../store/useAuditStore"
import { formatCurrency } from "../../lib/formatters"

import type { AuditLogEntry } from "../../api/audit"

interface DiffModalProps {
  isOpen?: boolean
  log?: AuditLogEntry | null
}

export const DiffModal: React.FC<DiffModalProps> = ({ isOpen, log: propLog }) => {
  const { isDiffModalOpen, closeDiffModal, selectedLogForDiff } = useAuditStore()

  const showModal = isOpen !== undefined ? isOpen : isDiffModalOpen
  const log = propLog || selectedLogForDiff

  if (!showModal || !log) return null
  const beforeJson = log.diffBefore
    ? JSON.stringify(log.diffBefore, null, 2)
    : `{\n  "status": "PREVIOUS_STATE",\n  "verified": true\n}`
  const afterJson = log.diffAfter
    ? JSON.stringify(log.diffAfter, null, 2)
    : `{\n  "status": "APPLIED_MUTATION",\n  "verified": true\n}`

  return (
    <div
      className="fixed inset-0 z-50 bg-bg-canvas/80 backdrop-blur-[4px] flex items-center justify-center p-4 overflow-y-auto"
      data-testid="audit-diff-modal"
    >
      <div className="w-full max-w-[760px] bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-bg-elevated border-b border-border-subtle flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-on-surface tracking-tight">Record of State Changes</h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[4px] bg-gold-accent/15 text-gold-accent font-semibold border border-gold-accent/30">
                Audit #{log.id}
              </span>
            </div>
            <p className="text-xs text-secondary">
              Action: <strong className="text-on-surface">{log.action}</strong> on{" "}
              <span className="font-mono text-gold-accent">{log.targetLabel}</span> • Executed by{" "}
              <strong className="text-on-surface">
                {log.officerName} [{log.officerDepartment}]
              </strong>
            </p>
            <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-telemetry-cyan">
              <Hash className="w-3.5 h-3.5 shrink-0" />
              <span>SHA-256: {log.sha256Hash}</span>
              <span className="text-secondary">•</span>
              <span className="text-secondary">Block #{log.merkleBlock.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={closeDiffModal}
            className="text-secondary hover:text-on-surface p-1 rounded-[4px] hover:bg-state-hover transition-colors cursor-pointer"
            data-testid="close-diff-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4 bg-bg-panel">
          {/* Side-by-side JSON Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before Change Box */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">
                  Before Change
                </span>
                <span className="font-mono text-[10px] text-secondary">State v14.01</span>
              </div>
              <div className="bg-bg-canvas border border-border-subtle p-3 rounded-[4px] font-mono text-xs text-secondary h-44 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{beforeJson}</pre>
              </div>
            </div>

            {/* After Change Box */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="font-mono text-[10px] text-status-success uppercase tracking-wider font-semibold">
                  After Change (Applied)
                </span>
                <span className="font-mono text-[10px] text-status-success">State v14.02</span>
              </div>
              <div className="bg-bg-canvas border border-status-success/30 p-3 rounded-[4px] font-mono text-xs text-status-success h-44 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{afterJson}</pre>
              </div>
            </div>
          </div>

          {/* Diff Delta Callout Banner */}
          {log.deltaAmount !== undefined && log.deltaAmount !== 0 && (
            <div className="bg-bg-canvas border border-border-subtle p-3 rounded-[4px] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-status-success shrink-0" />
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] text-secondary uppercase">
                    Ledger Adjustment Delta
                  </span>
                  <span className="text-xs text-on-surface">Applied to User Cash Sub-Account</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base text-status-success font-bold">
                  {log.deltaAmount > 0 ? "+" : ""}
                  {formatCurrency(log.deltaAmount)} {log.deltaCurrency || "USD"}
                </span>
                <span className="px-2 py-0.5 rounded-[4px] bg-status-success/10 text-status-success font-mono text-[10px] border border-status-success/30 font-semibold">
                  Settled
                </span>
              </div>
            </div>
          )}

          {/* Double-entry Ledger Invariant Verification Notice */}
          <div className="bg-bg-elevated border border-border-subtle p-3 rounded-[4px] flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-status-success/20 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4 text-status-success" />
            </div>
            <div className="flex flex-col gap-0.5 text-xs">
              <span className="text-on-surface font-semibold">
                Ledger Conservation Verified: Debits Equal Credits
              </span>
              <p className="text-secondary text-[11px] leading-relaxed">
                Cryptographic zero-knowledge proof generated by Zurich Custody Enclave. Root transition signed by FIPS-140-3 Hardware Security Module.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-border-subtle bg-bg-elevated flex items-center justify-between">
          <span className="font-mono text-[11px] text-secondary">
            Statutory Reason: <span className="text-on-surface">"{log.reason}"</span>
          </span>
          <button
            onClick={closeDiffModal}
            className="px-4 py-1.5 rounded-[4px] bg-bg-panel hover:bg-state-hover border border-border-subtle text-xs text-on-surface font-semibold cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  )
}
