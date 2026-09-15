import React, { useState } from 'react';
import {
  PiggyBank,
  Sliders,
  ArrowLeftRight,
  CheckCircle2,
} from 'lucide-react';
import { useLiquidStore } from '../../../store/useLiquidStore';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../../lib/calculations';

interface CashSweepPotProps {
  maskBalances?: boolean;
}

export const CashSweepPot: React.FC<CashSweepPotProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const { autoSweepEnabled, sweepThreshold, toggleAutoSweep, setSweepThreshold } =
    useLiquidStore();

  const [fxAmountUsd, setFxAmountUsd] = useState('100,000.00');
  const [isConverting, setIsConverting] = useState(false);
  const [fxSuccess, setFxSuccess] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const fxRate = 0.8872;
  const numUsd = parseFloat(fxAmountUsd.replace(/,/g, '')) || 0;
  const calculatedChf = (numUsd * fxRate).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleConvert = () => {
    setIsConverting(true);
    setTimeout(() => {
      setIsConverting(false);
      setFxSuccess(true);
      setTimeout(() => setFxSuccess(false), 3500);
    }, 600);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. AUTOMATED SOVEREIGN CASH SWEEP POT */}
      <div className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-tertiary" />
            <span className="text-xs font-mono text-on-surface uppercase tracking-wider font-bold">
              Automated Sovereign Cash Sweep
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary font-mono text-[11px] rounded-DEFAULT font-semibold">
              5.20% NET APY
            </span>
            <button
              type="button"
              onClick={toggleAutoSweep}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-DEFAULT font-mono text-[10px] uppercase transition-colors ${
                autoSweepEnabled
                  ? 'bg-tertiary/10 text-tertiary border border-tertiary/30'
                  : 'bg-surface-container text-outline border border-border-hairline'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  autoSweepEnabled ? 'bg-tertiary animate-pulse' : 'bg-outline'
                }`}
              />
              <span>{autoSweepEnabled ? 'ACTIVE SWEEP' : 'PAUSED'}</span>
            </button>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3">
          <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
            <span className="text-[10px] font-mono text-outline uppercase block">
              Current Swept Capital
            </span>
            <div className="text-base font-mono text-on-surface tabular-nums font-bold mt-0.5">
              {formatMaskedCurrency(1250000.0, maskBalances)}
            </div>
            <span className="text-[10px] font-sans text-outline">US T-Bills & SNB Repos</span>
          </div>

          <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
            <span className="text-[10px] font-mono text-outline uppercase block">
              Est. Daily Yield
            </span>
            <div className="text-base font-mono text-tertiary tabular-nums font-bold mt-0.5">
              {maskBalances ? '••••••••' : '+$178.08 / day'}
            </div>
            <span className="text-[10px] font-sans text-tertiary">
              {maskBalances ? '••••••••' : '$65,000.00 / annualized'}
            </span>
          </div>

          <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
            <span className="text-[10px] font-mono text-outline uppercase block">
              Accrued MTD Interest
            </span>
            <div className="text-base font-mono text-primary tabular-nums font-bold mt-0.5">
              {maskBalances ? '••••••••' : '+$4,260.40'}
            </div>
            <span className="text-[10px] font-sans text-outline">Auto-credited at 00:00 UTC</span>
          </div>
        </div>

        {/* Buffer Configuration */}
        <div className="bg-surface-container-low p-2.5 rounded-DEFAULT border border-border-hairline text-xs font-sans flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span>
                Maintain{' '}
                <strong className="text-on-surface font-mono tabular-nums">
                  {formatMaskedCurrency(sweepThreshold, maskBalances)}
                </strong>{' '}
                liquid buffer; sweep excess automatically at 21:00 UTC.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high border border-border-hairline text-on-surface font-mono text-[10px] rounded-DEFAULT uppercase tracking-wider shrink-0"
            >
              {showConfig ? 'Close' : 'Configure Buffer'}
            </button>
          </div>

          {showConfig && (
            <div className="pt-2 border-t border-border-hairline flex items-center gap-3">
              <span className="text-[11px] font-mono text-outline uppercase">Buffer Target:</span>
              <div className="flex items-center gap-1.5">
                {[25000, 50000, 100000, 250000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setSweepThreshold(amt)}
                    className={`px-2 py-0.5 font-mono text-[10px] rounded-DEFAULT transition-colors ${
                      sweepThreshold === amt
                        ? 'bg-primary text-surface font-bold'
                        : 'bg-surface-container text-outline hover:text-on-surface'
                    }`}
                  >
                    ${amt / 1000}k
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. ZERO-MARKUP INTERBANK SPOT FX DESK */}
      <div className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between pb-3 border-b border-border-hairline">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-secondary" />
            <span className="text-xs font-mono text-on-surface uppercase tracking-wider font-bold">
              Zero-Markup Interbank Spot FX Desk
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-outline">FEED: LMAX / EBS DIRECT</span>
            <span className="px-1.5 py-0.5 bg-primary/15 text-primary font-mono text-[10px] rounded-DEFAULT">
              0.00 BPS SPREAD
            </span>
          </div>
        </div>

        {/* Converter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center my-3">
          <div className="sm:col-span-2 bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
            <div className="flex justify-between text-outline font-mono text-[10px] mb-1">
              <span>Sell / From</span>
              <span>Bal: {formatMaskedCurrency(276400.0, maskBalances)}</span>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={fxAmountUsd}
                onChange={(e) => setFxAmountUsd(e.target.value)}
                className="w-2/3 bg-transparent text-sm font-mono text-on-surface font-bold tabular-nums focus:outline-none"
              />
              <span className="text-sm font-mono text-primary font-bold">USD</span>
            </div>
          </div>

          <div className="sm:col-span-1 flex justify-center">
            <div className="w-7 h-7 rounded-full bg-surface-container border border-border-hairline flex items-center justify-center text-outline">
              <ArrowLeftRight className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>

          <div className="sm:col-span-2 bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
            <div className="flex justify-between text-outline font-mono text-[10px] mb-1">
              <span>Receive / To</span>
              <span>1 USD = {fxRate} CHF</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-tertiary font-bold tabular-nums">
                {maskBalances ? '••••••••' : calculatedChf}
              </span>
              <span className="text-sm font-mono text-tertiary font-bold">CHF</span>
            </div>
          </div>
        </div>

        {/* Converter Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-border-hairline">
          <div className="flex items-center gap-3 text-[10px] font-mono text-outline">
            <span>
              Rate: <strong className="text-on-surface tabular-nums">0.88720 (12ms tick)</strong>
            </span>
            <span>
              Protocol: <strong className="text-tertiary">Atomic DvP (Zero Slippage)</strong>
            </span>
            <span>
              Enclave Fee: <strong className="text-tertiary">$0.00</strong>
            </span>
          </div>

          {fxSuccess ? (
            <div className="px-3 py-1.5 bg-tertiary/10 border border-tertiary/30 text-tertiary font-mono text-xs rounded-DEFAULT flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Conversion Settled T+0</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConvert}
              disabled={isConverting}
              className="px-4 py-1.5 bg-primary hover:bg-primary-hover text-surface font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT transition-colors disabled:opacity-50"
            >
              {isConverting ? 'Settling DvP...' : 'Execute Atomic Spot Conversion'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
