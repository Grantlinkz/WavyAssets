import React, { useState } from 'react';
import { ArrowLeftRight, Zap, CheckCircle2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useDashboardStore } from '../../store/useDashboardStore';

export interface TradeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen: propIsOpen,
  onClose: propClose,
}) => {
  const storeModal = usePortfolioStore((s) => s.activeModal);
  const storeClose = usePortfolioStore((s) => s.closeModal);
  const availableCash = usePortfolioStore((s) => s.availableCash);
  const adjustAvailableCash = usePortfolioStore((s) => s.adjustAvailableCash);
  const maskBalances = useDashboardStore((s) => s.maskBalances);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeModal === 'trade';
  const closeModal = propClose !== undefined ? propClose : storeClose;

  const [payAmount, setPayAmount] = useState<string>('100000');
  const [payAsset, setPayAsset] = useState<string>('USDC');
  const [receiveAsset, setReceiveAsset] = useState<string>('BTC');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  const PAY_ASSET_RATES: Record<string, number> = {
    USDC: 1.0,
    USD: 1.0,
    EUR: 1.08,
  };

  const RECEIVE_ASSET_PRICES: Record<string, number> = {
    BTC: 89420.0,
    ETH: 3410.5,
    NVDA: 138.85,
    GOLD: 2680.0,
  };

  const payMultiplier = PAY_ASSET_RATES[payAsset] ?? 1.0;
  const receivePrice = RECEIVE_ASSET_PRICES[receiveAsset] ?? 89420.0;
  const usdAllocated = (parseFloat(payAmount || '0') || 0) * payMultiplier;
  const receiveAmount = (usdAllocated / receivePrice).toFixed(4);

  // Available money in account for selected payAsset
  const availableInPayAsset = availableCash / payMultiplier;
  const formattedAvailable = maskBalances
    ? '••••••••'
    : payAsset === 'USD' || payAsset === 'USDC'
      ? `$${availableInPayAsset.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `€${availableInPayAsset.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const parsedPayAmount = parseFloat(payAmount || '0');
  const isValidAmount =
    Number.isFinite(parsedPayAmount) &&
    parsedPayAmount > 0 &&
    usdAllocated <= availableCash;

  const handleExecute = () => {
    if (!isValidAmount) return;
    setIsExecuting(true);
    setTimeout(() => {
      const currentCash = usePortfolioStore.getState().availableCash;
      if (usdAllocated > currentCash) {
        setIsExecuting(false);
        return;
      }
      const success = adjustAvailableCash(-usdAllocated);
      setIsExecuting(false);
      if (success) {
        setIsDone(true);
        setTimeout(() => {
          setIsDone(false);
          closeModal();
        }, 1500);
      }
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent data-testid="trade-modal" className="max-w-[520px]">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-primary/10 rounded-xs border border-primary/20">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-sm uppercase tracking-wide">
                TRADE
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.2 bg-primary/15 text-primary text-[10px] font-mono font-semibold rounded-xs">
                  INSTANT
                </span>
                <span className="text-[10px] text-tertiary font-mono">Zero Slippage Routing</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-trade-modal"
            onClick={closeModal}
            className="text-outline hover:text-on-surface p-1 rounded-DEFAULT transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 pt-1 flex flex-col gap-3">
          {/* You Pay */}
          <div className="p-3 bg-surface-container-low rounded-DEFAULT border border-border-hairline flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-outline">
              <span>YOU ALLOCATE / PAY</span>
              <span>AVAILABLE: {formattedAvailable}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                data-testid="trade-pay-amount-input"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="flex-1 bg-transparent text-lg font-mono font-bold text-on-surface focus:outline-none tabular-nums"
                placeholder="0.00"
              />
              <select
                data-testid="trade-pay-asset-select"
                value={payAsset}
                onChange={(e) => setPayAsset(e.target.value)}
                className="bg-surface-container border border-border-hairline rounded-DEFAULT px-2.5 py-1 text-xs font-mono font-bold text-primary focus:outline-none"
              >
                <option value="USDC">USDC (Treasury)</option>
                <option value="USD">USD (Fedwire Cash)</option>
                <option value="EUR">EUR (SEPA)</option>
              </select>
            </div>
          </div>

          {/* Swap Direction Divider */}
          <div className="flex justify-center -my-1">
            <div className="p-1 rounded-full bg-surface-container border border-border-hairline text-outline">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>

          {/* You Receive */}
          <div className="p-3 bg-surface-container-low rounded-DEFAULT border border-border-hairline flex flex-col gap-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-outline">
              <span>YOU ACQUIRE / RECEIVE (ESTIMATED)</span>
              <span>
                RATE: 1 {receiveAsset} = ${receivePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                data-testid="trade-receive-amount"
                className="flex-1 text-lg font-mono font-bold text-tertiary tabular-nums"
              >
                {receiveAmount}
              </span>
              <select
                data-testid="trade-receive-asset-select"
                value={receiveAsset}
                onChange={(e) => setReceiveAsset(e.target.value)}
                className="bg-surface-container border border-border-hairline rounded-DEFAULT px-2.5 py-1 text-xs font-mono font-bold text-tertiary focus:outline-none"
              >
                <option value="BTC">BTC-USD (Cold)</option>
                <option value="ETH">ETH (Staked)</option>
                <option value="NVDA">NVDA (DMA Shares)</option>
                <option value="GOLD">999.9 Gold Bullion</option>
              </select>
            </div>
          </div>

          {/* Slippage & Routing Info */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono p-2 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline/80 text-outline">
            <div>
              <span className="block text-outline">EXECUTION ROUTE:</span>
              <span className="text-on-surface font-semibold">Institutional OTC Dark Pool</span>
            </div>
            <div>
              <span className="block text-outline">GUARANTEED SLIPPAGE:</span>
              <span className="text-tertiary font-semibold">&lt; 0.01% Fixed</span>
            </div>
          </div>

          {/* Execution Button */}
          <div className="pt-2">
            {isDone ? (
              <div
                data-testid="trade-success-msg"
                className="p-3 bg-tertiary/10 border border-tertiary/40 rounded-DEFAULT flex items-center justify-center gap-2 text-tertiary text-xs font-mono font-bold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>EXECUTED</span>
              </div>
            ) : (
              <button
                type="button"
                data-testid="execute-trade-btn"
                disabled={isExecuting || !isValidAmount}
                onClick={handleExecute}
                className="w-full py-2.5 bg-primary-container text-on-primary hover:bg-primary font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                <span>{isExecuting ? 'Routing through FIX Dark Pool...' : 'Execute Instant Global Swap'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-border-hairline flex items-center justify-between text-[10px] font-mono text-outline">
          <span>CLEARED BY SIX SWISS EXCHANGE DLT</span>
          <span>FEES: 0.00% (TIER 3 EXEMPT)</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
