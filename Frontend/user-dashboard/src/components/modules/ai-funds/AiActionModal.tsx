import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import {
  Cpu,
  CheckCircle2,
  Shield,
  Server,
  AlertCircle,
  Loader2,
  X,
} from 'lucide-react';
import { type AiStrategyAsset } from '../../../lib/alternativeAssetData';
import { useAlternativeStore } from '../../../store/useAlternativeStore';
import { usePortfolioStore } from '../../../store/usePortfolioStore';

interface AiActionModalProps {
  asset: AiStrategyAsset | null;
  mode: 'buy' | 'lease';
  isOpen: boolean;
  onClose: () => void;
}

export const AiActionModal: React.FC<AiActionModalProps> = ({
  asset,
  mode: initialMode,
  isOpen,
  onClose,
}) => {
  const [activeMode, setActiveMode] = useState<'buy' | 'lease'>(initialMode);
  const buyAiAsset = useAlternativeStore((s) => s.buyAiAsset);
  const leaseAiAsset = useAlternativeStore((s) => s.leaseAiAsset);
  const accountBalance = usePortfolioStore((s) => s.accountBalance ?? s.availableCash);

  // Buy state
  const [tokenQty, setTokenQty] = useState<number>(5);

  // Lease state
  const [leaseTerm, setLeaseTerm] = useState<number>(12); // months

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptTx, setReceiptTx] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setActiveMode(initialMode);
    setIsSuccess(false);
    setIsProcessing(false);
    setErrorMsg(null);
  }, [initialMode, isOpen, asset]);

  if (!asset) return null;

  const tokenPrice = asset.tokenPrice || 500;
  const totalCost = tokenQty * tokenPrice;
  const monthlyLeaseRate = Math.round(asset.valuation * 0.006); // ~7.2% annual lease equivalent
  const totalLeaseCommitment = monthlyLeaseRate * leaseTerm;

  const isBuyInsufficient = totalCost > accountBalance;
  const isLeaseInsufficient = monthlyLeaseRate > accountBalance;

  const handleBuy = () => {
    if (isBuyInsufficient) {
      setErrorMsg('Insufficient Account Balance to complete this institutional token purchase.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);

    setTimeout(() => {
      const ok = buyAiAsset(asset.id, tokenQty, tokenPrice);
      if (ok) {
        setIsProcessing(false);
        setIsSuccess(true);
        setReceiptTx(`0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`);
      } else {
        setIsProcessing(false);
        setErrorMsg('Transaction rejected: Insufficient unencumbered account funds.');
      }
    }, 700);
  };

  const handleLease = () => {
    if (isLeaseInsufficient) {
      setErrorMsg('Insufficient Account Balance to fund the initial compute reservation fee.');
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);

    setTimeout(() => {
      const ok = leaseAiAsset(asset.id, leaseTerm, monthlyLeaseRate);
      if (ok) {
        setIsProcessing(false);
        setIsSuccess(true);
        setReceiptTx(`0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`);
      } else {
        setIsProcessing(false);
        setErrorMsg('Failed to reserve compute capacity: Insufficient account balance.');
      }
    }, 700);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-surface-container border border-border-hairline text-on-surface p-0 overflow-hidden shadow-2xl">
        {/* Header Banner */}
        <div className="bg-surface px-6 py-4 border-b border-border-hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg font-bold text-on-surface">
                {asset.name}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-outline font-mono">
                <span className="text-secondary font-semibold">{asset.hardwareCode}</span>
                <span>•</span>
                <span>{asset.facility}</span>
                <span>•</span>
                <span className="text-tertiary">{asset.category}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border-hairline bg-surface/50 px-6 pt-2">
          <button
            type="button"
            onClick={() => {
              setActiveMode('buy');
              setErrorMsg(null);
            }}
            className={`pb-2.5 px-4 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${
              activeMode === 'buy'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            Acquire Compute Tokens
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMode('lease');
              setErrorMsg(null);
            }}
            className={`pb-2.5 px-4 font-mono text-xs uppercase tracking-wider font-semibold border-b-2 transition-all ${
              activeMode === 'lease'
                ? 'border-primary text-primary'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            Lease Dedicated Capacity
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-tertiary/10 border border-tertiary/30 mx-auto flex items-center justify-center text-tertiary">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-on-surface">
                  {activeMode === 'buy' ? 'Compute Tokens Acquired' : 'Compute Capacity Leased'}
                </h3>
                <p className="text-xs text-on-surface-variant font-mono mt-1">
                  Settled into Enclave Ledger &bull; Holdings updated in Consolidated Net Worth
                </p>
              </div>

              <div className="bg-surface p-4 rounded border border-border-hairline text-left max-w-md mx-auto space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-outline">Transaction Hash:</span>
                  <span className="text-primary font-semibold truncate ml-2">{receiptTx}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Asset:</span>
                  <span className="text-on-surface">{asset.name}</span>
                </div>
                {activeMode === 'buy' ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-outline">Tokens Added:</span>
                      <span className="text-tertiary font-bold">+{tokenQty} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">Deducted from Account Balance:</span>
                      <span className="text-error font-bold">-${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-outline">Lease Term:</span>
                      <span className="text-tertiary font-bold">{leaseTerm} Months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">Monthly Compute Fee:</span>
                      <span className="text-on-surface font-semibold">${monthlyLeaseRate.toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo</span>
                    </div>
                  </>
                )}
              </div>

              <Button
                type="button"
                onClick={onClose}
                className="w-full max-w-md bg-primary hover:bg-primary/90 text-on-primary font-mono text-xs uppercase"
              >
                Return to AI Strategy Inventory
              </Button>
            </div>
          ) : activeMode === 'buy' ? (
            /* Mode BUY */
            <div className="space-y-4">
              {/* Asset Highlight Box */}
              <div className="bg-surface p-3.5 rounded border border-border-hairline grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-outline block text-[10px] uppercase">Token Price</span>
                  <span className="text-on-surface font-bold text-sm">
                    ${tokenPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-outline block text-[10px] uppercase">Annual Yield (APY)</span>
                  <span className="text-tertiary font-bold text-sm">{asset.netYieldApy.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-outline block text-[10px] uppercase">Utilization</span>
                  <span className="text-primary font-bold text-sm">{asset.clusterUtilizationPct.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-outline block text-[10px] uppercase">Tenant Class</span>
                  <span className="text-secondary font-bold text-sm truncate block">AAA Tier-1 Enterprise</span>
                </div>
              </div>

              {/* Token Quantity Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <label htmlFor="token-qty-input" className="text-outline uppercase">Fractional Token Quantity</label>
                  <span className="text-on-surface font-semibold">{tokenQty} Tokens</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={tokenQty}
                    onChange={(e) => setTokenQty(Number(e.target.value))}
                    className="flex-1 accent-primary h-1.5 bg-surface rounded cursor-pointer"
                  />
                  <input
                    id="token-qty-input"
                    type="number"
                    min="1"
                    max="1000"
                    value={tokenQty}
                    onChange={(e) => setTokenQty(Math.max(1, Number(e.target.value)))}
                    aria-label="Fractional Token Quantity"
                    className="w-20 px-2 py-1 bg-surface border border-border-hairline rounded font-mono text-xs text-right text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2">
                  {[1, 5, 10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTokenQty(amt)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors ${
                        tokenQty === amt
                          ? 'bg-primary/20 border-primary text-primary font-bold'
                          : 'bg-surface border-border-hairline text-outline hover:text-on-surface'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settlement & Balance Verification */}
              <div className="bg-surface p-3.5 rounded border border-border-hairline space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-outline">Account Balance (Liquid Cash):</span>
                  <span className="text-on-surface font-bold">
                    ${accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-outline">Total Purchase Cost:</span>
                  <span className={`font-bold ${isBuyInsufficient ? 'text-error' : 'text-primary'}`}>
                    ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border-hairline">
                  <span className="text-outline">Remaining Balance after Purchase:</span>
                  <span className={`font-semibold ${isBuyInsufficient ? 'text-error' : 'text-tertiary'}`}>
                    ${Math.max(0, accountBalance - totalCost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-error/10 border border-error/30 rounded flex items-center gap-2 text-error text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Institutional Assurance */}
              <div className="flex items-center gap-2 text-[11px] text-outline font-mono">
                <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>ERC-3643 Institutional Permissioned Token &bull; Deducted from Account Balance &bull; Reflected in Consolidated Net Worth</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 font-mono text-xs uppercase border-border-hairline"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleBuy}
                  disabled={isProcessing || isBuyInsufficient}
                  className="flex-1 bg-primary hover:bg-primary/90 text-on-primary font-mono text-xs uppercase font-semibold disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Executing Clearing...
                    </span>
                  ) : (
                    `Confirm Purchase ($${totalCost.toLocaleString('en-US')})`
                  )}
                </Button>
              </div>
            </div>
          ) : (
            /* Mode LEASE */
            <div className="space-y-4">
              <div className="bg-surface p-3.5 rounded border border-border-hairline grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div>
                  <span className="text-outline block text-[10px] uppercase">Cluster Specs</span>
                  <span className="text-on-surface font-bold text-sm truncate block">{asset.specs}</span>
                </div>
                <div>
                  <span className="text-outline block text-[10px] uppercase">Compute Rate</span>
                  <span className="text-tertiary font-bold text-sm">${asset.hourlyRate.toFixed(1)} / hr</span>
                </div>
                <div>
                  <span className="text-outline block text-[10px] uppercase">Uptime SLA</span>
                  <span className="text-secondary font-bold text-sm">99.999% SLA</span>
                </div>
                <div>
                  <span className="text-outline block text-[10px] uppercase">Hardware Code</span>
                  <span className="text-primary font-bold text-sm truncate block">{asset.hardwareCode}</span>
                </div>
              </div>

              {/* Lease Duration */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-outline uppercase block">Dedicated Lease Term</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 12, 24].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setLeaseTerm(term)}
                      className={`p-2.5 rounded font-mono text-xs border text-center transition-all ${
                        leaseTerm === term
                          ? 'bg-primary/20 border-primary text-primary font-bold'
                          : 'bg-surface border-border-hairline text-outline hover:text-on-surface'
                      }`}
                    >
                      <div>{term} Months</div>
                      <div className="text-[10px] opacity-75">{term >= 12 ? 'Institutional' : 'Quarterly'}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lease Breakdown */}
              <div className="bg-surface p-3.5 rounded border border-border-hairline space-y-2 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-outline">Monthly Reservation Fee:</span>
                  <span className="text-on-surface font-bold">
                    ${monthlyLeaseRate.toLocaleString('en-US', { minimumFractionDigits: 2 })} / mo
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-outline">Total Commitment ({leaseTerm} mo):</span>
                  <span className="text-primary font-bold">
                    ${totalLeaseCommitment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-border-hairline">
                  <span className="text-outline">Initial Deduction from Account Balance:</span>
                  <span className="text-tertiary font-semibold">
                    ${monthlyLeaseRate.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-error/10 border border-error/30 rounded flex items-center gap-2 text-error text-xs font-mono">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-outline font-mono">
                <Server className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span>Direct interconnect &bull; Redundant cooling &bull; 99.99% Hardware uptime guaranteed</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 font-mono text-xs uppercase border-border-hairline"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleLease}
                  disabled={isProcessing || isLeaseInsufficient}
                  className="flex-1 bg-primary hover:bg-primary/90 text-on-primary font-mono text-xs uppercase font-semibold disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Provisioning Rack...
                    </span>
                  ) : (
                    `Reserve Capacity ($${monthlyLeaseRate.toLocaleString('en-US')}/mo)`
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
