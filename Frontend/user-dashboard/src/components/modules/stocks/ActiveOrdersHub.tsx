import React, { useState } from 'react';
import { ListFilter, XCircle, CheckCircle2 } from 'lucide-react';

interface ActiveOrder {
  id: string;
  symbol: string;
  type: 'BUY_LIMIT' | 'SELL_LIMIT' | 'STOP_LOSS';
  shares: number;
  limitPrice: number;
  status: 'PENDING' | 'ROUTING' | 'CANCELLED';
  expires: string;
}

const INITIAL_ORDERS: ActiveOrder[] = [
  {
    id: 'ord-101',
    symbol: 'NVDA',
    type: 'BUY_LIMIT',
    shares: 1000,
    limitPrice: 135.0,
    status: 'PENDING',
    expires: 'GTC (Good-Til-Cancelled)',
  },
  {
    id: 'ord-102',
    symbol: 'MSFT',
    type: 'STOP_LOSS',
    shares: 500,
    limitPrice: 430.0,
    status: 'ROUTING',
    expires: 'Day Order (NYSE Close)',
  },
  {
    id: 'ord-103',
    symbol: 'SPACEX',
    type: 'BUY_LIMIT',
    shares: 200,
    limitPrice: 800.0,
    status: 'PENDING',
    expires: 'SPV Window (30 Days)',
  },
];

export const ActiveOrdersHub: React.FC = () => {
  const [orders, setOrders] = useState<ActiveOrder[]>(INITIAL_ORDERS);
  const [cancelledId, setCancelledId] = useState<string | null>(null);

  const handleCancel = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setCancelledId(id);
    setTimeout(() => setCancelledId(null), 2000);
  };

  return (
    <div className="bg-surface-container-low rounded-DEFAULT border border-border-hairline p-4 space-y-3" data-testid="active-orders-hub">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-primary" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
            Active Limit Orders & Execution Desk
          </h2>
        </div>
        <span className="text-[10px] font-mono text-outline uppercase bg-surface-container-high px-2 py-0.5 rounded-DEFAULT">
          {orders.length} OPEN DESK ORDERS
        </span>
      </div>

      {cancelledId && (
        <div className="p-2 bg-secondary/10 border border-secondary/30 rounded-DEFAULT text-xs font-mono text-secondary flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Order {cancelledId} successfully cancelled from DMA book.</span>
        </div>
      )}

      {/* Orders Table */}
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
            {orders.map((order) => (
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
                  {order.shares.toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right font-mono tabular-nums text-on-surface font-semibold">
                  ${order.limitPrice.toFixed(2)}
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
    </div>
  );
};
