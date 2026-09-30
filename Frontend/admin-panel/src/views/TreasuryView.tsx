import React from "react"
import { useQueryClient } from "@tanstack/react-query"
import {
  Download,
  Shield,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  Columns2,
  Search,
} from "lucide-react"
import { useTreasuryStore } from "../store/useTreasuryStore"
import type { SettlementRail, PendingWithdrawal, PendingDeposit } from "../api/treasury"
import { PendingWithdrawalsTable } from "../components/treasury/PendingWithdrawalsTable"
import { DualSignOffCard } from "../components/treasury/DualSignOffCard"
import { PendingDepositsTable } from "../components/treasury/PendingDepositsTable"
import { DepositReceiptViewerModal } from "../components/treasury/DepositReceiptViewerModal"

const RAILS: { label: string; value: SettlementRail }[] = [
  { label: "All Rails", value: "ALL" },
  { label: "SIC", value: "SIC" },
  { label: "Fedwire", value: "Fedwire" },
  { label: "USDC", value: "USDC" },
]

export const TreasuryView: React.FC = () => {
  const queryClient = useQueryClient()
  const {
    activeTab,
    railFilter,
    searchQuery,
    isSignOffOpen,
    setActiveTab,
    setRailFilter,
    setSearchQuery,
  } = useTreasuryStore()

  const handleExportCsv = () => {
    const withdrawals =
      queryClient.getQueryData<PendingWithdrawal[]>(["pending-withdrawals"]) || []
    const deposits =
      queryClient.getQueryData<PendingDeposit[]>(["pending-deposits"]) || []

    const header = "TransactionId,Type,Amount,Currency,Rail,Status,Timestamp"
    const withdrawalRows = withdrawals.map(
      (w) =>
        `"${w.id}",WITHDRAWAL,${w.amount},"${w.currency}","${w.settlementRail}","${w.status}","${w.createdAt}"`
    )
    const depositRows = deposits.map(
      (d) =>
        `"${d.id}",DEPOSIT,${d.amount},"${d.currency}","${d.railType}","${d.status}","${d.createdAt}"`
    )
    const allRows = [header, ...withdrawalRows, ...depositRows]
    const csvContent = "data:text/csv;charset=utf-8," + allRows.join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute(
      "download",
      `treasury_settlements_${new Date().toISOString().slice(0, 10)}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex flex-col w-full gap-4" data-testid="treasury-view">
      {/* Breadcrumb & Real-time Settlement Ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-1.5 font-mono text-xs text-secondary flex-wrap">
          <span className="text-secondary/70">Institutional Desk</span>
          <span className="text-secondary/40">/</span>
          <span className="text-secondary/70">Treasury Ops</span>
          <span className="text-secondary/40">/</span>
          <span className="text-gold-accent font-semibold">Liquidity Rails &amp; Co-Sign Settlements</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-bg-panel border border-border-subtle text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            <span className="text-secondary">SIC RTGS:</span>
            <span className="text-status-success font-medium">11ms</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-bg-panel border border-border-subtle text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
            <span className="text-secondary">Fedwire:</span>
            <span className="text-status-success font-medium">Online</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] bg-bg-panel border border-border-subtle text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-telemetry-cyan" />
            <span className="text-secondary">ERC-20 Treasury:</span>
            <span className="text-telemetry-cyan font-medium">Gas 14 Gwei</span>
          </div>
        </div>
      </div>

      {/* Top Title & Telemetry Header */}
      <div className="flex flex-col gap-3.5 bg-bg-panel p-4 sm:p-5 rounded-[4px] border border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-base font-bold text-on-surface tracking-tight">
              Treasury Settlements &amp; Liquidity Rails
            </h1>
            <span className="bg-gold-accent/10 text-gold-accent border border-gold-accent/30 font-mono text-[10px] px-2 py-0.5 rounded-[2px] uppercase tracking-wider font-semibold">
              Dual-Control Enforcement Active
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-bg-canvas px-3 py-1 rounded-[3px] border border-border-subtle">
              <span className="w-2 h-2 rounded-full bg-status-success" />
              <span className="font-mono text-xs text-on-surface">
                Settlement Rails: <span className="text-status-success font-semibold">4/4 Operational</span>
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportCsv}
              className="bg-bg-elevated hover:bg-state-hover border border-border-subtle text-on-surface font-medium text-xs px-3 py-1.5 rounded-[3px] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-secondary" />
              <span>Export Treasury Log (CSV)</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-border-subtle/60 text-xs">
          <p className="text-secondary text-xs max-w-2xl font-sans">
            Direct settlement bridge between Swiss Interbank Clearing (SIC), Federal Reserve Fedwire, Target2 SEPA, and Institutional Multisig Custody.
          </p>
          <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
            <span className="text-secondary uppercase text-[10px]">Main Vault Liquidity:</span>
            <span className="text-status-success font-semibold tabular-nums">$318,450,000.00 USD</span>
            <span className="text-secondary/70 text-[11px]">(99.98% Allocated)</span>
          </div>
        </div>
      </div>

      {/* FINMA Mandatory Dual-Control Policy Banner */}
      <div className="bg-status-warning/5 border border-status-warning/30 rounded-[4px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[2px] bg-status-warning/10 border border-status-warning/30 flex items-center justify-center shrink-0 text-status-warning">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-status-warning">
                Mandatory Security Rule: High-Value Dual-Signature Threshold
              </span>
              <span className="font-mono text-[9px] text-status-warning bg-status-warning/20 border border-status-warning/40 px-1.5 py-0.2 rounded-[2px]">
                Art. 72b FINMA Compliant
              </span>
            </div>
            <p className="text-secondary text-[11px] mt-0.5 font-sans">
              Every outgoing client withdrawal exceeding <strong className="text-on-surface font-mono">$100,000.00 USD</strong> requires cryptographic two-officer co-signature verification before message execution.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Segment Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-bg-panel p-2.5 rounded-[4px] border border-border-subtle">
        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 flex-wrap" id="settlement-tabs">
          <button
            type="button"
            onClick={() => setActiveTab("withdrawals")}
            className={`px-3 py-1.5 rounded-[3px] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "withdrawals"
                ? "bg-bg-elevated text-gold-accent border border-gold-accent/50 shadow-xs font-semibold"
                : "bg-bg-canvas hover:bg-state-hover text-secondary border border-border-subtle"
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-gold-accent" />
            <span>Outgoing Withdrawals</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("deposits")}
            className={`px-3 py-1.5 rounded-[3px] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "deposits"
                ? "bg-bg-elevated text-telemetry-cyan border border-telemetry-cyan/50 shadow-xs font-semibold"
                : "bg-bg-canvas hover:bg-state-hover text-secondary border border-border-subtle"
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-telemetry-cyan" />
            <span>Incoming Deposits</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("both")}
            className={`px-3 py-1.5 rounded-[3px] text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "both"
                ? "bg-bg-elevated text-on-surface border border-gold-accent/50 shadow-xs font-semibold"
                : "bg-bg-canvas hover:bg-state-hover text-secondary border border-border-subtle"
            }`}
          >
            <Columns2 className="w-3.5 h-3.5 text-secondary" />
            <span>Split Console View</span>
          </button>
        </div>

        {/* Search & Rail Filtering */}
        <div className="flex items-center gap-2.5 flex-1 justify-end flex-wrap sm:flex-nowrap">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-secondary absolute left-2.5 top-2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by client, hash..."
              className="w-full bg-bg-canvas border border-border-subtle rounded-[3px] pl-8 pr-3 py-1 font-mono text-xs text-on-surface placeholder:text-secondary focus:border-gold-accent focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 bg-bg-canvas border border-border-subtle rounded-[3px] p-0.5 shrink-0">
            {RAILS.map((rail) => (
              <button
                key={rail.value}
                type="button"
                onClick={() => setRailFilter(rail.value)}
                className={`px-2 py-0.5 rounded-[2px] text-[11px] font-mono uppercase transition-colors cursor-pointer ${
                  railFilter === rail.value
                    ? "bg-bg-elevated text-gold-accent font-semibold border border-gold-accent/30"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                {rail.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Workspace */}
      <div className="w-full">
        {activeTab === "withdrawals" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
            <div className={isSignOffOpen ? "xl:col-span-7" : "xl:col-span-12"}>
              <PendingWithdrawalsTable />
            </div>
            {isSignOffOpen && (
              <div className="xl:col-span-5">
                <DualSignOffCard />
              </div>
            )}
          </div>
        )}

        {activeTab === "deposits" && (
          <div className="w-full">
            <PendingDepositsTable />
          </div>
        )}

        {activeTab === "both" && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
              <PendingWithdrawalsTable />
              <PendingDepositsTable />
            </div>
            {isSignOffOpen && (
              <div className="max-w-2xl mx-auto w-full">
                <DualSignOffCard />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Real-Time Treasury Ledger Metrics & Audit Rail Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
        <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[10px] text-secondary uppercase">
              SIC Interbank Clearance
            </span>
            <Shield className="w-4 h-4 text-status-success" />
          </div>
          <div className="my-1.5">
            <span className="font-mono text-headline-md text-on-surface font-semibold tabular-nums">
              CHF 184.2M
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-secondary">
            <span>SNB St. Gallen Window</span>
            <span className="text-status-success">Normal Flow</span>
          </div>
        </div>

        <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[10px] text-secondary uppercase">
              Federal Reserve Fedwire
            </span>
            <Shield className="w-4 h-4 text-status-success" />
          </div>
          <div className="my-1.5">
            <span className="font-mono text-headline-md text-on-surface font-semibold tabular-nums">
              $94.8M USD
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-secondary">
            <span>BNY Mellon Sub-custody</span>
            <span className="text-status-success">Settling Active</span>
          </div>
        </div>

        <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[10px] text-secondary uppercase">
              Target2 Eurosystem
            </span>
            <Shield className="w-4 h-4 text-status-success" />
          </div>
          <div className="my-1.5">
            <span className="font-mono text-headline-md text-on-surface font-semibold tabular-nums">
              €62.1M EUR
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-secondary">
            <span>Deutsche Bank AG RTGS</span>
            <span className="text-status-success">Online (0 errors)</span>
          </div>
        </div>

        <div className="bg-bg-panel border border-border-subtle p-3.5 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-[10px] text-secondary uppercase">
              Multisig Cold Vault
            </span>
            <Shield className="w-4 h-4 text-telemetry-cyan" />
          </div>
          <div className="my-1.5">
            <span className="font-mono text-headline-md text-gold-accent font-semibold tabular-nums">
              $124.5M USD eq.
            </span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px] text-secondary">
            <span>Fireblocks MPC Zurich</span>
            <span className="text-telemetry-cyan">4/7 Quorum Active</span>
          </div>
        </div>
      </div>

      {/* Wire Receipt Viewer Modal */}
      <DepositReceiptViewerModal />
    </div>
  )
}
