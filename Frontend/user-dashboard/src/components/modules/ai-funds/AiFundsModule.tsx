import React from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { AI_FUNDS_METRICS } from '../../../lib/alternativeAssetData';
import { RiskCalibrator } from './RiskCalibrator';
import { CircuitBreakerPanel } from './CircuitBreakerPanel';
import { RationaleLedger } from './RationaleLedger';
import { CointegrationSpread } from './CointegrationSpread';
import { GpuComputeWidget } from './GpuComputeWidget';

interface AiFundsModuleProps {
  maskBalances?: boolean;
  isCircuitBreakerTriggered?: boolean;
}

export const AiFundsModule: React.FC<AiFundsModuleProps> = ({
  maskBalances: propMask,
  isCircuitBreakerTriggered: propCircuitTriggered,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const storeCircuitTriggered = useAlternativeStore((s) => s.isCircuitBreakerTriggered);
  const isCircuitBreakerTriggered = propCircuitTriggered ?? storeCircuitTriggered;

  return (
    <div data-testid="ai-funds-module" className="space-y-4 min-h-[540px] animate-fade-in">
      {/* Sub-Header Breadcrumb & System Telemetry */}
      <section className="w-full bg-surface-container border border-border-hairline px-4 py-2.5 rounded flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex items-center gap-1.5 font-mono text-xs text-outline uppercase tracking-wider truncate">
            <span>Portfolio</span>
            <span className="text-border-hairline">/</span>
            <span>Quantitative Infrastructure</span>
            <span className="text-border-hairline">/</span>
            <span className="text-primary font-semibold truncate">
              AI Systematic &amp; Quantitative Strategies
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <span className="px-2 py-0.5 bg-surface border border-border-hairline rounded text-[11px] font-mono text-on-surface-variant uppercase tabular-nums">
              Engine: <strong className="text-on-surface font-semibold">Nexus-Quant v6.42</strong>
            </span>
            <span className="px-2 py-0.5 bg-surface border border-border-hairline rounded text-[11px] font-mono text-on-surface-variant uppercase">
              Co-Located: <strong className="text-tertiary font-semibold">NY4 &amp; TY3 X-Connect</strong>
            </span>
            <span className="px-2 py-0.5 bg-tertiary/10 border border-tertiary/20 rounded text-[11px] font-mono text-tertiary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified_user</span>
              ZK-Proof Verified
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 bg-surface hover:bg-surface-container-high border border-border-hairline text-on-surface font-mono text-xs rounded transition-colors uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            <span>Algo Audit Log</span>
          </button>
          <div className="flex items-center gap-1 px-2 py-1 bg-surface-container-lowest border border-border-hairline rounded text-tertiary font-mono text-xs tabular-nums">
            <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-[10px]">WS FIX 12ms</span>
          </div>
        </div>
      </section>

      {/* Top 5 Executive Metric Matrix */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {AI_FUNDS_METRICS.map((metric, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-surface-container border border-border-hairline rounded flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs text-outline uppercase tracking-wider">
                {metric.label}
              </span>
              {metric.badge && (
                <span className="px-1.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded font-mono text-[10px] font-semibold tabular-nums">
                  {metric.badge}
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-col">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xl text-on-surface font-bold tracking-tight tabular-nums">
                  {metric.label === 'Capital Deployed' && maskBalances
                    ? '••••••••'
                    : metric.value}
                </span>
                {metric.sparkline && (
                  <svg className="w-16 h-6 text-tertiary shrink-0" fill="none" viewBox="0 0 100 30">
                    <path
                      d="M0,24 L14,21 L28,23 L42,16 L56,18 L70,11 L84,13 L100,4"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                    <path
                      d="M0,24 L14,21 L28,23 L42,16 L56,18 L70,11 L84,13 L100,4 L100,30 L0,30 Z"
                      fill="currentColor"
                      fillOpacity="0.12"
                    ></path>
                  </svg>
                )}
              </div>
              <span
                className={`text-xs mt-0.5 ${
                  metric.subValueColor ?? 'text-on-surface-variant'
                }`}
              >
                {metric.subValue}
              </span>
            </div>
            <div className="mt-3 pt-2 border-t border-border-hairline flex items-center justify-between text-[11px] font-mono text-outline tabular-nums">
              <span>{metric.footerLabel}</span>
              <span className="text-on-surface font-semibold">{metric.footerValue}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Risk Posture Calibrator & Emergency Circuit Breaker */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-3">
        <div className="xl:col-span-8">
          <RiskCalibrator />
        </div>
        <div className="xl:col-span-4">
          <CircuitBreakerPanel isTriggered={isCircuitBreakerTriggered} />
        </div>
      </section>

      {/* Main Two-Column Workspace (66% / 33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Rationale Feed & Cointegration Monitor */}
        <section className="lg:col-span-8 space-y-4">
          <RationaleLedger />
          <CointegrationSpread maskBalances={maskBalances} />
        </section>

        {/* Right Column: GPU Hardware Cluster & Counterparty Distribution */}
        <section className="lg:col-span-4 space-y-4">
          <GpuComputeWidget maskBalances={maskBalances} />
        </section>
      </div>
    </div>
  );
};
