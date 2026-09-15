import React from 'react';
import { ShieldCheck, Check, Award, Building, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { usePortfolioStore } from '../../store/usePortfolioStore';

export interface KycDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const KycDrawer: React.FC<KycDrawerProps> = ({
  isOpen: propIsOpen,
  onClose: propClose,
}) => {
  const storeModal = usePortfolioStore((s) => s.activeModal);
  const storeClose = usePortfolioStore((s) => s.closeModal);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeModal === 'kyc';
  const closeModal = propClose !== undefined ? propClose : storeClose;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent data-testid="kyc-modal" className="max-w-[520px]">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-tertiary/10 rounded-xs border border-tertiary/20">
              <ShieldCheck className="w-4 h-4 text-tertiary" />
            </div>
            <div>
              <DialogTitle className="text-sm uppercase tracking-wide">
                COMPLIANCE
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.2 bg-tertiary/15 text-tertiary text-[10px] font-mono font-semibold rounded-xs">
                  ACCREDITED INSTITUTIONAL
                </span>
                <span className="text-[10px] text-outline font-mono">FINMA & VARA DUAL-CLEARED</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-kyc-modal"
            aria-label="Close KYC passport"
            onClick={closeModal}
            className="text-outline hover:text-on-surface p-1 rounded-DEFAULT transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 pt-1 flex flex-col gap-3">
          {/* Quotas & Capacity */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-surface-container-low rounded-DEFAULT border border-border-hairline">
              <span className="block text-[10px] font-mono text-outline uppercase">Daily Limit</span>
              <span className="text-xs font-mono font-bold text-tertiary mt-0.5 block">UNLIMITED</span>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded-DEFAULT border border-border-hairline">
              <span className="block text-[10px] font-mono text-outline uppercase">Monthly Wires</span>
              <span className="text-xs font-mono font-bold text-tertiary mt-0.5 block">UNLIMITED</span>
            </div>
            <div className="p-2.5 bg-surface-container-low rounded-DEFAULT border border-border-hairline">
              <span className="block text-[10px] font-mono text-outline uppercase">OTC Desk Access</span>
              <span className="text-xs font-mono font-bold text-primary mt-0.5 block">DIRECT L3</span>
            </div>
          </div>

          {/* Attestation Checklist */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
              Verified Governance & Regulatory Documents
            </span>
            <div className="divide-y divide-border-hairline border border-border-hairline rounded-DEFAULT bg-surface-container-low text-xs">
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-outline" />
                  <span className="font-sans text-on-surface">Grant Sovereign Holdings AG Charter</span>
                </div>
                <span className="text-tertiary font-mono text-[10px] flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> VERIFIED
                </span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-outline" />
                  <span className="font-sans text-on-surface">Source of Wealth Notarization (Zurich Treuhand)</span>
                </div>
                <span className="text-tertiary font-mono text-[10px] flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> ATTESTED
                </span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-outline" />
                  <span className="font-sans text-on-surface">Accredited Qualified Purchaser Status (QEP)</span>
                </div>
                <span className="text-tertiary font-mono text-[10px] flex items-center gap-1 font-semibold">
                  <Check className="w-3 h-3" /> PERPETUAL
                </span>
              </div>
            </div>
          </div>

          {/* CCIP Enclave Badge */}
          <div className="p-2.5 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline flex items-center justify-between text-[11px] font-mono">
            <span className="text-outline">ORACLE ATTESTATION:</span>
            <span className="text-primary font-bold">CHAINLINK CCIP #99214-CH</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-border-hairline flex items-center justify-between text-[10px] font-mono text-outline">
          <span>NEXT AUDIT: 2027-12-31</span>
          <button
            type="button"
            onClick={closeModal}
            className="px-3 py-1 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-DEFAULT border border-border-hairline font-mono text-xs transition-colors cursor-pointer"
          >
            Close Passport
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
