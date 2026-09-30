import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Mail,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Copy,
  Check,
  Download,
  Trash2,
  Users,
  AlertCircle,
  ExternalLink,
} from "lucide-react"
import { fetchSubscribers, deleteSubscriber, type NewsletterSubscriber } from "../../api/inquiries"
import { SkeletonTable } from "../common/SkeletonTable"
import { formatTimestamp } from "../../lib/formatters"

export const SubscribersTable: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CONFIRMED" | "PENDING">("ALL")
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const {
    data: subscribers,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<NewsletterSubscriber[], Error>({
    queryKey: ["subscribers"],
    queryFn: fetchSubscribers,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSubscriber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribers"] })
      setDeletingId(null)
    },
    onError: () => {
      setDeletingId(null)
    },
  })

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const allItems = subscribers || []
  const filtered = allItems.filter((sub) => {
    if (statusFilter === "CONFIRMED" && !sub.isConfirmed) return false
    if (statusFilter === "PENDING" && sub.isConfirmed) return false
    if (!searchQuery.trim()) return true
    return sub.email.toLowerCase().includes(searchQuery.toLowerCase().trim())
  })

  const confirmedCount = allItems.filter((s) => s.isConfirmed).length
  const pendingCount = allItems.filter((s) => !s.isConfirmed).length

  const handleExportCSV = () => {
    if (filtered.length === 0) return
    const headers = ["ID", "Email", "Status", "Subscribed At", "Confirmed At"]
    const rows = filtered.map((s) => [
      s.id,
      `"${s.email.replace(/"/g, '""')}"`,
      s.isConfirmed ? "Confirmed" : "Pending",
      s.createdAt,
      s.confirmedAt || "N/A",
    ])
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `wavyassets-subscribers-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <SkeletonTable rows={8} />
  }

  if (isError) {
    return (
      <div
        className="w-full min-h-[400px] bg-bg-panel border border-border-subtle rounded-[4px] p-8 flex flex-col items-center justify-center text-center"
        data-testid="subscribers-error"
      >
        <div className="w-12 h-12 rounded-full bg-status-danger/10 border border-status-danger/30 flex items-center justify-center text-status-danger mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-on-surface mb-1">
          Subscriber Database Error
        </h3>
        <p className="text-xs text-secondary max-w-md mb-4 font-mono">
          {error?.message || "Failed to load newsletter subscribers from database."}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-bg-elevated hover:bg-state-hover border border-border-subtle text-xs font-mono text-on-surface rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-telemetry-cyan" />
          <span>Retry Loading Subscribers</span>
        </button>
      </div>
    )
  }

  return (
    <div
      className="bg-bg-panel border border-border-subtle rounded-[4px] overflow-hidden flex flex-col shadow-sm"
      data-testid="subscribers-table"
    >
      {/* Controls & Filter Header */}
      <div className="p-4 border-b border-border-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-bg-elevated/40">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <Users className="w-4 h-4 text-gold-accent" />
            <h2 className="text-xs font-mono uppercase tracking-wider font-semibold text-on-surface">
              Direct Newsletter Subscribers
            </h2>
            <span className="text-[11px] font-mono text-secondary ml-1">
              ({filtered.length} of {allItems.length})
            </span>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-state-hover text-gold-accent border border-gold-accent/40 font-semibold"
                  : "bg-bg-panel text-secondary hover:text-on-surface border border-border-subtle"
              }`}
            >
              All ({allItems.length})
            </button>
            <button
              onClick={() => setStatusFilter("CONFIRMED")}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
                statusFilter === "CONFIRMED"
                  ? "bg-status-success/15 text-status-success border border-status-success/40 font-semibold"
                  : "bg-bg-panel text-secondary hover:text-on-surface border border-border-subtle"
              }`}
            >
              Confirmed ({confirmedCount})
            </button>
            <button
              onClick={() => setStatusFilter("PENDING")}
              className={`px-2.5 py-1 rounded-[4px] text-xs font-mono transition-colors cursor-pointer ${
                statusFilter === "PENDING"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/40 font-semibold"
                  : "bg-bg-panel text-secondary hover:text-on-surface border border-border-subtle"
              }`}
            >
              Pending ({pendingCount})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-secondary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriber email..."
              className="w-full bg-bg-panel border border-border-subtle rounded-[4px] pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder:text-secondary/70 focus:border-gold-accent focus:outline-none transition-colors"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-bg-elevated hover:bg-state-hover border border-border-subtle text-xs text-on-surface rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Export subscribers to CSV"
          >
            <Download className="w-3.5 h-3.5 text-secondary" />
            <span className="hidden sm:inline font-mono">Export CSV</span>
          </button>

          <button
            onClick={() => refetch()}
            className="p-1.5 bg-bg-elevated hover:bg-state-hover border border-border-subtle text-xs text-secondary hover:text-on-surface rounded-[4px] transition-colors cursor-pointer shrink-0"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-telemetry-cyan" : ""}`} />
          </button>
        </div>
      </div>

      {/* High Density Table */}
      <div className="overflow-x-auto min-h-[380px]">
        <table className="w-full text-left text-xs border-collapse font-sans">
          <thead>
            <tr className="border-b border-border-subtle bg-bg-canvas/50 text-[11px] font-mono uppercase text-secondary tracking-wider">
              <th className="py-2.5 px-4 font-medium">Subscriber Email</th>
              <th className="py-2.5 px-4 font-medium">Verification Status</th>
              <th className="py-2.5 px-4 font-medium">Subscription Date</th>
              <th className="py-2.5 px-4 font-medium">Confirmed At</th>
              <th className="py-2.5 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-secondary font-mono">
                  No subscribers found in database matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((subscriber, index) => {
                const isEven = index % 2 === 0
                return (
                  <tr
                    key={subscriber.id}
                    className={`transition-colors hover:bg-state-hover ${
                      isEven ? "bg-bg-panel" : "bg-[#0C101A]"
                    }`}
                  >
                    {/* Email with copy button */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-on-surface font-medium">
                          {subscriber.email}
                        </span>
                        <button
                          onClick={() => handleCopy(subscriber.email)}
                          className="text-secondary hover:text-gold-accent transition-colors p-1 rounded-[2px]"
                          title="Copy email to clipboard"
                        >
                          {copiedEmail === subscriber.email ? (
                            <Check className="w-3 h-3 text-status-success" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      {subscriber.isConfirmed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-status-success/15 border border-status-success/30 text-status-success text-[10px] font-mono font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>CONFIRMED DOUBLE OPT-IN</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>VERIFICATION PENDING</span>
                        </span>
                      )}
                    </td>

                    {/* Subscription Date */}
                    <td className="py-2.5 px-4 whitespace-nowrap font-mono text-[11px] text-secondary">
                      {formatTimestamp(subscriber.createdAt)}
                    </td>

                    {/* Confirmed Date */}
                    <td className="py-2.5 px-4 whitespace-nowrap font-mono text-[11px] text-secondary">
                      {subscriber.confirmedAt ? (
                        <span className="text-on-surface font-medium">
                          {formatTimestamp(subscriber.confirmedAt)}
                        </span>
                      ) : (
                        <span className="text-secondary/60 italic">Unconfirmed</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`mailto:${subscriber.email}?subject=WavyAssets%20Institutional%20Research`}
                          className="px-2 py-1 rounded-[4px] bg-bg-elevated hover:bg-state-hover border border-border-subtle text-secondary hover:text-on-surface text-xs font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
                          title="Send direct email"
                        >
                          <Mail className="w-3 h-3 text-gold-accent" />
                          <span>Email</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently remove subscriber '${subscriber.email}' from research newsletter database?`)) {
                              setDeletingId(subscriber.id)
                              deleteMutation.mutate(subscriber.id)
                            }
                          }}
                          disabled={deleteMutation.isPending && deletingId === subscriber.id}
                          className="px-2 py-1 rounded-[4px] bg-status-danger/10 hover:bg-status-danger/20 border border-status-danger/30 text-status-danger text-xs font-mono inline-flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete subscriber record"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
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
