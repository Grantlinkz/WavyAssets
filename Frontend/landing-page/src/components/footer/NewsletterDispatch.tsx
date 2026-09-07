import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const NewsletterDispatch: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    // Basic institutional email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setStatus('error');
      setErrorMessage('Valid institutional email address required.');
      return;
    }

    // In a production terminal, this would invoke a secure authenticated endpoint
    // Redact email for secure logging invariant
    const domain = trimmed.split('@')[1] || 'domain.com';
    console.info(`[Audit] Institutional dispatch subscribed for domain: @${domain}`);

    setStatus('success');
    setErrorMessage('');
    setEmail('');
  };

  return (
    <div className="space-y-3" data-testid="newsletter-dispatch">
      <div className="font-sans text-xs text-primary uppercase tracking-widest font-bold">
        Institutional Dispatch
      </div>
      <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
        Weekly sovereign alpha briefings, regulatory filings, and audited portfolio allocation
        memos.
      </p>

      {status === 'success' ? (
        <div
          data-testid="newsletter-success-msg"
          className="flex items-center gap-2 p-2 bg-secondary/15 border border-secondary/30 rounded-sm text-secondary font-mono text-[11px]"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>PGP public key dispatched. Check your inbox.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="flex items-center gap-2 bg-surface-container p-1 rounded-sm border border-outline/30 focus-within:border-primary/60 transition-colors">
            <Mail className="w-3.5 h-3.5 text-outline ml-1.5 shrink-0" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="allocator@familyoffice.ch"
              data-testid="newsletter-email-input"
              className="bg-transparent border-none outline-none font-mono text-xs text-on-surface px-1.5 w-full placeholder:text-outline"
            />
            <button
              type="submit"
              data-testid="newsletter-submit-btn"
              className="px-3.5 py-1.5 rounded-sm bg-primary-container text-on-primary-container font-sans text-xs uppercase hover:bg-primary-hover transition-colors font-bold shrink-0 cursor-pointer shadow-sm"
            >
              Join
            </button>
          </div>

          {status === 'error' && (
            <div
              data-testid="newsletter-error-msg"
              className="flex items-center gap-1.5 text-error font-mono text-[10px]"
            >
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="font-mono text-[10px] text-outline flex items-center gap-1.5">
            <span>🔒 Encrypted PGP dispatch. Whitelisted institutional emails only.</span>
          </div>
        </form>
      )}
    </div>
  );
};
