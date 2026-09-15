import React from 'react';
import { Shield, ExternalLink } from 'lucide-react';
import { CRYPTO_HOLDINGS_DATA, type CryptoHolding, type CustodyBadge } from '../../../lib/liquidAssetData';
import { formatMaskedCurrency } from '../../../lib/calculations';
import { useDashboardStore } from '../../../store/useDashboardStore';

const getBadgeStyles = (type: CustodyBadge) => {
  switch (type) {
    case 'SOVEREIGN_CUSTODY':
      return 'bg-primary/15 border-primary/30 text-primary';
    case 'STAKING_LOCKUP':
      return 'bg-tertiary/15 border-tertiary/30 text-tertiary';
    case 'EXTERNAL_WEB3':
      return 'bg-secondary/15 border-secondary/30 text-secondary';
    default:
      return 'bg-surface-container text-outline';
  }
};

export const HoldingsTable: React.FC<{ maskBalances?: boolean }> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  return (
    <div className="bg-surface-container-low rounded-DEFAULT border border-border-hairline overflow-hidden" data-testid="crypto-holdings-table">
      {/* Table Header Controls */}
      <div className="p-3.5 bg-surface-container flex items-center justify-between border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
            Live Spot Holdings & Sovereign Custody Matrix
          </h2>
        </div>
        <span className="text-[10px] font-mono text-outline uppercase bg-surface-container-high px-2 py-0.5 rounded-DEFAULT">
          5 ACTIVE VAULT ASSETS
        </span>
      </div>

      {/* Dense Institutional Blotter */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-border-hairline text-[10px] text-outline uppercase tracking-wider">
              <th className="py-2.5 px-4 font-semibold">Asset / Contract</th>
              <th className="py-2.5 px-3 font-semibold">Custody Badge</th>
              <th className="py-2.5 px-3 text-right font-semibold">Balance</th>
              <th className="py-2.5 px-3 text-right font-semibold">Entry Mark</th>
              <th className="py-2.5 px-3 text-right font-semibold">Spot Price</th>
              <th className="py-2.5 px-3 text-right font-semibold">Unrealized P&L</th>
              <th className="py-2.5 px-3 text-right font-semibold">P&L (%)</th>
              <th className="py-2.5 px-3 text-center font-semibold">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-hairline font-sans text-xs">
            {CRYPTO_HOLDINGS_DATA.map((item: CryptoHolding) => {
              const notional = item.balance * item.spotPrice;
              return (
                <tr
                  key={item.symbol}
                  className="hover:bg-surface-container/60 transition-colors"
                  data-testid={`crypto-holding-row-${item.symbol}`}
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <div>
                        <span className="font-bold text-on-surface font-mono tracking-tight block">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-outline font-mono">
                          {item.enclave}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      data-testid={`custody-badge-${item.symbol}`}
                      className={`px-1.5 py-0.5 rounded-xs border text-[10px] font-mono font-semibold ${getBadgeStyles(
                        item.custodyType
                      )}`}
                    >
                      {item.custodyLabel}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-on-surface font-medium whitespace-nowrap">
                    <div>{maskBalances ? '••••••••' : `${item.balance.toLocaleString()} ${item.unit}`}</div>
                    <div className="text-[10px] text-outline">
                      {formatMaskedCurrency(notional, maskBalances)}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-outline whitespace-nowrap">
                    {formatMaskedCurrency(item.entryPrice, maskBalances)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-on-surface font-semibold whitespace-nowrap">
                    {formatMaskedCurrency(item.spotPrice, maskBalances)}
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold whitespace-nowrap text-tertiary">
                    {maskBalances
                      ? '••••••••'
                      : `+${formatMaskedCurrency(item.unrealizedPnl, false)}`}
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums font-medium whitespace-nowrap text-tertiary">
                    {maskBalances ? '••••' : `+${item.pnlPct.toFixed(2)}%`}
                  </td>

                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="px-1.5 py-0.5 rounded-xs bg-tertiary/10 text-tertiary text-[10px] font-mono font-bold border border-tertiary/30">
                      {item.riskRating}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Status */}
      <div className="p-2.5 bg-surface-container-lowest border-t border-border-hairline flex items-center justify-between text-[11px] font-mono text-outline">
        <span>SETTLEMENT: ZERO-KNOWLEDGE PROOF OF RESERVES VERIFIED</span>
        <span className="flex items-center gap-1 text-primary cursor-pointer hover:underline">
          <span>Audit Log</span>
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};
