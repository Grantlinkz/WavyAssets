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
  X,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useDashboardStore, type AssetVertical } from '../../store/useDashboardStore';
import { cn } from '../../lib/utils';

const MOBILE_NAV_ITEMS: { id: AssetVertical; label: string; badge?: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
  { id: 'crypto', label: 'Crypto & Staking', badge: '19.4%', icon: Coins },
  { id: 'stocks', label: 'Global Stocks (DMA)', badge: 'L2', icon: TrendingUp },
  { id: 'ai-funds', label: 'AI Systematic Funds', badge: 'ALPHA', icon: Cpu },
  { id: 'real-estate', label: 'Tokenized Real Estate', badge: 'SPV', icon: Building2 },
  { id: 'cars', label: 'Exotic Cars & Horology', badge: 'VAULT', icon: Car },
  { id: 'vip-cards', label: 'Obsidian VIP Cards', badge: 'METAL', icon: CreditCard },
  { id: 'wallet', label: 'Sovereign MPC Wallet', badge: '5.2%', icon: Wallet },
  { id: 'compliance', label: 'Compliance & Tax', icon: ShieldCheck },
  { id: 'security', label: 'Security & Access Vault', badge: 'LOCK', icon: KeyRound },
];

export interface MobileHeaderProps {
  isOpen?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ isOpen }) => {
  const storeIsOpen = useDashboardStore((s) => s.isMobileMenuOpen);
  const setMobileMenuOpen = useDashboardStore((s) => s.setMobileMenuOpen);
  const activeVertical = useDashboardStore((s) => s.activeVertical);
  const setActiveVertical = useDashboardStore((s) => s.setActiveVertical);

  const isMobileMenuOpen = isOpen ?? storeIsOpen;

  if (!isMobileMenuOpen) return null;

  return (
    <div
      data-testid="mobile-nav-drawer"
      className="fixed inset-0 z-50 lg:hidden flex"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile Navigation"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-container-lowest/80 backdrop-blur-xs transition-opacity"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-surface border-r border-border-hairline p-4 flex flex-col h-full z-10 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-border-hairline">
          <BrandLogo className="h-7 w-auto" />
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-sm text-on-surface-variant hover:text-on-surface"
            aria-label="Close navigation"
            data-testid="close-mobile-menu-btn"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeVertical === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveVertical(item.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2 rounded-sm text-xs font-medium transition-colors text-left',
                  isActive
                    ? 'bg-surface-container text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-on-surface-variant')} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1 py-0.5 rounded-xs bg-surface-container-high text-on-surface-variant font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
