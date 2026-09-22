import React, { useMemo } from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { REAL_ESTATE_ASSETS } from '../../../lib/alternativeAssetData';

interface RentalDistributionBlotterProps {
  maskBalances?: boolean;
}

export const RentalDistributionBlotter: React.FC<RentalDistributionBlotterProps> = ({
  maskBalances: propMask,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const storeHoldings = useAlternativeStore((s) => s.userRealEstateHoldings);
  const userHoldings = Object.keys(storeHoldings).length > 0 ? storeHoldings : useAlternativeStore.getState().userRealEstateHoldings;

  const { dynamicHistory, totalYtdCleared } = useMemo(() => {
    let monthlyBuyYield = 0;
    let monthlyLeaseYield = 0;
    let totalEquity = 0;

    Object.entries(userHoldings).forEach(([propId, holding]) => {
      const asset = REAL_ESTATE_ASSETS.find((a) => a.id === propId);
      if (!asset) return;

      const tokens = holding.tokens || 0;
      const buyEquity = tokens * asset.tokenPrice;
      const buyAnnualYield = buyEquity * (asset.netRentalYieldApy / 100);
      monthlyBuyYield += buyAnnualYield / 12;

      const leases = holding.leases || [];
      const leaseMonthlySum = leases.reduce((sum, l) => sum + (l.monthlyRent || 0), 0);
      const leaseTotalEquity = leases.reduce(
        (sum, l) => sum + (l.monthlyRent * (l.termMonths || 1)),
        0
      );
      monthlyLeaseYield += leaseMonthlySum;
      totalEquity += buyEquity + leaseTotalEquity;
    });

    const totalMonthlyYield = monthlyBuyYield + monthlyLeaseYield;

    if (totalEquity <= 0 || totalMonthlyYield <= 0) {
      return { dynamicHistory: [], totalYtdCleared: 0 };
    }

    const periods = [
      { id: 'dist-current', period: 'March 2025 (Current)', hash: '0x49f1...881a' },
      { id: 'dist-feb-25', period: 'February 2025', hash: '0x81b2...99ca' },
      { id: 'dist-jan-25', period: 'January 2025', hash: '0x34aa...e018' },
      { id: 'dist-dec-24', period: 'December 2024', hash: '0x72ef...15ad' },
      { id: 'dist-nov-24', period: 'November 2024', hash: '0x11ab...6389' },
      { id: 'dist-oct-24', period: 'October 2024', hash: '0x44dc...819e' },
    ];

    const history = periods.map((p, idx) => {
      // Small realistic baseline variances
      const varianceFactor = 1 - (idx * 0.005);
      const actual = Number((totalMonthlyYield * varianceFactor).toFixed(2));
      const projected = Number((actual * 0.99).toFixed(2));
      const varianceDelta = Number((actual - projected).toFixed(2));

      return {
        id: p.id,
        period: p.period,
        projected,
        actual,
        varianceDelta,
        settlementHash: p.hash,
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
              Monthly Rental Distribution Tracker
            </h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Automated on-chain rent distribution engine with direct bank clearing &amp; USDC settlement.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface border border-border-hairline px-2.5 py-1 rounded">
          <span className="font-mono text-xs text-outline uppercase">Total Cleared:</span>
          <span className="font-mono text-sm text-tertiary font-bold tabular-nums">
            {maskBalances
              ? '••••••••'
              : `$${totalYtdCleared.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })} USDC`}
          </span>
        </div>
      </div>

      {/* Distribution Table or Empty State */}
      {dynamicHistory.length === 0 ? (
        <div className="py-10 text-center text-outline font-mono text-xs bg-surface-container/50 rounded mt-2 border border-dashed border-border-hairline">
          No active rental distributions. Acquire or lease properties in the Institutional Asset Inventory to initialize continuous yield clearing.
        </div>
      ) : (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-hairline text-[10px] font-mono text-outline uppercase">
                <th className="py-2.5 px-3 font-semibold">Distribution Period</th>
                <th className="py-2.5 px-3 text-right font-semibold">Projected (Pro-Forma)</th>
                <th className="py-2.5 px-3 text-right font-semibold">Actual Cleared</th>
                <th className="py-2.5 px-3 text-right font-semibold">Variance / Delta</th>
                <th className="py-2.5 px-3 font-semibold">On-Chain Settlement Hash</th>
                <th className="py-2.5 px-3 text-right font-semibold">Audit Status</th>
              </tr>
            </thead>
            <tbody className="tabular-nums divide-y divide-border-hairline font-mono">
              {dynamicHistory.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-2.5 px-3 font-medium text-on-surface font-sans">
                    {item.period}
                  </td>
                  <td className="py-2.5 px-3 text-right text-on-surface-variant">
                    {maskBalances
                      ? '••••••••'
                      : `$${item.projected.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}`}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-tertiary">
                    {maskBalances
                      ? '••••••••'
                      : `$${item.actual.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}`}
                  </td>
                  <td className={`py-2.5 px-3 text-right ${item.varianceDelta < 0 ? 'text-error' : 'text-tertiary'}`}>
                    {(() => {
                      if (maskBalances) return '••••••••';
                      const sign = item.varianceDelta > 0 ? '+' : item.varianceDelta < 0 ? '-' : '';
                      const absDollar = Math.abs(item.varianceDelta).toFixed(2);
                      const absPct = Math.abs((item.varianceDelta / (item.projected || 1)) * 100).toFixed(2);
                      return `${sign}$${absDollar} (${sign}${absPct}%)`;
                    })()}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-outline">
                    {item.settlementHash} <span className="text-primary">(EVM/CH)</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold text-tertiary">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> {item.status}
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
