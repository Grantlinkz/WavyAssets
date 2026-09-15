import React from 'react';
import { NetWorthWidget } from './NetWorthWidget';
import { AllocationPreview } from './AllocationPreview';
import { PrivacyToggle } from './PrivacyToggle';
import { ActionRail } from './ActionRail';

import type { TimeframeOption } from '../../store/useDashboardStore';

export interface GlobalCommandBarProps {
  maskBalances?: boolean;
  timeframe?: TimeframeOption;
}

export const GlobalCommandBar: React.FC<GlobalCommandBarProps> = ({
  maskBalances,
  timeframe,
}) => {
  return (
    <div
      data-testid="global-command-bar"
      className="h-12 min-h-[48px] bg-surface-container-low border-b border-border-hairline px-4 flex items-center justify-between gap-6 overflow-x-auto text-on-surface select-none z-30 sticky top-14"
    >
      {/* Left Cell: Consolidated Net Worth & Dynamic Timeframe P&L */}
      <NetWorthWidget maskBalances={maskBalances} timeframe={timeframe} />

      {/* Center Cell: 3D Radial Donut & Multi-Vertical Progress Ribbon */}
      <AllocationPreview />

      {/* Right Cell: Privacy Toggle & Global Action Rail */}
      <div className="flex items-center gap-2 shrink-0">
        <PrivacyToggle maskBalances={maskBalances} />
        <div className="h-4 w-px bg-border-hairline mx-1 hidden sm:block" />
        <ActionRail />
      </div>
    </div>
  );
};
