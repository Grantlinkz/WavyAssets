import React from 'react';
import { ShieldCheck, Cpu, HardDrive } from 'lucide-react';

export const AiTenantCreditMatrix: React.FC = () => {
  return (
    <section className="bg-surface-container border border-border-hairline rounded p-4">
      <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <span className="w-1 h-3.5 bg-primary"></span>
          <h3 className="font-serif font-semibold text-on-surface text-base">
            Counterparty Credit Health &amp; Compute Solvency Index
          </h3>
        </div>
        <span className="text-tertiary font-mono text-xs uppercase font-semibold">
          100.0% SLA &amp; Lease Fulfillment Rate
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
        {/* Credit Distribution */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
            Compute Counterparty Quality
          </span>
          <div className="flex flex-col gap-1.5 font-mono text-xs">
            <div className="flex justify-between text-on-surface">
              <span className="text-tertiary font-medium">AAA / AA Hyperscalers &amp; Labs</span>
              <span className="tabular-nums font-semibold">88.0%</span>
            </div>
            <div className="h-1.5 bg-surface rounded overflow-hidden">
              <div className="h-full bg-tertiary" style={{ width: '88%' }}></div>
            </div>

            <div className="flex justify-between text-on-surface">
              <span className="text-secondary font-medium">A / BBB+ Sovereign &amp; Enterprise</span>
              <span className="tabular-nums font-semibold">12.0%</span>
            </div>
            <div className="h-1.5 bg-surface rounded overflow-hidden">
              <div className="h-full bg-secondary" style={{ width: '12%' }}></div>
            </div>

            <div className="flex justify-between text-outline">
              <span>Unrated / Spot Consumers</span>
              <span className="tabular-nums">0.0%</span>
            </div>
          </div>
        </div>

        {/* Compute Reservation Term Profile */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
            Compute Commitment Duration (WACT)
          </span>
          <div className="flex flex-col gap-1.5 text-xs font-mono">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>2025 - 2026</span>
              <span className="text-on-surface tabular-nums">0.0% (Zero near-term churn)</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>2027 - 2029</span>
              <span className="text-on-surface tabular-nums font-medium">22.0% (Enterprise AGV/Robotics)</span>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>2030 - 2038+</span>
              <span className="text-tertiary tabular-nums font-medium">78.0% (Hyperscale GPU Racks)</span>
            </div>
            <div className="text-[11px] text-outline pt-1 border-t border-border-hairline">
              Weighted Average Compute Term: <strong className="text-on-surface font-semibold">5.8 Years</strong>
            </div>
          </div>
        </div>

        {/* Security & Enclave Escrow */}
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
            Enclave Collateralization &amp; Failover
          </span>
          <div className="flex flex-col gap-1 text-xs font-mono text-on-surface-variant">
            <div className="flex items-center gap-1.5 text-on-surface">
              <ShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Multi-AZ Redundant Cluster Failover</span>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface">
              <Cpu className="w-3.5 h-3.5 text-tertiary shrink-0" />
              <span>120% Pre-funded Smart Contract Escrow</span>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface">
              <HardDrive className="w-3.5 h-3.5 text-secondary shrink-0" />
              <span>On-Chain Real-Time Thermal Telemetry</span>
            </div>
            <div className="text-[11px] text-outline pt-1 border-t border-border-hairline">
              Hardware Insurance: <strong className="text-on-surface font-semibold">Munich Re Underwritten</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
