import React, { useMemo } from 'react';
import { Shield, Archive, FileText } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { AI_STRATEGY_ASSETS } from '../../../lib/alternativeAssetData';
import { AiAssetDeck } from './AiAssetDeck';
import { AiDistributionBlotter } from './AiDistributionBlotter';
import { AiTenantCreditMatrix } from './AiTenantCreditMatrix';
import { AiSecondaryOtcBulletin } from './AiSecondaryOtcBulletin';

interface AiFundsModuleProps {
  maskBalances?: boolean;
  isCircuitBreakerTriggered?: boolean;
}

export const AiFundsModule: React.FC<AiFundsModuleProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const storeHoldings = useAlternativeStore((s) => s.userAiHoldings || {});
  const userHoldings = Object.keys(storeHoldings).length > 0 ? storeHoldings : (useAlternativeStore.getState().userAiHoldings || {});
  const storeNetWorth = usePortfolioStore((s) => s.netWorth);
  const netWorth = storeNetWorth > 0 ? storeNetWorth : usePortfolioStore.getState().netWorth;

  const dynamicCards = useMemo(() => {
    let totalEquity = 0;
    let totalBasis = 0;
    let totalAnnualYield = 0;
    let weightedDurationSum = 0;
    let weightedUtilSum = 0;
    let heldAssetsCount = 0;

    Object.entries(userHoldings).forEach(([assetId, holding]) => {
      const hasTokens = (holding.tokens || 0) > 0;
      const hasLeases = (holding.leases || []).length > 0;
      if (!hasTokens && !hasLeases) return;

      const asset = AI_STRATEGY_ASSETS.find((a) => a.id === assetId);
      if (!asset) return;

      heldAssetsCount += 1;
      const buyEquity = (holding.tokens || 0) * (asset.tokenPrice || 500);
      const leaseEquity = (holding.leases || []).reduce(
        (sum, l) => sum + (l.monthlyRent * (l.termMonths || 1)),
        0
      );
      const assetEquity = buyEquity + leaseEquity;

      const buyBasis = holding.totalInvested > 0 ? holding.totalInvested : buyEquity;
      const assetBasis = buyBasis + leaseEquity;

      const buyAnnualYield = buyEquity * (asset.netYieldApy / 100);
      const leaseAnnualYield = (holding.leases || []).reduce(
        (sum, l) => sum + (l.monthlyRent * 12),
        0
      );
      const assetAnnualYield = buyAnnualYield + leaseAnnualYield;

      totalEquity += assetEquity;
      totalBasis += assetBasis;
      totalAnnualYield += assetAnnualYield;
      weightedDurationSum += 5.8 * assetEquity; // 5.8 yrs institutional compute term baseline
      weightedUtilSum += asset.clusterUtilizationPct * assetEquity;
    });

    if (totalEquity <= 0) {
      return [
        {
          label: 'TOTAL AI COMPUTE EQUITY',
          subLabel: '0.0% of Consolidated NAV',
          value: '$0.00',
          delta: '+$0.00 (+0.00%)',
          deltaSub: 'UNREALIZED UPLIFT',
          footerKey: 'Acquisition Basis',
          footerVal: '$0.00',
        },
        {
          label: 'NET STRATEGY YIELD',
          subLabel: 'T+0 Continuous Cash Flow',
          value: '$0.00',
          unit: '/ mo',
          delta: '$0.00 / yr',
          deltaSub: 'ANNUALIZED',
          badge: '+0.0% vs Pro-Forma',
          footerKey: 'Settlement Enclave',
          footerVal: 'Auto-Swap USDC / CHF',
        },
        {
          label: 'AVERAGE COMPUTE APY',
          subLabel: 'Unlevered Weighted Yield',
          value: '0.00%',
          delta: '+0 bps',
          deltaSub: 'SPREAD OVER FED FUNDS (5.25%)',
          extraMetric: '0.0 Yrs',
          extraMetricLabel: 'WACT DURATION',
          footerKey: 'Valuation Standard',
          footerVal: 'Tier-4 Cluster Qualified',
        },
        {
          label: 'CLUSTER UTILIZATION',
          subLabel: '0 Institutional AI Nodes',
          value: '0.0%',
          delta: '0.0% Reserve Headroom',
          badge: '100% INSTITUTIONAL',
          footerKey: 'Hardware Faults',
          footerVal: '0.00% (High-Availability N+2)',
        },
      ];
    }

    const effectiveNetWorth = netWorth > 0 ? netWorth : totalEquity;
    const consolidatedNavPct = (totalEquity / effectiveNetWorth) * 100;
    const upliftDollars = totalEquity - totalBasis;
    const upliftPct = totalBasis > 0 ? (upliftDollars / totalBasis) * 100 : 0;
    const acquisitionBasis = totalBasis;

    const weightedApy = (totalAnnualYield / totalEquity) * 100;
    const monthlyYield = totalAnnualYield / 12;

    const spreadBps = Math.round((weightedApy - 5.25) * 100);
    const weightedDuration = weightedDurationSum / totalEquity;
    const weightedUtil = weightedUtilSum / totalEquity;
    const headroom = Math.max(0, 100 - weightedUtil);

    const sign = upliftDollars >= 0 ? '+' : '-';
    const absUplift = Math.abs(upliftDollars);
    const absPct = Math.abs(upliftPct);

    return [
      {
        label: 'TOTAL AI COMPUTE EQUITY',
        subLabel: `${consolidatedNavPct.toFixed(1)}% of Consolidated NAV`,
        value: `$${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        delta: `${sign}$${absUplift.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${sign}${absPct.toFixed(2)}%)`,
        deltaSub: 'UNREALIZED UPLIFT',
        footerKey: 'Acquisition Basis',
        footerVal: `$${acquisitionBasis.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
      {
        label: 'NET STRATEGY YIELD',
        subLabel: 'T+0 Continuous Cash Flow',
        value: `$${monthlyYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        unit: '/ mo',
        delta: `$${totalAnnualYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / yr`,
        deltaSub: 'ANNUALIZED',
        badge: '+4.1% vs Pro-Forma',
        footerKey: 'Settlement Enclave',
        footerVal: 'Auto-Swap USDC / CHF',
      },
      {
        label: 'AVERAGE COMPUTE APY',
        subLabel: 'Unlevered Weighted Yield',
        value: `${weightedApy.toFixed(2)}%`,
        delta: `${spreadBps >= 0 ? '+' : ''}${spreadBps} bps`,
        deltaSub: 'SPREAD OVER FED FUNDS (5.25%)',
        extraMetric: `${weightedDuration.toFixed(1)} Yrs`,
        extraMetricLabel: 'WACT DURATION',
        footerKey: 'Valuation Standard',
        footerVal: 'Tier-4 Cluster Qualified',
      },
      {
        label: 'CLUSTER UTILIZATION',
        subLabel: `${heldAssetsCount} Institutional AI Nodes`,
        value: `${weightedUtil.toFixed(1)}%`,
        delta: `${headroom.toFixed(1)}% Reserve Headroom`,
        badge: '100% INSTITUTIONAL',
        footerKey: 'Hardware Faults',
        footerVal: '0.00% (High-Availability N+2)',
      },
    ];
  }, [userHoldings, netWorth]);

  return (
    <div data-testid="ai-funds-module" className="space-y-4 min-h-[540px] animate-fade-in">
      {/* Telemetry Bar / Institutional Breadcrumb */}
      <div className="w-full bg-surface-container border border-border-hairline px-4 py-2.5 rounded flex flex-wrap items-center justify-between gap-3 text-on-surface">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="font-mono text-xs text-outline tracking-wider uppercase">Portfolio</span>
          <span className="text-border-hairline text-xs font-mono">/</span>
          <span className="font-mono text-xs text-outline tracking-wider uppercase">Alternative Assets</span>
          <span className="text-border-hairline text-xs font-mono">/</span>
          <span className="font-mono text-xs text-primary font-semibold tracking-wider uppercase">
            AI Systematic &amp; Quantitative Strategies
          </span>
          <div className="h-3.5 w-px bg-border-hairline mx-1 hidden sm:block"></div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface border border-border-hairline rounded text-on-surface-variant font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              DLT ENCLAVE: TEE H100/B200 ATTESTATION VERIFIED
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface border border-border-hairline rounded text-on-surface-variant font-mono text-[11px]">
              <Shield className="w-3 h-3 text-primary shrink-0" />
              ZURICH HPC CLUSTER ENCLAVE 08
            </span>
          </div>
        </div>

        {/* Right Operational Downloads */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border-hairline hover:border-primary/50 text-on-surface-variant hover:text-on-surface font-mono text-xs rounded transition-colors"
          >
            <Archive className="w-3.5 h-3.5 shrink-0" />
            <span>Consolidated Ledger</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-1 px-2.5 py-1 bg-surface border border-border-hairline hover:border-primary/50 text-on-surface-variant hover:text-on-surface font-mono text-xs rounded transition-colors"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Compute SLA Telemetry</span>
          </button>
        </div>
      </div>

      {/* Top Executive Summary Performance Matrix (4-card modular split pane) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {dynamicCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-surface-container border border-border-hairline rounded p-3.5 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-xs uppercase tracking-wider text-outline font-semibold">
                  {card.label}
                </span>
                <span className="text-xs text-on-surface-variant mt-0.5">{card.subLabel}</span>
              </div>
              {card.badge && (
                <span className="px-1.5 py-0.5 bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono text-[10px] rounded font-semibold tabular-nums">
                  {card.badge}
                </span>
              )}
            </div>

            <div className="my-2.5 flex items-baseline justify-between">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-xl text-on-surface font-bold tabular-nums tracking-tight">
                    {(card.label.includes('EQUITY') || card.label.includes('YIELD')) && maskBalances
                      ? '••••••••'
                      : card.value}
                  </span>
                  {card.unit && (
                    <span className="font-mono text-xs text-outline">{card.unit}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 font-mono text-xs">
                  <span className="text-tertiary tabular-nums font-semibold">
                    {card.delta.includes('$') && maskBalances ? '••••••••' : card.delta}
                  </span>
                  {card.deltaSub && (
                    <span className="text-[10px] text-outline uppercase">{card.deltaSub}</span>
                  )}
                </div>
              </div>

              {card.extraMetric && (
                <div className="text-right flex flex-col items-end">
                  <span className="font-mono text-sm font-bold text-on-surface tabular-nums">
                    {card.extraMetric}
                  </span>
                  <span className="text-[10px] font-mono text-outline uppercase">
                    {card.extraMetricLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-[11px] font-mono text-outline tabular-nums">
              <span>{card.footerKey}</span>
              <span className="text-on-surface-variant font-medium">
                {card.footerVal.includes('$') && maskBalances ? '••••••••' : card.footerVal}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Institutional AI Asset Inventory Deck */}
      <AiAssetDeck maskBalances={maskBalances} />

      {/* Split Bottom Row: Distribution Blotter + Credit Matrix (8 cols) vs Secondary OTC Bulletin (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 space-y-4">
          <AiDistributionBlotter maskBalances={maskBalances} />
          <AiTenantCreditMatrix />
        </div>

        <div className="lg:col-span-4">
          <AiSecondaryOtcBulletin maskBalances={maskBalances} />
        </div>
      </div>
    </div>
  );
};
