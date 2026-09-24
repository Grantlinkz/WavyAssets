import React, { useState } from 'react';
import { ArrowLeftRight, CheckCircle2, Shield } from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { AI_STRATEGY_ASSETS, AI_SECONDARY_OTC_ORDERS } from '../../../lib/alternativeAssetData';

interface AiSecondaryOtcBulletinProps {
  maskBalances?: boolean;
}

export const AiSecondaryOtcBulletin: React.FC<AiSecondaryOtcBulletinProps> = ({
  maskBalances: propMask,
}) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const userHoldings = useAlternativeStore((s) => s.userAiHoldings || {});
  const buyAiAsset = useAlternativeStore((s) => s.buyAiAsset);
  const sellAiAsset = useAlternativeStore((s) => s.sellAiAsset);

  const [activeTab, setActiveTab] = useState<'ALL' | 'BIDS' | 'OFFERS'>('ALL');
  const [notification, setNotification] = useState<string | null>(null);
  const [internalOrders, setInternalOrders] = useState<typeof AI_SECONDARY_OTC_ORDERS>([]);

  // Convert user-held positions into tradeable OFFER entries
  const userHeldOrders = Object.entries(userHoldings)
    .filter(([, h]) => (h.tokens || 0) > 0)
    .map(([assetId, h]) => {
      const asset = AI_STRATEGY_ASSETS.find((a) => a.id === assetId);
      const tokenPrice = asset?.tokenPrice || 500;
      return {
        id: `ai-holding-${assetId}`,
        assetId,
        type: 'OFFER' as const,
        assetName: asset?.name || 'Institutional AI Strategy Asset',
        tokenCount: h.tokens,
        pricePerToken: tokenPrice,
        navPremiumDiscountPct: 0.0,
        counterpartyEnclave: 'Your Direct Enclave Allocation',
        totalUsd: h.tokens * tokenPrice,
        isUserHolding: true,
      };
    });

  const combinedOrders = [
    ...userHeldOrders,
    ...internalOrders.filter((o) => !userHeldOrders.some((u) => u.id === o.id)),
  ];

  const filteredOrders = combinedOrders.filter((order) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'BIDS') return order.type === 'BID';
    if (activeTab === 'OFFERS') return order.type === 'OFFER';
    return true;
  });

  const handleSell = (assetId: string, tokens: number, name: string, tokenPrice: number) => {
    const success = sellAiAsset(assetId, tokens, tokenPrice);
    if (success) {
      setNotification(
        `Successfully liquidated ${tokens} tokens of ${name} for $${(tokens * tokenPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}. Proceeds credited to Account Balance.`
      );
    } else {
      setNotification(`Failed to liquidate tokens.`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOrderAction = (orderId: string, type: 'BID' | 'OFFER', tokens: number, name: string, assetId?: string, pricePerToken?: number) => {
    if (type === 'OFFER' && assetId && pricePerToken) {
      const ok = buyAiAsset(assetId, tokens, pricePerToken);
      if (ok) {
        setInternalOrders((prev) => prev.filter((o) => o.id !== orderId));
        setNotification(`Successfully executed OTC acquisition of ${tokens} units of ${name}.`);
      } else {
        setNotification('Insufficient Account Balance to fulfill this OTC offer.');
      }
    } else {
      setInternalOrders((prev) => prev.filter((o) => o.id !== orderId));
      setNotification(`Matched and routed OTC order for ${tokens} units of ${name} to Dark Pool.`);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <section className="bg-surface-container border border-border-hairline rounded p-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-primary" />
          <h3 className="font-serif font-semibold text-on-surface text-base">
            Secondary OTC Compute Bulletin
          </h3>
        </div>
        <span className="font-mono text-[10px] text-tertiary bg-tertiary/10 border border-tertiary/30 px-1.5 py-0.5 rounded font-semibold uppercase">
          Continuous DvP Settlement
        </span>
      </div>

      {notification && (
        <div className="my-2.5 p-2 bg-tertiary/10 border border-tertiary/30 rounded flex items-center gap-2 text-tertiary text-xs font-mono animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="truncate">{notification}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 pt-3 pb-2 font-mono text-xs">
        {(['ALL', 'BIDS', 'OFFERS'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-primary text-on-primary'
                : 'bg-surface border border-border-hairline text-outline hover:text-on-surface'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 mt-2 max-h-[380px] pr-1">
        {filteredOrders.length === 0 ? (
          <div className="py-8 px-4 text-center text-xs font-mono text-outline bg-surface-container/50 rounded border border-dashed border-border-hairline">
            No active secondary OTC compute orders. Acquire units in the Strategy Catalog to access secondary market liquidity and list compute buy/sell orders.
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isOffer = order.type === 'OFFER';
            const isUserHeld = 'isUserHolding' in order && order.isUserHolding;

            return (
              <div
                key={order.id}
                className="bg-surface border border-border-hairline hover:border-primary/40 rounded p-2.5 flex flex-col justify-between gap-2 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 rounded font-bold uppercase ${
                          isOffer
                            ? 'bg-error/10 border border-error/30 text-error'
                            : 'bg-tertiary/10 border border-tertiary/30 text-tertiary'
                        }`}
                      >
                        {order.type}
                      </span>
                      <span className="font-medium text-xs text-on-surface line-clamp-1">
                        {order.assetName}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-outline mt-0.5 truncate max-w-[200px]">
                      {order.counterpartyEnclave}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-on-surface block tabular-nums">
                      {order.tokenCount} Tokens
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant block tabular-nums">
                      @ ${order.pricePerToken.toLocaleString('en-US')} / tok
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1.5 border-t border-border-hairline/50 text-[11px] font-mono">
                  <span className="text-outline">
                    Total:{' '}
                    <strong className="text-on-surface tabular-nums">
                      {maskBalances ? '••••••••' : `$${order.totalUsd.toLocaleString('en-US')}`}
                    </strong>
                  </span>

                  {isUserHeld ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleSell(
                          (order as any).assetId,
                          order.tokenCount,
                          order.assetName,
                          order.pricePerToken
                        )
                      }
                      className="px-2 py-0.5 bg-error/15 border border-error/40 hover:bg-error/25 text-error rounded font-mono text-[10px] uppercase font-bold transition-colors"
                    >
                      Liquidate / Sell
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleOrderAction(
                          order.id,
                          order.type,
                          order.tokenCount,
                          order.assetName,
                          (order as any).assetId,
                          order.pricePerToken
                        )
                      }
                      className="px-2 py-0.5 bg-primary/15 border border-primary/40 hover:bg-primary/25 text-primary rounded font-mono text-[10px] uppercase font-bold transition-colors"
                    >
                      {isOffer ? 'Fill Ask' : 'Match Bid'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-3 border-t border-border-hairline mt-3 flex items-center justify-between text-[10px] font-mono text-outline">
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-tertiary" />
          Dark Pool Atomic DvP Settlement
        </span>
        <span>Institutional Only</span>
      </div>
    </section>
  );
};
