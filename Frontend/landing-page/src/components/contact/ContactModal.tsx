import React, { useState } from 'react';
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
} from 'lucide-react';
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

  const handleSubmit = (e: React.FormEvent) => {
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
    // PII Redacted Logging Invariant
    console.info(`[Contact] Inquiry received from corporate domain: @${domain}`);

    setErrorMsg('');
    setIsSuccess(true);

    setTimeout(() => {
      closeContactModal();
      setIsSuccess(false);
      setFullName('');
      setWorkEmail('');
      setTelegram('');
      setCompanyName('');
      setWebsiteUrl('');
    }, 2200);
  };

  if (!isOpen) return null;

  const modalBody = (
    <div className="relative w-full grid grid-cols-1 lg:grid-cols-12 bg-[#08090B] text-on-surface rounded-md border border-outline/30 overflow-hidden shadow-2xl">
      {/* Absolute Close Button */}
      <button
        type="button"
        data-testid="contact-modal-close-btn"
        onClick={closeContactModal}
        className="absolute top-4 right-4 z-30 p-1.5 rounded-sm bg-surface-container/60 hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer border border-outline/20"
        aria-label="Close Contact Modal"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Left Column: Contact Form (7 cols on desktop) */}
      <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6 relative z-10">
        <div className="space-y-3">
          {/* Top Security Telemetry Tag */}
          <div className="flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>WAVYASSETS INSTITUTIONAL INQUIRY</span>
          </div>

          {/* Headline */}
          <div className="space-y-1">
            <h2 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl text-on-surface font-extrabold uppercase tracking-tight leading-tight">
              Fill out form and <br className="hidden sm:inline" />
              we contact you
            </h2>
          </div>

          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Direct institutional onboarding and multi-asset mandate consultation for funds, family
            offices, and qualified corporate treasuries.
          </p>
        </div>

        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            data-testid="contact-success-banner"
            className="p-8 bg-secondary/10 border border-secondary/30 rounded-sm flex flex-col items-center justify-center text-center gap-3 my-4"
          >
            <CheckCircle2 className="w-12 h-12 text-[#A6FF00] animate-bounce" />
            <div className="font-headline-sm text-lg text-on-surface font-bold">
              Inquiry Dispatched Successfully
            </div>
            <p className="font-sans text-xs text-on-surface-variant max-w-sm">
              Your mandate request has been securely routed to our institutional allocations desk. A
              fiduciary director will contact you within 2 business hours.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {/* 1. Full Name */}
            <div className="space-y-1">
              <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
                Full name
              </label>
              <div className="flex items-center gap-2 bg-[#0F1115] px-3 py-2 rounded-sm border border-outline/30 focus-within:border-[#A6FF00]/70 transition-colors">
                <User className="w-4 h-4 text-outline shrink-0" />
                <input
                  type="text"
                  required
                  data-testid="contact-fullname-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Henrik Lindqvist"
                  className="bg-transparent border-none outline-none font-sans text-xs text-on-surface w-full placeholder:text-outline/70"
                />
              </div>
            </div>

            {/* 2. Work Email & Telegram (Two Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
                  Work email
                </label>
                <div className="flex items-center gap-2 bg-[#0F1115] px-3 py-2 rounded-sm border border-outline/30 focus-within:border-[#A6FF00]/70 transition-colors">
                  <Mail className="w-4 h-4 text-outline shrink-0" />
                  <input
                    type="email"
                    required
                    data-testid="contact-email-input"
                    value={workEmail}
                    onChange={(e) => setWorkEmail(e.target.value)}
                    placeholder="director@fund.com"
                    className="bg-transparent border-none outline-none font-mono text-xs text-on-surface w-full placeholder:text-outline/70"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
                  Telegram / Direct Handle
                </label>
                <div className="flex items-center gap-2 bg-[#0F1115] px-3 py-2 rounded-sm border border-outline/30 focus-within:border-[#A6FF00]/70 transition-colors">
                  <MessageSquare className="w-4 h-4 text-outline shrink-0" />
                  <input
                    type="text"
                    data-testid="contact-telegram-input"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@institutional_lead"
                    className="bg-transparent border-none outline-none font-mono text-xs text-on-surface w-full placeholder:text-outline/70"
                  />
                </div>
              </div>
            </div>

            {/* 3. Company Name */}
            <div className="space-y-1">
              <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
                Company name
              </label>
              <div className="flex items-center gap-2 bg-[#0F1115] px-3 py-2 rounded-sm border border-outline/30 focus-within:border-[#A6FF00]/70 transition-colors">
                <Building className="w-4 h-4 text-outline shrink-0" />
                <input
                  type="text"
                  required
                  data-testid="contact-company-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Zurich Alpha Capital AG"
                  className="bg-transparent border-none outline-none font-sans text-xs text-on-surface w-full placeholder:text-outline/70"
                />
              </div>
            </div>

            {/* 4. Website / Company URL */}
            <div className="space-y-1">
              <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
                Website / company URL
              </label>
              <div className="flex items-center gap-2 bg-[#0F1115] px-3 py-2 rounded-sm border border-outline/30 focus-within:border-[#A6FF00]/70 transition-colors">
                <Globe className="w-4 h-4 text-outline shrink-0" />
                <input
                  type="text"
                  data-testid="contact-website-input"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://alphacapital.ch"
                  className="bg-transparent border-none outline-none font-mono text-xs text-on-surface w-full placeholder:text-outline/70"
                />
              </div>
            </div>

            {/* 5. Two Dropdowns (Solution Focus & Allocation Range) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
                  Service / Solution
                </label>
                <div className="relative">
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    data-testid="contact-service-select"
                    className="w-full bg-[#0F1115] px-3 py-2 rounded-sm border border-outline/30 text-xs text-on-surface font-sans appearance-none focus:border-[#A6FF00]/70 outline-none pr-8 cursor-pointer"
                  >
                    <option value="PSP & Global Settlement">PSP &amp; Global Settlement</option>
                    <option value="Institutional Custody & MPC">Institutional Custody &amp; MPC</option>
                    <option value="Crypto Yield Aggregation">Crypto Yield Aggregation</option>
                    <option value="Global Stocks DMA">Global Stocks DMA</option>
                    <option value="AI Systematic Funds">AI Systematic Funds</option>
                    <option value="Tokenized Real Estate">Tokenized Real Estate</option>
                    <option value="VIP Metal Cards">VIP Metal Cards</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-outline absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-sans text-[11px] text-outline uppercase tracking-wider block">
                  Allocation range
                </label>
                <div className="relative">
                  <select
                    value={allocation}
                    onChange={(e) => setAllocation(e.target.value)}
                    data-testid="contact-allocation-select"
                    className="w-full bg-[#0F1115] px-3 py-2 rounded-sm border border-outline/30 text-xs text-on-surface font-mono appearance-none focus:border-[#A6FF00]/70 outline-none pr-8 cursor-pointer"
                  >
                    <option value="€500 - €3M">€500 - €3M</option>
                    <option value="€500k - €3M">€500k - €3M</option>
                    <option value="$3M - $10M">$3M - $10M</option>
                    <option value="$10M - $50M">$10M - $50M</option>
                    <option value=">$50M Sovereign">&gt;$50M Sovereign</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-outline absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Error Message if Any */}
            {errorMsg && (
              <div
                data-testid="contact-error-msg"
                className="flex items-center gap-1.5 text-error font-mono text-[11px] p-2 bg-error/10 border border-error/20 rounded-sm"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Bar: High-Visibility SEND button + Consent Disclaimer */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <motion.button
                type="submit"
                data-testid="contact-submit-btn"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-8 py-3 rounded-sm bg-[#A6FF00] hover:bg-[#b8ff1a] text-black font-mono font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(166,255,0,0.35)] flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>SEND</span>
                <Send className="w-3.5 h-3.5" />
              </motion.button>

              <label className="text-[11px] text-on-surface-variant font-sans leading-tight flex items-center gap-2 cursor-pointer select-none">
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

      {/* Right Column: Dark Textured Sentinel Mascot (5 cols on desktop) */}
      <div className="lg:col-span-5 relative hidden lg:flex items-center justify-center bg-[#07080A] border-l border-outline/20">
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <div className="max-w-4xl lg:max-w-5xl w-full max-h-[90vh] overflow-y-auto my-auto">{modalBody}</div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeContactModal()}>
      <DialogContent
        data-testid="contact-modal"
        showCloseButton={false}
        className="p-0 border-none bg-transparent shadow-none !max-w-4xl sm:!max-w-4xl lg:!max-w-5xl w-[92vw] max-h-[90vh] overflow-y-auto outline-none flex items-center justify-center my-auto"
      >
        {modalBody}
      </DialogContent>
    </Dialog>
  );
};
