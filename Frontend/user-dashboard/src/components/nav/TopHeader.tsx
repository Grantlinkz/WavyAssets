import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Shield,
  UserCheck,
  Menu,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useAuthStore } from '../../store/useAuthStore';

export const TopHeader: React.FC = () => {
  const {
    theme,
    toggleTheme,
    maskBalances,
    toggleMaskBalances,
    setMobileMenuOpen,
  } = useDashboardStore();
  const { user } = useAuthStore();

  return (
    <header
      data-testid="top-header"
      className="h-14 border-b border-border-hairline bg-surface/95 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-40 select-none"
    >
      {/* Left: Mobile hamburger & BrandLogo & Enclave */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden p-1.5 rounded-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
          aria-label="Open mobile navigation"
          data-testid="mobile-menu-btn"
        >
          <Menu className="h-5 w-5" />
        </button>

        <BrandLogo className="h-7 w-auto" />

        {/* Active Vault Enclave Pill */}
        <div className="hidden xl:flex items-center space-x-1.5 px-2 py-0.5 rounded-xs border border-border-hairline/80 bg-surface-container-low text-[11px] font-mono text-on-surface-variant">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="text-on-surface/90 font-medium">Vault Enclave:</span>
          <span className="text-primary font-semibold">Geneva Alpha</span>
        </div>
      </div>

      {/* Center: Command Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search tickers, vault assets, SPVs, transactions... (⌘K)"
            aria-label="Global terminal search"
            data-testid="global-search-input"
            className="w-full h-8 pl-8 pr-12 text-xs bg-surface-container-lowest border border-border-hairline rounded-sm text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none focus:border-primary/80 focus:ring-1 focus:ring-primary/40 font-sans transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-on-surface-variant bg-surface-container px-1 py-0.5 rounded-xs border border-border-hairline">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Controls: Tier Badge, Privacy Mask, Theme Toggle, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Tier Badge */}
        <div
          data-testid="client-tier-badge"
          className="hidden sm:inline-flex items-center space-x-1 px-2 py-1 rounded-xs border border-primary/30 bg-primary/10 text-[10px] font-mono font-semibold text-primary uppercase tracking-wider"
        >
          <Shield className="h-3 w-3" />
          <span>{user?.tier ? user.tier.replace('_', ' ') : 'PRIVATE WEALTH'}</span>
        </div>

        {/* Privacy Mask Toggle */}
        <button
          onClick={toggleMaskBalances}
          data-testid="privacy-mask-toggle"
          title={maskBalances ? "Show balances" : "Hide balances (Privacy Mode)"}
          aria-label={maskBalances ? "Show balances" : "Hide balances"}
          className={`h-8 w-8 rounded-sm flex items-center justify-center border transition-colors cursor-pointer ${
            maskBalances
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-border-hairline bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          }`}
        >
          {maskBalances ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>

        {/* Theme Mode Switcher */}
        <button
          onClick={toggleTheme}
          data-testid="theme-toggle-btn"
          title={`Switch to ${theme === 'dark' ? 'Luxury Light' : 'Obsidian Dark'} mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'Luxury Light' : 'Obsidian Dark'} mode`}
          className="h-8 w-8 rounded-sm flex items-center justify-center border border-border-hairline bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-primary" />
          ) : (
            <Moon className="h-4 w-4 text-primary" />
          )}
        </button>

        {/* Account Profile Summary */}
        <div className="flex items-center space-x-2 pl-1 border-l border-border-hairline">
          <div className="h-8 w-8 rounded-xs border border-primary/40 bg-surface-container flex items-center justify-center text-xs font-mono font-bold text-primary">
            GA
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-medium text-on-surface leading-tight truncate max-w-[130px]">
              {user?.fullName || 'Geneva Alpha'}
            </span>
            <span className="text-[10px] font-mono text-secondary flex items-center space-x-1">
              <UserCheck className="h-2.5 w-2.5" />
              <span>KYC Tier 3</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
