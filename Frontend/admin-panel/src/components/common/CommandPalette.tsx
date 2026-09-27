import React, { useState, useEffect } from "react"
import { Search, X, Activity, Users, ShieldAlert, ArrowRight, Wallet, Sliders, CreditCard, FileText } from "lucide-react"
import { useAdminNavStore, type AdminRoute } from "../../store/useAdminNavStore"

interface CommandItem {
  id: string
  title: string
  category: "Navigation" | "Action" | "Quick Link"
  icon: React.ComponentType<{ className?: string }>
  route?: AdminRoute
  action?: () => void
}

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen, setActiveRoute } = useAdminNavStore()
  const [query, setQuery] = useState("")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(!isCommandPaletteOpen)
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isCommandPaletteOpen, setCommandPaletteOpen])

  if (!isCommandPaletteOpen) return null

  const items: CommandItem[] = [
    { id: "nav-overview", title: "Executive Overview & Settlement Ledger", category: "Navigation", icon: Activity, route: "overview" },
    { id: "nav-inquiries", title: "Investor & Mandate Inquiries", category: "Navigation", icon: FileText, route: "inquiries" },
    { id: "nav-users", title: "User Directory & Ledger Governance", category: "Navigation", icon: Users, route: "user-directory" },
    { id: "nav-compliance", title: "Compliance & AML Queue", category: "Navigation", icon: ShieldAlert, route: "compliance" },
    { id: "nav-treasury", title: "Treasury Settlements & Wire Matching", category: "Navigation", icon: Wallet, route: "treasury" },
    { id: "nav-rails", title: "Global Deposit Rails Configuration", category: "Navigation", icon: Sliders, route: "deposit-rails" },
    { id: "nav-cards", title: "Obsidian VIP Metal Cards", category: "Navigation", icon: CreditCard, route: "vip-cards" },
    { id: "nav-audit", title: "Immutable Audit Log & Activity", category: "Navigation", icon: FileText, route: "audit-log" },
  ]

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = (item: CommandItem) => {
    if (item.route) {
      setActiveRoute(item.route)
    }
    if (item.action) {
      item.action()
    }
    setCommandPaletteOpen(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
      data-testid="command-palette-backdrop"
    >
      <div
        className="w-full max-w-xl bg-bg-panel border border-border-subtle rounded-[4px] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        data-testid="command-palette-modal"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border-subtle gap-3">
          <Search className="w-5 h-5 text-secondary shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, deck modules, users, or wire memos..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-secondary focus:outline-none font-sans"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-secondary hover:text-on-surface p-1 rounded-[2px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-secondary">
              No institutional matching commands found.
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="flex items-center justify-between px-3 py-2 rounded-[4px] hover:bg-state-hover text-left transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-gold-accent shrink-0 group-hover:scale-105 transition-transform" />
                    <span className="text-xs font-medium text-on-surface">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-secondary text-[11px] font-mono">
                    <span>{item.category}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-bg-canvas/50 border-t border-border-subtle flex items-center justify-between text-[11px] font-mono text-secondary">
          <span>Navigate with arrows</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  )
}
