import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore, type OtcTabType } from '../../../store/useAlternativeStore';

interface SecondaryOtcBulletinProps {
  maskBalances?: boolean;
}

export const SecondaryOtcBulletin: React.FC<SecondaryOtcBulletinProps> = ({
  maskBalances: propMask,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const otcOrders = useAlternativeStore((s) => s.otcOrders);
  const activeTab = useAlternativeStore((s) => s.activeOtcTab);
  const setOtcTab = useAlternativeStore((s) => s.setOtcTab);
  const executeOtcOrder = useAlternativeStore((s) => s.executeOtcOrder);

  const [notification, setNotification] = useState<string | null>(null);

  const filteredOrders = otcOrders.filter((order) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'BIDS') return order.type === 'BID';
    if (activeTab === 'OFFERS') return order.type === 'OFFER';
    return true;
  });

  const handleOrderAction = (orderId: string, type: 'BID' | 'OFFER', tokens: number, name: string) => {
    executeOtcOrder(orderId);
    setNotification(
      type === 'OFFER'
        ? `Successfully purchased ${tokens} fractional tokens of ${name}.`
        : `Successfully filled bid for ${tokens} tokens of ${name}.`
    );
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <section className="bg-surface-container border border-border-hairline rounded p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between pb-2.5 border-b border-border-hairline">
        <div>
          <div className="flex items-center gap-1.5">
            <ArrowLeftRight className="w-4 h-4 text-primary shrink-0" />
            <h3 className="font-serif font-semibold text-on-surface text-base">
              Secondary OTC Bulletin
            </h3>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-0.5">
            Fiduciary peer-to-peer liquidity matching engine for fractional SPV property shares.
          </p>
        </div>
        <span className="px-1.5 py-0.5 bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono text-[10px] rounded uppercase font-semibold">
          LIVE DEPTH
        </span>
      </div>

      {notification && (
        <div className="p-2 bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs font-mono rounded flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center bg-surface border border-border-hairline p-0.5 rounded">
        {(['ALL', 'BIDS', 'OFFERS'] as OtcTabType[]).map((tab) => {
          const isSelected = activeTab === tab;
          const count =
            tab === 'ALL'
              ? otcOrders.length
              : tab === 'BIDS'
              ? otcOrders.filter((o) => o.type === 'BID').length
              : otcOrders.filter((o) => o.type === 'OFFER').length;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setOtcTab(tab)}
              className={`flex-1 py-1 px-1.5 font-mono text-xs rounded transition-colors text-center ${
                isSelected
                  ? 'bg-primary text-on-primary font-semibold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              {tab === 'ALL' ? `All Orders (${count})` : `${tab} (${count})`}
            </button>
          );
        })}
      </div>

      {/* Live Bids & Offers Roster */}
      <div className="flex flex-col gap-2">
        {filteredOrders.length === 0 ? (
          <div className="p-4 text-center text-xs font-mono text-outline">
            No active orders found for selected tab.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isOffer = order.type === 'OFFER';
            return (
              <div
                key={order.id}
                className="p-2.5 bg-surface border border-border-hairline hover:border-primary/40 rounded flex flex-col gap-2 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span
                      className={`px-1 py-0.5 text-[9px] font-mono uppercase font-bold rounded ${
                        isOffer
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-tertiary/15 text-tertiary border border-tertiary/30'
                      }`}
                    >
                      {isOffer ? 'ASK OFFER' : 'BUY BID'}
                    </span>
                    <div className="font-sans text-xs font-semibold text-on-surface mt-1">
                      {order.tokenCount} Tokens • {order.propertyName}
                    </div>
                    <div className="text-[11px] font-mono text-on-surface-variant">
                      Counterparty: {order.counterpartyEnclave}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-sm font-bold text-on-surface tabular-nums">
                      ${order.pricePerToken.toFixed(2)}
                    </div>
                    <span
                      className={`text-[10px] tabular-nums ${
                        order.navPremiumDiscountPct >= 0 ? 'text-secondary' : 'text-outline'
                      }`}
                    >
                      {order.navPremiumDiscountPct >= 0 ? '+' : ''}
                      {order.navPremiumDiscountPct.toFixed(1)}% to NAV
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-hairline text-xs font-mono">
                  <span className="text-outline tabular-nums">
                    Total:{' '}
                    {maskBalances
                      ? '••••••••'
                      : `$${order.totalUsd.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}`}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleOrderAction(
                        order.id,
                        order.type,
                        order.tokenCount,
                        order.propertyName
                      )
                    }
                    className={`px-2.5 py-1 font-mono text-xs font-semibold rounded uppercase tracking-wider transition-colors cursor-pointer ${
                      isOffer
                        ? 'bg-primary text-on-primary hover:bg-primary-container'
                        : 'bg-surface-container-high border border-border-hairline hover:border-outline text-on-surface'
                    }`}
                  >
                    {isOffer ? 'EXECUTE BUY' : 'FILL BID'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
