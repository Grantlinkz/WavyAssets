import React, { useMemo } from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { AI_STRATEGY_ASSETS } from '../../../lib/alternativeAssetData';
import { CheckCircle2 } from 'lucide-react';

interface AiDistributionBlotterProps {
  maskBalances?: boolean;
}

export const AiDistributionBlotter: React.FC<AiDistributionBlotterProps> = ({
  maskBalances: propMask,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const userHoldings = useAlternativeStore((s) => s.userAiHoldings || {});

  const { dynamicHistory, totalYtdCleared } = useMemo(() => {
    let monthlyTokensYield = 0;
    let monthlyLeaseYield = 0;
    let totalEquity = 0;

    Object.entries(userHoldings).forEach(([assetId, holding]) => {
      const asset = AI_STRATEGY_ASSETS.find((a) => a.id === assetId);
      if (!asset) return;

      const tokens = holding.tokens || 0;
      const buyEquity = tokens * (asset.tokenPrice || 500);
      const buyAnnualYield = buyEquity * (asset.netYieldApy / 100);
      monthlyTokensYield += buyAnnualYield / 12;

      const leases = holding.leases || [];
      const leaseMonthlySum = leases.reduce((sum, l) => sum + (l.monthlyRent || 0), 0);
      const leaseTotalEquity = leases.reduce(
        (sum, l) => sum + (l.monthlyRent * (l.termMonths || 1)),
        0
      );
      monthlyLeaseYield += leaseMonthlySum;
      totalEquity += buyEquity + leaseTotalEquity;
    });

    const totalMonthlyYield = monthlyTokensYield + monthlyLeaseYield;

    if (totalEquity <= 0 || totalMonthlyYield <= 0) {
      return { dynamicHistory: [], totalYtdCleared: 0 };
    }

    const now = new Date();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const history = Array.from({ length: 6 }).map((_, idx) => {
      const d = new Date(now.getFullYear(), now.getMonth() - idx, 1);
      const mName = monthNames[d.getMonth()];
      const yNum = d.getFullYear();
      const isCurrent = idx === 0;
      const periodLabel = isCurrent ? `${mName} ${yNum} (Current)` : `${mName} ${yNum}`;
      const hashSuffix = ((3000 + idx * 487) % 10000).toString(16).padStart(4, '0');

      const varianceFactor = 1 - (idx * 0.004);
      const actual = Number((totalMonthlyYield * varianceFactor).toFixed(2));
      const projected = Number((actual * 0.985).toFixed(2));
      const varianceDelta = Number((actual - projected).toFixed(2));

      return {
        id: `ai-dist-${idx}`,
        period: periodLabel,
        projected,
        actual,
        varianceDelta,
        settlementHash: `0x7f2a...${hashSuffix}`,
        status: 'CLEARED' as const,
      };
    });

    const total = history.reduce((acc, cur) => acc + cur.actual, 0);
    return { dynamicHistory: history, totalYtdCleared: total };
  }, [userHoldings]);

  return (
    <section className="bg-surface-container border border-border-hairline rounded p-4 flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-3.5 bg-tertiary"></span>
            <h3 className="font-serif font-semibold text-on-surface text-base">
              Monthly Compute &amp; Arbitrage Distribution Tracker
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Continuous automated settlement of compute leasing fees and high-frequency quantitative yield.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-outline uppercase">Cumulative Cleared:</span>
          <span className="font-mono text-sm font-bold text-tertiary tabular-nums">
            {maskBalances
              ? '••••••••'
              : `$${totalYtdCleared.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
        </div>
      </div>

      {dynamicHistory.length === 0 ? (
        <div className="py-10 text-center text-outline font-mono text-xs bg-surface-container/50 rounded mt-3 border border-dashed border-border-hairline">
          No active compute yield distributions. Acquire or lease units in the Strategy Catalog to initialize continuous yield clearing.
        </div>
      ) : (
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-border-hairline text-outline uppercase text-[10px]">
              <th className="pb-2 font-medium">Accounting Period</th>
              <th className="pb-2 font-medium text-right">Projected Yield</th>
              <th className="pb-2 font-medium text-right">Actual Cleared</th>
              <th className="pb-2 font-medium text-right">Variance</th>
              <th className="pb-2 font-medium text-right">Enclave Settlement</th>
              <th className="pb-2 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline/60">
            {dynamicHistory.map((item) => (
              <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                <td className="py-2.5 text-on-surface font-medium">{item.period}</td>
                <td className="py-2.5 text-right text-on-surface-variant tabular-nums">
                  {maskBalances
                    ? '••••••••'
                    : `$${item.projected.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </td>
                <td className="py-2.5 text-right text-on-surface font-semibold tabular-nums">
                  {maskBalances
                    ? '••••••••'
                    : `$${item.actual.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                </td>
                <td className="py-2.5 text-right tabular-nums">
                  <span
                    className={`font-semibold ${
                      item.varianceDelta >= 0 ? 'text-tertiary' : 'text-error'
                    }`}
                  >
                    {maskBalances
                      ? '••••'
                      : `${item.varianceDelta >= 0 ? '+' : ''}$${item.varianceDelta.toFixed(2)}`}
                  </span>
                </td>
                <td className="py-2.5 text-right text-outline text-[11px] truncate max-w-[140px]">
                  {item.settlementHash}
                </td>
                <td className="py-2.5 text-center">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-tertiary/10 border border-tertiary/30 text-tertiary text-[10px] font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </section>
  );
};
