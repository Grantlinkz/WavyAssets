/**
 * Live Ticker Component
 * Displays real-time market data from WebSocket
 */

import React from 'react';
import { useTickerWebSocket } from '../hooks/useTickerWebSocket';
import { TrendingUp, TrendingDown, Activity, Wifi, WifiOff } from 'lucide-react';

export const LiveTicker: React.FC = () => {
  const { quotes, feedStatus, isConnected, lastUpdate } = useTickerWebSocket({
    autoConnect: true,
    autoSubscribe: true,
  });

  if (quotes.length === 0) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-sm border border-outline/20">
        <Activity className="w-4 h-4 text-outline animate-pulse" />
        <span className="text-xs text-on-surface-variant">Loading market data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Connection Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-container-low rounded-sm border border-outline/20">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5 text-secondary" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-error" />
          )}
          <span className="text-[10px] font-mono text-on-surface-variant">
            {isConnected ? 'LIVE' : 'DISCONNECTED'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono px-2 py-0.5 rounded-sm ${
              feedStatus === 'OPTIMAL'
                ? 'bg-secondary/15 text-secondary'
                : feedStatus === 'STALE'
                ? 'bg-warning/15 text-warning'
                : 'bg-error/15 text-error'
            }`}
          >
            {feedStatus}
          </span>
          {lastUpdate && (
            <span className="text-[9px] font-mono text-outline">
              {new Date(lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Ticker Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {quotes.map((quote) => {
          const isPositive = quote.change24h.startsWith('+');
          const isNegative = quote.change24h.startsWith('-');

          return (
            <div
              key={quote.symbol}
              className="p-3 bg-surface-container-low rounded-sm border border-outline/20 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono font-bold text-xs text-primary">
                  {quote.symbol}
                </span>
                <div className="flex items-center gap-1">
                  {isPositive && <TrendingUp className="w-3 h-3 text-secondary" />}
                  {isNegative && <TrendingDown className="w-3 h-3 text-error" />}
                </div>
              </div>
              <div className="font-mono text-sm font-semibold text-on-surface mb-1">
                ${quote.price.toLocaleString()}
              </div>
              <div
                className={`text-[10px] font-mono ${
                  isPositive ? 'text-secondary' : isNegative ? 'text-error' : 'text-on-surface-variant'
                }`}
              >
                {quote.change24h}
              </div>
              <div className="text-[9px] font-mono text-outline mt-1">
                {quote.category}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
