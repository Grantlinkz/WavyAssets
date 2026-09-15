import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAlternativeStore } from '../../../store/useAlternativeStore';

interface CircuitBreakerPanelProps {
  isTriggered?: boolean;
}

export const CircuitBreakerPanel: React.FC<CircuitBreakerPanelProps> = ({
  isTriggered: propTriggered,
}) => {
  const storeTriggered = useAlternativeStore((s) => s.isCircuitBreakerTriggered);
  const isTriggered = propTriggered ?? storeTriggered;
  const triggerCircuitBreaker = useAlternativeStore((s) => s.triggerCircuitBreaker);
  const resetCircuitBreaker = useAlternativeStore((s) => s.resetCircuitBreaker);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleExecuteTrigger = () => {
    triggerCircuitBreaker();
    setConfirmModalOpen(false);
  };

  return (
    <div
      className={`p-3.5 rounded flex flex-col justify-between relative overflow-hidden transition-colors ${
        isTriggered
          ? 'bg-rose-950/40 border-2 border-rose-500'
          : 'bg-surface-container border-2 border-rose-600/70'
      }`}
    >
      <div className="flex items-center justify-between pb-2 border-b border-rose-600/30">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-rose-300 shrink-0" />
          <span className="font-serif text-sm text-rose-300 uppercase tracking-wider font-semibold">
            Fiduciary Kill Switch
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-rose-600/20 border border-rose-600/40 rounded text-[10px] font-mono text-rose-300 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping"></span>
          <span>{isTriggered ? 'TRADING HALTED' : 'ARMED • T+0'}</span>
        </div>
      </div>

      <div className="my-2.5 space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-mono text-on-surface">
          <span className="text-rose-300 font-bold">FIX PROTOCOL ROUTE:</span>
          <span>{isTriggered ? 'POSITIONS FLATTENED TO USDC' : 'HALT LATENCY'}</span>
        </div>
        <p className="text-xs text-on-surface-variant leading-normal">
          {isTriggered
            ? 'All active derivative positions flattened to USDC cash collateral. Algorithmic blotter halted. Multi-sig authentication required to restore live execution.'
            : 'Instantly flattens all derivative positions to USDC and cancels outstanding order blotters. Non-reversible once triggered without multi-signature re-arm.'}
        </p>
      </div>

      <div className="pt-2 border-t border-rose-600/30 flex items-center gap-2">
        {!isTriggered ? (
          <button
            type="button"
            onClick={() => setConfirmModalOpen(true)}
            className="flex-1 py-1.5 px-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-600 text-rose-300 font-mono text-xs rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
            <span>Trigger Circuit Breaker</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={resetCircuitBreaker}
            className="flex-1 py-1.5 px-3 bg-tertiary/20 hover:bg-tertiary/30 border border-tertiary text-tertiary font-mono text-xs rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Re-Arm Algorithmic Engine</span>
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-surface border border-rose-500 rounded p-5 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-serif text-lg font-bold">Emergency Circuit Breaker Trigger</h3>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Are you sure you want to trigger the Fiduciary Kill Switch? This will instantly execute
              emergency market orders to flatten all derivative positions to USDC and halt execution
              protocols.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="px-3 py-1.5 bg-surface-container border border-border-hairline text-on-surface text-xs font-mono rounded hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteTrigger}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold rounded uppercase tracking-wider transition-colors"
              >
                Confirm Halt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
