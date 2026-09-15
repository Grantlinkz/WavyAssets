import React from 'react';

export const TenantCreditMatrix: React.FC = () => {
  return (
    <section className="bg-surface-container border border-border-hairline rounded p-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-primary"></span>
          <h3 className="font-serif font-semibold text-on-surface text-base">
            Tenant Credit Health &amp; Solvency Index
          </h3>
        </div>
        <span className="text-tertiary font-mono text-xs uppercase font-semibold">
          100.0% Perfect Collection Rate
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
        {/* Credit Gauge */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
            Tenant Credit Distribution
          </span>
          <div className="flex flex-col gap-1.5 font-mono text-xs">
            <div className="flex justify-between text-on-surface">
              <span className="text-tertiary font-medium">AAA / AA Sovereign &amp; Corp</span>
              <span className="tabular-nums font-semibold">84.0%</span>
            </div>
            <div className="h-1.5 bg-surface rounded overflow-hidden">
              <div className="h-full bg-tertiary" style={{ width: '84%' }}></div>
            </div>

            <div className="flex justify-between text-on-surface">
              <span className="text-secondary font-medium">A / BBB+ Investment Grade</span>
              <span className="tabular-nums font-semibold">16.0%</span>
            </div>
            <div className="h-1.5 bg-surface rounded overflow-hidden">
              <div className="h-full bg-secondary" style={{ width: '16%' }}></div>
            </div>

            <div className="flex justify-between text-outline">
              <span>Sub-Investment Grade</span>
              <span className="tabular-nums">0.0%</span>
            </div>
          </div>
        </div>

        {/* Lease Maturity Profile */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
            Lease Expiration Schedule (WALT)
          </span>
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>2025 - 2027</span>
              <span className="text-on-surface tabular-nums">0.0% (Zero near-term rollover)</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>2028 - 2030</span>
              <span className="text-on-surface tabular-nums font-medium">24.0% (Geneva residential)</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>2031 - 2040+</span>
              <span className="text-tertiary tabular-nums font-medium">76.0% (Commercial / Infra)</span>
            </div>
            <div className="text-[11px] text-outline pt-1 border-t border-border-hairline">
              Weighted Average Lease Term: <strong className="text-on-surface font-semibold">6.2 Years</strong>
            </div>
          </div>
        </div>

        {/* Land Registry & Escrow State */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
            Custody Enclave Architecture
          </span>
          <div className="p-2.5 bg-surface border border-border-hairline rounded flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="text-outline uppercase">Fiduciary Trustee:</span>
              <span className="text-on-surface font-semibold">Treuhand Zürich AG</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline uppercase">Deed Enclave:</span>
              <span className="text-tertiary font-semibold">CH-GEN-VAULT-04</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline uppercase">Tax Optimization:</span>
              <span className="text-primary font-semibold">Lump-Sum SPV Regime</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-border-hairline">
              <span className="text-outline uppercase">Atomic DvP:</span>
              <span className="text-tertiary font-semibold">Enabled (USDC / CHF)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
