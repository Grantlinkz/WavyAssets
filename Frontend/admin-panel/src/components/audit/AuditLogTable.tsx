import React, { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, ShieldCheck, Download, AlertCircle, FileText, ShieldAlert, X } from "lucide-react"
import { useAuditStore } from "../../store/useAuditStore"
import { fetchAuditLogs, type AuditCategory } from "../../api/audit"
import { SkeletonTable } from "../common/SkeletonTable"

export const AuditLogTable: React.FC = () => {
  const [verificationResult, setVerificationResult] = useState<{ verified: boolean; message: string } | null>(null)
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedOfficer,
    setSelectedOfficer,
    selectedDateRange,
    setSelectedDateRange,
    openDiffModal,
  } = useAuditStore()

  const {
    data: logs = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["audit-logs", searchQuery, selectedCategory, selectedOfficer, selectedDateRange],
    queryFn: () =>
      fetchAuditLogs({
        search: searchQuery,
        category: selectedCategory,
        officer: selectedOfficer,
        dateRange: selectedDateRange,
      }),
  })

  const getActionBadge = (category: AuditCategory, action: string) => {
    switch (category) {
      case "CREDIT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] bg-status-success/10 text-status-success font-semibold text-[11px] border border-status-success/30">
            {action}
          </span>
        )
      case "LOCK":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] bg-status-danger/10 text-status-danger font-semibold text-[11px] border border-status-danger/30">
            {action}
          </span>
        )
      case "KYC":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] bg-gold-accent/10 text-gold-accent font-semibold text-[11px] border border-gold-accent/30">
            {action}
          </span>
        )
      case "RAIL":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] bg-telemetry-cyan/10 text-telemetry-cyan font-semibold text-[11px] border border-telemetry-cyan/30">
            {action}
          </span>
        )
      case "VIP_CARD":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] bg-purple-500/10 text-purple-400 font-semibold text-[11px] border border-purple-500/30">
            {action}
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-[2px] bg-bg-elevated text-secondary font-semibold text-[11px] border border-border-subtle">
            {action}
          </span>
        )
    }
  }

  const availableOfficers = useMemo(() => {
    const map = new Map<string, string>()
    logs.forEach((l) => {
      if (l.officerName) {
        map.set(l.officerName, `${l.officerName} [${l.officerDepartment || "System"}]`)
      }
    })
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [logs])

  const handleExportReport = () => {
    if (!logs || logs.length === 0) return
    const headers = [
      "ID",
      "Timestamp",
      "Action",
      "Target",
      "Officer",
      "Department",
      "Reason",
      "Delta Amount",
      "Delta Currency",
      "Merkle Block",
      "SHA256 Hash",
    ]
    const rows = logs.map((log) => [
      `"${log.id}"`,
      `"${log.timestamp}"`,
      `"${log.action}"`,
      `"${log.targetLabel}"`,
      `"${log.officerName}"`,
      `"${log.officerDepartment}"`,
      `"${log.reason.replace(/"/g, '""')}"`,
      log.deltaAmount ?? "",
      `"${log.deltaCurrency || "USD"}"`,
      log.merkleBlock,
      `"${log.sha256Hash}"`,
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `WavyAssets_FINMA_Art73_Audit_Report_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleVerifyMerkle = () => {
    if (!logs || logs.length === 0) {
      setVerificationResult({
        verified: false,
        message: "No ledger records available to cryptographically verify.",
      })
      return
    }
    const hasInvalidHashes = logs.some(
      (l) => !l.sha256Hash || l.sha256Hash.length < 32 || !l.merkleBlock
    )
    if (hasInvalidHashes) {
      setVerificationResult({
        verified: false,
        message: "Cryptographic anomaly: one or more audit log hashes or block indices are missing.",
      })
    } else {
      setVerificationResult({
        verified: true,
        message: `Cryptographic proof verified: All ${logs.length} entries have valid SHA-256 digests and Merkle block commitments.`,
      })
    }
  }

  return (
    <div
      className="bg-bg-panel border border-border-subtle rounded-[4px] shadow-sm flex flex-col min-h-[540px] overflow-hidden"
      data-testid="audit-log-table-container"
    >
      {/* Merkle Verification Feedback Banner */}
      {verificationResult && (
        <div
          className={`p-3 border-b flex items-center justify-between text-xs font-mono ${
            verificationResult.verified
              ? "bg-status-success/10 border-status-success/30 text-status-success"
              : "bg-status-danger/10 border-status-danger/30 text-status-danger"
          }`}
          data-testid="verification-banner"
        >
          <div className="flex items-center gap-2">
            {verificationResult.verified ? (
              <ShieldCheck className="w-4 h-4 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 shrink-0" />
            )}
            <span>{verificationResult.message}</span>
          </div>
          <button
            onClick={() => setVerificationResult(null)}
            className="hover:opacity-75 p-1 rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="p-4 border-b border-border-subtle flex flex-col gap-3 bg-bg-panel">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Date Range Pills */}
          <div className="flex items-center gap-1 bg-bg-canvas p-1 rounded-[4px] border border-border-subtle">
            {["Today", "Past 7 Days", "Past 30 Days", "All"].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedDateRange(range)}
                className={`px-3 py-1 rounded-[2px] text-xs font-semibold transition-colors cursor-pointer ${
                  selectedDateRange === range
                    ? "bg-bg-elevated text-gold-accent border border-border-subtle shadow-sm"
                    : "text-secondary hover:text-on-surface hover:bg-state-hover"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Right Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleVerifyMerkle}
              disabled={isLoading || logs.length === 0}
              className="bg-bg-elevated hover:bg-state-hover text-telemetry-cyan text-xs font-semibold px-3 py-1.5 rounded-[4px] border border-border-subtle flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Merkle Proof</span>
            </button>
            <button
              onClick={handleExportReport}
              disabled={isLoading || logs.length === 0}
              className="bg-bg-elevated hover:bg-state-hover text-on-surface text-xs font-semibold px-3 py-1.5 rounded-[4px] border border-border-subtle flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Report</span>
            </button>
          </div>
        </div>

        {/* Search + Granular Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border-subtle">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Field */}
            <div className="relative w-full max-w-[320px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by client, ID, reason, or node..."
                className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder:text-secondary focus:border-gold-accent focus:outline-none transition-colors"
                data-testid="audit-search-input"
              />
            </div>

            {/* Action Category Select */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {[
                { id: "ALL", label: "All Actions" },
                { id: "CREDIT", label: "Balance Credits" },
                { id: "LOCK", label: "User Locks" },
                { id: "KYC", label: "KYC Approvals" },
                { id: "RAIL", label: "Rail Updates" },
                { id: "VIP_CARD", label: "VIP Cards" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as AuditCategory)}
                  className={`px-2.5 py-1 rounded-[2px] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-gold-accent text-bg-canvas shadow-sm"
                      : "bg-bg-elevated text-secondary hover:text-on-surface hover:bg-state-hover border border-border-subtle"
                  }`}
                  data-testid={`category-tab-${cat.id.toLowerCase()}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Officer Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono text-[10px] text-secondary uppercase">Officer:</span>
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="bg-bg-canvas border border-border-subtle rounded-[4px] px-2.5 py-1 text-xs text-on-surface focus:border-gold-accent focus:outline-none"
            >
              <option value="ALL">All Officers</option>
              {availableOfficers.map(([officerName, label]) => (
                <option key={officerName} value={officerName}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table or Loading Skeleton */}
      {isLoading ? (
        <SkeletonTable minHeight="min-h-[540px]" columns={7} rows={8} />
      ) : isError ? (
        <div className="min-h-[540px] flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-10 h-10 text-status-danger mb-2" />
          <h3 className="text-sm font-semibold text-on-surface">Unable to load immutable audit events</h3>
          <p className="text-xs text-secondary font-mono mt-1 max-w-md">
            {(error as Error)?.message || "A network or cryptographic verification error occurred."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-3 py-1.5 rounded-[4px] bg-bg-elevated border border-border-subtle text-xs text-on-surface hover:border-gold-accent"
          >
            Retry Verification
          </button>
        </div>
      ) : logs.length === 0 ? (
        <div className="min-h-[540px] flex flex-col items-center justify-center p-6 text-center text-secondary">
          <FileText className="w-10 h-10 mb-2 opacity-40 text-gold-accent" />
          <span className="text-sm font-medium text-on-surface">No Audit Events Found</span>
          <span className="text-xs font-mono text-secondary mt-0.5">
            Adjust search filter or category to view historic state changes.
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1">
          <table className="w-full border-collapse text-left" data-testid="audit-table">
            <thead>
              <tr className="bg-bg-canvas border-b border-border-subtle text-secondary font-mono text-[10px] uppercase tracking-wider select-none">
                <th className="py-2.5 px-4 font-semibold w-40">Timestamp (UTC)</th>
                <th className="py-2.5 px-3 font-semibold w-44">Authorized Officer</th>
                <th className="py-2.5 px-3 font-semibold w-28">Action Type</th>
                <th className="py-2.5 px-3 font-semibold w-48">Target Account / Entity</th>
                <th className="py-2.5 px-3 font-semibold">Statutory Justification (Reason)</th>
                <th className="py-2.5 px-3 font-semibold w-28">Node Origin</th>
                <th className="py-2.5 px-4 font-semibold text-right w-28">Ledger State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-xs">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => openDiffModal(log)}
                  className="hover:bg-state-hover transition-colors group cursor-pointer"
                  data-testid={`audit-row-${log.id}`}
                >
                  {/* Timestamp */}
                  <td className="py-2.5 px-4 font-mono text-on-surface">{log.timestamp}</td>

                  {/* Authorized Officer */}
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-accent shrink-0" />
                      <span className="text-on-surface font-semibold truncate">{log.officerName}</span>
                      <span className="text-secondary font-mono text-[10px] hidden xl:inline">
                        [{log.officerDepartment}]
                      </span>
                    </div>
                  </td>

                  {/* Action Type */}
                  <td className="py-2.5 px-3">{getActionBadge(log.actionCategory, log.action)}</td>

                  {/* Target Account / Entity */}
                  <td className="py-2.5 px-3 truncate">
                    <span className="font-mono text-gold-accent font-semibold">{log.targetId}</span>
                    <span className="text-secondary ml-1 truncate">({log.targetLabel})</span>
                  </td>

                  {/* Statutory Justification */}
                  <td className="py-2.5 px-3 text-secondary truncate max-w-xs" title={log.reason}>
                    {log.reason}
                  </td>

                  {/* Node Origin */}
                  <td className="py-2.5 px-3 font-mono text-[11px] text-secondary truncate">
                    {log.nodeOrigin}
                  </td>

                  {/* Ledger State / Diff View Button */}
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openDiffModal(log)
                      }}
                      className="bg-gold-accent text-bg-canvas font-semibold text-xs px-2.5 py-1 rounded-[4px] hover:bg-[#C5A028] transition-colors cursor-pointer shadow-sm"
                      data-testid={`diff-btn-${log.id}`}
                    >
                      Diff View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
