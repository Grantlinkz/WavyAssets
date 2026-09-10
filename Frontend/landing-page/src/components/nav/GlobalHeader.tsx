import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { ThemeToggle } from './ThemeToggle';
import { useTerminalStore } from '../../store/useTerminalStore';
import { ChevronDown, Lock, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Client Voices', href: '#client-voices' },
  { label: 'Contact', href: '#contact' },
  { label: 'Research', href: '/research#/services/vip-cards' },
];

export interface GlobalHeaderProps {
  isMegaMenuOpen?: boolean;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  isMegaMenuOpen: isMegaMenuOpenProp,
}) => {
  const storeIsMegaMenuOpen = useTerminalStore((state) => state.isMegaMenuOpen);
  const isMegaMenuOpen =
    isMegaMenuOpenProp !== undefined ? isMegaMenuOpenProp : storeIsMegaMenuOpen;
  const toggleMegaMenu = useTerminalStore((state) => state.toggleMegaMenu);
  const openAuthModal = useTerminalStore((state) => state.openAuthModal);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Sliding Dot Indicator State
  const navRef = useRef<HTMLElement>(null);
  const servicesBtnRef = useRef<HTMLButtonElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [dotX, setDotX] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [activeX, setActiveX] = useState<number | null>(null);

  // Helper to calculate centered dot coordinate relative to nav container
  const computeCenter = useCallback((el: HTMLElement): number => {
    if (!navRef.current) return 0;
    const navRect = navRef.current.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return elRect.left - navRect.left + elRect.width / 2;
  }, []);

  const handleMouseEnter = useCallback(
    (el: HTMLElement) => {
      const center = computeCenter(el);
      setDotX(center);
      setIsHovered(true);
    },
    [computeCenter]
  );

  const handleNavMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Synchronize active element (when mega-menu is open or hash matches)
  useEffect(() => {
    if (isMegaMenuOpen && servicesBtnRef.current) {
      setActiveX(computeCenter(servicesBtnRef.current));
      return;
    }

    if (typeof window !== 'undefined' && window.location.hash) {
      const activeIdx = navLinks.findIndex((l) => l.href === window.location.hash);
      if (activeIdx !== -1 && linkRefs.current[activeIdx]) {
        setActiveX(computeCenter(linkRefs.current[activeIdx]!));
        return;
      }
    }

    setActiveX(null);
  }, [isMegaMenuOpen, computeCenter]);

  return (
    <header className="sticky top-0 z-50 w-full bg-surface-container-lowest/95 backdrop-blur-xl border-b border-outline">
      <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-6">
          <BrandLogo showSecuredBadge={true} />
        </div>

        {/* Center: Desktop Navigation with Sliding Dot Indicator */}
        <nav
          ref={navRef}
          onMouseLeave={handleNavMouseLeave}
          className="hidden lg:flex items-center gap-6 relative py-1"
          aria-label="Main Navigation"
        >
          {/* Services Mega-Menu Trigger */}
          <button
            ref={servicesBtnRef}
            type="button"
            id="services-nav-trigger"
            onClick={toggleMegaMenu}
            onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
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

          {navLinks.map((link, idx) => (
            <a
              key={link.label}
              ref={(el) => {
                linkRefs.current[idx] = el;
              }}
              href={link.href}
              onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
              className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors py-1 px-1"
            >
              {link.label}
            </a>
          ))}

          {/* Sliding Dot Indicator: Centers under hovered link with smooth cubic-bezier easing */}
          <motion.div
            data-testid="navbar-sliding-dot"
            aria-hidden="true"
            initial={false}
            animate={{
              x: isHovered ? dotX - 3 : activeX !== null ? activeX - 3 : dotX - 3,
              opacity: isHovered || activeX !== null ? 1 : 0,
              scale: isHovered || activeX !== null ? 1 : 0.4,
            }}
            transition={{
              x: { duration: 0.35, ease: [0.25, 1, 0.5, 1] },
              opacity: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
              scale: { duration: 0.25, ease: [0.25, 1, 0.5, 1] },
            }}
            style={{ willChange: 'transform, opacity' }}
            className="pointer-events-none absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(212,175,55,0.8)]"
          />
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
            <span>Welcome Back</span>
          </button>

          <button
            type="button"
            onClick={() => openAuthModal('institutional')}
            className="inline-flex items-center justify-center px-4 py-1.5 rounded-sm bg-primary-container text-on-primary-container text-xs uppercase font-sans font-bold tracking-wider hover:bg-primary-hover transition-colors shadow-sm"
          >
            <span>Request Service</span>
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
              <span>Welcome Back</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
