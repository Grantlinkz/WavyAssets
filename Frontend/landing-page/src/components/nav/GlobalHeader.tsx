import React, { useState } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { useTerminalStore } from '../../store/useTerminalStore';
import { ChevronDown, Lock, Menu, X } from 'lucide-react';

export const GlobalHeader: React.FC = () => {
  const isMegaMenuOpen = useTerminalStore((state) => state.isMegaMenuOpen);
  const toggleMegaMenu = useTerminalStore((state) => state.toggleMegaMenu);
  const openAuthModal = useTerminalStore((state) => state.openAuthModal);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Client Voices', href: '#client-voices' },
    { label: 'Contact', href: '#contact' },
    { label: 'Research', href: '#research' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand + Status Chip */}
        <div className="flex items-center gap-6">
          <BrandLogo showSecuredBadge={true} />

          <div className="hidden xl:flex items-center gap-2 bg-surface-container px-3 py-1 rounded-sm border border-outline text-xs text-on-surface-variant font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider">
              TERMINAL ONLINE • SLA 99.999% • NYC / LON FIX
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
          {/* Services Mega-Menu Trigger */}
          <button
            type="button"
            id="services-nav-trigger"
            onClick={toggleMegaMenu}
            aria-expanded={isMegaMenuOpen}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all border ${
              isMegaMenuOpen
                ? 'bg-surface-container border-primary/50 text-primary shadow-sm'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
            <span>Services</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isMegaMenuOpen ? 'rotate-180 text-primary' : 'text-on-surface-variant'
              }`}
            />
          </button>

          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => openAuthModal('institutional')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm bg-surface-container border border-outline hover:border-primary/60 text-xs uppercase font-sans font-semibold tracking-wider hover:text-primary transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-primary" />
            <span>Terminal Login</span>
          </button>

          <button
            type="button"
            onClick={() => openAuthModal('institutional')}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-sm bg-primary-container text-on-primary-container text-xs uppercase font-sans font-bold tracking-wider hover:bg-primary-hover transition-colors shadow-sm"
          >
            <span>Request Mandate</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-1.5 rounded-sm bg-surface-container border border-outline text-on-surface"
            aria-label="Toggle Mobile Navigation"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden border-t border-outline bg-surface-container-lowest px-4 py-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              toggleMegaMenu();
              setMobileNavOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-sm bg-surface-container text-xs font-semibold uppercase tracking-wider text-primary border border-primary/30"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span>Explore 7 Asset Verticals</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>

          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileNavOpen(false)}
              className="block px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider text-on-surface hover:bg-surface-container transition-colors"
            >
              {link.label}
            </a>
          ))}

          <div className="pt-2 border-t border-outline flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                openAuthModal('institutional');
                setMobileNavOpen(false);
              }}
              className="w-full py-2 rounded-sm bg-surface-container border border-outline text-xs uppercase font-semibold text-on-surface flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-primary" />
              <span>Terminal Login</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
