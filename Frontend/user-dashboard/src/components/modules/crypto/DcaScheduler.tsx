import React, { useState } from 'react';
import { Calendar, Plus, Play, Pause, Check } from 'lucide-react';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../../lib/calculations';

export interface DcaSchedulerProps {
  maskBalances?: boolean;
}

export const DcaScheduler: React.FC<DcaSchedulerProps> = ({ maskBalances: propMask }) => {
  const { dcaSchedules, toggleDcaSchedule, addDcaSchedule } = useLiquidStore();
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const [asset, setAsset] = useState<string>('BTC');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [amountUsd, setAmountUsd] = useState<number>(25000);
  const [sourceAccount] = useState<string>('USD Fedwire Treasury');
  const [justAdded, setJustAdded] = useState<boolean>(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      return;
    }
    addDcaSchedule({
      asset,
      frequency,
      amountUsd,
      sourceAccount,
      nextExecution: 'Scheduled next cycle',
      active: true,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="bg-surface-container-low rounded-DEFAULT border border-border-hairline p-4 space-y-4" data-testid="dca-scheduler">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h2 className="font-serif text-sm font-semibold uppercase tracking-wide text-on-surface">
            Automated Dollar-Cost Averaging (DCA) Scheduler
          </h2>
        </div>
        <span className="text-[10px] font-mono text-tertiary bg-tertiary/10 border border-tertiary/30 px-1.5 py-0.5 rounded-DEFAULT">
          AUTO-DEBIT ENABLED
        </span>
      </div>

      {/* Creation Form */}
      <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
        <div>
          <label className="text-[10px] font-mono text-outline uppercase block mb-1">Target Asset</label>
          <select
            data-testid="dca-asset-select"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
            className="w-full bg-surface-container border border-border-hairline rounded-DEFAULT px-2 py-1.5 text-xs font-mono font-bold text-on-surface focus:outline-none"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="SOL">Solana (SOL)</option>
            <option value="AVAX">Avalanche (AVAX)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-outline uppercase block mb-1">Frequency</label>
          <select
            data-testid="dca-frequency-select"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY')}
            className="w-full bg-surface-container border border-border-hairline rounded-DEFAULT px-2 py-1.5 text-xs font-mono text-on-surface focus:outline-none"
          >
            <option value="DAILY">Daily (00:00 UTC)</option>
            <option value="WEEKLY">Weekly (Monday)</option>
            <option value="BI_WEEKLY">Bi-Weekly (1st & 15th)</option>
            <option value="MONTHLY">Monthly (1st)</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-mono text-outline uppercase block mb-1">Debit Amount (USD)</label>
          <input
            type="number"
            min="1"
            step="any"
            data-testid="dca-amount-input"
            value={amountUsd}
            onChange={(e) => setAmountUsd(Number(e.target.value))}
            className="w-full bg-surface-container border border-border-hairline rounded-DEFAULT px-2 py-1.5 text-xs font-mono font-bold text-primary focus:outline-none"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            data-testid="deploy-dca-btn"
            className="w-full py-1.5 bg-primary-container text-on-primary hover:bg-primary font-mono text-xs font-bold uppercase rounded-DEFAULT flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            {justAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{justAdded ? 'Deployed' : 'Deploy DCA'}</span>
          </button>
        </div>
      </form>

      {/* Active Schedules List */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-outline uppercase tracking-wider block">
          Active Execution Schedules ({dcaSchedules.length})
        </span>

        <div className="divide-y divide-border-hairline border border-border-hairline rounded-DEFAULT bg-surface-container-lowest">
          {dcaSchedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-2.5 flex items-center justify-between text-xs font-mono"
              data-testid={`dca-item-${schedule.id}`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary text-sm">{schedule.asset}</span>
                <span className="px-1.5 py-0.2 bg-surface-container text-[10px] rounded-xs text-on-surface-variant">
                  {schedule.frequency}
                </span>
                <span className="text-on-surface font-semibold">
                  {formatMaskedCurrency(schedule.amountUsd, maskBalances)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[10px] text-outline hidden sm:inline">
                  {schedule.nextExecution}
                </span>
                <button
                  type="button"
                  data-testid={`toggle-dca-${schedule.id}`}
                  onClick={() => toggleDcaSchedule(schedule.id)}
                  className={`px-2 py-0.5 rounded-DEFAULT text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                    schedule.active
                      ? 'bg-tertiary/15 text-tertiary border border-tertiary/30'
                      : 'bg-surface-container text-outline border border-border-hairline'
                  }`}
                >
                  {schedule.active ? (
                    <>
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>ACTIVE</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-2.5 h-2.5" />
                      <span>PAUSED</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
