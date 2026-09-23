import React, { useState } from 'react';
import {
  ArrowUpRight,
  ShieldAlert,
  KeyRound,
  X,
  Landmark,
  Wallet,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useLiquidStore } from '../../store/useLiquidStore';
import { useAuthStore } from '../../store/useAuthStore';
import { checkKycWithdrawalLimit } from '../../lib/kycLimits';
import { formatMaskedCurrency } from '../../lib/calculations';

export interface WithdrawModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export type WithdrawalRail = 'bank' | 'crypto';
export type SupportedCryptoAsset = 'USDT' | 'BTC' | 'ETH' | 'USDC';

export const CRYPTO_NETWORKS_CONFIG: Record<SupportedCryptoAsset, string[]> = {
  USDT: ['ERC-20', 'TRC-20', 'BEP-20'],
  BTC: ['Bitcoin Native', 'BEP-20'],
  ETH: ['ERC-20', 'Arbitrum', 'Optimism'],
  USDC: ['ERC-20', 'BEP-20', 'Polygon'],
};

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen: propIsOpen,
  onClose: propClose,
}) => {
  const storeModal = usePortfolioStore((s) => s.activeModal);
  const storeClose = usePortfolioStore((s) => s.closeModal);
  const openModal = usePortfolioStore((s) => s.openModal);
  const availableCash = usePortfolioStore((s) => s.availableCash);
  const adjustAvailableCash = usePortfolioStore((s) => s.adjustAvailableCash);
  const maskBalances = useDashboardStore((s) => s.maskBalances);
  const addTransaction = useLiquidStore((s) => s.addTransaction);
  const user = useAuthStore((s) => s.user);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeModal === 'withdraw';
  const closeModal = propClose !== undefined ? propClose : storeClose;

  // Rail selection: 'bank' vs 'crypto'
  const [activeRail, setActiveRail] = useState<WithdrawalRail>('bank');

  // Bank Withdrawal form state
  const [bankName, setBankName] = useState<string>('UBS Switzerland AG');
  const [accountName, setAccountName] = useState<string>('Global Custody Mandate');
  const [accountNumber, setAccountNumber] = useState<string>('CH88 0024 0000 1234 5678 9');
  const [bankAmount, setBankAmount] = useState<string>('50000');

  // Wallet (Crypto) Withdrawal form state
  const [selectedCrypto, setSelectedCrypto] = useState<SupportedCryptoAsset>('USDT');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('ERC-20');
  const [withdrawalAddress, setWithdrawalAddress] = useState<string>(
    '0x39aB22cDE82914Afb7104bC67D289A294c71eE22'
  );
  const [cryptoAmount, setCryptoAmount] = useState<string>('50000');

  // Submission & Pending state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [pendingWithdrawal, setPendingWithdrawal] = useState<{
    refId: string;
    rail: WithdrawalRail;
    amount: number;
    details: {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      cryptoAsset?: string;
      protocol?: string;
      destinationAddress?: string;
    };
    submittedAt: string;
  } | null>(null);

  // Active form validation
  const currentAmountStr = activeRail === 'bank' ? bankAmount : cryptoAmount;
  const parsedAmount = parseFloat(currentAmountStr || '0');
  const kycCheck = checkKycWithdrawalLimit(parsedAmount, user?.kycTier || 'TIER_1');
  const isValidAmount =
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= availableCash &&
    kycCheck.allowed;

  const handleSelectCrypto = (asset: SupportedCryptoAsset) => {
    setSelectedCrypto(asset);
    const availableProtocols = CRYPTO_NETWORKS_CONFIG[asset] || ['ERC-20'];
    setSelectedProtocol(availableProtocols[0]);
  };

  const handleAuthorize = () => {
    if (!isValidAmount || !kycCheck.allowed) return;
    setIsVerifying(true);

    setTimeout(() => {
      const currentCash = usePortfolioStore.getState().availableCash;
      if (parsedAmount > currentCash) {
        setIsVerifying(false);
        return;
      }

      // Deduct cash from available balance
      adjustAvailableCash(-parsedAmount);

      const refId =
        activeRail === 'bank'
          ? `WY-WTH-BANK-${Date.now().toString().slice(-6)}`
          : `WY-WTH-CRYPTO-${Date.now().toString().slice(-6)}`;

      const details =
        activeRail === 'bank'
          ? {
              bankName,
              accountName,
              accountNumber,
            }
          : {
              cryptoAsset: selectedCrypto,
              protocol: selectedProtocol,
              destinationAddress: withdrawalAddress,
            };

      // Add to transaction log as PENDING withdrawal
      try {
        addTransaction({
          id: refId,
          timestamp: new Date().toISOString(),
          vertical: activeRail === 'bank' ? 'CASH' : 'CRYPTO',
          type: 'WITHDRAWAL',
          description:
            activeRail === 'bank'
              ? `${bankName} (Settlement Queue)`
              : `Vault Cold Rail (${selectedCrypto} - ${selectedProtocol})`,
          amountUsd: parsedAmount,
          status: 'PENDING',
          reference: refId,
        });
      } catch {
        // Continue gracefully
      }

      setPendingWithdrawal({
        refId,
        rail: activeRail,
        amount: parsedAmount,
        details,
        submittedAt: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      });

      setIsVerifying(false);
    }, 800);
  };

  const handleResetForNew = () => {
    setPendingWithdrawal(null);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent data-testid="withdraw-modal" className="max-w-[540px]">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-secondary/10 rounded-xs border border-secondary/20">
              <ArrowUpRight className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <DialogTitle className="text-sm uppercase tracking-wide">
                WITHDRAW
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.2 bg-secondary/15 text-secondary text-[10px] font-mono font-semibold rounded-xs">
                  24-48H WHITELIST ENFORCED
                </span>
                <span className="text-[10px] text-outline font-mono">FIDO2 WebAuthn Required</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-withdraw-modal"
            aria-label="Close withdrawal modal"
            onClick={closeModal}
            className="text-outline hover:text-on-surface p-1 rounded-DEFAULT transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-4 pt-3 flex flex-col gap-3.5">
          {/* Whitelist Security Notice */}
          <div className="p-3 bg-surface-container-low rounded-DEFAULT border border-secondary/30 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
            <div className="text-[11px] font-sans text-on-surface-variant leading-relaxed">
              <p className="font-semibold text-secondary">Zero-Trust Whitelist Lock Active</p>
              <p>
                Withdrawals are strictly restricted to pre-approved addresses. Changes or new destinations are subject to an inviolable 24-to-48 hour timelock before first execution.
              </p>
            </div>
          </div>

          {/* KYC Tier Daily Limit Exceeded Notice */}
          {parsedAmount > 0 && !kycCheck.allowed && (
            <div
              data-testid="kyc-limit-banner"
              className="p-3 bg-error/15 border border-error/40 rounded-DEFAULT flex items-start justify-between gap-2"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-mono font-bold text-error uppercase tracking-wider block">
                    Tier Daily Limit Exceeded
                  </span>
                  <p className="text-[11px] text-on-surface-variant font-sans mt-0.5">
                    {kycCheck.error || 'You have gone beyond your Tier daily limit. Please upgrade your Tier.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-testid="upgrade-kyc-tier-btn"
                onClick={() => {
                  closeModal();
                  openModal('kyc');
                }}
                className="px-2.5 py-1 bg-error/20 hover:bg-error/30 text-error border border-error/40 font-mono text-[11px] font-bold rounded uppercase whitespace-nowrap cursor-pointer transition-colors"
              >
                Upgrade Tier
              </button>
            </div>
          )}

          {/* Pending Admin Approval Screen */}
          {pendingWithdrawal ? (
            <div className="bg-surface-container-low p-3.5 rounded-DEFAULT border border-secondary/50 flex flex-col gap-3">
              {/* Alert Ribbon */}
              <div className="flex items-start gap-2.5 bg-secondary/10 border border-secondary/30 p-2.5 rounded-DEFAULT">
                <Clock className="w-5 h-5 text-secondary shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-secondary uppercase tracking-wider">
                      STATUS: PENDING ADMIN APPROVAL
                    </span>
                    <span className="px-1.5 py-0.2 bg-secondary/20 text-secondary text-[9px] font-mono font-bold rounded-xs">
                      ADMIN REVIEW
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant font-sans mt-0.5 leading-relaxed">
                    Your request has been securely queued in the Zurich vault disbursement ledger.
                  </p>
                </div>
              </div>

              {/* Transaction Spec Snapshot */}
              <div className="bg-surface-container-lowest p-2.5 rounded-DEFAULT border border-border-hairline space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center pb-1.5 border-b border-border-hairline/60">
                  <span className="text-outline">Disbursement Type:</span>
                  <span className="text-primary font-bold uppercase">
                    {pendingWithdrawal.rail === 'bank' ? 'Bank Wire Transfer' : 'Crypto / Wallet Rail'}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-1.5 border-b border-border-hairline/60">
                  <span className="text-outline">Disbursement Amount:</span>
                  <span className="text-on-surface font-bold">
                    ${pendingWithdrawal.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>

                {pendingWithdrawal.rail === 'bank' ? (
                  <>
                    <div className="flex justify-between items-center pb-1.5 border-b border-border-hairline/60">
                      <span className="text-outline">Bank Name:</span>
                      <span className="text-on-surface font-semibold">
                        {pendingWithdrawal.details.bankName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-border-hairline/60">
                      <span className="text-outline">Account Name:</span>
                      <span className="text-on-surface font-semibold">
                        {pendingWithdrawal.details.accountName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-border-hairline/60">
                      <span className="text-outline">Account Number:</span>
                      <span className="text-on-surface font-semibold truncate max-w-[200px]">
                        {pendingWithdrawal.details.accountNumber}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center pb-1.5 border-b border-border-hairline/60">
                      <span className="text-outline">Selected Asset:</span>
                      <span className="text-primary font-bold">
                        {pendingWithdrawal.details.cryptoAsset}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-border-hairline/60">
                      <span className="text-outline">Network Protocol:</span>
                      <span className="text-tertiary font-bold">
                        {pendingWithdrawal.details.protocol}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-border-hairline/60">
                      <span className="text-outline">Withdrawal Address:</span>
                      <span className="text-on-surface text-[10px] truncate max-w-[200px]">
                        {pendingWithdrawal.details.destinationAddress}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-outline">Reference ID:</span>
                  <span className="text-secondary font-bold">{pendingWithdrawal.refId}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetForNew}
                  className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high border border-border-hairline font-mono text-xs text-on-surface font-semibold rounded-DEFAULT transition-colors cursor-pointer"
                >
                  Submit Another Withdrawal
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2 bg-primary text-on-primary hover:bg-primary-container font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT transition-colors cursor-pointer"
                >
                  Close &amp; Monitor Status
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Section Tabs: 1) Bank Withdrawal & 2) Wallet (Crypto) Withdrawal */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
                <button
                  type="button"
                  onClick={() => setActiveRail('bank')}
                  className={`py-2 px-3 flex items-center justify-center gap-2 rounded-DEFAULT font-mono text-xs font-bold transition-all cursor-pointer ${
                    activeRail === 'bank'
                      ? 'bg-surface-container-high text-primary border border-border-hairline shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <Landmark className="w-3.5 h-3.5 text-primary" />
                  <span>Bank Withdrawal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRail('crypto')}
                  className={`py-2 px-3 flex items-center justify-center gap-2 rounded-DEFAULT font-mono text-xs font-bold transition-all cursor-pointer ${
                    activeRail === 'crypto'
                      ? 'bg-surface-container-high text-tertiary border border-border-hairline shadow-xs'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5 text-tertiary" />
                  <span>Wallet (Crypto) Withdrawal</span>
                </button>
              </div>


              {/* Section 1: Bank Withdrawal */}
              {activeRail === 'bank' && (
                <div className="space-y-3 bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">
                      Bank Transfer Specifications
                    </span>
                    <span className="text-[10px] font-mono text-outline">SWIFT / SEPA Core</span>
                  </div>

                  <div className="space-y-2">
                    {/* Bank Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-outline uppercase tracking-wider">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. UBS Switzerland AG / JPMorgan Chase"
                        className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Account Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-outline uppercase tracking-wider">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={accountName}
                        onChange={(e) => setAccountName(e.target.value)}
                        placeholder="e.g. Global Wealth Mandate LLC"
                        className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Account Number */}
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-mono text-outline uppercase tracking-wider">
                        Account Number / IBAN
                      </label>
                      <input
                        type="text"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g. CH88 0024 0000 1234 5678 9"
                        className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-outline">
                        <span>WITHDRAWAL AMOUNT (USD)</span>
                        <span>AVAILABLE: {formatMaskedCurrency(availableCash, maskBalances)}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          data-testid="withdraw-amount-input"
                          value={bankAmount}
                          onChange={(e) => setBankAmount(e.target.value)}
                          className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT px-3 py-2 text-sm font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
                          placeholder="0.00"
                        />
                        <button
                          type="button"
                          onClick={() => setBankAmount(availableCash.toString())}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-surface-container text-[10px] font-mono text-primary font-semibold rounded-DEFAULT hover:bg-surface-container-high cursor-pointer"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Wallet (Crypto) Withdrawal */}
              {activeRail === 'crypto' && (
                <div className="space-y-3 bg-surface-container-low p-3.5 rounded-DEFAULT border border-border-hairline">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-tertiary font-bold uppercase tracking-wider">
                      Digital Asset Whitelist Rail
                    </span>
                    <span className="text-[10px] font-mono text-outline">MPC Cold Enclave</span>
                  </div>

                  {/* Option for selecting [USDT, BTC, ETH, USDC] */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-outline uppercase tracking-wider">
                      Select Cryptocurrency
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['USDT', 'BTC', 'ETH', 'USDC'] as const).map((asset) => (
                        <button
                          key={asset}
                          type="button"
                          onClick={() => handleSelectCrypto(asset)}
                          className={`py-1.5 px-2 text-xs font-mono font-bold rounded-DEFAULT cursor-pointer transition-all ${
                            selectedCrypto === asset
                              ? 'bg-primary text-on-primary shadow-xs'
                              : 'bg-surface-container text-outline hover:text-on-surface border border-border-hairline'
                          }`}
                        >
                          {asset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Option for selecting network protocol */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-outline uppercase tracking-wider">
                      <span>Network Protocol</span>
                      <span className="text-tertiary font-bold">{selectedProtocol}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {CRYPTO_NETWORKS_CONFIG[selectedCrypto].map((protocol) => (
                        <button
                          key={protocol}
                          type="button"
                          onClick={() => setSelectedProtocol(protocol)}
                          className={`px-2.5 py-1 text-xs font-mono rounded-DEFAULT cursor-pointer transition-all ${
                            selectedProtocol === protocol
                              ? 'bg-tertiary text-surface font-bold shadow-xs'
                              : 'bg-surface-container text-outline hover:text-on-surface border border-border-hairline'
                          }`}
                        >
                          {protocol}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Withdrawal Address */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-mono text-outline uppercase tracking-wider">
                      Withdrawal Address ({selectedProtocol})
                    </label>
                    <input
                      type="text"
                      value={withdrawalAddress}
                      onChange={(e) => setWithdrawalAddress(e.target.value)}
                      placeholder={`Enter destination ${selectedCrypto} address`}
                      className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT px-3 py-2 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Amount */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-outline">
                      <span>AMOUNT TO WITHDRAW (USD EQUIVALENT)</span>
                      <span>AVAILABLE: {formatMaskedCurrency(availableCash, maskBalances)}</span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        data-testid="withdraw-amount-input"
                        value={cryptoAmount}
                        onChange={(e) => setCryptoAmount(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-border-hairline rounded-DEFAULT px-3 py-2 text-sm font-mono font-bold text-on-surface focus:outline-none focus:border-primary"
                        placeholder="0.00"
                      />
                      <button
                        type="button"
                        onClick={() => setCryptoAmount(availableCash.toString())}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-surface-container text-[10px] font-mono text-primary font-semibold rounded-DEFAULT hover:bg-surface-container-high cursor-pointer"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Hardware Key / FIDO2 Trigger */}
              <div className="pt-1">
                <button
                  type="button"
                  data-testid="authorize-withdraw-btn"
                  disabled={isVerifying || !isValidAmount}
                  onClick={handleAuthorize}
                  className="w-full py-2.5 bg-primary-container text-on-primary hover:bg-primary font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {isVerifying
                      ? 'Awaiting WebAuthn Key Touch...'
                      : 'Authorize with YubiKey / WebAuthn'}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-border-hairline flex items-center justify-between text-[10px] font-mono text-outline">
          <span>ZERO-TRUST DISBURSEMENT ENCLAVE</span>
          <span>EST. SETTLEMENT: PENDING ADMIN APPROVAL</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

