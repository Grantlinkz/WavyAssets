import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useAuthStore } from '../../store/useAuthStore';

export const ActionRail: React.FC = () => {
  const openModal = usePortfolioStore((s) => s.openModal);
  const user = useAuthStore((s) => s.user);

  const kycLevel = user?.kycTier === 'TIER_3'
    ? 'KYC LEVEL 3'
    : user?.kycTier === 'TIER_2'
    ? 'KYC LEVEL 2'
    : 'KYC LEVEL 1';

  return (
    <div className="flex items-center gap-1.5 shrink-0" data-testid="action-rail">
      <button
        type="button"
        data-testid="action-deposit-btn"
        onClick={() => openModal('deposit')}
        className="px-3 py-1 bg-primary-container text-on-primary font-mono text-xs font-semibold rounded-DEFAULT hover:bg-primary transition-colors uppercase tracking-wider cursor-pointer"
      >
        Deposit
      </button>

      <button
        type="button"
        data-testid="action-withdraw-btn"
        onClick={() => openModal('withdraw')}
        className="px-3 py-1 bg-transparent border border-border-hairline text-on-surface hover:bg-surface-container-high font-mono text-xs rounded-DEFAULT transition-colors uppercase tracking-wider cursor-pointer"
      >
        Withdraw
      </button>

      <button
        type="button"
        data-testid="action-trade-btn"
        onClick={() => openModal('trade')}
        className="px-3 py-1 bg-transparent border border-border-hairline text-on-surface hover:bg-surface-container-high font-mono text-xs rounded-DEFAULT transition-colors uppercase tracking-wider cursor-pointer"
      >
        Trade / Swap
      </button>

      <button
        type="button"
        data-testid="action-kyc-btn"
        onClick={() => openModal('kyc')}
        className="flex items-center gap-1 px-2 py-1 bg-tertiary/10 border border-tertiary/30 rounded-DEFAULT text-tertiary font-mono text-xs font-medium hover:bg-tertiary/20 transition-colors cursor-pointer"
        title={`View ${kycLevel} Clearance`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        <span className="tracking-wider">{kycLevel}</span>
      </button>
    </div>
  );
};
