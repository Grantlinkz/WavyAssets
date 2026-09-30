import React from "react"
import { Search, Power, AlertTriangle, ShieldCheck } from "lucide-react"
import { BrandLogo } from "../common/BrandLogo"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"
import { useAdminNavStore } from "../../store/useAdminNavStore"

export const TopBar: React.FC = () => {
  const { operator, setLoginModalOpen } = useAdminAuthStore()
  const { setCommandPaletteOpen, setEmergencyStopModalOpen, badgeCounts } = useAdminNavStore()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex flex-col select-none" data-testid="admin-topbar">
      {/* Primary Header Row */}
      <div className="h-14 bg-bg-panel border-b border-border-subtle px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Brand & Console Title */}
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo className="h-7 w-auto" />
          <span className="hidden sm:inline-block font-mono text-[11px] text-gold-accent uppercase tracking-widest font-semibold border-l border-border-subtle pl-3">
            Admin Command Deck
          </span>
        </div>

        {/* Global Search Bar (Cmd + K) */}
        <div
          onClick={() => setCommandPaletteOpen(true)}
          className="flex-1 max-w-md relative hidden md:flex items-center cursor-pointer group"
        >
          <Search className="w-4 h-4 absolute left-3 text-secondary group-hover:text-gold-accent transition-colors pointer-events-none" />
          <input
            type="text"
            readOnly
            placeholder="Search by user, email, wire memo, wallet, or card..."
            className="w-full bg-bg-canvas border border-border-subtle rounded-[4px] pl-9 pr-16 py-1.5 text-xs text-on-surface placeholder:text-secondary group-hover:border-gold-accent/60 transition-colors cursor-pointer"
          />
          <span className="absolute right-2 font-mono text-[10px] text-secondary bg-bg-elevated px-1.5 py-0.5 rounded-[2px] border border-border-subtle">
            Cmd + K
          </span>
        </div>

        {/* Actions & Operator Profile */}
        <div className="flex items-center gap-3 shrink-0">
         

          {/* Emergency System Stop */}
          <button
            onClick={() => setEmergencyStopModalOpen(true)}
            className="border border-status-danger text-status-danger hover:bg-status-danger hover:text-white text-xs font-semibold px-3 py-1.5 rounded-[4px] flex items-center gap-1.5 transition-colors cursor-pointer"
            data-testid="emergency-stop-btn"
          >
            <Power className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Emergency Stop</span>
          </button>

          {/* Operator Identity & Role Switcher */}
          <div
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-2 pl-3 border-l border-border-subtle cursor-pointer group hover:opacity-90"
            title={operator ? "Click to switch operator role" : "Click to sign in"}
            data-testid="operator-profile-btn"
          >
            <div className="w-7 h-7 rounded-[4px] bg-bg-elevated text-gold-accent border border-border-subtle font-mono text-xs flex items-center justify-center font-bold group-hover:border-gold-accent transition-colors">
              {operator?.initials || "--"}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-medium text-on-surface leading-tight">
                {operator ? operator.name : "Signed Out"}
              </span>
              <span className="font-mono text-[10px] text-secondary leading-none">
                {operator ? `[${operator.role}]` : "[Click to Sign In]"}
              </span>
            </div>
            <div className="w-6 h-6 rounded-full bg-primary/20 border border-gold-accent/40 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-gold-accent" />
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Attention Ticker Banner */}
      <div className="h-8 bg-bg-elevated border-b border-border-subtle px-4 flex items-center justify-center gap-2 overflow-hidden">
        <AlertTriangle className="w-3.5 h-3.5 text-status-warning shrink-0" />
        <span className="text-xs font-medium text-status-warning tracking-tight truncate">
          Attention Needed: {badgeCounts.urgentActions ?? 0} unverified bank wires • {badgeCounts.pendingCompliance ?? 0} pending passport reviews • {badgeCounts.treasurySignOffs ?? 0} large withdrawals over $100k waiting for second approval.
        </span>
      </div>
    </header>
  )
}
