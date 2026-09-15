import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

export interface PrivacyToggleProps {
  maskBalances?: boolean;
  onToggle?: () => void;
}

export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  maskBalances: propMask,
  onToggle: propToggle,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const storeToggle = useDashboardStore((s) => s.toggleMaskBalances);

  const maskBalances = propMask !== undefined ? propMask : storeMask;
  const toggleMaskBalances = propToggle ?? storeToggle;

  return (
    <button
      type="button"
      data-testid="privacy-toggle-btn"
      onClick={toggleMaskBalances}
      aria-label={maskBalances ? 'Show Balances' : 'Hide Balances'}
      title={maskBalances ? 'Show Balances' : 'Hide Balances'}
      className="flex items-center gap-1.5 px-2 py-1 text-outline hover:text-on-surface bg-[#08090B] border border-border-hairline rounded-DEFAULT text-[11px] font-mono transition-colors cursor-pointer select-none"
    >
      {maskBalances ? (
        <>
          <Eye className="w-3.5 h-3.5 text-primary" />
          <span className="tracking-wider uppercase text-primary font-medium">Show Balances</span>
        </>
      ) : (
        <>
          <EyeOff className="w-3.5 h-3.5 text-outline" />
          <span className="tracking-wider uppercase">Hide Balances</span>
        </>
      )}
    </button>
  );
};
