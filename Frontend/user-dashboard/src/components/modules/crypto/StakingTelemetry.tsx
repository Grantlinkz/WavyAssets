import React, { useState, useMemo } from 'react';
import { Gauge, Download, RotateCw, CheckCircle2 } from 'lucide-react';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../../lib/calculations';
import { CRYPTO_HOLDINGS_DATA, type CryptoHolding } from '../../../lib/liquidAssetData';

export interface StakingTelemetryProps {
  maskBalances?: boolean;
  stakedHoldings?: CryptoHolding[];
  blendedApy?: number;
}

interface StakingTaxLot {
  lotId: string;
  timestamp: string;
  asset: string;
  bondedQty: number;
  costBasisUsd: number;
  accruedYieldUsd: number;
  validatorNode: string;
}

const IMMUTABLE_STAKING_TAX_LOTS: StakingTaxLot[] = [
  {
    lotId: 'LOT-ETH-2024-001',
    timestamp: '2024-01-15T08:30:00Z',
    asset: 'ETH',
    bondedQty: 250.0,
    costBasisUsd: 710000.0,
    accruedYieldUsd: 8240.5,
    validatorNode: 'ETH VALIDATOR NODE 04',
  },
  {
    lotId: 'LOT-ETH-2024-002',
    timestamp: '2024-02-10T14:15:00Z',
    asset: 'ETH',
    bondedQty: 100.0,
    costBasisUsd: 295000.0,
    accruedYieldUsd: 3150.2,
    validatorNode: 'ETH VALIDATOR NODE 04',
  },
  {
    lotId: 'LOT-SOL-2024-001',
    timestamp: '2024-02-01T12:00:00Z',
    asset: 'SOL',
    bondedQty: 2200.0,
    costBasisUsd: 297000.0,
    accruedYieldUsd: 4120.8,
    validatorNode: 'SOL MARINADE Global',
  },
  {
    lotId: 'LOT-AVAX-2024-001',
    timestamp: '2024-02-18T16:45:00Z',
    asset: 'AVAX',
    bondedQty: 4800.0,
    costBasisUsd: 117600.0,
    accruedYieldUsd: 1840.4,
    validatorNode: 'AVALANCHE SUBNET CORE',
  },
];

