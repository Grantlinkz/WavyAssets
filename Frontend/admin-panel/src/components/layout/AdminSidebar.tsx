import React from "react"
import {
  Activity,
  FileText,
  Users,
  ShieldAlert,
  Wallet,
  Sliders,
  CreditCard,
  History,
  CheckCircle2,
} from "lucide-react"
import { useAdminNavStore, type AdminRoute } from "../../store/useAdminNavStore"

interface NavItem {
  id: AdminRoute
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: {
    text?: string
    variant?: "warning" | "cyan" | "success" | "secondary"
    isSkeleton?: boolean
  }
}

export const AdminSidebar: React.FC = () => {
  const { activeRoute, setActiveRoute, badgeCounts } = useAdminNavStore()

  const navItems: NavItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Activity,
      badge:
        badgeCounts.urgentActions !== null
          ? { text: `${badgeCounts.urgentActions} Urgent`, variant: "warning" }
          : { isSkeleton: true },
    },
    {
      id: "inquiries",
      label: "Inquiries",
      icon: FileText,
      badge:
        badgeCounts.newInquiries !== null
          ? { text: `${badgeCounts.newInquiries} New`, variant: "cyan" }
          : { isSkeleton: true },
    },
    {
      id: "user-directory",
      label: "User Directory",
      icon: Users,
      badge:
        badgeCounts.totalUsers !== null
          ? { text: badgeCounts.totalUsers.toLocaleString(), variant: "secondary" }
          : { isSkeleton: true },
    },
    {
      id: "compliance",
      label: "Compliance",
      icon: ShieldAlert,
      badge:
        badgeCounts.pendingCompliance !== null
          ? { text: `${badgeCounts.pendingCompliance} Pending`, variant: "warning" }
          : { isSkeleton: true },
    },
    {
      id: "treasury",
      label: "Treasury",
      icon: Wallet,
      badge:
        badgeCounts.treasurySignOffs !== null
          ? { text: `${badgeCounts.treasurySignOffs} Sign-Offs`, variant: "warning" }
          : { isSkeleton: true },
    },
    {
      id: "deposit-rails",
      label: "Deposit Rails",
      icon: Sliders,
      badge: { text: "Live", variant: "success" },
    },
    {
      id: "vip-cards",
      label: "VIP Cards",
      icon: CreditCard,
      badge:
        badgeCounts.activeCards !== null
          ? { text: `${badgeCounts.activeCards} Active`, variant: "secondary" }
          : { isSkeleton: true },
    },
    {
      id: "audit-log",
      label: "Audit Log",
      icon: History,
    },
  ]

  const getBadgeStyle = (variant?: "warning" | "cyan" | "success" | "secondary") => {
    switch (variant) {
      case "warning":
        return "text-status-warning bg-status-warning/10 border-status-warning/30"
      case "cyan":
        return "text-telemetry-cyan bg-telemetry-cyan/10 border-telemetry-cyan/30"
      case "success":
        return "text-status-success bg-status-success/10 border-status-success/30"
      case "secondary":
      default:
        return "text-secondary bg-bg-elevated border-border-subtle"
    }
  }

  return (
    <aside
      className="fixed left-0 top-[90px] bottom-0 w-[260px] bg-bg-panel border-r border-border-subtle z-30 flex flex-col justify-between p-3 select-none"
      data-testid="admin-sidebar"
    >
      <div className="flex flex-col gap-3">

        {/* Navigation Rail */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeRoute === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveRoute(item.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-[4px] text-xs transition-colors cursor-pointer text-left ${
                  isActive
                    ? "bg-state-hover text-on-surface border-l-2 border-gold-accent font-semibold"
                    : "text-secondary hover:bg-state-hover hover:text-on-surface"
                }`}
                data-testid={`nav-${item.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-gold-accent" : "text-secondary"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge &&
                  (item.badge.isSkeleton ? (
                    <span className="w-12 h-3.5 rounded-[2px] wavy-skeleton shrink-0" />
                  ) : (
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] border ${getBadgeStyle(
                        item.badge.variant
                      )}`}
                    >
                      {item.badge.text}
                    </span>
                  ))}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer Ledger Telemetry */}
      <div className="flex flex-col gap-2 pt-3 border-t border-border-subtle">
        <div className="border border-status-success/40 bg-bg-canvas p-2 rounded-[4px] flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0" />
          <span className="font-mono text-[11px] text-status-success font-medium">
            Ledger Status: 100% Balanced
          </span>
        </div>
        <span className="font-mono text-[10px] text-secondary/70 text-center block">
          Version 1.0.0 — FINMA AMLA Compliant
        </span>
      </div>
    </aside>
  )
}
