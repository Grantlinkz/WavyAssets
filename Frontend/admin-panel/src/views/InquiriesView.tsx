import React, { useState } from "react"
import { Download, Search, KeyRound } from "lucide-react"
import { InquiriesTable } from "../components/inquiries/InquiriesTable"
import { LeadDetailDrawer } from "../components/inquiries/LeadDetailDrawer"
import { LeadConvertModal } from "../components/inquiries/LeadConvertModal"
import { useAdminNavStore } from "../store/useAdminNavStore"

export const InquiriesView: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [isDecrypted, setIsDecrypted] = useState(true)
  const { badgeCounts } = useAdminNavStore()

  const filterTabs = [
    { id: "ALL", label: "All", count: 48 },
    { id: "NEW", label: "New", count: badgeCounts.newInquiries },
    { id: "IN_REVIEW", label: "In Review", count: 18 },
    { id: "MANDATE_SENT", label: "Mandate Sent", count: 14 },
    { id: "ARCHIVED", label: "Archived", count: 4 },
  ]

  const handleExportCSV = () => {
    alert("Exporting institutional mandate dossier to signed CSV format...")
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
                <span>{badgeCounts.newInquiries} Inbound Queue</span>
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
      />

      {/* Slide-over Detail Drawer & Conversion Modal */}
      <LeadDetailDrawer />
      <LeadConvertModal />
    </div>
  )
}
