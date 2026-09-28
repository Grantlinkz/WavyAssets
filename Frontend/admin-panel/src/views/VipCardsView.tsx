import React from "react"
import { useQuery } from "@tanstack/react-query"
import { CreditCard, Shield, Truck, Terminal, Layers, Lock, History } from "lucide-react"
import { useVipCardsStore } from "../store/useVipCardsStore"
import { useAdminNavStore } from "../store/useAdminNavStore"
import { fetchVipCardsTelemetry } from "../api/vipCards"
import { VipCardsTable } from "../components/vip-cards/VipCardsTable"
import { MintVipCardModal } from "../components/vip-cards/MintVipCardModal"
import { formatCurrency } from "../lib/formatters"

export const VipCardsView: React.FC = () => {
  const { setIsMintModalOpen } = useVipCardsStore()
  const { setActiveRoute } = useAdminNavStore()

  const {
    data: telemetry,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vip-cards-telemetry"],
    queryFn: fetchVipCardsTelemetry,
    initialData: {
      activeCards: 38,
      authorizedDailyCapacity: 15400000,
      volume24h: 3184920,
      authRate24h: 99.8,
      lockedCards: 3,
      vaultInventoryBlanks: 142,
    },
  })

  return (
    <div className="flex flex-col gap-6" data-testid="vip-cards-view">
      {/* Top Institutional Telemetry Ribbon */}
      <div className="w-full bg-bg-panel border border-border-subtle rounded-[4px] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-secondary text-xs">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-success shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-secondary">
              Network Status:
            </span>
            <span className="font-mono text-on-surface font-semibold">
              VISA Infinite / Direct Core Active
            </span>
          </div>
          <div className="h-3 w-px bg-border-subtle hidden md:block" />
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-gold-accent" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-secondary">
              Card Vault:
            </span>
            <span className="font-mono text-gold-accent font-semibold">
              {telemetry?.vaultInventoryBlanks ?? 142} Unminted Tungsten Blanks
            </span>
          </div>
          <div className="h-3 w-px bg-border-subtle hidden md:block" />
          <div className="flex items-center gap-2">
            <Truck className="w-3.5 h-3.5 text-telemetry-cyan" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-secondary">
              Armored Logistics:
            </span>
            <span className="font-mono text-telemetry-cyan font-semibold">
              Swiss Armored Courier Operational
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-secondary">
            Protocol: <span className="text-on-surface">ISO-8583/EMV-L1</span>
          </span>
          <span className="bg-bg-elevated px-2 py-0.5 rounded-[2px] text-secondary font-mono text-[10px] border border-border-subtle">
            ZRH-DC4
          </span>
        </div>
      </div>

      {/* Header Section with Direct Institutional Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-on-surface tracking-tight">VIP Obsidian Metal Cards</h1>
            <span className="px-2 py-0.5 rounded-[4px] bg-gold-accent/10 border border-gold-accent/40 text-gold-accent font-mono text-[10px] uppercase tracking-wider">
              Institutional Desk
            </span>
          </div>
          <p className="text-xs text-secondary mt-1">
            Mint custom 42-gram tungsten metal cards, configure real-time daily spending limits, and execute instant terminal killswitches.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveRoute("audit-log")}
            className="bg-bg-elevated hover:bg-state-hover border border-border-subtle text-on-surface text-xs font-semibold px-3 py-1.5 rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-secondary" />
            <span>Audit Card Logs</span>
          </button>
          <button
            onClick={() => setIsMintModalOpen(true)}
            className="bg-gold-accent hover:bg-[#C5A028] text-bg-canvas text-xs font-bold px-4 py-1.5 rounded-[4px] flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
            data-testid="open-mint-modal-btn"
          >
            <CreditCard className="w-4 h-4" />
            <span>+ Mint New VIP Card</span>
          </button>
        </div>
      </div>

      {/* High-Density KPI Metric Row */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-bg-panel border border-border-subtle rounded-[4px] p-3.5 h-24 wavy-skeleton"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="bg-bg-panel border border-status-danger/30 p-4 rounded-[4px] flex items-center justify-between text-xs text-status-danger">
          <span>{error?.message || "Failed to load VIP card telemetry."}</span>
          <button
            onClick={() => refetch()}
            className="px-2.5 py-1 rounded-[2px] bg-bg-elevated border border-border-subtle text-on-surface"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">Active Card Portfolio</span>
              <CreditCard className="w-4 h-4 text-status-success" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-xl text-on-surface font-semibold">
                {telemetry?.activeCards ?? "—"}
              </span>
            </div>
            <span className="font-mono text-[10px] text-secondary mt-1">
              Total Capacity: {telemetry ? formatCurrency(telemetry.authorizedDailyCapacity) : "—"} / day
            </span>
          </div>

          <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">24h Settlement Volume</span>
              <Terminal className="w-4 h-4 text-gold-accent" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-xl text-gold-accent font-semibold">
                {telemetry ? formatCurrency(telemetry.volume24h) : "—"}
              </span>
              {telemetry?.authRate24h !== undefined && (
                <span className="font-mono text-xs text-status-success">
                  {telemetry.authRate24h}% Auth Rate
                </span>
              )}
            </div>
            <span className="font-mono text-[10px] text-secondary mt-1">Direct Settlement Channel</span>
          </div>

          <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">Terminal Killswitches</span>
              <Lock className="w-4 h-4 text-status-danger" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-xl text-status-danger font-semibold">
                {telemetry?.lockedCards ?? "—"}
              </span>
              <span className="font-mono text-xs text-secondary">Vault Locked</span>
            </div>
            <span className="font-mono text-[10px] text-secondary mt-1">Instant Desk Freeze Capable</span>
          </div>

          <div className="bg-bg-panel border border-border-subtle rounded-[4px] p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-secondary uppercase tracking-wider">Swiss Vault Inventory</span>
              <Shield className="w-4 h-4 text-telemetry-cyan" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-xl text-telemetry-cyan font-semibold">
                {telemetry?.vaultInventoryBlanks ?? "—"} Blanks
              </span>
              <span className="font-mono text-xs text-secondary">42g Tungsten</span>
            </div>
            <span className="font-mono text-[10px] text-secondary mt-1">Laser Engraver Calibration: Nominal</span>
          </div>
        </div>
      )}

      {/* Cardholder Ledger Table */}
      <VipCardsTable />

      {/* Mint VIP Card Modal */}
      <MintVipCardModal />
    </div>
  )
}
