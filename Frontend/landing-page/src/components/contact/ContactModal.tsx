import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '../ui/dialog';
import { useTerminalStore } from '../../store/useTerminalStore';
import { ContactSentinelGraphic } from './ContactSentinelGraphic';
import {
  X,
  Send,
  User,
  Mail,
  Building,
  Globe,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { leadsApi, ApiError, type LeadInquiryPayload } from '../../lib/api';
import { motion } from 'framer-motion';

export interface ContactModalProps {
  forceInline?: boolean;
  isOpen?: boolean;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  forceInline,
  isOpen: propIsOpen,
}) => {
  const storeIsOpen = useTerminalStore((state) => state.isContactModalOpen);
  const closeContactModal = useTerminalStore((state) => state.closeContactModal);

  // In SSR / Node testing where getServerSnapshot defaults to initialState, fall back to getState()
  const isServerOrMock =
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof document.createElement === 'undefined';

  const activeIsOpen = isServerOrMock
    ? useTerminalStore.getState().isContactModalOpen
    : storeIsOpen;

  const isOpen = propIsOpen ?? activeIsOpen;

  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [telegram, setTelegram] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [service, setService] = useState('PSP & Global Settlement');
  const [allocation, setAllocation] = useState('€500k - €3M');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!isLoading) return;
    const timer = setInterval(() => setElapsedSecs((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [isLoading]);

  const mapServiceToBackend = (serviceStr: string): LeadInquiryPayload['service'] => {
    switch (serviceStr) {
      case 'Crypto Yield Aggregation':
        return 'CRYPTO';
      case 'Global Stocks DMA':
        return 'STOCKS';
      case 'AI Systematic Funds':
        return 'AI_FUNDS';
      case 'Tokenized Real Estate':
        return 'REAL_ESTATE';
      case 'VIP Metal Cards':
        return 'VIP_CARDS';
      case 'Institutional Custody & MPC':
        return 'WALLET';
      default:
        return 'WALLET';
    }
  };

  const mapAllocationToBackend = (allocStr: string): LeadInquiryPayload['allocationRange'] => {
    if (allocStr.includes('€500 -') || allocStr.includes('500k')) return '$500K - $1M';
    if (allocStr.includes('$3M') || allocStr.includes('$1M')) return '$1M - $5M';
    if (allocStr.includes('$10M - $50M')) return '$5M - $10M';
    if (allocStr.includes('>$50M')) return '$10M+';
    return 'CUSTOM';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    const trimmedEmail = workEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    if (!companyName.trim()) {
      setErrorMsg('Please enter your company or fund name.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Please agree to the privacy policy to submit.');
      return;
    }

    const domain = trimmedEmail.split('@')[1] || 'domain.com';
    console.info(`[Contact] Ingesting inquiry for domain: @${domain}`);

    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await leadsApi.submitInquiry({
        fullName: fullName.trim(),
        workEmail: trimmedEmail,
        companyName: companyName.trim(),
        websiteUrl: websiteUrl.trim() || undefined,
        telegram: telegram.trim() || undefined,
        service: mapServiceToBackend(service),
        allocationRange: mapAllocationToBackend(allocation),
      });

      setSuccessMessage(
        res.data?.message ||
          'We received your message and will get back to you shortly. A confirmation has been sent to your email.'
      );
      setIsSuccess(true);

      setTimeout(() => {
        closeContactModal();
        setIsSuccess(false);
        setFullName('');
        setWorkEmail('');
        setTelegram('');
        setCompanyName('');
        setWebsiteUrl('');
        setSuccessMessage('');
      }, 4000);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.error
          : err instanceof Error
          ? err.message
          : 'Failed to record mandate inquiry. Please try again.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalBody = (
    <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 bg-white dark:bg-[#08090B] text-slate-900 dark:text-on-surface rounded-md border border-slate-200 dark:border-outline/30 overflow-hidden shadow-2xl">
      {/* Absolute Close Button */}
      <button
        type="button"
        data-testid="contact-modal-close-btn"
        onClick={closeContactModal}
        className="absolute top-3 right-3 z-30 p-1.5 rounded-sm bg-slate-100 hover:bg-slate-200 dark:bg-surface-container/60 dark:hover:bg-surface-container text-slate-600 hover:text-slate-900 dark:text-on-surface-variant dark:hover:text-on-surface transition-colors cursor-pointer border border-slate-200 dark:border-outline/20"
        aria-label="Close Contact Modal"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Left Column: Contact Form (7 cols on desktop) */}
      <div className="lg:col-span-7 p-4 sm:p-5 lg:p-6 flex flex-col justify-between space-y-4 relative z-10">
        <div className="space-y-2">
          {/* Top Security Telemetry Tag */}
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>WAVYASSETS INSTITUTIONAL INQUIRY</span>
          </div>

          {/* Headline */}
          <div className="space-y-0.5">
            <h2 className="font-headline-lg text-lg sm:text-xl lg:text-2xl text-slate-900 dark:text-on-surface font-extrabold uppercase tracking-tight leading-tight">
              Fill out form and <br className="hidden sm:inline" />
              we contact you
            </h2>
          </div>

          <p className="font-sans text-[11px] text-slate-600 dark:text-on-surface-variant leading-relaxed">
            Direct institutional onboarding and multi-asset mandate consultation for funds, family
            offices, and qualified corporate treasuries.
          </p>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            data-testid="contact-success-banner"
            className="p-6 bg-secondary/10 border border-secondary/30 rounded-sm flex flex-col items-center justify-center text-center gap-2.5 my-2"
          >
            <CheckCircle2 className="w-10 h-10 text-[#A6FF00] animate-bounce" />
            <div className="font-headline-sm text-base text-slate-900 dark:text-on-surface font-bold">
              We Received Your Message
            </div>
            <p className="font-sans text-[11px] text-slate-600 dark:text-on-surface-variant max-w-sm">
              {successMessage ||
                'We received your message and will get back to you shortly. A confirmation has been sent to your email.'}
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5 pt-0.5">
            {/* 1. Full Name */}
            <div className="space-y-1">
              <label className="font-sans text-[10px] text-slate-500 dark:text-outline uppercase tracking-wider block">
                Full name
              </label>
              <div className="flex items-center gap-2 bg-[#F4F6FB] dark:bg-[#0F1115] px-2.5 py-1.5 rounded-sm border border-slate-200 dark:border-outline/30 focus-within:border-[#A6FF00] dark:focus-within:border-[#A6FF00]/70 transition-colors">
                <User className="w-3.5 h-3.5 text-slate-400 dark:text-outline shrink-0" />
                <input
                  type="text"
                  required
                  data-testid="contact-fullname-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Henrik Lindqvist"
                  className="bg-transparent border-none outline-none font-sans text-xs text-slate-900 dark:text-on-surface w-full placeholder:text-slate-400 dark:placeholder:text-outline/70"
                />
              </div>
            </div>

            {/* 2. Work Email & Telegram (Two Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-sans text-[10px] text-slate-500 dark:text-outline uppercase tracking-wider block">
                  Work email
                </label>
                <div className="flex items-center gap-2 bg-[#F4F6FB] dark:bg-[#0F1115] px-2.5 py-1.5 rounded-sm border border-slate-200 dark:border-outline/30 focus-within:border-[#A6FF00] dark:focus-within:border-[#A6FF00]/70 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-outline shrink-0" />
                  <input
                    type="email"
                    required
                    data-testid="contact-email-input"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="director@fund.com"
                    className="bg-transparent border-none outline-none font-mono text-xs text-slate-900 dark:text-on-surface w-full placeholder:text-slate-400 dark:placeholder:text-outline/70"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-sans text-[10px] text-slate-500 dark:text-outline uppercase tracking-wider block">
                  Telegram / Direct Handle
                </label>
                <div className="flex items-center gap-2 bg-[#F4F6FB] dark:bg-[#0F1115] px-2.5 py-1.5 rounded-sm border border-slate-200 dark:border-outline/30 focus-within:border-[#A6FF00] dark:focus-within:border-[#A6FF00]/70 transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 dark:text-outline shrink-0" />
                  <input
                    type="text"
                    data-testid="contact-telegram-input"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@institutional_lead"
                    className="bg-transparent border-none outline-none font-mono text-xs text-slate-900 dark:text-on-surface w-full placeholder:text-slate-400 dark:placeholder:text-outline/70"
                  />
                </div>
              </div>
            </div>

            {/* 3. Company Name */}
            <div className="space-y-1">
              <label className="font-sans text-[10px] text-slate-500 dark:text-outline uppercase tracking-wider block">
                Company name
              </label>
              <div className="flex items-center gap-2 bg-[#F4F6FB] dark:bg-[#0F1115] px-2.5 py-1.5 rounded-sm border border-slate-200 dark:border-outline/30 focus-within:border-[#A6FF00] dark:focus-within:border-[#A6FF00]/70 transition-colors">
                <Building className="w-3.5 h-3.5 text-slate-400 dark:text-outline shrink-0" />
                <input
                  type="text"
                  required
                  data-testid="contact-company-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Zurich Alpha Capital AG"
                  className="bg-transparent border-none outline-none font-sans text-xs text-slate-900 dark:text-on-surface w-full placeholder:text-slate-400 dark:placeholder:text-outline/70"
                />
              </div>
            </div>

            {/* 4. Website / Company URL */}
            <div className="space-y-1">
              <label className="font-sans text-[10px] text-slate-500 dark:text-outline uppercase tracking-wider block">
                Website / company URL
              </label>
              <div className="flex items-center gap-2 bg-[#F4F6FB] dark:bg-[#0F1115] px-2.5 py-1.5 rounded-sm border border-slate-200 dark:border-outline/30 focus-within:border-[#A6FF00] dark:focus-within:border-[#A6FF00]/70 transition-colors">
                <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-outline shrink-0" />
                <input
                  type="text"
                  data-testid="contact-website-input"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://alphacapital.ch"
                  className="bg-transparent border-none outline-none font-mono text-xs text-slate-900 dark:text-on-surface w-full placeholder:text-slate-400 dark:placeholder:text-outline/70"
                />
              </div>
            </div>

            {/* 5. Two Dropdowns (Solution Focus & Allocation Range) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-sans text-[10px] text-slate-500 dark:text-outline uppercase tracking-wider block">
                  Service / Solution
                </label>
                <div className="relative">
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    data-testid="contact-service-select"
                    className="w-full bg-[#F4F6FB] dark:bg-[#0F1115] px-2.5 py-1.5 rounded-sm border border-slate-200 dark:border-outline/30 text-xs text-slate-900 dark:text-on-surface font-sans appearance-none focus:border-[#A6FF00] dark:focus:border-[#A6FF00]/70 outline-none pr-8 cursor-pointer"
                  >
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="PSP & Global Settlement">PSP &amp; Global Settlement</option>
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="Institutional Custody & MPC">Institutional Custody &amp; MPC</option>
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="Crypto Yield Aggregation">Crypto Yield Aggregation</option>
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="Global Stocks DMA">Global Stocks DMA</option>
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="AI Systematic Funds">AI Systematic Funds</option>
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="Tokenized Real Estate">Tokenized Real Estate</option>
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="VIP Metal Cards">VIP Metal Cards</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-outline absolute right-2 top-2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-sans text-[10px] text-slate-500 dark:text-outline uppercase tracking-wider block">
                  Allocation range
                </label>
                <div className="relative">
                  <select
                    value={allocation}
                    onChange={(e) => setAllocation(e.target.value)}
                    data-testid="contact-allocation-select"
                    className="w-full bg-[#F4F6FB] dark:bg-[#0F1115] px-2.5 py-1.5 rounded-sm border border-slate-200 dark:border-outline/30 text-xs text-slate-900 dark:text-on-surface font-mono appearance-none focus:border-[#A6FF00] dark:focus:border-[#A6FF00]/70 outline-none pr-8 cursor-pointer"
                  >
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="€500 - €3M">€500 - €3M</option>
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="€500k - €3M">€500k - €3M</option>
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="$3M - $10M">$3M - $10M</option>
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value="$10M - $50M">$10M - $50M</option>
                    <option className="bg-white dark:bg-[#0F1115] text-slate-900 dark:text-on-surface" value=">$50M Sovereign">&gt;$50M Sovereign</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-outline absolute right-2 top-2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Error Message if Any */}
            {errorMsg && (
              <div
                data-testid="contact-error-msg"
                className="flex items-center gap-1.5 text-error font-mono text-[10px] p-2 bg-error/10 border border-error/20 rounded-sm"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Bar: High-Visibility SEND button + Consent Disclaimer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <motion.button
                type="submit"
                disabled={isLoading}
                data-testid="contact-submit-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-6 py-2 rounded-sm bg-[#A6FF00] hover:bg-[#b8ff1a] text-black font-mono font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(166,255,0,0.35)] flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{elapsedSecs > 5 ? `SENDING (${elapsedSecs}s)...` : 'SENDING...'}</span>
                  </>
                ) : (
                  <>
                    <span>SEND</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </motion.button>

              {isLoading && elapsedSecs >= 5 && (
                <p className="text-[10px] font-mono text-outline animate-pulse w-full">
                  Connecting to institutional gateway (cold server waking up, please wait)...
                </p>
              )}

              <label className="text-[10px] text-slate-600 dark:text-on-surface-variant font-sans leading-tight flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded-sm accent-[#A6FF00] cursor-pointer"
                />
                <span>Sending this form I agree privacy policy and cookies.</span>
              </label>
            </div>
          </form>
        )}
      </div>

      {/* Right Column: Textured Sentinel Mascot (5 cols on desktop) */}
      <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center bg-[#EDF2FB] dark:bg-[#07080A] border-l border-slate-200 dark:border-outline/20">
        <ContactSentinelGraphic />
      </div>
    </div>
  );

  const isHeadless =
    forceInline ||
    typeof document === 'undefined' ||
    typeof (document as unknown as { body?: { appendChild?: unknown } }).body?.appendChild === 'undefined';

  if (isHeadless) {
    return (
      <div
        data-testid="contact-modal"
        className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto"
      >
        <div className="max-w-lg sm:max-w-2xl lg:max-w-3xl w-full max-h-[90dvh] sm:max-h-[88vh] overflow-y-auto my-auto overscroll-contain">{modalBody}</div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeContactModal()}>
      <DialogContent
        data-testid="contact-modal"
        showCloseButton={false}
        className="p-0 border-none bg-transparent shadow-none !max-w-lg sm:!max-w-2xl lg:!max-w-3xl w-[92vw] sm:w-[86vw] max-h-[90dvh] sm:max-h-[88vh] overflow-y-auto outline-none block overscroll-contain"
      >
        {modalBody}
      </DialogContent>
    </Dialog>
  );
};
