import React, { useState } from 'react';
import { Gauge, Download, RotateCw, CheckCircle2 } from 'lucide-react';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../../lib/calculations';

export const StakingTelemetry: React.FC<{ maskBalances?: boolean }> = ({ maskBalances: propMask }) => {
  const { unclaimedRewards, isCompounding, triggerFastCompound } = useLiquidStore();
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;
  const [exportedFormat, setExportedFormat] = useState<string | null>(null);

  const handleExport = (format: string) => {
    const headers = ['Lot_ID', 'Timestamp', 'Asset', 'Accounting_Method', 'Bonded_Qty', 'Cost_Basis_USD', 'Accrued_Yield_USD', 'Validator_Node'];
    const rows = [
      ['LOT-ETH-01', '2024-01-15T08:30:00Z', 'ETH', format, '380.0', '1079200.00', '14210.40', 'ETH VALIDATOR NODE 04'],
      ['LOT-SOL-01', '2024-02-01T12:00:00Z', 'SOL', format, '2400.0', '324000.00', '3120.90', 'SOL MARINADE SOVEREIGN'],
      ['LOT-AVAX-01', '2024-02-18T16:45:00Z', 'AVAX', format, '8500.0', '208250.00', '1161.00', 'AVALANCHE SUBNET CORE'],
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
          7.42% BLENDED RUN-RATE
        </span>
      </div>

      {/* 3 Staking Protocol Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
          <div className="flex items-center justify-between text-[10px] font-mono text-outline">
            <span>ETH VALIDATOR NODE 04</span>
            <span className="text-tertiary font-bold">ONLINE</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-mono font-bold text-on-surface">3.82% APY</span>
            <span className="text-[10px] font-mono text-outline">
              {maskBalances ? '•••• ETH Bonded' : '380 ETH Bonded'}
            </span>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-DEFAULT mt-2 overflow-hidden">
            <div className="bg-primary h-full" style={{ width: '65%' }} />
          </div>
          <span className="text-[10px] font-mono text-outline block mt-1">Next epoch: 18m 42s</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
          <div className="flex items-center justify-between text-[10px] font-mono text-outline">
            <span>SOL MARINADE SOVEREIGN</span>
            <span className="text-tertiary font-bold">OPTIMAL</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-mono font-bold text-tertiary">7.42% APY</span>
            <span className="text-[10px] font-mono text-outline">
              {maskBalances ? '•••• SOL Bonded' : '2,400 SOL Bonded'}
            </span>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-DEFAULT mt-2 overflow-hidden">
            <div className="bg-tertiary h-full" style={{ width: '85%' }} />
          </div>
          <span className="text-[10px] font-mono text-outline block mt-1">Epoch 682 // 99.98% uptime</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
          <div className="flex items-center justify-between text-[10px] font-mono text-outline">
            <span>AVALANCHE SUBNET CORE</span>
            <span className="text-secondary font-bold">SYNCED</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg font-mono font-bold text-secondary">5.90% APY</span>
            <span className="text-[10px] font-mono text-outline">
              {maskBalances ? '•••• AVAX Bonded' : '8,500 AVAX Bonded'}
            </span>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-DEFAULT mt-2 overflow-hidden">
            <div className="bg-secondary h-full" style={{ width: '50%' }} />
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