export const StakingTelemetry: React.FC<StakingTelemetryProps> = ({
  maskBalances: propMask,
  stakedHoldings: propStaked,
  blendedApy: propBlendedApy,
}) => {
  const { unclaimedRewards, isCompounding, triggerFastCompound } = useLiquidStore();
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  // Compute live staked assets directly from active holdings
  const activeStaked = useMemo(() => {
    if (propStaked) return propStaked;
    return CRYPTO_HOLDINGS_DATA.filter((h) => h.custodyType === 'STAKING_LOCKUP' && h.balance > 0);
  }, [propStaked]);

  const totalStakedVal = useMemo(() => {
    return activeStaked.reduce((sum, h) => sum + h.balance * h.spotPrice, 0);
  }, [activeStaked]);

  const dynamicBlendedApy = useMemo(() => {
    if (propBlendedApy !== undefined) return propBlendedApy;
    if (totalStakedVal === 0) return 0;
    const weightedSum = activeStaked.reduce(
      (sum, h) => sum + h.balance * h.spotPrice * (h.stakingApy || 0),
      0
    );
    return weightedSum / totalStakedVal;
  }, [propBlendedApy, totalStakedVal, activeStaked]);

  // Asset-specific holdings for live validator gauges (only active staked, no fallback to unstaked)
  const ethHolding = useMemo(() => {
    return activeStaked.find((h) => h.symbol === 'ETH');
  }, [activeStaked]);

  const solHolding = useMemo(() => {
    return activeStaked.find((h) => h.symbol === 'SOL');
  }, [activeStaked]);

  const avaxHolding = useMemo(() => {
    return activeStaked.find((h) => h.symbol === 'AVAX');
  }, [activeStaked]);

  const handleExport = (format: string) => {
    const headers = [
      'Lot_ID',
      'Timestamp',
      'Asset',
      'Accounting_Method',
      'Bonded_Qty',
      'Cost_Basis_USD',
      'Accrued_Yield_USD',
      'Validator_Node',
    ];

    const sortedLots = [...IMMUTABLE_STAKING_TAX_LOTS].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return format === 'LIFO' ? timeB - timeA : timeA - timeB;
    });

    const rows = sortedLots.map((lot) => [
      lot.lotId,
      lot.timestamp,
      lot.asset,
      format,
      lot.bondedQty.toFixed(1),
      lot.costBasisUsd.toFixed(2),
      lot.accruedYieldUsd.toFixed(2),
      lot.validatorNode,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    if (typeof window !== 'undefined' && window.document) {
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `WavyAssets_TaxLot_${format}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setExportedFormat(format);
    setTimeout(() => setExportedFormat(null), 2500);
  };

  return (
    <div className="bg-surface-container-low rounded-DEFAULT border border-border-hairline p-4 space-y-4" data-testid="staking-telemetry">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-tertiary" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
            Staking Telemetry & Tax-Lot Audit Export
          </h2>
        </div>
        <span className="text-[10px] font-mono text-tertiary bg-tertiary/10 border border-tertiary/30 px-1.5 py-0.5 rounded-DEFAULT">
          {dynamicBlendedApy > 0 ? `${dynamicBlendedApy.toFixed(2)}% BLENDED RUN-RATE` : '0.00% BLENDED RUN-RATE'}
        </span>
      </div>

      {/* 3 Staking Protocol Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Node 1: ETH */}
        <div className="p-3 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
          <div className="flex items-center justify-between text-[10px] font-mono text-outline">
            <span>ETH VALIDATOR NODE 04</span>
            <span className="text-tertiary font-bold">{ethHolding && ethHolding.balance > 0 ? 'ONLINE' : 'INACTIVE'}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-mono font-bold text-on-surface">
              {(ethHolding?.stakingApy ?? 0).toFixed(2)}% APY
            </span>
            <span className="text-[10px] font-mono text-outline">
              {maskBalances
                ? '•••• ETH Bonded'
                : `${(ethHolding?.balance || 0).toLocaleString()} ETH Bonded`}
            </span>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-DEFAULT mt-2 overflow-hidden">
            <div className="bg-primary h-full" style={{ width: ethHolding && ethHolding.balance > 0 ? '65%' : '0%' }} />
          </div>
          <span className="text-[10px] font-mono text-outline block mt-1">Next epoch: 18m 42s</span>
        </div>

        {/* Node 2: SOL */}
        <div className="p-3 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
          <div className="flex items-center justify-between text-[10px] font-mono text-outline">
            <span>SOL MARINADE Global</span>
            <span className="text-tertiary font-bold">{solHolding && solHolding.balance > 0 ? 'OPTIMAL' : 'INACTIVE'}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-mono font-bold text-tertiary">
              {(solHolding?.stakingApy ?? 0).toFixed(2)}% APY
            </span>
            <span className="text-[10px] font-mono text-outline">
              {maskBalances
                ? '•••• SOL Bonded'
                : `${(solHolding?.balance || 0).toLocaleString()} SOL Bonded`}
            </span>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-DEFAULT mt-2 overflow-hidden">
            <div className="bg-tertiary h-full" style={{ width: solHolding && solHolding.balance > 0 ? '85%' : '0%' }} />
          </div>
          <span className="text-[10px] font-mono text-outline block mt-1">Epoch 682 // 99.98% uptime</span>
        </div>

        {/* Node 3: AVAX */}
        <div className="p-3 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
          <div className="flex items-center justify-between text-[10px] font-mono text-outline">
            <span>AVALANCHE SUBNET CORE</span>
            <span className="text-secondary font-bold">{avaxHolding && avaxHolding.balance > 0 ? 'SYNCED' : 'INACTIVE'}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-mono font-bold text-secondary">
              {(avaxHolding?.stakingApy ?? 0).toFixed(2)}% APY
            </span>
            <span className="text-[10px] font-mono text-outline">
              {maskBalances
                ? '•••• AVAX Bonded'
                : `${(avaxHolding?.balance || 0).toLocaleString()} AVAX Bonded`}
            </span>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-DEFAULT mt-2 overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: avaxHolding && avaxHolding.balance > 0 ? '50%' : '0%' }} />
          </div>
          <span className="text-[10px] font-mono text-outline block mt-1">Delegated validator: Geneva #02</span>
        </div>
      </div>

      {/* Action Strip: Fast Auto-Compound & Tax Lot CSV */}
      <div className="p-3 bg-surface-container rounded-DEFAULT border border-border-hairline flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] font-mono text-outline uppercase block">Accrued Unclaimed Yield</span>
            <span className="text-sm font-mono font-bold text-tertiary tabular-nums" data-testid="unclaimed-rewards-value">
              {formatMaskedCurrency(unclaimedRewards, maskBalances)}
            </span>
          </div>
          <button
            type="button"
            data-testid="compound-all-btn"
            disabled={isCompounding || unclaimedRewards === 0}
            onClick={triggerFastCompound}
            className="px-2.5 py-1 bg-primary-container text-on-primary font-mono text-xs font-semibold rounded-DEFAULT hover:bg-primary transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isCompounding ? 'animate-spin' : ''}`} />
            <span>{isCompounding ? 'Compounding...' : 'Compound All'}</span>
          </button>
        </div>

        {/* Tax-lot export buttons */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-outline uppercase hidden sm:inline">Tax-Lot Audit:</span>
          <button
            type="button"
            data-testid="export-fifo-btn"
            onClick={() => handleExport('FIFO')}
            className="px-2 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-border-hairline text-[11px] font-mono rounded-DEFAULT flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3 text-outline" />
            <span>Export FIFO CSV</span>
          </button>
          <button
            type="button"
            data-testid="export-lifo-btn"
            onClick={() => handleExport('LIFO')}
            className="px-2 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-border-hairline text-[11px] font-mono rounded-DEFAULT flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-3 h-3 text-outline" />
            <span>Export LIFO CSV</span>
          </button>
          {exportedFormat && (
            <span className="text-[10px] font-mono text-tertiary flex items-center gap-0.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>{exportedFormat} Exported</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
