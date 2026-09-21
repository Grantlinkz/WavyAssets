import React from 'react';
import { Shield, KeyRound, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';

interface InstitutionalGateProps {
  onTicketExchangeSuccess?: () => void;
}

export const InstitutionalGate: React.FC<InstitutionalGateProps> = () => {
  const landingUrl = typeof window !== 'undefined'
    ? (import.meta.env.VITE_LANDING_URL || `${window.location.protocol}//${window.location.hostname}:5173`)
    : 'http://localhost:5173';

  const handleSignInRedirect = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `${landingUrl}/?auth=signin`;
    }
  };

  const handleMandateRedirect = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `${landingUrl}/?auth=mandate`;
    }
  };

  return (
    <div
      data-testid="institutional-gate-container"
      className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-primary/20 selection:text-primary relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg p-8 rounded-sm border border-border-hairline bg-surface-container-low shadow-2xl space-y-8 relative z-10">
        {/* Header with Institutional Crest */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-sm border border-primary/40 bg-surface-container flex items-center justify-center shadow-inner p-2.5">
            <img
              src="/favicon.svg"
              alt="WavyAssets Favicon"
              data-testid="gate-favicon"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-primary/10 border border-primary/30 text-[10px] font-mono font-semibold tracking-wider text-primary uppercase">
              <Shield className="w-3 h-3" />
              Global Command Deck Restricted
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-on-surface tracking-tight">
              WavyAssets Institutional System
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Access to the double-entry transactional core and multi-asset execution environment is restricted to authenticated institutional allocators and family offices.
            </p>
          </div>
        </div>

        {/* Action Pathways */}
        <div className="space-y-3">
          {/* Primary Action 1: Sign In */}
          <Button
            data-testid="gate-signin-button"
            variant="default"
            size="lg"
            className="w-full justify-between font-mono font-semibold text-xs tracking-wider uppercase h-11"
            onClick={handleSignInRedirect}
          >
            <span className="flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Sign In with Global 2FA
            </span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          {/* Primary Action 2: Request Mandate */}
          <Button
            data-testid="gate-mandate-button"
            variant="goldOutline"
            size="lg"
            className="w-full justify-between font-mono font-semibold text-xs tracking-wider uppercase h-11"
            onClick={handleMandateRedirect}
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Request Institutional Mandate
            </span>
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer Security Badges */}
        <div className="pt-4 border-t border-border-hairline/50 flex items-center justify-between text-[10px] font-mono text-on-surface-variant/70">
          <span>Double-Entry Conservation</span>
          <span>•</span>
          <span>48h Quarantine Time-Lock</span>
          <span>•</span>
          <span>FIDO2 WebAuthn</span>
        </div>

        {/* Link back to Showcase */}
        <div className="text-center pt-1">
          <a
            href={landingUrl}
            className="text-[11px] font-mono text-on-surface-variant hover:text-on-surface transition-colors"
          >
            ← Return to WavyAssets Home Page
          </a>
        </div>
      </div>
    </div>
  );
};
