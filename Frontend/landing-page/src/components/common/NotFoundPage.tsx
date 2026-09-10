import React from 'react';
import { ShieldAlert, Compass, Home, Mail } from 'lucide-react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { BrandLogo } from './BrandLogo';

interface NotFoundPageProps {
  requestedPath?: string;
  onReset?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  requestedPath,
  onReset,
}) => {
  const openContactModal = useTerminalStore((state) => state.openContactModal);
  const setMegaMenuOpen = useTerminalStore((state) => state.setMegaMenuOpen);
  const setActiveAssetId = useTerminalStore((state) => state.setActiveAssetId);
  const setIs404 = useTerminalStore((state) => state.setIs404);

  const displayPath =
    requestedPath ||
    (typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.hash}`
      : '/404');

  const handleReturnHome = () => {
    setIs404(false);
    if (onReset) onReset();
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/#/services/crypto');
      setActiveAssetId('crypto');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBrowseServices = () => {
    setIs404(false);
    if (onReset) onReset();
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', '/#/services/crypto');
      setActiveAssetId('crypto');
      setMegaMenuOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContact = () => {
    openContactModal();
  };

  return (
    <div
      data-testid="not-found-page"
      className="min-h-[75vh] w-full flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative z-10 select-none"
    >
      {/* Background Soft Glow Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center z-0"
      >
        <div className="w-96 h-96 rounded-full bg-primary/5 dark:bg-primary/10 blur-3xl" />
        <div className="w-72 h-72 rounded-full bg-error/5 dark:bg-error/10 blur-2xl translate-y-8" />
      </div>

      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center text-center">
        {/* Brand Crest */}
        <div className="mb-6">
          <BrandLogo />
        </div>

        {/* Status Telemetry Tag */}
        <div
          data-testid="not-found-telemetry-pill"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-surface-container border border-outline mb-6 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-error animate-pulse shrink-0" />
          <span className="font-mono text-[11px] text-error font-semibold uppercase tracking-wider">
            Page Not Found • Error 404
          </span>
        </div>

        {/* Stylized 3D Vault Missing Lock Illustration */}
        <div
          aria-hidden="true"
          className="w-24 h-24 sm:w-28 sm:h-28 mb-6 relative flex items-center justify-center rounded-sm bg-surface-container border border-outline/60 shadow-lg"
        >
          <div className="absolute inset-2 border border-dashed border-outline/40 rounded-sm" />
          <ShieldAlert className="w-12 h-12 text-primary dark:text-primary-hover animate-pulse" />
          <span className="absolute -bottom-2 px-2 py-0.5 rounded-xs bg-surface-container-high border border-outline text-[9px] font-mono text-on-surface-variant uppercase tracking-wider">
            Lost Link
          </span>
        </div>

        {/* Large 404 Headline */}
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-on-surface mb-3">
          We Can't Find That Page
        </h1>

        {/* Plain English Explanation */}
        <p className="font-sans text-sm sm:text-base text-on-surface-variant max-w-lg mb-8 leading-relaxed">
          We searched everywhere, but the link you followed may be broken, outdated,
          or moved to a new address. Your account and investments are completely safe.
        </p>

        {/* Diagnostic Metadata Strip */}
        <div
          data-testid="not-found-diagnostic-strip"
          className="w-full max-w-md bg-surface-container-low border border-outline rounded-sm p-3 mb-8 text-left font-mono text-xs space-y-1.5"
        >
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>Requested Link:</span>
            <span className="text-primary truncate max-w-[240px]" title={displayPath}>
              {displayPath}
            </span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>Status Code:</span>
            <span className="text-error font-semibold">404 (Not Found)</span>
          </div>
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>Platform Status:</span>
            <span className="text-secondary font-semibold">All Systems Normal</span>
          </div>
        </div>

        {/* Institutional Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
          {/* 1. Return Home Button */}
          <button
            type="button"
            data-testid="not-found-return-home-btn"
            onClick={handleReturnHome}
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-primary text-on-primary font-semibold text-xs uppercase tracking-wider hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer shadow-md"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Return to Home</span>
          </button>

          {/* 2. Browse Services */}
          <button
            type="button"
            data-testid="not-found-browse-services-btn"
            onClick={handleBrowseServices}
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-surface-container border border-outline text-on-surface font-semibold text-xs uppercase tracking-wider hover:border-primary/50 hover:text-primary active:scale-[0.98] transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>Browse Services</span>
          </button>

          {/* 3. Contact Support */}
          <button
            type="button"
            data-testid="not-found-contact-btn"
            onClick={handleContact}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-sm bg-transparent border border-outline/60 text-on-surface-variant font-medium text-xs hover:text-on-surface hover:border-outline transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 shrink-0" />
            <span>Contact Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};
