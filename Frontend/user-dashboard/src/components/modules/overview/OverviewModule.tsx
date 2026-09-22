import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Server,
  ArrowRightLeft,
  DollarSign,
  Layers,
  Lock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { usePortfolioStore } from '../../../store/usePortfolioStore';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { REAL_ESTATE_ASSETS, EXOTIC_ASSETS } from '../../../lib/alternativeAssetData';
import { formatMaskedCurrency } from '../../../lib/calculations';
import { Button } from '../../ui/button';

export const OverviewModule: React.FC = () => {
  const maskBalances = useDashboardStore((s) => s.maskBalances);
  const openModal = usePortfolioStore((s) => s.openModal);
  const netWorth = usePortfolioStore((s) => s.netWorth);
  const storeReturns = usePortfolioStore((s) => s.returns);
  const storeAllocations = usePortfolioStore((s) => s.allocations);

  // Live streaming heartbeat simulation
  const [pulseTime, setPulseTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setPulseTime(new Date()), 3000);
    return () => clearInterval(timer);
  }, []);

  const totalPortfolioValue = netWorth;

  const allTimeGain = React.useMemo(() => {
    if (storeReturns?.ALL) {
      const { dollarChange, percentageChange } = storeReturns.ALL;
      const sign = dollarChange >= 0 ? '+' : '-';
      return `${sign}$${Math.abs(dollarChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${sign}${Math.abs(percentageChange).toFixed(2)}%) ALL-TIME`;
    }
    if (storeReturns?.allTime) {
      const { dollarChange, percentageChange } = storeReturns.allTime;
      const sign = dollarChange >= 0 ? '+' : '-';
      return `${sign}$${Math.abs(dollarChange).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${sign}${Math.abs(percentageChange).toFixed(2)}%) ALL-TIME`;
    }
    if (totalPortfolioValue > 0) {
      // Baseline cost basis for the $14,820,450 Global portfolio with +$1,562,200 gain
      const baselineCostBasis = 13258250.0;
      const dollarGain = totalPortfolioValue - baselineCostBasis;
      const pctGain = baselineCostBasis > 0 ? (dollarGain / baselineCostBasis) * 100 : 0;
      const sign = dollarGain >= 0 ? '+' : '-';
      return `${sign}$${Math.abs(dollarGain).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${sign}${Math.abs(pctGain).toFixed(2)}%) ALL-TIME`;
    }
    return null;
  }, [storeReturns, totalPortfolioValue]);

  const telemetryNodes = [
    {
      name: 'Geneva Bunker Alpha',
      role: 'MPC Global Cold Vault',
      status: 'OPTIMAL',
      latency: '0.02ms',
      climate: '19.2°C • 45% RH',
    },
    {
      name: 'Zurich Enclave Node 04',
      role: 'Institutional Validator & L2 Staking',
      status: 'OPTIMAL',
      latency: '11.4ms',
      climate: 'Block #21,894,203',
    },
    {
      name: 'New York NY-03',
      role: 'Circle USDC Treasury Ramp',
      status: 'VERIFIED',
      latency: '24.1ms',
      climate: 'ZK-Proof #99214-CH',
    },
  ];

  const oraclePrices = [
    { symbol: 'BTC/USD', price: '$89,420.00', change: '+43.99%', isUp: true },
    { symbol: 'ETH/USD', price: '$3,410.50', change: '+20.09%', isUp: true },
    { symbol: 'NVDA', price: '$138.85', change: '+23.53%', isUp: true },
    { symbol: 'SPV-CH-01', price: '$142.80 CHF', change: '+4.20%', isUp: true },
    { symbol: 'HAGERTY-250', price: '382.4 pts', change: '+18.40%', isUp: true },
  ];

  const transactions = useLiquidStore((s) => s.transactions);
  const userRealEstateHoldings = useAlternativeStore((s) => s.userRealEstateHoldings);
  const userVehicleHoldings = useAlternativeStore((s) => s.userVehicleHoldings);

  const [blotterPage, setBlotterPage] = useState(1);
  const [blotterSortOrder, setBlotterSortOrder] = useState<'asc' | 'desc'>('desc');
  const [blotterSortField, setBlotterSortField] = useState<'time' | 'price'>('time');
  const BLOTTER_PAGE_SIZE = 4;

  const dynamicBlotter = useMemo(() => {
    const list: Array<{
      id: string;
      asset: string;
      side: string;
      size: string;
      price: string;
      numericPrice: number;
      venue: string;
      status: string;
      time: string;
    }> = [];

    // Map real liquid transactions
    transactions.forEach((tx) => {
      let venue = 'Geneva OTC Bunker';
      if (tx.vertical === 'STOCKS') venue = 'DTCC / Euroclear CH';
      else if (tx.vertical === 'REAL_ESTATE') venue = 'DLT Land Registry';
      else if ((tx.vertical as string) === 'CARS') venue = 'Geneva Freeport Vault';
      else if (tx.vertical === 'CASH') venue = 'Zurich Enclave SIC';

      list.push({
        id: tx.id,
        asset: tx.description,
        side: tx.type,
        size: formatMaskedCurrency(tx.amountUsd, false),
        price: formatMaskedCurrency(tx.amountUsd, false),
        numericPrice: tx.amountUsd,
        venue,
        status: tx.status,
        time: tx.timestamp,
      });
    });

    // Active real estate holdings
    Object.entries(userRealEstateHoldings).forEach(([propId, holding]) => {
      const asset = REAL_ESTATE_ASSETS.find((a) => a.id === propId);
      if (asset && holding.tokens > 0) {
        list.push({
          id: `re-holding-${propId}`,
          asset: asset.name.toUpperCase(),
          side: 'BUY SPV',
          size: `${holding.tokens.toLocaleString()} TKNS`,
          price: `$${asset.tokenPrice.toFixed(2)}`,
          numericPrice: holding.tokens * asset.tokenPrice,
          venue: 'DLT Land Registry',
          status: 'CLEARED',
          time: 'Active Position',
        });
      }
    });

    // Active exotic vehicles / horology holdings
    Object.entries(userVehicleHoldings).forEach(([assetId, holding]) => {
      const asset = EXOTIC_ASSETS.find((a) => a.id === assetId);
      if (asset && (holding.owned || (holding.totalInvested && holding.totalInvested > 0))) {
        list.push({
          id: `car-holding-${assetId}`,
          asset: asset.title.toUpperCase(),
          side: holding.purchaseType === 'fractional' ? 'FRACTIONAL' : 'FULL ASSET',
          size: '1 UNIT',
          price: `$${(holding.totalInvested || asset.fairMarketValue).toLocaleString()}`,
          numericPrice: holding.totalInvested || asset.fairMarketValue,
          venue: asset.custodyEnclave || 'Geneva Freeport Vault',
          status: 'BONDED',
          time: 'Active Vaulted',
        });
      }
    });

    // Sort entries
    return [...list].sort((a, b) => {
      if (blotterSortField === 'price') {
        return blotterSortOrder === 'asc'
          ? a.numericPrice - b.numericPrice
          : b.numericPrice - a.numericPrice;
      }
      const cmp = a.time.localeCompare(b.time);
      return blotterSortOrder === 'asc' ? cmp : -cmp;
    });
  }, [transactions, userRealEstateHoldings, userVehicleHoldings, blotterSortField, blotterSortOrder]);

  const totalBlotterPages = Math.max(1, Math.ceil(dynamicBlotter.length / BLOTTER_PAGE_SIZE));
  const safeBlotterPage = Math.min(blotterPage, totalBlotterPages);
  const paginatedBlotter = dynamicBlotter.slice(
    (safeBlotterPage - 1) * BLOTTER_PAGE_SIZE,
    safeBlotterPage * BLOTTER_PAGE_SIZE
  );

  const toggleSort = () => {
    if (blotterSortField === 'time') {
      if (blotterSortOrder === 'desc') setBlotterSortOrder('asc');
      else {
        setBlotterSortField('price');
        setBlotterSortOrder('desc');
      }
    } else {
      if (blotterSortOrder === 'desc') setBlotterSortOrder('asc');
      else {
        setBlotterSortField('time');
        setBlotterSortOrder('desc');
      }
    }
  };

  const verticalAllocations = storeAllocations.map((alloc) => ({
    name: alloc.name,
    value: alloc.actualValue,
    pct: alloc.actualPct,
    color: alloc.color,
  }));

  return (
    <div
      data-testid="consolidated-executive-overview"
      className="min-h-[540px] w-full space-y-6 select-none animate-fade-in"
    >
      {/* View Header */}
      <div className="border-b border-border-hairline pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-semibold">
              Universal Terminal
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-xs bg-primary/10 border border-primary/30 text-primary font-bold">
              ACTIVE ALLOCATOR
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-semibold text-on-surface tracking-tight mt-1">
            Consolidated Executive Overview
          </h1>
          <p className="text-xs text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
            Multi-asset wealth orchestration across all services with real-time mark-to-market valuations and institutional risk telemetry.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="space-x-1 font-mono text-xs cursor-pointer"
            onClick={() => window.open('https://docs.wavyassets.com', '_blank')}
          >
            <span>Documentation</span>
            <ArrowUpRight className="h-3 w-3" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="font-mono text-xs font-semibold bg-primary text-on-primary hover:bg-primary-container cursor-pointer"
            onClick={() => openModal('trade')}
          >
            Execute Mandate
          </Button>
        </div>
      </div>

      {/* 4-KPI Institutional Summary Ribbon */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Consolidated Net Worth */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                CONSOLIDATED NET WORTH
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-on-surface tabular-nums">
                  {formatMaskedCurrency(totalPortfolioValue, maskBalances)}
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-mono rounded-DEFAULT uppercase">
              100% ASSETS
            </span>
          </div>
          {allTimeGain && (
            <div className="flex items-center gap-1.5 text-tertiary font-mono text-xs tabular-nums font-semibold mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{maskBalances ? '••••••' : allTimeGain}</span>
            </div>
          )}
        </div>

        {/* KPI 2: Fiduciary Risk Rating */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                FIDUCIARY AUDIT SCORE
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-primary tabular-nums">
                  99.4 / 100
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-mono rounded-DEFAULT uppercase font-bold">
              AAA RATED
            </span>
          </div>
          <div className="text-[11px] font-mono text-outline mt-2">
            FINMA &amp; VARA Dual-Cleared Cadastre
          </div>
        </div>

        {/* KPI 3: Real-Time Telemetry Uptime */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                ENCLAVE LATENCY
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-tertiary tabular-nums">
                  0.03 ms
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-tertiary/10 text-tertiary text-[10px] font-mono rounded-DEFAULT uppercase font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              NOMINAL
            </span>
          </div>
          <div className="text-[11px] font-mono text-outline mt-2">
            99.999% SLA • Geneva &amp; Zurich Freezone
          </div>
        </div>

        {/* KPI 4: Proof of Reserves */}
        <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono text-outline uppercase tracking-widest block">
                ORACLE PROOF OF RESERVES
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-mono font-bold text-on-surface tabular-nums">
                  100% COLLATERAL
                </span>
              </div>
            </div>
            <span className="px-1.5 py-0.5 bg-surface-container text-primary text-[10px] font-mono rounded-DEFAULT uppercase font-bold">
              VERIFIED
            </span>
          </div>
          <div className="text-[11px] font-mono text-tertiary mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ZK Proof #99214-CH Synced</span>
          </div>
        </div>
      </section>

      {/* Main 2-Column Institutional Core Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 Cols): Live Telemetry Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-DEFAULT border border-border-hairline bg-surface-container-low p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs font-serif font-bold text-on-surface uppercase tracking-wider">
                  Telemetry Feed
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-tertiary">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                <span>STREAMING</span>
              </div>
            </div>

            {/* Enclave Nodes */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-outline uppercase tracking-wider block">
                Active Enclave Facilities
              </span>
              <div className="space-y-2">
                {telemetryNodes.map((node, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-surface-container border border-border-hairline rounded-xs flex items-center justify-between text-xs font-mono"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 font-semibold text-on-surface">
                        <Server className="w-3 h-3 text-primary" />
                        <span>{node.name}</span>
                      </div>
                      <div className="text-[10px] text-outline">{node.role}</div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <span className="px-1.5 py-0.2 bg-tertiary/10 text-tertiary rounded text-[9px] font-bold">
                        {node.status}
                      </span>
                      <div className="text-[10px] text-outline">{node.climate}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Oracle Mark-to-Market Prices */}
            <div className="space-y-2 pt-2 border-t border-border-hairline">
              <span className="text-[10px] font-mono text-outline uppercase tracking-wider block">
                Live Mark-to-Market Oracle Feed
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {oraclePrices.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-surface-container border border-border-hairline rounded-xs font-mono"
                  >
                    <div className="text-[10px] text-outline font-semibold">{item.symbol}</div>
                    <div className="text-xs font-bold text-on-surface mt-0.5">{item.price}</div>
                    <div className="text-[10px] text-tertiary font-semibold">{item.change}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Telemetry Audit Log */}
            <div className="space-y-2 pt-2 border-t border-border-hairline">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                  Cryptographic Audit Log
                </span>
                <span className="text-[9px] font-mono text-outline">
                  {pulseTime.toLocaleTimeString()}
                </span>
              </div>
              <div className="bg-surface-container-lowest p-2 rounded-xs border border-border-hairline font-mono text-[10px] text-outline space-y-1">
                <div className="text-tertiary">
                  &gt; [15:32:04] Staking rewards auto-compounded (+0.082 ETH)
                </div>
                <div className="text-on-surface-variant">
                  &gt; [15:28:11] Swiss Land Registry Cadastre proof verified
                </div>
                <div className="text-on-surface-variant">
                  &gt; [15:15:40] DTCC settlement batch cleared for NVDA
                </div>
                <div className="text-outline">
                  &gt; [15:00:02] Daily proof-of-reserve ZK-attestation published
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Order Execution & Position Depth */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-DEFAULT border border-border-hairline bg-surface-container-low p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border-hairline pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-xs font-serif font-bold text-on-surface uppercase tracking-wider">
                  Order Execution &amp; Position Depth
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px] text-secondary font-bold px-1.5 py-0.5 bg-secondary/10 border border-secondary/20 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span>LIVE EXECUTION</span>
              </div>
            </div>

            {/* Multi-Asset Segmented Allocation Visualizer */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                  Consolidated Capital Allocation
                </span>
                <span className="text-xs font-mono font-bold text-on-surface">
                  {formatMaskedCurrency(totalPortfolioValue, maskBalances)}
                </span>
              </div>

              {/* Progress ribbon */}
              <div className="h-2.5 w-full bg-surface-container rounded-full overflow-hidden flex">
                {verticalAllocations.map((alloc, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${alloc.pct}%`, backgroundColor: alloc.color }}
                    title={`${alloc.name}: ${alloc.pct}%`}
                    className="h-full transition-all duration-500 hover:opacity-80"
                  />
                ))}
              </div>

              {/* Allocation Tags Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
                {verticalAllocations.map((alloc, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-surface-container border border-border-hairline rounded-xs flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-outline">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: alloc.color }}
                      />
                      <span className="truncate">{alloc.name}</span>
                    </div>
                    <div className="flex justify-between items-baseline mt-1 font-semibold">
                      <span className="text-on-surface tabular-nums">
                        {formatMaskedCurrency(alloc.value, maskBalances)}
                      </span>
                      <span className="text-[10px] text-primary">{alloc.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institutional Execution Blotter */}
            <div className="space-y-2 pt-2 border-t border-border-hairline">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                  Recent Venue Fills &amp; Position Depth ({dynamicBlotter.length} Total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="blotter-sort-btn"
                    onClick={toggleSort}
                    className="flex items-center gap-1 px-2 py-0.5 bg-surface-container hover:bg-surface-container-high border border-border-hairline rounded text-[10px] font-mono text-on-surface transition-colors cursor-pointer"
                    title={`Sorted by ${blotterSortField} (${blotterSortOrder.toUpperCase()})`}
                  >
                    <ArrowUpDown className="w-3 h-3 text-primary" />
                    <span>
                      {blotterSortField === 'time' ? 'Time' : 'Price'}{' '}
                      ({blotterSortOrder === 'asc' ? '↑' : '↓'})
                    </span>
                  </button>
                  <span className="text-[10px] font-mono text-tertiary">Direct DMA / Dark Pool</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead>
                    <tr className="text-[10px] text-outline border-b border-border-hairline uppercase">
                      <th className="pb-1.5 font-semibold">Contract / Asset</th>
                      <th className="pb-1.5 font-semibold">Side</th>
                      <th className="pb-1.5 font-semibold">Size</th>
                      <th className="pb-1.5 font-semibold">Mark Price</th>
                      <th className="pb-1.5 font-semibold">Routing Venue</th>
                      <th className="pb-1.5 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-hairline/60">
                    {paginatedBlotter.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-container transition-colors">
                        <td className="py-2 text-on-surface font-medium">{order.asset}</td>
                        <td className="py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              order.side.includes('BUY') || order.side.includes('DEPOSIT')
                                ? 'bg-tertiary/10 text-tertiary'
                                : 'bg-primary/10 text-primary'
                            }`}
                          >
                            {order.side}
                          </span>
                        </td>
                        <td className="py-2 text-on-surface tabular-nums">{order.size}</td>
                        <td className="py-2 text-on-surface font-semibold tabular-nums">
                          {order.price}
                        </td>
                        <td className="py-2 text-outline text-[11px]">{order.venue}</td>
                        <td className="py-2 text-right">
                          <span className="text-tertiary text-[10px] font-semibold">
                            ✓ {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Blotter Pagination Controls */}
              {totalBlotterPages > 1 && (
                <div className="flex items-center justify-between pt-1 font-mono text-xs text-outline border-t border-border-hairline/40">
                  <span data-testid="blotter-page-info" className="text-[10px]">
                    Page {safeBlotterPage} of {totalBlotterPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      data-testid="blotter-prev-btn"
                      disabled={safeBlotterPage <= 1}
                      onClick={() => setBlotterPage((p) => Math.max(1, p - 1))}
                      className="p-1 rounded bg-surface-container hover:bg-surface-container-high border border-border-hairline disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      data-testid="blotter-next-btn"
                      disabled={safeBlotterPage >= totalBlotterPages}
                      onClick={() => setBlotterPage((p) => Math.min(totalBlotterPages, p + 1))}
                      className="p-1 rounded bg-surface-container hover:bg-surface-container-high border border-border-hairline disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar inside Order Execution */}
            <div className="pt-2 border-t border-border-hairline flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => openModal('trade')}
                  className="font-mono text-xs bg-primary text-on-primary hover:bg-primary-container flex items-center gap-1 cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Trade / Swap</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openModal('deposit')}
                  className="font-mono text-xs flex items-center gap-1 cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Wire Deposit</span>
                </Button>
              </div>

              <div className="text-[10px] font-mono text-outline flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-tertiary" />
                <span>Zero-Slippage Routing Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WavyAssets Telemetry Footer */}
      <div className="h-9 rounded-xs border border-border-hairline bg-surface-container-lowest px-3.5 flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
        <div className="flex items-center space-x-2">
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse" />
          <span>WavyAssets Status: Optimal (99.999% SLA)</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Settlement Engine: Sub-50ms</span>
          <span>Zero CLS Enforced</span>
        </div>
      </div>
    </div>
  );
};
