import React, { useState } from 'react';
import { formatPercent } from '../../lib/formatters';
import type { AssetWeight } from '../../lib/calculator';

interface DonutChart3DProps {
  blendedApy: number;
  weights: AssetWeight[];
}

export const DonutChart3D: React.FC<DonutChart3DProps> = ({ blendedApy, weights }) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6 select-none">
      {/* Radial Donut SVG Container */}
      <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
        <svg
          className="w-full h-full -rotate-90 filter drop-shadow-md"
          viewBox="0 0 100 100"
          aria-label={`Portfolio Allocation Donut Chart showing ${blendedApy}% blended return`}
        >
          {weights.map((seg) => {
            const isHovered = hoveredSegment === seg.id;
            const strokeWidth = isHovered ? 14 : 12;

            return (
              <circle
                key={seg.id}
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${seg.dashLength} ${238.76 - seg.dashLength}`}
                strokeDashoffset={seg.dashOffset}
                className="transition-all duration-500 ease-out cursor-pointer hover:opacity-90"
                onMouseEnter={() => setHoveredSegment(seg.id)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
        </svg>

        {/* Center Readout Gauge */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="font-mono text-xl sm:text-2xl font-bold text-secondary tracking-tight">
            {formatPercent(blendedApy)}
          </span>
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">
            Blended APY
          </span>
        </div>
      </div>

      {/* Dynamic Breakdown Rows */}
      <div className="w-full space-y-2.5">
        {weights.map((weight) => {
          const isHovered = hoveredSegment === weight.id;
          return (
            <div
              key={weight.id}
              onMouseEnter={() => setHoveredSegment(weight.id)}
              onMouseLeave={() => setHoveredSegment(null)}
              className={`flex items-center justify-between p-2.5 rounded-sm transition-all cursor-pointer border ${
                isHovered
                  ? 'bg-surface-container border-primary/40 shadow-sm'
                  : 'bg-surface-container-low border-transparent hover:bg-surface-container/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: weight.color }}
                />
                <span className="text-xs text-on-surface font-medium">{weight.name}</span>
              </div>
              <span className="font-mono text-xs font-bold text-on-surface">
                {weight.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
