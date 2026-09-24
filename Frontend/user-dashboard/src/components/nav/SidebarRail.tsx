import React from 'react';
import {
  LayoutDashboard,
  Coins,
  TrendingUp,
  Cpu,
  Building2,
  Car,
  CreditCard,
  Wallet,
  ShieldCheck,
  KeyRound,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDashboardStore, type AssetVertical } from '../../store/useDashboardStore';
import { useAuthStore } from '../../store/useAuthStore';
import { logoutUser } from '../../lib/api';
import { cn } from '../../lib/utils';

interface NavItem {
  id: AssetVertical;
  label: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'crypto', label: 'Crypto & Staking', badge: '19.4%', icon: Coins },
  { id: 'stocks', label: 'Global Stocks (DMA)', badge: 'L2', icon: TrendingUp },
  { id: 'ai-funds', label: 'AI Systematic Funds', badge: 'ALPHA', icon: Cpu },
  { id: 'real-estate', label: 'Tokenized Real Estate', badge: 'SPV', icon: Building2 },
  { id: 'cars', label: 'Exotic Cars & Horology', badge: 'VAULT', icon: Car },
  { id: 'vip-cards', label: 'Obsidian VIP Cards', badge: 'METAL', icon: CreditCard },
  { id: 'wallet', label: 'Global MPC Wallet', badge: '5.2%', icon: Wallet },
  { id: 'compliance', label: 'Compliance & Tax', icon: ShieldCheck },
  { id: 'security', label: 'Security & Access Vault', badge: 'LOCK', icon: KeyRound },
];

export interface SidebarRailProps {
  isCollapsed?: boolean;
  activeTab?: AssetVertical;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({ isCollapsed, activeTab }) => {
  const storeActiveVertical = useDashboardStore((s) => s.activeVertical);
  const storeIsCollapsed = useDashboardStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar);
  const setActiveVertical = useDashboardStore((s) => s.setActiveVertical);

  const activeVertical = activeTab ?? storeActiveVertical;
  const isSidebarCollapsed = isCollapsed ?? storeIsCollapsed;

  return (
    <aside
      data-testid="dashboard-sidebar"
      className={cn(
        'hidden lg:flex flex-col border-r border-border-hairline bg-surface-container-lowest transition-all duration-200 z-30 select-none shrink-0 h-screen sticky top-0',
        isSidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Sidebar Header / Section Label */}
      <div className="h-14 flex items-center px-4 border-b border-border-hairline/60">
        {!isSidebarCollapsed ? (
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-on-surface-variant font-semibold">
            Global Verticals
          </span>
        ) : (
          <div className="w-full flex justify-center">
            <span className="h-2 w-2 rounded-full bg-primary/80 animate-pulse" />
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto custom-scrollbar" aria-label="Global asset navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeVertical === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveVertical(item.id)}
              data-testid={`nav-item-${item.id}`}
              title={isSidebarCollapsed ? item.label : undefined}
              className={cn(
                'group relative flex items-center w-full h-9 rounded-sm transition-all duration-150 cursor-pointer font-sans text-xs',
                isSidebarCollapsed ? 'justify-center px-0' : 'px-2.5 space-x-3',
                isActive
                  ? 'bg-surface-container text-primary font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              )}
            >
              {/* Active Left Indicator */}
              {isActive && (
                <span
                  data-testid="active-nav-indicator"
                  className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r-xs bg-primary shadow-xs"
                />
              )}

              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'
                )}
              />

              {!isSidebarCollapsed && (
                <span className="truncate flex-1 text-left tracking-wide">
                  {item.label}
                </span>
              )}

              {!isSidebarCollapsed && item.badge && (
                <span
                  className={cn(
                    'text-[9px] font-mono px-1 py-0.5 rounded-xs font-semibold shrink-0 uppercase',
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : 'bg-surface-container-high text-on-surface-variant'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Sign Out Action after Security & Access Vault */}
        <button
          onClick={async () => {
            try {
              await logoutUser();
            } finally {
              useAuthStore.getState().logout();
            }
          }}
          data-testid="nav-item-sign-out"
          title={isSidebarCollapsed ? 'Sign Out' : undefined}
          className={cn(
            'group relative flex items-center w-full h-9 rounded-sm transition-all duration-150 cursor-pointer font-sans text-xs text-error/90 hover:bg-error/10 hover:text-error',
            isSidebarCollapsed ? 'justify-center px-0' : 'px-2.5 space-x-3'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0 transition-colors text-error/80 group-hover:text-error" />
          {!isSidebarCollapsed && (
            <span className="truncate flex-1 text-left tracking-wide font-medium">
              Sign Out
            </span>
          )}
        </button>
      </nav>

      {/* Sidebar Footer / Collapse Toggle */}
      <div className="p-2 border-t border-border-hairline/60">
        <button
          onClick={toggleSidebar}
          data-testid="sidebar-collapse-toggle"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex items-center w-full h-8 rounded-sm text-xs text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer',
            isSidebarCollapsed ? 'justify-center' : 'px-2 space-x-2'
          )}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-[11px] font-mono">Collapse Rail</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
