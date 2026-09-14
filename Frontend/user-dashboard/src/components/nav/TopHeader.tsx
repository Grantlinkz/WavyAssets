import React from 'react';
import {
  Search,
  Moon,
  Sun,
  Eye,
  EyeOff,
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

  const userInitials = React.useMemo(() => {
    const name = user?.fullName;
    if (!name) return 'GA';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }, [user]);

  const kycLabel = React.useMemo(() => {
    if (!user?.kycTier) return 'KYC Tier 3';
    return user.kycTier.replace('_', ' ');
  }, [user]);

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

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-xs md:max-w-sm mx-3 hidden sm:block">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-on-surface-variant pointer-events-none" />
          <input
            type="text"
            placeholder="Search assets, vaults, or contracts... (⌘K)"
            aria-label="Global Search"
            data-testid="global-search-input"
            className="w-full h-8 pl-8 pr-3 text-xs rounded-sm border border-border-hairline bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary font-mono transition-colors"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Client Access Tier Badge */}
        <div
          data-testid="client-tier-badge"
          className="hidden sm:inline-flex items-center space-x-1 px-2 py-1 rounded-xs border border-secondary/40 bg-secondary/10 text-[10px] font-mono font-semibold text-secondary uppercase tracking-wider"
        >
          <span>{user?.tier || 'PRIVATE WEALTH'}</span>
        </div>

        {/* Privacy Mask Toggle */}
        <button
          onClick={toggleMaskBalances}
          data-testid="privacy-toggle-btn"
          title={maskBalances ? 'Unhide Financial Values' : 'Hide Financial Values (Public Safe)'}
          aria-label={maskBalances ? 'Unhide Financial Values' : 'Hide Financial Values (Public Safe)'}
          className="h-8 w-8 rounded-sm flex items-center justify-center border border-border-hairline bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
        >
          {maskBalances ? (
            <EyeOff className="h-4 w-4 text-primary" />
          ) : (
            <Eye className="h-4 w-4 text-on-surface-variant" />
          )}
        </button>

        {/* Theme Toggle (Dark / Light) */}
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
          <div
            data-testid="user-avatar-initials"
            className="h-8 w-8 rounded-xs border border-primary/40 bg-surface-container flex items-center justify-center text-xs font-mono font-bold text-primary"
          >
            {userInitials}
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-medium text-on-surface leading-tight truncate max-w-[130px]">
              {user?.fullName || 'Geneva Alpha'}
            </span>
            <span className="text-[10px] font-mono text-secondary flex items-center space-x-1">
              <UserCheck className="h-2.5 w-2.5" />
              <span>{kycLabel}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
