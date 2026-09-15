import React from 'react';
import { LEVEL_2_ORDER_BOOK } from '../../../lib/liquidAssetData';
import { useLiquidStore } from '../../../store/useLiquidStore';

export const OrderBookTable: React.FC = () => {
  const selectedStock = useLiquidStore((s) => s.selectedStock);

  return (
    <div className="bg-surface-container-low rounded-DEFAULT border border-border-hairline p-4 space-y-3" data-testid="order-book-table">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-primary">{selectedStock}</span>
          <span className="text-[10px] font-mono text-outline uppercase">DMA LEVEL-2 DEPTH</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-outline">SPREAD: <strong className="text-tertiary font-semibold">$0.03 (0.01%)</strong></span>
          <span className="h-2 w-px bg-border-hairline" />
          <span className="text-tertiary">0.03ms FIX</span>
        </div>
      </div>

      {/* 2-Column Split: Bids (Left) vs Asks (Right) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
        {/* Bids Column */}
        <div>
          <div className="flex justify-between text-[10px] text-outline uppercase pb-1 border-b border-border-hairline">
            <span>Bid Size</span>
            <span className="text-tertiary">Bid Price ($)</span>
          </div>
          <div className="divide-y divide-border-hairline/40">
            {LEVEL_2_ORDER_BOOK.bids.map((bid, idx) => (
              <div key={idx} className="py-1 flex items-center justify-between relative overflow-hidden">
                <div
                  className="absolute right-0 top-0 bottom-0 bg-tertiary/10 pointer-events-none"
                  style={{ width: `${bid.depthPct}%` }}
                />
                <span className="text-on-surface tabular-nums z-10">{bid.size.toLocaleString()}</span>
                <span className="font-bold text-tertiary tabular-nums z-10">${bid.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asks Column */}
        <div>
          <div className="flex justify-between text-[10px] text-outline uppercase pb-1 border-b border-border-hairline">
            <span className="text-error">Ask Price ($)</span>
            <span>Ask Size</span>
          </div>
          <div className="divide-y divide-border-hairline/40">
            {LEVEL_2_ORDER_BOOK.asks.map((ask, idx) => (
              <div key={idx} className="py-1 flex items-center justify-between relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-error/10 pointer-events-none"
                  style={{ width: `${ask.depthPct}%` }}
                />
                <span className="font-bold text-error tabular-nums z-10">${ask.price.toFixed(2)}</span>
                <span className="text-on-surface tabular-nums z-10">{ask.size.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
