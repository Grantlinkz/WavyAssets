import React from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { GPU_CLUSTER_TELEMETRY } from '../../../lib/alternativeAssetData';

interface GpuComputeWidgetProps {
  maskBalances?: boolean;
}

export const GpuComputeWidget: React.FC<GpuComputeWidgetProps> = ({
  maskBalances: propMask,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const pendingYield = useAlternativeStore((s) => s.pendingGpuYieldUsdc);
  const claimGpuYield = useAlternativeStore((s) => s.claimGpuYield);

  return (
    <div className="bg-surface-container border border-border-hairline rounded p-4 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border-hairline">
          <div>
            <span className="font-serif font-semibold text-on-surface text-base">
              Tokenized GPU Cluster
            </span>
            <div className="font-mono text-xs text-primary mt-0.5">
              {GPU_CLUSTER_TELEMETRY.clusterName}
            </div>
          </div>
          <span className="px-1.5 py-0.5 bg-surface-container-high border border-border-hairline text-tertiary rounded text-[10px] font-mono font-semibold uppercase">
            Facility #02 CH
          </span>
        </div>

        {/* Hardware Spec & Real-time utilization */}
        <div className="mt-3 p-3 bg-surface rounded border border-border-hairline space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-outline uppercase">Active Compute Hashrate</span>
            <span className="font-mono text-tertiary font-bold text-xs tabular-nums">
              {GPU_CLUSTER_TELEMETRY.utilizationRate}% UTILIZED
            </span>
          </div>

          {/* Multi-segment utilization bar */}
          <div className="h-2 w-full bg-surface-container-high rounded flex gap-0.5 overflow-hidden">
            <div
              className="h-full bg-tertiary"
              style={{ width: `${GPU_CLUSTER_TELEMETRY.dedicatedInferenceRate}%` }}
              title="78% Dedicated Inference & Fine-Tuning"
            ></div>
            <div
              className="h-full bg-primary"
              style={{ width: `${GPU_CLUSTER_TELEMETRY.quantOptimizationRate}%` }}
              title="16.2% Quant Optimization Batch"
            ></div>
            <div
              className="h-full bg-surface-variant"
              style={{ width: `${GPU_CLUSTER_TELEMETRY.standbyReserveRate}%` }}
              title="5.8% Standby Reserve"
            ></div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-outline">
            <span>
              {GPU_CLUSTER_TELEMETRY.onlineGpus} Online /{' '}
              {GPU_CLUSTER_TELEMETRY.totalGpus - GPU_CLUSTER_TELEMETRY.onlineGpus} Hot Spare
            </span>
            <span>{GPU_CLUSTER_TELEMETRY.avgCoreTemp}</span>
          </div>
        </div>

        {/* Yield Generation Tickers */}
        <div className="mt-3 grid grid-cols-2 gap-2.5">
          <div className="p-2.5 bg-surface rounded border border-border-hairline">
            <div className="font-mono text-xs text-outline uppercase">Hourly Rate</div>
            <div className="mt-1 font-mono text-sm font-bold text-on-surface tabular-nums">
              ${GPU_CLUSTER_TELEMETRY.hourlyRate.toFixed(2)}{' '}
              <span className="text-[10px] text-outline font-normal">/ hr</span>
            </div>
            <div className="text-[10px] text-tertiary font-mono mt-0.5">Real-time Stream</div>
          </div>
          <div className="p-2.5 bg-surface rounded border border-border-hairline">
            <div className="font-mono text-xs text-outline uppercase">Monthly Cash Flow</div>
            <div className="mt-1 font-mono text-sm font-bold text-tertiary tabular-nums">
              {maskBalances
                ? '••••••••'
                : `$${GPU_CLUSTER_TELEMETRY.monthlyCashFlow.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}`}
            </div>
            <div className="text-[10px] text-outline font-mono mt-0.5">
              {GPU_CLUSTER_TELEMETRY.hardwareApy}% Hardware APY
            </div>
          </div>
        </div>

        {/* Workload Meta */}
        <div className="mt-3 p-2.5 bg-surface-container-low rounded border border-border-hairline space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-outline">
            <span className="font-mono text-[10px] uppercase">Active Tenant</span>
            <span className="font-mono text-on-surface text-[11px]">
              {GPU_CLUSTER_TELEMETRY.activeTenant}
            </span>
          </div>
          <div className="text-on-surface-variant font-mono text-[11px] leading-relaxed">
            Task: {GPU_CLUSTER_TELEMETRY.taskDescription}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-border-hairline text-[10px] text-outline font-mono">
            <span>Grid: {GPU_CLUSTER_TELEMETRY.powerSource}</span>
            <span className="text-tertiary font-medium">100% Zero-Carbon</span>
          </div>
        </div>
      </div>

      {/* Claim GPU Yield Action */}
      <div className="pt-3 border-t border-border-hairline flex items-center justify-between gap-2">
        <div className="flex flex-col font-mono text-xs">
          <span className="text-outline text-[10px] uppercase">Pending Yield</span>
          <span className="text-tertiary font-bold tabular-nums">
            {maskBalances ? '••••••••' : `$${pendingYield.toFixed(2)} USDC`}
          </span>
        </div>
        <button
          type="button"
          disabled={pendingYield === 0}
          onClick={claimGpuYield}
          className={`px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 ${
            pendingYield > 0
              ? 'bg-primary hover:bg-primary-container text-on-primary cursor-pointer'
              : 'bg-surface-container-high text-outline cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined text-[15px]">savings</span>
          <span>{pendingYield > 0 ? 'Claim to Vault' : 'Claimed'}</span>
        </button>
      </div>

      {/* Counterparty & Venue Solvency Breakdown */}
      <div className="pt-2 border-t border-border-hairline space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-outline uppercase">Counterparty Distribution</span>
          <span className="text-tertiary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px]">verified</span> 100% Solvency
          </span>
        </div>
        <div className="space-y-1.5 font-mono text-[11px]">
          <div>
            <div className="flex justify-between text-on-surface-variant mb-0.5">
              <span>Deribit Institutional (BVI Enclave)</span>
              <span className="text-on-surface font-medium tabular-nums">40.0% ($580k)</span>
            </div>
            <div className="h-1 w-full bg-surface rounded overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '40%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-on-surface-variant mb-0.5">
              <span>Binance Institutional Enclave</span>
              <span className="text-on-surface font-medium tabular-nums">30.0% ($435k)</span>
            </div>
            <div className="h-1 w-full bg-surface rounded overflow-hidden">
              <div className="h-full bg-tertiary" style={{ width: '30%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-on-surface-variant mb-0.5">
              <span>OKX Prime &amp; Coinbase Prime</span>
              <span className="text-on-surface font-medium tabular-nums">30.0% ($435k)</span>
            </div>
            <div className="h-1 w-full bg-surface rounded overflow-hidden">
              <div className="h-full bg-secondary" style={{ width: '30%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
