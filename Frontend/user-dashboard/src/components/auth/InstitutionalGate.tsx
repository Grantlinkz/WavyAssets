import React, { useState } from 'react';
import { Shield, Lock, KeyRound, ArrowRight, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuthStore } from '../../store/useAuthStore';

interface InstitutionalGateProps {
  onTicketExchangeSuccess?: () => void;
}

export const InstitutionalGate: React.FC<InstitutionalGateProps> = ({ onTicketExchangeSuccess }) => {
  const consumeTicket = useAuthStore((s) => s.consumeTicket);
  const isExchangingTicket = useAuthStore((s) => s.isExchangingTicket);
  const ticketExchangeError = useAuthStore((s) => s.ticketExchangeError);

  const [ticketInput, setTicketInput] = useState('');
  const [showManualTicket, setShowManualTicket] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const landingUrl = typeof window !== 'undefined'
    ? (import.meta.env.VITE_LANDING_URL || `${window.location.protocol}//${window.location.hostname}:5173`)
    : 'http://localhost:5173';

  const handleManualTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketInput.trim()) {
      setLocalError('Please enter a valid handoff ticket token.');
      return;
    }

    setLocalError(null);
    try {
      await consumeTicket(ticketInput.trim());
      if (onTicketExchangeSuccess) {
        onTicketExchangeSuccess();
      }
    } catch (err: unknown) {
      setLocalError(err instanceof Error ? err.message : 'Ticket verification failed');
    }
  };

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
          <div className="mx-auto w-14 h-14 rounded-sm border border-primary/40 bg-surface-container flex items-center justify-center shadow-inner">
            <Lock className="h-7 w-7 text-primary" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-primary/10 border border-primary/30 text-[10px] font-mono font-semibold tracking-wider text-primary uppercase">
              <Shield className="w-3 h-3" />
              Sovereign Command Deck Restricted
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-on-surface tracking-tight">
              WavyAssets Institutional Operating System
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
              Sign In with Sovereign 2FA
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

        {/* Manual Handoff Ticket Drawer (Optional for Enclave & Local Test Handoff) */}
        <div className="pt-2 border-t border-border-hairline">
          {!showManualTicket ? (
            <button
              type="button"
              data-testid="toggle-manual-ticket"
              onClick={() => setShowManualTicket(true)}
              className="text-[11px] font-mono text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1.5 w-full py-1"
            >
              <span>Have an ephemeral handoff ticket?</span>
              <span className="text-primary underline">Enter token directly</span>
            </button>
          ) : (
            <form onSubmit={handleManualTicketSubmit} className="space-y-3 pt-2" data-testid="manual-ticket-form">
              <label htmlFor="ticket-input" className="block text-[11px] font-mono text-on-surface-variant">
                Enter Single-Use HMAC Handoff Ticket:
              </label>
              <div className="flex gap-2">
                <input
                  id="ticket-input"
                  data-testid="manual-ticket-input"
                  type="text"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  placeholder="wavy_ticket_... or seed hex"
                  className="flex-1 bg-surface-container border border-border-hairline rounded-xs px-3 py-1.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary placeholder:text-on-surface-variant/40"
                  disabled={isExchangingTicket}
                />
                <Button
                  data-testid="manual-ticket-submit"
                  type="submit"
                  variant="secondary"
                  size="default"
                  disabled={isExchangingTicket || !ticketInput.trim()}
                >
                  {isExchangingTicket ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Redeem'}
                </Button>
              </div>

              {(localError || ticketExchangeError) && (
                <div
                  data-testid="gate-error-message"
                  className="p-2.5 rounded-xs bg-error/10 border border-error/30 text-error flex items-center gap-2 text-[11px] font-mono"
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{localError || ticketExchangeError}</span>
                </div>
              )}
            </form>
          )}
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
            ← Return to Public Terminal Showcase
          </a>
        </div>
      </div>
    </div>
  );
};
