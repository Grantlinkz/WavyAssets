import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download, Search, KeyRound } from "lucide-react"
import { InquiriesTable } from "../components/inquiries/InquiriesTable"
import { LeadDetailDrawer } from "../components/inquiries/LeadDetailDrawer"
import { LeadConvertModal } from "../components/inquiries/LeadConvertModal"
import { useAdminNavStore } from "../store/useAdminNavStore"
import { fetchInquiries, type LeadInquiry } from "../api/inquiries"

export const InquiriesView: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDecrypted, setIsDecrypted] = useState(true)
  const { badgeCounts } = useAdminNavStore()

  const { data: allInquiries } = useQuery<LeadInquiry[]>({
    queryKey: ["inquiries", "ALL"],
    queryFn: () => fetchInquiries("ALL"),
  })

  const { data: currentInquiries } = useQuery<LeadInquiry[]>({
    queryKey: ["inquiries", statusFilter],
    queryFn: () => fetchInquiries(statusFilter),
  })

  const allCount = allInquiries ? allInquiries.length : "--"
  const inReviewCount = allInquiries ? allInquiries.filter((i) => i.status === "IN_REVIEW").length : "--"
  const mandateSentCount = allInquiries ? allInquiries.filter((i) => i.status === "MANDATE_SENT").length : "--"
  const archivedCount = allInquiries ? allInquiries.filter((i) => i.status === "ARCHIVED").length : "--"
  const liveNewCount = allInquiries ? allInquiries.filter((i) => i.status === "NEW").length : "--"

  const filterTabs = [
    { id: "ALL", label: "All", count: allCount },
    { id: "NEW", label: "New", count: badgeCounts.newInquiries ?? liveNewCount },
    { id: "IN_REVIEW", label: "In Review", count: inReviewCount },
    { id: "MANDATE_SENT", label: "Mandate Sent", count: mandateSentCount },
    { id: "ARCHIVED", label: "Archived", count: archivedCount },
  ]

  const handleExportCSV = () => {
    const list = currentInquiries || allInquiries || []
    if (list.length === 0) return

    const headers = [
      "Dossier ID",
      "Received At",
      "Company",
      "Trust Score",
      "Contact Name",
      "Email",
      "Telegram",
      "Location",
      "Asset Interest",
      "Declared Capital",
      "Status",
    ]
    const rows = list.map((inq) => [
      inq.dossierId,
      inq.receivedAt,
      `"${inq.company.replace(/"/g, '""')}"`,
      inq.trustScore,
      `"${isDecrypted ? inq.contactName.replace(/"/g, '""') : "[ENCRYPTED]"}"`,
      `"${isDecrypted ? inq.email.replace(/"/g, '""') : "[ENCRYPTED]"}"`,
      `"${isDecrypted ? inq.telegram.replace(/"/g, '""') : "[ENCRYPTED]"}"`,
      `"${inq.location.replace(/"/g, '""')}"`,
      `"${inq.assetInterest.replace(/"/g, '""')}"`,
      `"${inq.declaredCapital.replace(/"/g, '""')}"`,
      inq.status,
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `wavyassets-mandate-inquiries-${statusFilter.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200" data-testid="inquiries-view">
      {/* View Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-on-surface tracking-tight">
                Investor & Mandate Inquiries
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] bg-telemetry-cyan/10 border border-telemetry-cyan/30 text-telemetry-cyan font-mono text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan animate-pulse" />
                <span>
                  {badgeCounts.newInquiries !== null ? `${badgeCounts.newInquiries} Inbound Queue` : "Inbound Queue"}
                </span>
              </span>
            </div>
            <p className="text-xs text-secondary">
              Review, verify, and syndicate private wealth submissions from institutional portal wavyassets.ch
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-bg-panel hover:bg-state-hover border border-border-subtle text-on-surface text-xs font-medium px-3 py-1.5 rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-secondary" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsDecrypted(!isDecrypted)}
              className="bg-bg-panel hover:bg-state-hover border border-gold-accent/40 text-gold-accent text-xs font-medium px-3 py-1.5 rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-gold-accent" />
              <span>{isDecrypted ? "Contact Info Decrypted" : "Decrypt PII"}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {filterTabs.map((tab) => {
              const isActive = statusFilter === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-[4px] text-xs font-mono transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-state-hover text-gold-accent border border-gold-accent/40 font-semibold"
                      : "bg-bg-panel text-secondary hover:text-on-surface border border-border-subtle"
                  }`}
                  data-testid={`filter-${tab.id.toLowerCase()}`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gold-accent" />}
                  <span>{tab.label}</span>
                  <span className={`text-[10px] ${isActive ? "text-gold-accent" : "text-secondary/70"}`}>
                    ({tab.count})
                  </span>
                </button>
              )
            })}
          </div>

          <div className="relative w-full lg:w-80 flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-secondary pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company, contact, or telegram..."
              className="w-full bg-bg-panel border border-border-subtle rounded-[4px] pl-9 pr-3 py-1.5 text-xs text-on-surface placeholder:text-secondary/70 focus:border-gold-accent focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <InquiriesTable
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        isDecrypted={isDecrypted}
      />

      {/* Slide-over Detail Drawer & Conversion Modal */}
      <LeadDetailDrawer isDecrypted={isDecrypted} />
      <LeadConvertModal />
    </div>
  )
}
