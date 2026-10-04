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
  Eye,
  EyeOff,
  X,
  Loader2,
  Send,
  Radio,
} from "lucide-react"
import {
  fetchSubscribers,
  deleteSubscriber,
  sendSubscriberEmail,
  broadcastSubscribersEmail,
  type NewsletterSubscriber,
} from "../../api/inquiries"
import { SkeletonTable } from "../common/SkeletonTable"
import { formatTimestamp } from "../../lib/formatters"

export const SubscribersTable: React.FC = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CONFIRMED" | "PENDING">("ALL")
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Email modal state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [emailMode, setEmailMode] = useState<"single" | "broadcast">("single")
  const [targetSubscriber, setTargetSubscriber] = useState<NewsletterSubscriber | null>(null)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [broadcastFilter, setBroadcastFilter] = useState<"ALL" | "CONFIRMED">("ALL")
  const [showPreview, setShowPreview] = useState(false)
  const [emailFeedback, setEmailFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null)

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

  const singleEmailMutation = useMutation({
    mutationFn: (data: { id: string; subject: string; message: string }) =>
      sendSubscriberEmail(data.id, { subject: data.subject, message: data.message }),
    onSuccess: (res) => {
      setEmailFeedback({
        type: "success",
        text: `Email successfully dispatched to ${res.recipient} via Resend.`,
      })
      setTimeout(() => {
        setIsEmailModalOpen(false)
        setEmailFeedback(null)
      }, 1500)
    },
    onError: (err: Error) => {
      setEmailFeedback({
        type: "error",
        text: err.message || "Failed to dispatch email via Resend.",
      })
    },
  })

  const broadcastEmailMutation = useMutation({
    mutationFn: (data: { subject: string; message: string; filter: "ALL" | "CONFIRMED" }) =>
      broadcastSubscribersEmail({ subject: data.subject, message: data.message, filter: data.filter }),
    onSuccess: (res) => {
      setEmailFeedback({
        type: "success",
        text: res.message || `Dispatched to ${res.deliveredCount} of ${res.totalRecipients} subscribers via Resend.`,
      })
      setTimeout(() => {
        setIsEmailModalOpen(false)
        setEmailFeedback(null)
      }, 1800)
    },
    onError: (err: Error) => {
      setEmailFeedback({
        type: "error",
        text: err.message || "Failed to broadcast newsletter via Resend.",
      })
    },
  })

  const handleOpenSingleEmail = (sub: NewsletterSubscriber) => {
    setTargetSubscriber(sub)
    setEmailMode("single")
    setEmailSubject("WavyAssets Institutional Research & Market Update")
    setEmailMessage(
      `Dear Subscriber,\n\nWe are pleased to provide you with the latest allocation insights and quarterly research updates from the WavyAssets Executive Desk.\n\nKey Highlights:\n- Swiss Physical Vault Inflows: Gold & Tungsten Allocation Metrics\n- Quantitative Hedge Fund Yield Performance\n- Digital Asset Settlement Infrastructure Updates\n\nWarm regards,\nWavyAssets Research & Security Desk`
    )
    setShowPreview(false)
    setEmailFeedback(null)
    setIsEmailModalOpen(true)
  }

  const handleOpenBroadcastEmail = () => {
    setTargetSubscriber(null)
    setEmailMode("broadcast")
    setBroadcastFilter("ALL")
    setEmailSubject("WavyAssets Executive Newsletter: Global Wealth & Vault Allocation")
    setEmailMessage(
      `Dear Subscribers,\n\nHere is your official WavyAssets research update covering institutional asset vaulting and digital treasury allocations.\n\nInstitutional Highlights:\n- Direct Swiss Bank Wire RTGS DvP Settlement active across all regional nodes\n- Cryptographic Cold Storage Vault Inflow Matrix update\n- Global Equities and Liquid Asset Rebalancing Insights\n\nWarm regards,\nWavyAssets Executive Team`
    )
    setShowPreview(false)
    setEmailFeedback(null)
    setIsEmailModalOpen(true)
  }

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailFeedback(null)
    if (!emailSubject.trim()) {
      setEmailFeedback({ type: "error", text: "Subject line is required." })
      return
    }
    if (!emailMessage.trim()) {
      setEmailFeedback({ type: "error", text: "Message body cannot be empty." })
      return
    }

    if (emailMode === "single" && targetSubscriber) {
      singleEmailMutation.mutate({
        id: targetSubscriber.id,
        subject: emailSubject.trim(),
        message: emailMessage.trim(),
      })
    } else {
      broadcastEmailMutation.mutate({
        subject: emailSubject.trim(),
        message: emailMessage.trim(),
        filter: broadcastFilter,
      })
    }
  }

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
            onClick={handleOpenBroadcastEmail}
            className="px-3 py-1.5 bg-gold-accent hover:bg-[#C5A028] text-bg-canvas font-medium text-xs rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
            title="Broadcast newsletter email to all subscribers via Resend"
            data-testid="broadcast-email-btn"
          >
            <Mail className="w-3.5 h-3.5 text-bg-canvas" />
            <span className="font-sans font-semibold">Broadcast Email</span>
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
                        <button
                          type="button"
                          onClick={() => handleOpenSingleEmail(subscriber)}
                          className="px-2.5 py-1 rounded-[4px] bg-bg-elevated hover:bg-state-hover border border-border-subtle text-secondary hover:text-on-surface text-xs font-mono inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          title="Send direct email to this subscriber via Resend"
                          data-testid={`email-subscriber-${subscriber.id}`}
                        >
                          <Mail className="w-3 h-3 text-gold-accent" />
                          <span>Email</span>
                        </button>
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

      {/* Subscriber Email Modal (Single & Broadcast via Resend) */}
      {isEmailModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-bg-canvas/80 backdrop-blur-[4px] flex items-center justify-center p-4 overflow-y-auto"
          data-testid="subscriber-email-modal"
        >
          <div className="w-full max-w-[620px] bg-bg-panel border border-border-subtle rounded-[6px] shadow-2xl overflow-hidden my-auto flex flex-col">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-bg-elevated border-b border-border-subtle flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-gold-accent/15 border border-gold-accent/30 flex items-center justify-center text-gold-accent">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-on-surface">
                    {emailMode === "single"
                      ? "Send Subscriber Email"
                      : "Broadcast Newsletter Email"}
                  </h3>
                  <p className="text-[11px] font-mono text-secondary">
                    Transactional Gateway: Resend API &bull; Branded Template
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="text-secondary hover:text-on-surface p-1 rounded hover:bg-state-hover cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSendEmail} className="p-5 flex flex-col gap-4">
              {emailFeedback && (
                <div
                  className={`p-3 rounded-[4px] text-xs font-mono flex items-center gap-2 ${
                    emailFeedback.type === "success"
                      ? "bg-status-success/15 border border-status-success/30 text-status-success"
                      : "bg-status-danger/15 border border-status-danger/30 text-status-danger"
                  }`}
                >
                  {emailFeedback.type === "success" ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{emailFeedback.text}</span>
                </div>
              )}

              {/* Target / Recipient Information */}
              <div className="p-3 bg-bg-canvas border border-border-subtle rounded-[4px] flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-secondary">
                    Target Recipient(s)
                  </span>
                  <span className="font-mono text-[10px] text-telemetry-cyan font-semibold">
                    Resend Delivery Engine
                  </span>
                </div>
                {emailMode === "single" && targetSubscriber ? (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-gold-accent font-semibold bg-bg-elevated px-2.5 py-1 rounded-[3px] border border-border-subtle">
                      {targetSubscriber.email}
                    </span>
                    <span className="text-[10px] font-mono text-secondary">
                      ({targetSubscriber.isConfirmed ? "Confirmed Subscriber" : "Pending Verification"})
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-gold-accent shrink-0" />
                      <span className="font-sans text-xs text-on-surface font-medium">
                        Audience Filter:
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setBroadcastFilter("ALL")}
                        className={`px-2.5 py-1 rounded-[3px] text-xs font-mono transition-colors cursor-pointer ${
                          broadcastFilter === "ALL"
                            ? "bg-gold-accent text-bg-canvas font-semibold"
                            : "bg-bg-elevated text-secondary border border-border-subtle"
                        }`}
                      >
                        All ({allItems.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBroadcastFilter("CONFIRMED")}
                        className={`px-2.5 py-1 rounded-[3px] text-xs font-mono transition-colors cursor-pointer ${
                          broadcastFilter === "CONFIRMED"
                            ? "bg-gold-accent text-bg-canvas font-semibold"
                            : "bg-bg-elevated text-secondary border border-border-subtle"
                        }`}
                      >
                        Confirmed Only ({confirmedCount})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Subject Line */}
              <div className="space-y-1">
                <label className="block font-mono text-[10px] uppercase tracking-wider text-secondary">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. WavyAssets Institutional Market Update"
                  className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-1.5 text-xs text-on-surface placeholder:text-secondary/60 focus:border-gold-accent focus:outline-none"
                  required
                  data-testid="email-subject-input"
                />
              </div>

              {/* Message Body or Live Preview Toggle */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-secondary">
                    Message Content &amp; Briefing Text *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-[11px] font-mono text-gold-accent hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPreview ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        <span>Edit Raw Text</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        <span>Preview with Logo &amp; Favicon</span>
                      </>
                    )}
                  </button>
                </div>

                {showPreview ? (
                  /* Live Branded Email Preview Rendering */
                  <div
                    className="bg-[#08090B] border border-border-subtle rounded-[4px] p-4 text-xs font-sans max-h-64 overflow-y-auto"
                    data-testid="email-brand-preview"
                  >
                    <div className="bg-[#0F131A] border border-[#1F2937] rounded-[6px] p-4 flex flex-col gap-3">
                      {/* Brand Header with Logo and Favicon */}
                      <div className="flex items-center gap-3 pb-3 border-b border-[#1F2937]">
                        {/* Official WavyAssets Favicon Squircle Emblem */}
                        <div className="w-8 h-8 rounded-[7px] shrink-0 bg-[#08090B] border border-gold-accent/50 p-1 flex items-center justify-center">
                          <svg viewBox="0 0 64 64" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <rect width="64" height="64" rx="14" fill="#08090B" />
                            <rect x="1" y="1" width="62" height="62" rx="13" stroke="#D4AF37" strokeWidth="2.5" strokeOpacity="0.8" />
                            <circle cx="32" cy="32" r="18" fill="#D4AF37" fillOpacity="0.15" />
                            <path d="M 12 33 C 18 19, 26 19, 32 33 C 38 47, 46 47, 52 33" stroke="#D4AF37" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M 12 42 C 18 28, 26 28, 32 42 C 38 56, 46 56, 52 42" stroke="#00C288" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.95" />
                            <circle cx="32" cy="17" r="3.2" fill="#D4AF37" />
                          </svg>
                        </div>
                        {/* Brand Logo Typography */}
                        <div className="flex items-center text-sm font-bold tracking-wider">
                          <span className="text-white">WAVY</span>
                          <span className="text-gold-accent font-semibold ml-0.5">ASSETS</span>
                          <span className="ml-2 px-1.5 py-0.2 bg-[#00C288]/15 border border-[#00C288]/30 text-[#00C288] text-[8px] font-mono font-bold rounded-[2px]">
                            ● SECURED
                          </span>
                        </div>
                      </div>

                      {/* Preview Subject */}
                      <h4 className="font-bold text-sm text-on-surface">
                        {emailSubject || "Email Subject"}
                      </h4>

                      {/* Preview Message */}
                      <div className="text-secondary whitespace-pre-wrap leading-relaxed text-xs">
                        {emailMessage || "Enter message content above to view preview."}
                      </div>

                      {/* Preview Footer */}
                      <div className="pt-3 border-t border-[#1F2937] text-[10px] text-secondary/60 text-center font-mono">
                        &copy; {new Date().getFullYear()} WavyAssets AG &bull; Zurich FreePort &bull; FinSA / AMLA Compliant
                      </div>
                    </div>
                  </div>
                ) : (
                  <textarea
                    rows={6}
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Enter email content..."
                    className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] px-3 py-2 text-xs text-on-surface placeholder:text-secondary/60 focus:border-gold-accent focus:outline-none leading-relaxed font-sans"
                    required
                    data-testid="email-message-textarea"
                  />
                )}
                <span className="text-[10px] text-secondary font-mono block">
                  All dispatches automatically embed the official project SVG Favicon and Logo in the email template.
                </span>
              </div>

              {/* Modal Footer / Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
                  <span>Resend Email Gateway Ready</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-3.5 py-1.5 rounded-[4px] border border-border-subtle bg-bg-canvas hover:bg-state-hover text-on-surface text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={singleEmailMutation.isPending || broadcastEmailMutation.isPending}
                    className="px-4 py-1.5 rounded-[4px] bg-gold-accent hover:bg-[#C5A028] text-bg-canvas text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60"
                    data-testid="send-email-submit-btn"
                  >
                    {singleEmailMutation.isPending || broadcastEmailMutation.isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Dispatching via Resend...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {emailMode === "single"
                            ? "Send Email"
                            : `Broadcast to ${broadcastFilter === "ALL" ? allItems.length : confirmedCount} Subscribers`}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
