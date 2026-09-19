import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface AuthCallbackProps {
  onComplete?: () => void;
  ticketOverride?: string;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onComplete, ticketOverride }) => {
  const consumeTicket = useAuthStore((s) => s.consumeTicket);
  const ticketExchangeError = useAuthStore((s) => s.ticketExchangeError);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const getInitialTicket = () => {
    if (ticketOverride) return ticketOverride;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const q = urlParams.get('ticket');
      if (q) return q;
      if (window.location.hash.includes('ticket=')) {
        const hash = window.location.hash;
        const hashQuery = hash.includes('?') ? hash.split('?')[1] : hash.replace(/^#/, '');
        const hashParams = new URLSearchParams(hashQuery);
        return hashParams.get('ticket') || undefined;
      }
    }
    return undefined;
  };

  const initialTicket = getInitialTicket();
  const isAuth = useAuthStore.getState().isAuthenticated;

  const [ticketStatus, setTicketStatus] = useState<'verifying' | 'success' | 'error'>(() => {
    if (initialTicket) return 'verifying';
    if (isAuth) return 'success';
    return 'error';
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (!initialTicket && !isAuth) {
      return 'No authentication handoff ticket found.';
    }
    return null;
  });

  const consumedTicketRef = React.useRef<string | null>(null);

  useEffect(() => {
    const ticket = initialTicket;

    if (!ticket) {
      if (isAuthenticated && onComplete) {
        onComplete();
      }
      return;
    }

    if (consumedTicketRef.current === ticket) {
      return;
    }
    consumedTicketRef.current = ticket;

    consumeTicket(ticket)
      .then(() => {
        setTicketStatus('success');
        if (typeof window !== 'undefined' && window.history.replaceState) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        if (onComplete) {
          setTimeout(onComplete, 800);
        }
      })
      .catch((err) => {
        if (!useAuthStore.getState().isAuthenticated) {
          setTicketStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Cryptographic handoff exchange failed.');
        }
      });
  }, [consumeTicket, initialTicket, isAuthenticated, onComplete]);

  return (
    <div
      data-testid="auth-callback-container"
      className="min-h-screen flex items-center justify-center p-6 bg-surface-container-lowest"
    >
      <div className="w-full max-w-md p-6 rounded-sm border border-border-hairline bg-surface-container-low shadow-xl text-center space-y-6">
        {/* Enclave Crest */}
        <div className="mx-auto w-12 h-12 rounded-sm border border-primary/40 bg-surface-container flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>

        <div>
          <h2 className="text-lg font-serif font-semibold text-on-surface tracking-wide">
            Sovereign Enclave Authentication
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Verifying HMAC-SHA256 sovereign handoff ticket
          </p>
        </div>

        {/* Dynamic Verification State */}
        <div className="p-4 rounded-xs border border-border-hairline bg-surface-container-lowest flex flex-col items-center space-y-3">
          {ticketStatus === 'verifying' && (
            <>
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <div className="space-y-1">
                <span className="text-xs font-mono font-medium text-on-surface block">
                  Exchanging Handoff Ticket...
                </span>
                <span className="text-[11px] font-mono text-on-surface-variant block">
                  Validating against Prisma Identity Vault
                </span>
              </div>
            </>
          )}

          {ticketStatus === 'success' && (
            <>
              <CheckCircle2 className="h-6 w-6 text-secondary" />
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold text-secondary block">
                  Cryptographic Verification Cleared
                </span>
                <span className="text-[11px] text-on-surface-variant block">
                  Welcome, <strong className="text-on-surface">{user?.fullName || 'Institutional Mandate'}</strong>
                </span>
              </div>
            </>
          )}

          {ticketStatus === 'error' && (
            <>
              <AlertCircle className="h-6 w-6 text-error" />
              <div className="space-y-1">
                <span className="text-xs font-mono font-semibold text-error block">
                  Ticket Exchange Error
                </span>
                <span className="text-[11px] text-on-surface-variant block">
                  {errorMessage || ticketExchangeError || 'Invalid or expired single-use ticket.'}
                </span>
              </div>
            </>
          )}
        </div>

        {ticketStatus === 'error' && (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="default"
                size="default"
                className="font-mono text-xs"
                onClick={() => {
                  const landingUrl = typeof window !== 'undefined'
                    ? (import.meta.env.VITE_LANDING_URL || `${window.location.protocol}//${window.location.hostname}:5173`)
                    : 'http://localhost:5173';
                  if (typeof window !== 'undefined') {
                    window.location.href = `${landingUrl}/?auth=signin`;
                  }
                }}
              >
                Sign In Again
              </Button>
              <Button
                variant="goldOutline"
                size="default"
                className="font-mono text-xs"
                onClick={() => {
                  const landingUrl = typeof window !== 'undefined'
                    ? (import.meta.env.VITE_LANDING_URL || `${window.location.protocol}//${window.location.hostname}:5173`)
                    : 'http://localhost:5173';
                  if (typeof window !== 'undefined') {
                    window.location.href = `${landingUrl}/?auth=mandate`;
                  }
                }}
              >
                Request Mandate
              </Button>
            </div>
            <div className="pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-on-surface-variant hover:text-on-surface text-[11px] font-mono"
                onClick={() => {
                  const landingUrl = typeof window !== 'undefined'
                    ? (import.meta.env.VITE_LANDING_URL || `${window.location.protocol}//${window.location.hostname}:5173`)
                    : 'http://localhost:5173';
                  if (typeof window !== 'undefined') {
                    window.location.href = landingUrl;
                  }
                }}
              >
                Return to Terminal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
