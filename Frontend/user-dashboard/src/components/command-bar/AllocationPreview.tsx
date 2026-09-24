import React from 'react';
import { AllocationDonut3D } from '../3d/AllocationDonut3D';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { isSsrOrTestEnv } from '../../lib/calculations';

export const AllocationPreview: React.FC = () => {
  const storeAllocations = usePortfolioStore((s) => s.allocations);
  const isSsr = isSsrOrTestEnv();
  const allocations = isSsr ? usePortfolioStore.getState().allocations : storeAllocations;

  return (
    <div
      className="hidden xl:flex items-center gap-3 w-72 shrink-0 border-l border-r border-border-hairline/60 px-4"
      data-testid="allocation-preview"
    >
      {/* 3D Mini Donut Widget */}
      <AllocationDonut3D size={28} className="shrink-0" />

      {/* Stacked Multi-Asset Progress Ribbon */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex justify-between text-[10px] font-mono text-outline">
          <span className="tracking-wider">ALLOCATION</span>
          <span className="text-on-surface font-medium">services</span>
        </div>
        <div
          className="h-1.5 w-full bg-[#08090B] rounded-DEFAULT flex overflow-hidden gap-0.5"
          role="progressbar"
          aria-label="Asset Allocation Matrix"
        >
          {allocations.map((item) => (
            <div
              key={item.id}
              className="h-full transition-all duration-300"
              style={{
                width: `${item.actualPct}%`,
                backgroundColor: item.color,
              }}
              title={`${item.shortName}: ${item.actualPct.toFixed(1)}%`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
