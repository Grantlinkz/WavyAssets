import React from 'react';
import { NetWorthWidget } from './NetWorthWidget';
import { AllocationPreview } from './AllocationPreview';
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
      className="min-h-[48px] h-12 bg-surface-container-low border-b border-border-hairline px-4 flex items-center justify-between gap-6 overflow-x-auto overflow-y-hidden text-on-surface select-none z-30 sticky top-14"
    >
      {/* Left Cell: Consolidated Net Worth & Dynamic Timeframe P&L */}
      <NetWorthWidget maskBalances={maskBalances} timeframe={timeframe} />

      {/* Center Cell: 3D Radial Donut & Multi-Vertical Progress Ribbon */}
      <AllocationPreview />

      {/* Right Cell: Global Action Rail */}
      <div className="flex items-center gap-2 shrink-0">
        <ActionRail />
      </div>
    </div>
  );
};
