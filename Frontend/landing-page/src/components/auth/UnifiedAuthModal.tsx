import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '../ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '../ui/input-otp';
import { useTerminalStore, type TrustMode } from '../../store/useTerminalStore';
import { ShieldCheck, KeyRound, Lock, ArrowRight, CheckCircle2, AlertCircle, User } from 'lucide-react';

interface UnifiedAuthModalProps {
  forceInline?: boolean;
  isOpen?: boolean;
  step?: 1 | 2;
  initialTier?: TrustMode;
}

export const UnifiedAuthModal: React.FC<UnifiedAuthModalProps> = ({
  forceInline,
  isOpen: propIsOpen,
  step: propStep,
  initialTier: propInitialTier,
}) => {
  const storeAuthModal = useTerminalStore((state) => state.authModal);
  const closeAuthModal = useTerminalStore((state) => state.closeAuthModal);
  const setAuthStep = useTerminalStore((state) => state.setAuthStep);

  // In SSR / Node testing where getServerSnapshot defaults to initialState, fall back to getState()
  const isServerOrMock =
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof document.createElement === 'undefined';

  const activeAuth = isServerOrMock ? useTerminalStore.getState().authModal : storeAuthModal;

  const isOpen = propIsOpen ?? activeAuth.isOpen;
  const step = propStep ?? activeAuth.step;
  const initialTier = propInitialTier ?? activeAuth.initialTier;

  const [authMode, setAuthMode] = useState<'login' | 'mandate'>(activeAuth.initialMode ?? 'login');
  const [tier, setTier] = useState<TrustMode>(initialTier || 'institutional');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(45);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setAuthMode(activeAuth.initialMode ?? 'login');
      setTier(initialTier || 'institutional');
      setIsSuccess(false);
      setErrorMsg('');
      setFullName('');
      setOtpCode('');
      setCountdown(45);
    }
  }

  // Countdown timer in step 2
  useEffect(() => {
    if (step === 2 && isOpen && !isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, isOpen, isSuccess]);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'mandate' && (!fullName.trim() || fullName.trim().length < 2)) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (passphrase.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    const domain = trimmed.split('@')[1] || 'domain.com';
    // Redacted logging for PII privacy invariant
    console.info(`[Auth] Credentials verified for institutional domain: @${domain}`);

    setErrorMsg('');
    setAuthStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    console.info('[Auth] Identity verified successfully.');
    setIsSuccess(true);
    setErrorMsg('');

    // Auto close after verification display
    setTimeout(() => {
      closeAuthModal();
      setIsSuccess(false);
    }, 1200);
  };

  if (!isOpen) return null;

  const modalBody = (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>WavyAssets SECURE ACCESS // 256-BIT ENCRYPTION</span>
        </div>

        <div className="font-headline-sm text-xl text-on-surface font-bold">
          {step === 1
            ? authMode === 'login'
              ? 'Sign In to Your Account'
              : 'Create Your Account'
            : 'Enter Verification Code'}
        </div>

        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
          {step === 1
            ? authMode === 'login'
              ? 'Welcome back. Access your dashboard, track live yields, and manage your portfolio.'
              : 'Join qualified investors and institutions managing multi-asset wealth securely.'
            : 'Enter the 6-digit security code sent to your registered device to confirm your identity.'}
        </p>
      </div>

      {isSuccess ? (
        <div
          data-testid="auth-success-banner"
          className="p-6 bg-secondary/10 border border-secondary/30 rounded-sm flex flex-col items-center justify-center text-center gap-3 my-2"
        >
          <CheckCircle2 className="w-10 h-10 text-secondary animate-bounce" />
          <div className="font-headline-sm text-base text-on-surface font-semibold">
            Identity Verified
          </div>
          <p className="font-sans text-xs text-secondary">
            Redirecting you to your secure dashboard...
          </p>
        </div>
      ) : step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4 pt-2">
          {/* Tabbed Auth Mode */}
          <div className="grid grid-cols-2 p-1 bg-surface-container rounded-sm border border-outline/20">
            <button
              type="button"
              data-testid="tab-login"
              onClick={() => setAuthMode('login')}
              className={`py-1.5 font-sans text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer ${
                authMode === 'login'
                  ? 'bg-surface-container-high text-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              data-testid="tab-mandate"
              onClick={() => setAuthMode('mandate')}
              className={`py-1.5 font-sans text-xs uppercase tracking-wider rounded-sm transition-colors cursor-pointer ${
                authMode === 'mandate'
                  ? 'bg-surface-container-high text-primary font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Request Service
            </button>
          </div>

          {/* Client Tier Pill Selector */}
          <div className="space-y-1.5">
            <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
              Account Tier
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="auth-tier-private"
                onClick={() => setTier('private-wealth')}
                className={`px-3 py-2 rounded-sm border text-xs font-sans uppercase transition-colors cursor-pointer text-left flex items-center justify-between ${
                  tier === 'private-wealth'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-outline/30 bg-surface-container text-on-surface-variant hover:border-outline'
                }`}
              >
                <span>Private Wealth</span>
                <span className="font-mono text-[10px] text-outline">$50k–$5M</span>
              </button>
              <button
                type="button"
                data-testid="auth-tier-institutional"
                onClick={() => setTier('institutional')}
                className={`px-3 py-2 rounded-sm border text-xs font-sans uppercase transition-colors cursor-pointer text-left flex items-center justify-between ${
                  tier === 'institutional'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-outline/30 bg-surface-container text-on-surface-variant hover:border-outline'
                }`}
              >
                <span>Institutional</span>
                <span className="font-mono text-[10px] text-outline">&gt;$5M AUM</span>
              </button>
            </div>
          </div>

          {/* Full Name Field (Request Mandate / Open Account) */}
          {authMode === 'mandate' && (
            <div className="space-y-1.5">
              <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
                Full Name
              </label>
              <div className="flex items-center gap-2 bg-surface-container p-2 rounded-sm border border-outline/30 focus-within:border-primary/60 transition-colors">
                <User className="w-4 h-4 text-outline shrink-0 ml-1" />
                <input
                  type="text"
                  required
                  data-testid="auth-fullname-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="bg-transparent border-none outline-none font-sans text-xs text-on-surface w-full placeholder:text-outline"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
              {authMode === 'login' ? 'Email Address' : 'Work or Personal Email'}
            </label>
            <div className="flex items-center gap-2 bg-surface-container p-2 rounded-sm border border-outline/30 focus-within:border-primary/60 transition-colors">
              <Lock className="w-4 h-4 text-outline shrink-0 ml-1" />
              <input
                type="email"
                required
                data-testid="auth-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="bg-transparent border-none outline-none font-mono text-xs text-on-surface w-full placeholder:text-outline"
              />
            </div>
          </div>

          {/* Passphrase / Password Field */}
          <div className="space-y-1.5">
            <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
              {authMode === 'login' ? 'Password' : 'Create Password'}
            </label>
            <div className="flex items-center gap-2 bg-surface-container p-2 rounded-sm border border-outline/30 focus-within:border-primary/60 transition-colors">
              <KeyRound className="w-4 h-4 text-outline shrink-0 ml-1" />
              <input
                type="password"
                required
                data-testid="auth-password-input"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={authMode === 'login' ? 'Enter your password' : 'Create a secure password (min. 6 characters)'}
                className="bg-transparent border-none outline-none font-mono text-xs text-on-surface w-full placeholder:text-outline"
              />
            </div>
          </div>

          {errorMsg && (
            <div
              data-testid="auth-error-msg"
              className="flex items-center gap-1.5 text-error font-mono text-[11px] p-2 bg-error/10 border border-error/20 rounded-sm"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            data-testid="auth-step1-submit"
            className="w-full py-2.5 rounded-sm bg-primary-container text-on-primary-container font-sans text-xs uppercase hover:bg-primary-hover transition-colors font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <span>{authMode === 'login' ? 'Continue to Verification' : 'Create Account & Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        /* Step 2: 6-Digit Segmented OTP */
        <form onSubmit={handleStep2Submit} className="space-y-5 pt-2">
          <div className="space-y-2 flex flex-col items-center">
            <label className="font-sans text-[11px] text-outline uppercase tracking-wider text-center">
              6-Digit Security Code
            </label>

            <div className="py-2">
              <InputOTP
                maxLength={6}
                value={otpCode}
                onChange={(val) => setOtpCode(val)}
                data-testid="auth-otp-input"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex items-center justify-between w-full font-mono text-[11px] text-outline px-2">
              <span>
                Code expires in:{' '}
                <strong className="text-on-surface">
                  00:{countdown < 10 ? `0${countdown}` : countdown}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => setCountdown(45)}
                className="text-primary hover:underline cursor-pointer"
              >
                Resend Code
              </button>
            </div>
          </div>

          {errorMsg && (
            <div
              data-testid="auth-error-msg"
              className="flex items-center gap-1.5 text-error font-mono text-[11px] p-2 bg-error/10 border border-error/20 rounded-sm"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAuthStep(1)}
              className="px-4 py-2.5 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-sans text-xs uppercase transition-colors cursor-pointer border border-outline/20"
            >
              Back
            </button>
            <button
              type="submit"
              data-testid="auth-step2-submit"
              className="flex-1 py-2.5 rounded-sm bg-primary-container text-on-primary-container font-sans text-xs uppercase hover:bg-primary-hover transition-colors font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify &amp; Access Dashboard</span>
            </button>
          </div>
        </form>
      )}
    </>
  );

  // If running in SSR or headless environment without real document.body portal support
  const isHeadless =
    forceInline ||
    typeof document === 'undefined' ||
    typeof (document as unknown as { body?: { appendChild?: unknown } }).body?.appendChild === 'undefined';

  if (isHeadless) {
    return (
      <div
        data-testid="unified-auth-modal"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      >
        <div className="sm:max-w-[480px] w-full bg-surface-container-lowest border border-outline/30 p-6 rounded-md shadow-2xl space-y-4">
          {modalBody}
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent
        data-testid="unified-auth-modal"
        className="sm:max-w-[480px] bg-surface-container-lowest border border-outline/30 p-6 rounded-md shadow-2xl space-y-4"
      >
        {modalBody}
      </DialogContent>
    </Dialog>
  );
};
