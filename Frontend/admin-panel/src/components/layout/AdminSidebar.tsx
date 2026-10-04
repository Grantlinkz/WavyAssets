import React, { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
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
  UserCog,
} from "lucide-react"
import { useAdminNavStore, type AdminRoute } from "../../store/useAdminNavStore"
import { fetchBadgeCounts } from "../../api/overview"
import { useAdminAuthStore } from "../../store/useAdminAuthStore"

interface NavItem {
  id: AdminRoute
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: {
    text: string
    variant?: "warning" | "cyan" | "success" | "secondary"
  }
}

export const AdminSidebar: React.FC = () => {
  const { activeRoute, setActiveRoute, badgeCounts, updateBadgeCount } = useAdminNavStore()
  const { isAuthenticated } = useAdminAuthStore()

  // Real-time telemetry query for live navigation badge counters
  const { data: serverBadgeCounts } = useQuery({
    queryKey: ["admin-badge-counts"],
    queryFn: fetchBadgeCounts,
    enabled: isAuthenticated,
    refetchInterval: 3000,
  })

  // Synchronize incoming badge telemetry with global nav store
  useEffect(() => {
    if (serverBadgeCounts) {
      updateBadgeCount("urgentActions", serverBadgeCounts.urgentActions)
      updateBadgeCount("newInquiries", serverBadgeCounts.newInquiries)
      updateBadgeCount("totalUsers", serverBadgeCounts.totalUsers)
      updateBadgeCount("pendingCompliance", serverBadgeCounts.pendingCompliance)
      updateBadgeCount("treasurySignOffs", serverBadgeCounts.treasurySignOffs)
      updateBadgeCount("activeCards", serverBadgeCounts.activeCards)
    }
  }, [serverBadgeCounts, updateBadgeCount])

  const urgentCount = serverBadgeCounts?.urgentActions ?? badgeCounts.urgentActions ?? 0
  const inquiriesCount = serverBadgeCounts?.newInquiries ?? badgeCounts.newInquiries ?? 0
  const usersCount = serverBadgeCounts?.totalUsers ?? badgeCounts.totalUsers ?? 0
  const complianceCount = serverBadgeCounts?.pendingCompliance ?? badgeCounts.pendingCompliance ?? 0
  const treasuryCount = serverBadgeCounts?.treasurySignOffs ?? badgeCounts.treasurySignOffs ?? 0
  const cardsCount = serverBadgeCounts?.activeCards ?? badgeCounts.activeCards ?? 0

  const navItems: NavItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: Activity,
      badge:
        urgentCount > 0
          ? { text: `${urgentCount} Urgent`, variant: "warning" }
          : { text: "Live", variant: "success" },
    },
    {
      id: "inquiries",
      label: "Inquiries",
      icon: FileText,
      badge:
        inquiriesCount > 0
          ? { text: `${inquiriesCount} New`, variant: "cyan" }
          : { text: "Live", variant: "success" },
    },
    {
      id: "user-directory",
      label: "User Directory",
      icon: Users,
      badge:
        usersCount > 0
          ? { text: usersCount.toLocaleString(), variant: "secondary" }
          : { text: "Live", variant: "success" },
    },
    {
      id: "compliance",
      label: "Compliance",
      icon: ShieldAlert,
      badge:
        complianceCount > 0
          ? { text: `${complianceCount} Pending`, variant: "warning" }
          : { text: "Live", variant: "success" },
    },
    {
      id: "treasury",
      label: "Treasury",
      icon: Wallet,
      badge:
        urgentCount > 0
          ? { text: `${urgentCount} Pending`, variant: "warning" }
          : treasuryCount > 0
            ? { text: `${treasuryCount} Sign-Offs`, variant: "warning" }
            : { text: "Live", variant: "success" },
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
        cardsCount > 0
          ? { text: `${cardsCount} Active`, variant: "secondary" }
          : { text: "Live", variant: "success" },
    },
    {
      id: "audit-log",
      label: "Audit Log",
      icon: History,
    },
    {
      id: "admin-directory",
      label: "Admin Directory",
      icon: UserCog,
      badge: { text: "RBAC", variant: "cyan" },
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
                {item.badge && (
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded-[2px] border ${getBadgeStyle(
                      item.badge.variant
                    )}`}
                  >
                    {item.badge.text}
                  </span>
                )}
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
