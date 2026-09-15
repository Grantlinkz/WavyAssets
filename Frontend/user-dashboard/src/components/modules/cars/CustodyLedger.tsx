import React from 'react';

export const CustodyLedger: React.FC = () => {
  return (
    <div className="bg-surface-container border border-border-hairline rounded p-4 flex flex-col justify-between space-y-3">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <h3 className="font-serif font-semibold text-on-surface text-base">
              Custody &amp; Underwriting
            </h3>
          </div>
          <span className="text-[10px] font-mono text-tertiary font-bold">LL-SPECIE-2003</span>
        </div>

        <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
          Continuous cryptographic audit and multi-jurisdiction fiduciary coverage architecture.
        </p>

        {/* Condition Inspection Scores */}
        <div className="mt-3 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-outline block">
            Condition Inspection Scores
          </span>

          <div className="p-2.5 bg-surface rounded border border-border-hairline space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface font-medium truncate">
                Porsche 993 GT2 Clubsport
              </span>
              <div className="flex items-center gap-1 font-mono">
                <span className="text-sm font-bold text-tertiary tabular-nums">99.4</span>
                <span className="text-outline text-[11px]">/ 100</span>
              </div>
            </div>
            <div className="text-[11px] text-outline font-mono flex items-center justify-between">
              <span>Swiss Classic Car Registry</span>
              <span className="text-primary font-semibold">Concours Gold Standard</span>
            </div>
          </div>

          <div className="p-2.5 bg-surface rounded border border-border-hairline space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface font-medium truncate">
                Patek Philippe 5270P Platinum
              </span>
              <div className="flex items-center gap-1 font-mono">
                <span className="text-sm font-bold text-tertiary tabular-nums">100.0</span>
                <span className="text-outline text-[11px]">/ 100</span>
              </div>
            </div>
            <div className="text-[11px] text-outline font-mono flex items-center justify-between">
              <span>Patek Geneva Archives</span>
              <span className="text-primary font-semibold">Factory Blister / Sealed</span>
            </div>
          </div>
        </div>

        {/* Underwriting Policy Breakdown */}
        <div className="mt-3 space-y-1.5 text-xs font-mono">
          <span className="text-[10px] uppercase tracking-wider text-outline block">
            Lloyds Specie Policies
          </span>

          <div className="p-2 bg-surface rounded border border-border-hairline space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-outline">Freeport Geneva #4B:</span>
              <span className="text-on-surface font-semibold">$800k (Full All-Risk)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Zurich Safe Enclave #02:</span>
              <span className="text-on-surface font-semibold">$400k (All-Risk Specie)</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border-hairline">
              <span className="text-outline">In-Transit Enclosed Flatbed:</span>
              <span className="text-tertiary font-semibold">Covered ($2M Umbrella)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-border-hairline">
        <div className="flex items-center justify-between text-[11px] font-mono text-outline">
          <span>Last Audit: 12 March 2025</span>
          <span className="text-tertiary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">verified</span> 0 Deficiencies
          </span>
        </div>
      </div>
    </div>
  );
};
