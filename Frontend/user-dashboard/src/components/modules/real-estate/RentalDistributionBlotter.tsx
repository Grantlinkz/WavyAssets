import React from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { RENTAL_DISTRIBUTION_HISTORY } from '../../../lib/alternativeAssetData';

interface RentalDistributionBlotterProps {
  maskBalances?: boolean;
}

export const RentalDistributionBlotter: React.FC<RentalDistributionBlotterProps> = ({
  maskBalances: propMask,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const totalYtdCleared = RENTAL_DISTRIBUTION_HISTORY.reduce(
    (acc, cur) => acc + cur.actual,
    0
  );

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
          <span className="font-mono text-xs text-outline uppercase">Total 6M Cleared:</span>
          <span className="font-mono text-sm text-tertiary font-bold tabular-nums">
            {maskBalances
              ? '••••••••'
              : `$${totalYtdCleared.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })} USDC`}
          </span>
        </div>
      </div>

      {/* Distribution Table */}
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
            {RENTAL_DISTRIBUTION_HISTORY.map((item) => (
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
                <td className="py-2.5 px-3 text-right text-tertiary">
                  {maskBalances
                    ? '••••••••'
                    : `+$${item.varianceDelta.toFixed(2)} (+0.88%)`}
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
    </section>
  );
};
