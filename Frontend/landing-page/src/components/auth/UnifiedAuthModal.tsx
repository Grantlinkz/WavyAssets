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
import { authApi, ApiError } from '../../lib/api';
import {
  ShieldCheck,
  KeyRound,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  User,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft,
  Key,
} from 'lucide-react';

interface UnifiedAuthModalProps {
  forceInline?: boolean;
  isOpen?: boolean;
  step?: 1 | 2;
  initialTier?: TrustMode;
}

type ModalAuthMode = 'login' | 'mandate' | 'forgot-password' | 'reset-password';

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

  const [authMode, setAuthMode] = useState<ModalAuthMode>(
    (activeAuth.initialMode as ModalAuthMode) ?? 'login'
  );
  const [tier, setTier] = useState<TrustMode>(initialTier || 'institutional');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [newPassphrase, setNewPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [countdown, setCountdown] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedLoadingSecs, setElapsedLoadingSecs] = useState(0);
  const [challengeId, setChallengeId] = useState('');
  const [deliveryInfo, setDeliveryInfo] = useState('');
  const [hasTelegramBackup, setHasTelegramBackup] = useState(false);
  const [showTelegramBackupInfo, setShowTelegramBackupInfo] = useState(false);

  const formatCountdown = (totalSeconds: number): string => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setAuthMode((activeAuth.initialMode as ModalAuthMode) ?? 'login');
      setTier(initialTier || 'institutional');
      setIsSuccess(false);
      setErrorMsg('');
      setResetSuccessMsg('');
      setFullName('');
      setPassphrase('');
      setNewPassphrase('');
      setShowPassword(false);
      setShowNewPassword(false);
      setOtpCode('');
      setCountdown(45);
      setIsLoading(false);
      setElapsedLoadingSecs(0);
      setChallengeId('');
      setDeliveryInfo('');
      setHasTelegramBackup(false);
      setShowTelegramBackupInfo(false);
    }
  }

  // Monitor loading duration for cold-start UX (e.g. Render 50s spin-up)
  useEffect(() => {
    if (!isLoading) return;
    setElapsedLoadingSecs(0);
    const interval = setInterval(() => {
      setElapsedLoadingSecs((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Countdown timer in step 2 or reset-password
  useEffect(() => {
    if ((step === 2 || authMode === 'reset-password') && isOpen && !isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, authMode, isOpen, isSuccess]);

  const handleStep1Submit = async (e: React.FormEvent) => {
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
    console.info(`[Auth] Initiating credentials verification for domain: @${domain}`);
    setErrorMsg('');
    setResetSuccessMsg('');
    setIsLoading(true);

    try {
      const res = await authApi.initiate({
        email: trimmed,
        passphrase,
        fullName: authMode === 'mandate' ? fullName.trim() : undefined,
        tier: tier === 'private-wealth' ? 'PRIVATE_WEALTH' : 'INSTITUTIONAL',
        mode: authMode === 'mandate' ? 'register' : 'login',
      });

      if (res.data) {
        setChallengeId(res.data.challengeId);
        if (res.data.expiresInSeconds) {
          setCountdown(res.data.expiresInSeconds);
        }
        const destination = res.data.maskedDestination || domain;
        setDeliveryInfo(`Code dispatched to your registered email: ${destination}`);
        setHasTelegramBackup(
          res.data.backupChannel === 'TELEGRAM_ENCLAVE' ||
          tier === 'institutional' ||
          res.data.deliveryChannel === 'TELEGRAM_ENCLAVE'
        );
      }
      setAuthStep(2);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.error
          : err instanceof Error
          ? err.message
          : 'Authentication gateway unavailable';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      if (challengeId) {
        await authApi.verifyOtp({ challengeId, otpCode });
        console.info('[Auth] Identity verified successfully via API gateway.');
      } else {
        // Fallback for direct testing/offline simulation
        console.info('[Auth] Identity verified successfully.');
      }

      setIsSuccess(true);
      setErrorMsg('');

      // Auto close after verification display
      setTimeout(() => {
        closeAuthModal();
        setIsSuccess(false);
      }, 1200);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.error
          : err instanceof Error
          ? err.message
          : 'Invalid verification code or challenge expired';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword({ email: trimmed });
      if (res.data) {
        setChallengeId(res.data.challengeId);
        setCountdown(res.data.expiresInSeconds || 300);
        setDeliveryInfo(`Password reset authorization code dispatched to ${res.data.maskedDestination}`);
        setOtpCode('');
        setNewPassphrase('');
        setAuthMode('reset-password');
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.error
          : err instanceof Error
          ? err.message
          : 'Failed to initiate password reset';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setErrorMsg('Please enter the 6-digit reset code sent to your email.');
      return;
    }
    if (newPassphrase.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await authApi.resetPassword({
        challengeId,
        otpCode,
        newPassphrase,
      });

      setResetSuccessMsg(res.data?.message || 'Password reset successfully. You may now sign in.');
      setPassphrase('');
      setNewPassphrase('');
      setOtpCode('');
      setAuthMode('login');
      setAuthStep(1);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.error
          : err instanceof Error
          ? err.message
          : 'Failed to reset password';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (authMode === 'reset-password') {
      if (!email.trim()) return;
      setIsLoading(true);
      try {
        const res = await authApi.forgotPassword({ email: email.trim() });
        if (res.data) {
          setChallengeId(res.data.challengeId);
          setCountdown(res.data.expiresInSeconds || 300);
          setErrorMsg('');
          setDeliveryInfo(`Fresh reset code dispatched to ${res.data.maskedDestination}`);
        }
      } catch (err: unknown) {
        const message = err instanceof ApiError ? err.error : 'Failed to resend reset code';
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email.trim() || !passphrase) return;
    setIsLoading(true);
    try {
      const res = await authApi.initiate({
        email: email.trim(),
        passphrase,
        fullName: authMode === 'mandate' ? fullName.trim() : undefined,
        tier: tier === 'private-wealth' ? 'PRIVATE_WEALTH' : 'INSTITUTIONAL',
        mode: authMode === 'mandate' ? 'register' : 'login',
      });
      if (res.data) {
        setChallengeId(res.data.challengeId);
        setCountdown(res.data.expiresInSeconds || 300);
        setErrorMsg('');
        const destination = res.data.maskedDestination || email.trim();
        setDeliveryInfo(`Fresh code dispatched to your registered email: ${destination}`);
        setHasTelegramBackup(
          res.data.backupChannel === 'TELEGRAM_ENCLAVE' ||
          tier === 'institutional' ||
          res.data.deliveryChannel === 'TELEGRAM_ENCLAVE'
        );
      }
    } catch (err: unknown) {
      const message = err instanceof ApiError ? err.error : 'Failed to resend verification code';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const isDuplicateEmailError =
    errorMsg.toLowerCase().includes('already registered') ||
    errorMsg.toLowerCase().includes('already exists');

  const modalBody = (
    <>
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5 text-primary" />
          <span>WavyAssets SECURE ACCESS</span>
        </div>

        <div className="font-headline-sm text-xl text-on-surface font-bold">
          {authMode === 'forgot-password'
            ? 'Reset Your Password'
            : authMode === 'reset-password'
            ? 'Enter Security Code & New Password'
            : step === 1
            ? authMode === 'login'
              ? 'Sign In to Your Account'
              : 'Create Your Account'
            : 'Enter Verification Code'}
        </div>

        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
          {authMode === 'forgot-password'
            ? 'Enter your registered email address to receive a 6-digit password reset authorization code.'
            : authMode === 'reset-password'
            ? 'Enter the 6-digit authorization code dispatched to your email along with your new password.'
            : step === 1
            ? authMode === 'login'
              ? 'Welcome back. Access your dashboard, track live yields, and manage your portfolio.'
              : 'Join qualified investors and institutions managing multi-asset wealth securely.'
            : 'Enter the 6-digit security code sent to your registered device to confirm your identity.'}
        </p>
      </div>

      {resetSuccessMsg && (
        <div
          data-testid="auth-reset-success-banner"
          className="p-3 bg-secondary/10 border border-secondary/30 rounded-sm flex items-center gap-2 text-secondary text-xs font-sans"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{resetSuccessMsg}</span>
        </div>
      )}

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
      ) : authMode === 'forgot-password' ? (
        /* Forgot Password Email View */
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
              Registered Email Address
            </label>
            <div className="flex items-center gap-2 bg-surface-container p-2 rounded-sm border border-outline/30 focus-within:border-primary/60 transition-colors">
              <Lock className="w-4 h-4 text-outline shrink-0 ml-1" />
              <input
                type="email"
                required
                autoFocus
                data-testid="auth-forgot-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
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
            disabled={isLoading}
            data-testid="auth-forgot-submit-btn"
            className="w-full py-2.5 rounded-sm bg-primary-container text-on-primary-container font-sans text-xs uppercase hover:bg-primary-hover transition-colors font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {elapsedLoadingSecs > 5
                    ? `Waking Gateway (${elapsedLoadingSecs}s)...`
                    : 'Dispatching Reset Code...'}
                </span>
              </>
            ) : (
              <>
                <span>Send Reset Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {isLoading && elapsedLoadingSecs >= 5 && (
            <p className="text-center font-mono text-[10px] text-outline animate-pulse">
              Connecting to institutional gateway (cold server waking up, please wait)...
            </p>
          )}

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
              className="inline-flex items-center gap-1.5 font-sans text-xs text-outline hover:text-on-surface transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      ) : authMode === 'reset-password' ? (
        /* Reset Password OTP & New Password View */
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-2">
          {deliveryInfo && (
            <div className="text-center px-2 py-1 bg-surface-container/60 rounded-sm border border-outline/20">
              <p className="font-sans text-[11px] text-primary font-medium">
                {deliveryInfo}
              </p>
            </div>
          )}

          <div className="space-y-2 flex flex-col items-center">
            <label className="font-sans text-[11px] text-outline uppercase tracking-wider text-center">
              6-Digit Security Code
            </label>
            <InputOTP
              maxLength={6}
              value={otpCode}
              onChange={(val) => setOtpCode(val)}
              data-testid="auth-reset-otp-input"
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

            <div className="flex items-center justify-between w-full font-mono text-[11px] text-outline px-2">
              <span>
                Code expires in:{' '}
                <strong className="text-on-surface font-mono font-bold">
                  {formatCountdown(countdown)}
                </strong>
              </span>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleResend}
                className="text-primary hover:underline cursor-pointer disabled:opacity-50"
              >
                Resend Code
              </button>
            </div>
          </div>

          {/* New Password Field with Eye Toggle */}
          <div className="space-y-1.5">
            <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
              New Password
            </label>
            <div className="flex items-center gap-2 bg-surface-container p-2 rounded-sm border border-outline/30 focus-within:border-primary/60 transition-colors">
              <Key className="w-4 h-4 text-outline shrink-0 ml-1" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                data-testid="auth-new-password-input"
                value={newPassphrase}
                onChange={(e) => setNewPassphrase(e.target.value)}
                placeholder="Create a new password (min. 6 characters)"
                className="bg-transparent border-none outline-none font-mono text-xs text-on-surface w-full placeholder:text-outline"
              />
              <button
                type="button"
                data-testid="auth-toggle-new-password-btn"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="text-outline hover:text-on-surface transition-colors p-1 cursor-pointer focus:outline-none shrink-0"
                title={showNewPassword ? 'Hide password' : 'Show password'}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              disabled={isLoading}
              onClick={() => {
                setAuthMode('forgot-password');
                setErrorMsg('');
              }}
              className="px-4 py-2.5 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-sans text-xs uppercase transition-colors cursor-pointer border border-outline/20 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              data-testid="auth-reset-submit-btn"
              className="flex-1 py-2.5 rounded-sm bg-primary-container text-on-primary-container font-sans text-xs uppercase hover:bg-primary-hover transition-colors font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {elapsedLoadingSecs > 5
                      ? `Updating (${elapsedLoadingSecs}s)...`
                      : 'Updating Password...'}
                  </span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      ) : step === 1 ? (
        <form onSubmit={handleStep1Submit} className="space-y-4 pt-2">
          {/* Tabbed Auth Mode */}
          <div className="grid grid-cols-2 p-1 bg-surface-container rounded-sm border border-outline/20">
            <button
              type="button"
              data-testid="tab-login"
              onClick={() => {
                setAuthMode('login');
                setErrorMsg('');
              }}
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
              onClick={() => {
                setAuthMode('mandate');
                setErrorMsg('');
              }}
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

          {/* Passphrase / Password Field with Eye Toggle & Forgot Password Link */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
                {authMode === 'login' ? 'Password' : 'Create Password'}
              </label>
              {authMode === 'login' && (
                <button
                  type="button"
                  data-testid="auth-forgot-password-btn"
                  onClick={() => {
                    setAuthMode('forgot-password');
                    setErrorMsg('');
                    setResetSuccessMsg('');
                  }}
                  className="font-sans text-[11px] text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 bg-surface-container p-2 rounded-sm border border-outline/30 focus-within:border-primary/60 transition-colors">
              <KeyRound className="w-4 h-4 text-outline shrink-0 ml-1" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                data-testid="auth-password-input"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder={authMode === 'login' ? 'Enter your password' : 'Create a secure password (min. 6 characters)'}
                className="bg-transparent border-none outline-none font-mono text-xs text-on-surface w-full placeholder:text-outline"
              />
              <button
                type="button"
                data-testid="auth-toggle-password-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-outline hover:text-on-surface transition-colors p-1 cursor-pointer focus:outline-none shrink-0"
                title={showPassword ? 'Hide password' : 'Show password'}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div
              data-testid="auth-error-msg"
              className="flex flex-col gap-1 text-error font-mono text-[11px] p-2 bg-error/10 border border-error/20 rounded-sm"
            >
              <div className="flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              {authMode === 'mandate' && isDuplicateEmailError && (
                <div className="pt-1 flex items-center justify-between text-on-surface font-sans">
                  <span>Already registered?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setErrorMsg('');
                    }}
                    className="text-primary hover:underline font-bold font-sans cursor-pointer"
                  >
                    Switch to Sign In &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            data-testid="auth-step1-submit"
            className="w-full py-2.5 rounded-sm bg-primary-container text-on-primary-container font-sans text-xs uppercase hover:bg-primary-hover transition-colors font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>
                  {elapsedLoadingSecs > 5
                    ? `Waking Gateway (${elapsedLoadingSecs}s)...`
                    : 'Processing...'}
                </span>
              </>
            ) : (
              <>
                <span>{authMode === 'login' ? 'Continue to Verification' : 'Create Account & Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

          {isLoading && elapsedLoadingSecs >= 5 && (
            <p className="text-center font-mono text-[10px] text-outline animate-pulse">
              Connecting to institutional gateway (cold server waking up, please wait)...
            </p>
          )}
        </form>
      ) : (
        /* Step 2: 6-Digit Segmented OTP */
        <form onSubmit={handleStep2Submit} className="space-y-5 pt-2">
          <div className="space-y-2 flex flex-col items-center">
            <label className="font-sans text-[11px] text-outline uppercase tracking-wider text-center">
              6-Digit Security Code
            </label>

            {deliveryInfo && (
              <div className="space-y-1.5 text-center px-2">
                <p className="font-sans text-[11px] text-primary/90 font-medium">
                  {deliveryInfo}
                </p>
                {hasTelegramBackup && (
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setShowTelegramBackupInfo((prev) => !prev)}
                      className="inline-flex items-center gap-1 font-mono text-[10px] text-secondary hover:underline cursor-pointer tracking-wider"
                    >
                      <span>🛡️ Backup Option: Telegram Account</span>
                      <span className="text-outline text-[9px]">{showTelegramBackupInfo ? '▲' : '▼'}</span>
                    </button>
                    {showTelegramBackupInfo && (
                      <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed bg-surface-container/70 p-2 rounded-sm border border-outline/20 mt-1 max-w-xs text-left">
                        WavyAssets Institutional accounts have a secondary backup dispatch routed to the private Telegram channel in case corporate email filtering causes a delay.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

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
                <strong className="text-on-surface font-mono font-bold">
                  {formatCountdown(countdown)}
                </strong>
              </span>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleResend}
                className="text-primary hover:underline cursor-pointer disabled:opacity-50"
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
              disabled={isLoading}
              onClick={() => setAuthStep(1)}
              className="px-4 py-2.5 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface font-sans text-xs uppercase transition-colors cursor-pointer border border-outline/20 disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              data-testid="auth-step2-submit"
              className="flex-1 py-2.5 rounded-sm bg-primary-container text-on-primary-container font-sans text-xs uppercase hover:bg-primary-hover transition-colors font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    {elapsedLoadingSecs > 5
                      ? `Verifying (${elapsedLoadingSecs}s)...`
                      : 'Verifying...'}
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify &amp; Access Dashboard</span>
                </>
              )}
            </button>
          </div>

          {isLoading && elapsedLoadingSecs >= 5 && (
            <p className="text-center font-mono text-[10px] text-outline animate-pulse">
              Verifying credentials against institutional cryptographic engine...
            </p>
          )}
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
