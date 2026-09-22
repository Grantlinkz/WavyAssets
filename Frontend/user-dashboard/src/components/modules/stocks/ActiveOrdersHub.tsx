import React, { useState, useEffect } from 'react';
import { ListFilter, XCircle, CheckCircle2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { STOCKS_HOLDINGS_DATA } from '../../../lib/liquidAssetData';

export const ActiveOrdersHub: React.FC<{ maskBalances?: boolean }> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const user = useAuthStore((s) => s.user);

  const { activeOrders, addActiveOrder, cancelActiveOrder, selectedStock } = useLiquidStore();
  const [cancelledId, setCancelledId] = useState<string | null>(null);
  const [showOrderForm, setShowOrderForm] = useState<boolean>(false);

  // Form State
  const [symbol, setSymbol] = useState<string>(selectedStock || 'NVDA');
  const [type, setType] = useState<'BUY_LIMIT' | 'SELL_LIMIT' | 'STOP_LOSS'>('BUY_LIMIT');
  const [shares, setShares] = useState<number>(500);
  const [limitPrice, setLimitPrice] = useState<number>(135.0);
  const [duration] = useState<string>('GTC (Good-Til-Cancelled)');
  const [justPlaced, setJustPlaced] = useState<boolean>(false);

  // Synchronize symbol with selectedStock whenever a user clicks any stock/SPV
  useEffect(() => {
    if (selectedStock) {
      setSymbol(selectedStock);
      setShowOrderForm(true);
      const stock = STOCKS_HOLDINGS_DATA.find((s) => s.symbol === selectedStock);
      if (stock) {
        setLimitPrice(stock.currentMark);
      }
    }
  }, [selectedStock]);

  const handleCancel = (id: string) => {
    cancelActiveOrder(id, user?.id);
    setCancelledId(id);
    setTimeout(() => setCancelledId(null), 2500);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (justPlaced) return;
    if (!Number.isFinite(shares) || shares <= 0 || !Number.isFinite(limitPrice) || limitPrice <= 0) {
      return;
    }

    addActiveOrder(
      {
        symbol,
        type,
        shares,
        limitPrice,
        status: 'PENDING',
        expires: duration,
      },
      user?.id
    );

    setJustPlaced(true);
    setTimeout(() => {
      setJustPlaced(false);
      setShowOrderForm(false);
    }, 1500);
  };

  return (
    <div className="bg-surface-container-low rounded-DEFAULT border border-border-hairline p-4 space-y-3" data-testid="active-orders-hub">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-border-hairline gap-2">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-primary" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
            Active Limit Orders &amp; Execution Desk
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-outline uppercase bg-surface-container-high px-2 py-0.5 rounded-DEFAULT">
            {activeOrders.length} OPEN DESK ORDERS
          </span>
          <button
            type="button"
            data-testid="toggle-place-order-form"
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded-DEFAULT text-[11px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Place Order</span>
            {showOrderForm ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Cancellation Confirmation Alert */}
      {cancelledId && (
        <div className="p-2 bg-secondary/10 border border-secondary/30 rounded-DEFAULT text-xs font-mono text-secondary flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Order {cancelledId} successfully cancelled from DMA book.</span>
        </div>
      )}

      {/* Order Placement Form */}
      {showOrderForm && (
        <form
          onSubmit={handlePlaceOrder}
          data-testid="limit-order-form"
          className="p-3 bg-surface-container-lowest border border-border-hairline rounded-DEFAULT grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs font-mono"
        >
          <div>
            <label className="text-[10px] text-outline uppercase block mb-1">Asset Symbol</label>
            <select
              data-testid="order-symbol-select"
              value={symbol}
              onChange={(e) => {
                setSymbol(e.target.value);
                const stock = STOCKS_HOLDINGS_DATA.find((s) => s.symbol === e.target.value);
                if (stock) {
                  setLimitPrice(stock.currentMark);
                }
              }}
              className="w-full bg-surface-container border border-border-hairline rounded px-2 py-1.5 font-bold text-on-surface focus:outline-none"
            >
              {STOCKS_HOLDINGS_DATA.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} — {s.name} ({s.isPreIpo ? 'SPV' : 'DMA'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-outline uppercase block mb-1">Order Type</label>
            <select
              data-testid="order-type-select"
              value={type}
              onChange={(e) => setType(e.target.value as 'BUY_LIMIT' | 'SELL_LIMIT' | 'STOP_LOSS')}
              className="w-full bg-surface-container border border-border-hairline rounded px-2 py-1.5 text-on-surface focus:outline-none"
            >
              <option value="BUY_LIMIT">BUY_LIMIT</option>
              <option value="SELL_LIMIT">SELL_LIMIT</option>
              <option value="STOP_LOSS">STOP_LOSS</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-outline uppercase block mb-1">Shares</label>
            <input
              type="number"
              min="1"
              data-testid="order-shares-input"
              value={shares}
              onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full bg-surface-container border border-border-hairline rounded px-2 py-1.5 text-on-surface focus:outline-none tabular-nums"
            />
          </div>

          <div>
            <label className="text-[10px] text-outline uppercase block mb-1">Limit Price ($)</label>
            <input
              type="number"
              min="0.01"
              step="any"
              data-testid="order-price-input"
              value={limitPrice}
              onChange={(e) => setLimitPrice(Math.max(0.01, parseFloat(e.target.value) || 0))}
              className="w-full bg-surface-container border border-border-hairline rounded px-2 py-1.5 text-primary font-bold focus:outline-none tabular-nums"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={justPlaced}
              data-testid="submit-desk-order-btn"
              className="w-full py-1.5 bg-primary-container text-on-primary hover:bg-primary font-bold uppercase rounded flex items-center justify-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              {justPlaced ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{justPlaced ? 'Deployed' : 'Deploy Order'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Orders Table or Empty State */}
      {activeOrders.length === 0 ? (
        <div
          data-testid="no-active-orders"
          className="p-8 text-center text-xs font-mono text-outline border border-dashed border-border-hairline rounded-DEFAULT bg-surface-container-lowest flex flex-col items-center justify-center gap-1"
        >
          <span className="font-semibold text-on-surface-variant">No open limit orders on execution desk.</span>
          <span className="text-[11px]">Deploy limit orders via the &ldquo;Place Order&rdquo; button above to track active DMA routing.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-border-hairline text-[10px] text-outline uppercase tracking-wider">
                <th className="py-2 px-3">Order ID</th>
                <th className="py-2 px-3">Symbol</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3 text-right">Shares</th>
                <th className="py-2 px-3 text-right">Limit Price</th>
                <th className="py-2 px-3">Duration</th>
                <th className="py-2 px-3 text-center">Status</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline font-sans text-xs">
              {activeOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container/60 transition-colors" data-testid={`active-order-${order.id}`}>
                  <td className="py-2 px-3 font-mono text-outline text-[11px]">{order.id}</td>
                  <td className="py-2 px-3 font-mono font-bold text-primary">{order.symbol}</td>
                  <td className="py-2 px-3 font-mono text-[11px]">
                    <span
                      className={`px-1.5 py-0.2 rounded-xs text-[10px] font-bold ${
                        order.type === 'BUY_LIMIT'
                          ? 'bg-tertiary/15 text-tertiary'
                          : 'bg-secondary/15 text-secondary'
                      }`}
                    >
                      {order.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-on-surface">
                    {maskBalances ? '••••' : order.shares.toLocaleString()}
                  </td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums text-on-surface font-semibold">
                    {maskBalances ? '••••' : `$${order.limitPrice.toFixed(2)}`}
                  </td>
                  <td className="py-2 px-3 text-outline text-[11px] font-mono">{order.expires}</td>
                  <td className="py-2 px-3 text-center">
                    <span className="px-1.5 py-0.2 rounded-xs bg-primary/10 text-primary text-[10px] font-mono font-bold">
                      {order.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      type="button"
                      data-testid={`cancel-order-${order.id}`}
                      onClick={() => handleCancel(order.id)}
                      className="p-1 hover:text-error transition-colors cursor-pointer"
                      title="Cancel Order"
                    >
                      <XCircle className="w-4 h-4 text-outline hover:text-error" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
