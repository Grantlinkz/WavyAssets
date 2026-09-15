import React, { useState } from 'react';
import {
  Landmark,
  Send,
  Check,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { formatMaskedCurrency } from '../../../lib/calculations';

interface FiatRampWizardProps {
  maskBalances?: boolean;
}

export const FiatRampWizard: React.FC<FiatRampWizardProps> = ({ maskBalances: propMask }) => {
  const storeMask = useDashboardStore((s) => s.maskBalances);
  const maskBalances = propMask ?? storeMask;

  const [activeTab, setActiveTab] = useState<'WIRE' | 'WEB3' | 'CARD'>('WIRE');
  const [wireDirection, setWireDirection] = useState<'DEPOSIT' | 'WITHDRAW'>('WITHDRAW');
  const [amount, setAmount] = useState('250,000.00');
  const [isExecuting, setIsExecuting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleQuickAmount = (val: string) => {
    setAmount(val);
  };

  const handleInitiate = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setSuccessMsg(`Wire settlement of $${amount} USD submitted to HSM Enclave.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 700);
  };

  return (
    <div className="bg-surface-container-lowest border border-border-hairline rounded-DEFAULT flex flex-col h-full">
      {/* Module Top Bar */}
      <div className="p-3 border-b border-border-hairline flex items-center justify-between bg-surface-container-low">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-primary" />
          <span className="text-xs font-mono text-on-surface uppercase tracking-wider font-bold">
            Interactive Settlement Terminal
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-tertiary">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
          <span>HSM SIGNATURE READY</span>
        </div>
      </div>

      {/* Module Sub Tabs */}
      <div className="flex border-b border-border-hairline bg-surface-container-lowest">
        <button
          type="button"
          onClick={() => setActiveTab('WIRE')}
          className={`flex-1 py-2 px-3 text-center border-b-2 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'WIRE'
              ? 'border-primary bg-surface-container-low text-primary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          Bank Wire (Fedwire / SIC / SWIFT)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('WEB3')}
          className={`flex-1 py-2 px-3 text-center border-b-2 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'WEB3'
              ? 'border-primary bg-surface-container-low text-primary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          Web3 MPC Wallet
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('CARD')}
          className={`flex-1 py-2 px-3 text-center border-b-2 font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'CARD'
              ? 'border-primary bg-surface-container-low text-primary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          Obsidian Card Sweep
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Wire Direction Toggle */}
        <div className="flex items-center justify-between bg-surface-container-lowest p-1 border border-border-hairline rounded-DEFAULT">
          <button
            type="button"
            onClick={() => setWireDirection('DEPOSIT')}
            className={`flex-1 py-1.5 text-center font-mono text-xs uppercase tracking-wider rounded-DEFAULT transition-colors flex items-center justify-center gap-1.5 ${
              wireDirection === 'DEPOSIT'
                ? 'bg-primary text-surface font-bold shadow-sm'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-tertiary" />
            <span>Deposit into Vault</span>
          </button>
          <button
            type="button"
            onClick={() => setWireDirection('WITHDRAW')}
            className={`flex-1 py-1.5 text-center font-mono text-xs uppercase tracking-wider rounded-DEFAULT transition-colors flex items-center justify-center gap-1.5 ${
              wireDirection === 'WITHDRAW'
                ? 'bg-primary text-surface font-bold shadow-sm'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Withdraw to Bank</span>
          </button>
        </div>

        {/* Wire Destination & Rail Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
          <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
            <span className="text-[10px] font-mono text-outline uppercase block mb-1">
              Beneficiary Enclave
            </span>
            <div className="text-on-surface font-medium truncate">Treuhand Zurich AG</div>
            <div className="text-outline font-mono text-[11px] mt-0.5 truncate tabular-nums">
              IBAN: CH93-0023-8812-4019
            </div>
          </div>
          <div className="bg-surface-container p-2.5 rounded-DEFAULT border border-border-hairline">
            <span className="text-[10px] font-mono text-outline uppercase block mb-1">
              Routing Rail & SLA
            </span>
            <div className="text-primary font-medium flex items-center justify-between">
              <span>Swiss SIC / Fedwire Instant</span>
              <span className="text-tertiary font-bold font-mono text-[10px]">&lt;15 MINS</span>
            </div>
            <div className="text-outline text-[11px] mt-0.5">Atomic Confirmation Guarantee</div>
          </div>
        </div>

        {/* Wire Amount Input Form */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px] font-mono">
            <span className="text-outline uppercase">Settlement Amount (USD)</span>
            <span className="text-on-surface-variant">
              Available Liquid:{' '}
              <strong className="text-primary tabular-nums">
                {formatMaskedCurrency(1820450.0, maskBalances)}
              </strong>
            </span>
          </div>

          <div className="relative flex items-center">
            <span className="absolute left-3 text-outline font-mono font-bold">$</span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-surface-container-lowest border border-border-hairline focus:border-primary focus:outline-none text-on-surface font-mono text-sm tabular-nums py-2 pl-7 pr-28 rounded-DEFAULT"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickAmount('50,000.00')}
                className="px-1.5 py-0.5 bg-surface-container text-outline hover:text-on-surface font-mono text-[10px] rounded-DEFAULT"
              >
                $50k
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount('250,000.00')}
                className="px-1.5 py-0.5 bg-surface-container text-outline hover:text-on-surface font-mono text-[10px] rounded-DEFAULT"
              >
                $250k
              </button>
              <button
                type="button"
                onClick={() => handleQuickAmount('1,820,450.00')}
                className="px-1.5 py-0.5 bg-primary/20 text-primary font-mono text-[10px] rounded-DEFAULT font-bold"
              >
                MAX
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-outline pt-0.5">
            <span>
              Reference: <strong className="text-on-surface-variant">WY-9942-TREASURY-ALLOC</strong>
            </span>
            <span>
              Fee: <strong className="text-tertiary">0.00 USD (Sovereign Tier)</strong>
            </span>
          </div>
        </div>

        {/* Action Button */}
        {successMsg ? (
          <div className="p-2.5 bg-tertiary/10 border border-tertiary/30 text-tertiary text-xs font-mono text-center rounded-DEFAULT flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-tertiary" />
            <span>{successMsg}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInitiate}
            disabled={isExecuting}
            className="w-full py-2 bg-primary hover:bg-primary-hover text-surface font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>
              {isExecuting
                ? 'Broadcasting to HSM Network...'
                : `Initiate Wire Settlement (${maskBalances ? '••••••••' : `${amount} USD`})`}
            </span>
          </button>
        )}

        {/* In-Transit Visual Clearing Pipeline */}
        <div className="mt-2 pt-3 border-t border-border-hairline bg-surface-container/40 p-3 rounded-DEFAULT">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono text-outline uppercase tracking-wider font-semibold">
              Active In-Transit Pipeline
            </span>
            <span className="text-[10px] font-mono text-tertiary tabular-nums">
              EST. 6 MINS REMAINING
            </span>
          </div>

          <div className="text-xs font-sans text-on-surface mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <span>
              Fedwire Outbound:{' '}
              <strong className="font-mono">
                {maskBalances ? '••••••••' : '$250,000.00 USD'}
              </strong>{' '}
              → JPMorgan Chase NY (••••8819)
            </span>
            <span className="text-outline font-mono text-[10px]">IMAD: 20260518MMB002148</span>
          </div>

          {/* 3-Stage Stepper */}
          <div className="relative flex items-center justify-between pt-1">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-border-hairline -z-0" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-1/2 bg-tertiary -z-0" />

            {/* Stage 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-tertiary text-surface flex items-center justify-center font-bold text-[10px]">
                <Check className="w-3 h-3 text-surface stroke-[3]" />
              </div>
              <span className="font-mono text-[10px] text-tertiary mt-1 font-semibold uppercase">
                1. HSM Signed
              </span>
              <span className="font-mono text-[9px] text-outline">14:10 UTC</span>
            </div>

            {/* Stage 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-primary text-surface flex items-center justify-center font-bold text-[10px] ring-4 ring-primary/20 animate-pulse">
                2
              </div>
              <span className="font-mono text-[10px] text-primary mt-1 font-semibold uppercase">
                2. SNB / SIC Gate
              </span>
              <span className="font-mono text-[9px] text-outline">14:14 UTC (In Transit)</span>
            </div>

            {/* Stage 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-5 h-5 rounded-full bg-surface-container border border-border-hairline text-outline flex items-center justify-center font-bold text-[10px]">
                3
              </div>
              <span className="font-mono text-[10px] text-outline mt-1 uppercase">
                3. JPM NY Credited
              </span>
              <span className="font-mono text-[9px] text-outline">Est. 14:20 UTC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
