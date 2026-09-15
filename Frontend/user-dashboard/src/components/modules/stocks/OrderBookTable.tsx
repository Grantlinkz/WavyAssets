import React from 'react';
import { LEVEL_2_ORDER_BOOK } from '../../../lib/liquidAssetData';
import { useLiquidStore } from '../../../store/useLiquidStore';

const STOCK_ORDER_BOOKS: Record<string, { bids: typeof LEVEL_2_ORDER_BOOK.bids; asks: typeof LEVEL_2_ORDER_BOOK.asks }> = {
  NVDA: LEVEL_2_ORDER_BOOK,
  MSFT: {
    bids: [
      { price: 442.05, size: 1200, total: 1200, depthPct: 70 },
      { price: 442.0, size: 2100, total: 3300, depthPct: 85 },
      { price: 441.95, size: 1500, total: 4800, depthPct: 60 },
      { price: 441.9, size: 3400, total: 8200, depthPct: 90 },
      { price: 441.85, size: 900, total: 9100, depthPct: 40 },
    ],
    asks: [
      { price: 442.15, size: 1100, total: 1100, depthPct: 65 },
      { price: 442.2, size: 1800, total: 2900, depthPct: 80 },
      { price: 442.25, size: 2500, total: 5400, depthPct: 88 },
      { price: 442.3, size: 1400, total: 6800, depthPct: 50 },
      { price: 442.35, size: 2200, total: 9000, depthPct: 75 },
    ],
  },
  SPACEX: {
    bids: [
      { price: 819.5, size: 300, total: 300, depthPct: 60 },
      { price: 819.0, size: 500, total: 800, depthPct: 80 },
      { price: 818.5, size: 400, total: 1200, depthPct: 70 },
    ],
    asks: [
      { price: 820.5, size: 250, total: 250, depthPct: 55 },
      { price: 821.0, size: 450, total: 700, depthPct: 75 },
      { price: 821.5, size: 600, total: 1300, depthPct: 85 },
    ],
  },
  ANTHROPIC: {
    bids: [
      { price: 1478.0, size: 150, total: 150, depthPct: 50 },
      { price: 1475.0, size: 220, total: 370, depthPct: 75 },
    ],
    asks: [
      { price: 1482.0, size: 180, total: 180, depthPct: 60 },
      { price: 1485.0, size: 310, total: 490, depthPct: 80 },
    ],
  },
};

export const OrderBookTable: React.FC = () => {
  const selectedStock = useLiquidStore((s) => s.selectedStock);
  const book = STOCK_ORDER_BOOKS[selectedStock] || LEVEL_2_ORDER_BOOK;
  const bestBid = book.bids[0]?.price;
  const bestAsk = book.asks[0]?.price;
  const spreadVal = bestBid && bestAsk ? (bestAsk - bestBid).toFixed(2) : '0.03';
  const spreadPct = bestBid && bestAsk ? (((bestAsk - bestBid) / bestAsk) * 100).toFixed(2) : '0.01';

  return (
    <div className="bg-surface-container-low rounded-DEFAULT border border-border-hairline p-4 space-y-3" data-testid="order-book-table">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-primary">{selectedStock}</span>
          <span className="text-[10px] font-mono text-outline uppercase">DMA LEVEL-2 DEPTH</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-outline">
            SPREAD: <strong className="text-tertiary font-semibold">${spreadVal} ({spreadPct}%)</strong>
          </span>
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
            {book.bids.map((bid, idx) => (
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
            {book.asks.map((ask, idx) => (
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
