import React, { useState } from 'react';
import { ArrowUpRight, ShieldAlert, KeyRound, CheckCircle2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../lib/calculations';

export interface WithdrawModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen: propIsOpen,
  onClose: propClose,
}) => {
  const storeModal = usePortfolioStore((s) => s.activeModal);
  const storeClose = usePortfolioStore((s) => s.closeModal);
  const availableCash = usePortfolioStore((s) => s.availableCash);
  const adjustAvailableCash = usePortfolioStore((s) => s.adjustAvailableCash);
  const maskBalances = useDashboardStore((s) => s.maskBalances);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeModal === 'withdraw';
  const closeModal = propClose !== undefined ? propClose : storeClose;

  const [amount, setAmount] = useState<string>('50000');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleAuthorize = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const numAmount = parseFloat(amount || '0') || 0;
      adjustAvailableCash(-numAmount);
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        closeModal();
      }, 1500);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent data-testid="withdraw-modal" className="max-w-[520px]">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-secondary/10 rounded-xs border border-secondary/20">
              <ArrowUpRight className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <DialogTitle className="text-sm uppercase tracking-wide">
                WITHDRAW
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.2 bg-secondary/15 text-secondary text-[10px] font-mono font-semibold rounded-xs">
                  24-48H WHITELIST ENFORCED
                </span>
                <span className="text-[10px] text-outline font-mono">FIDO2 WebAuthn Required</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-withdraw-modal"
            aria-label="Close withdrawal modal"
            onClick={closeModal}
            className="text-outline hover:text-on-surface p-1 rounded-DEFAULT transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 pt-1 flex flex-col gap-3">
          {/* Whitelist Security Banner */}
          <div className="p-3 bg-surface-container-low rounded-DEFAULT border border-secondary/30 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div className="text-[11px] font-sans text-on-surface-variant leading-relaxed">
              <p className="font-semibold text-secondary">Zero-Trust Whitelist Lock Active</p>
              <p>
                Withdrawals are strictly restricted to pre-approved addresses. Changes or new destinations are subject to an inviolable 24-to-48 hour timelock before first execution.
              </p>
            </div>
          </div>

          {/* Destination Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono text-outline uppercase tracking-wider">
              Destination Whitelist Address
            </label>
            <select
              data-testid="withdraw-destination-select"
              className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="cold-01">
                Cold Storage Vault #1 (Zurich Treuhand - 0x39aB...22cD) [48h Verified]
              </option>
              <option value="ubs-ch">
                UBS Switzerland Corporate Operating (CH88 0024...9912) [Permanent]
              </option>
            </select>
          </div>

          {/* Amount input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-outline">
              <span>WITHDRAWAL AMOUNT (USD)</span>
              <span>AVAILABLE: {formatMaskedCurrency(availableCash, maskBalances)}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                data-testid="withdraw-amount-input"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT px-3 py-2 text-sm font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
                placeholder="0.00"
              />
              <button
                type="button"
                onClick={() => setAmount(availableCash.toString())}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-surface-container text-[10px] font-mono text-primary font-semibold rounded-DEFAULT hover:bg-surface-container-high cursor-pointer"
              >
                MAX
              </button>
            </div>
          </div>

          {/* Hardware Key / FIDO2 Trigger */}
          <div className="pt-2">
            {isSuccess ? (
              <div
                data-testid="withdraw-success-msg"
                className="p-3 bg-tertiary/10 border border-tertiary/40 rounded-DEFAULT flex items-center justify-center gap-2 text-tertiary text-xs font-mono font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRMED</span>
              </div>
            ) : (
              <button
                type="button"
                data-testid="authorize-withdraw-btn"
                disabled={isVerifying}
                onClick={handleAuthorize}
                className="w-full py-2.5 bg-primary-container text-on-primary hover:bg-primary font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isVerifying ? 'Awaiting WebAuthn Key Touch...' : 'Authorize with YubiKey / WebAuthn'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-border-hairline flex items-center justify-between text-[10px] font-mono text-outline">
          <span>ZERO-TRUST DISBURSEMENT ENCLAVE</span>
          <span>EST. SETTLEMENT: &lt; 15 SECONDS</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
