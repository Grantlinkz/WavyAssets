import React, { useState } from 'react';
import { Landmark, Copy, Check, QrCode, CreditCard, X, Wallet, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { usePortfolioStore, type DepositRailTab } from '../../store/usePortfolioStore';

export interface DepositModalProps {
  isOpen?: boolean;
  activeTab?: DepositRailTab;
  onClose?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen: propIsOpen,
  activeTab: propTab,
  onClose: propClose,
}) => {
  const storeModal = usePortfolioStore((s) => s.activeModal);
  const storeClose = usePortfolioStore((s) => s.closeModal);
  const storeTab = usePortfolioStore((s) => s.activeDepositTab);
  const setActiveDepositTab = usePortfolioStore((s) => s.setActiveDepositTab);

  const isOpen = propIsOpen !== undefined ? propIsOpen : storeModal === 'deposit';
  const activeDepositTab = propTab !== undefined ? propTab : storeTab;
  const closeModal = propClose !== undefined ? propClose : storeClose;

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string>('MetaMask');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [depositAmount, setDepositAmount] = useState<string>('25000');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<boolean>(false);

  const handleConnectWallet = (name: string) => {
    setIsConnecting(true);
    setWalletName(name);
    setTimeout(() => {
      setIsConnecting(false);
      setConnectedWallet('0x71C839F0d8B024A229dEc06D29fD9F6b840138A9');
    }, 600);
  };

  const handleWalletDeposit = () => {
    setIsDepositing(true);
    setTimeout(() => {
      setIsDepositing(false);
      setDepositSuccess(true);
      setTimeout(() => {
        setDepositSuccess(false);
        closeModal();
      }, 1500);
    }, 1000);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent data-testid="deposit-modal" className="max-w-[520px]">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-primary/10 rounded-xs border border-primary/20">
              <Landmark className="w-4 h-4 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-sm uppercase tracking-wide">
                DEPOSIT
              </DialogTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-1.5 py-0.2 bg-primary/15 text-primary text-[10px] font-mono font-semibold rounded-xs">
                  TIER 3 PERPETUAL CLEARANCE
                </span>
                <span className="text-[10px] text-tertiary font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  Instant Allocation
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-deposit-modal"
            onClick={closeModal}
            className="text-outline hover:text-on-surface p-1 rounded-DEFAULT transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Rail Selector Tabs */}
        <div className="px-4 pt-1">
          <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-DEFAULT border border-border-hairline">
            <button
              type="button"
              data-testid="deposit-tab-wire"
              onClick={() => setActiveDepositTab('wire')}
              className={`py-1.5 text-center font-mono text-xs font-semibold rounded-DEFAULT transition-all cursor-pointer ${
                activeDepositTab === 'wire'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Bank Wire (SIC / Fedwire)
            </button>
            <button
              type="button"
              data-testid="deposit-tab-crypto"
              onClick={() => setActiveDepositTab('crypto')}
              className={`py-1.5 text-center font-mono text-xs font-semibold rounded-DEFAULT transition-all cursor-pointer ${
                activeDepositTab === 'crypto'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Crypto / Web3
            </button>
            <button
              type="button"
              data-testid="deposit-tab-card"
              onClick={() => setActiveDepositTab('card')}
              className={`py-1.5 text-center font-mono text-xs font-semibold rounded-DEFAULT transition-all cursor-pointer ${
                activeDepositTab === 'card'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              Obsidian VIP Card
            </button>
          </div>
        </div>

        {/* Tab 1: Bank Wire View */}
        {activeDepositTab === 'wire' && (
          <div className="p-4 pt-2 flex flex-col gap-3" data-testid="deposit-view-wire">
            <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-border-hairline flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                  Beneficiary Name
                </span>
                <span className="text-[10px] font-mono text-tertiary font-medium">
                  Segregated Escrow
                </span>
              </div>
              <p className="text-xs font-sans text-on-surface font-semibold select-all">
                Grant Sovereign Holdings AG / Escrow Treuhand Zurich
              </p>

              <div className="h-px bg-border-hairline my-0.5" />

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                  Swiss IBAN
                </span>
                <span className="text-[10px] font-mono text-primary">Fedwire & SEPA</span>
              </div>
              <div className="flex items-center justify-between bg-surface-container-lowest px-2.5 py-1.5 rounded-DEFAULT border border-border-hairline/80">
                <code className="text-xs font-mono font-semibold tracking-wider text-on-surface tabular-nums">
                  CH93 0023 8812 4019 8821 0
                </code>
                <button
                  type="button"
                  data-testid="copy-iban-btn"
                  onClick={() => handleCopy('CH93 0023 8812 4019 8821 0', 'iban')}
                  className="flex items-center gap-1 text-primary hover:text-primary-fixed text-[11px] font-mono font-semibold ml-2 cursor-pointer"
                >
                  {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'iban' ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-[10px] font-mono text-outline uppercase tracking-wider block">
                    BIC / SWIFT
                  </span>
                  <span className="text-xs font-mono font-semibold text-on-surface">UBSWCHZH80A</span>
                  <span className="block text-[10px] text-outline font-sans">UBS Zurich Custody</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-outline uppercase tracking-wider block">
                    Clearing Rail
                  </span>
                  <span className="text-xs font-sans font-medium text-on-surface">Swiss SIC RTGS</span>
                  <span className="block text-[10px] text-tertiary font-mono font-semibold">
                    Instant Inbound DvP
                  </span>
                </div>
              </div>
            </div>

            {/* Mandatory Reference Memo Box */}
            <div className="bg-surface-container p-3 rounded-DEFAULT border border-border-hairline">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-primary font-semibold uppercase tracking-wider">
                  Mandatory Memo / Reference
                </span>
                <button
                  type="button"
                  data-testid="copy-memo-btn"
                  onClick={() => handleCopy('WY-9942-TREASURY-03', 'memo')}
                  className="text-primary hover:text-primary-fixed text-[11px] font-mono font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'memo' ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'memo' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <div className="mt-1 px-2.5 py-1.5 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline flex items-center justify-between">
                <code className="text-xs font-mono font-bold text-primary">WY-9942-TREASURY-03</code>
                <span className="text-[10px] font-mono text-outline">Unique Mandate ID</span>
              </div>
              <p className="text-[11px] text-outline mt-1.5 leading-relaxed font-sans">
                Notice: All incoming wires without this mandatory mandate reference code will undergo an extended 48h compliance manual audit.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Crypto / Web3 View */}
        {activeDepositTab === 'crypto' && (
          <div className="p-4 pt-2 flex flex-col gap-3" data-testid="deposit-view-crypto">
            {/* Direct Web3 Wallet Rail (Simulation Sandbox) */}
            <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-primary/30 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-mono text-on-surface font-semibold uppercase tracking-wider">
                    Direct Web3 Wallet Deposit (Demo Sandbox)
                  </span>
                </div>
                <span className="text-[10px] font-mono text-tertiary">Simulated Sandbox</span>
              </div>

              {connectedWallet ? (
                <div className="bg-surface-container-lowest p-2.5 rounded-DEFAULT border border-border-hairline space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                      <span className="text-xs font-mono text-on-surface font-bold">
                        {walletName}: {connectedWallet.slice(0, 6)}...{connectedWallet.slice(-4)}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-primary/10 text-primary border border-primary/20 rounded-xs font-semibold">
                        DEMO
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConnectedWallet(null)}
                      className="text-[10px] font-mono text-outline hover:text-error transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono text-outline">
                    <span>Simulated Wallet Balance:</span>
                    <span className="text-primary font-bold">124,500.00 USDC</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="relative">
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Amount to Deposit"
                        className="w-full bg-surface-container border border-border-hairline rounded-DEFAULT px-2.5 py-1.5 text-xs font-mono text-on-surface focus:outline-none focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setDepositAmount('124500')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-primary font-bold hover:underline cursor-pointer"
                      >
                        MAX
                      </button>
                    </div>

                    {depositSuccess ? (
                      <div className="py-2 bg-tertiary/10 border border-tertiary/40 rounded-DEFAULT text-center text-xs font-mono text-tertiary font-bold flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        <span>SIMULATED TRANSFER DISPATCHED (DEMO SANDBOX)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleWalletDeposit}
                        disabled={isDepositing}
                        className="w-full py-2 bg-primary text-on-primary hover:bg-primary-container font-mono text-xs font-bold uppercase tracking-wider rounded-DEFAULT transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{isDepositing ? 'Simulating Wallet Signature...' : `Simulate Deposit of ${depositAmount} USDC to Vault`}</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-outline font-sans">
                    Simulate connecting a non-custodial Web3 wallet provider to test sovereign MPC vault deposit flows:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={isConnecting}
                      onClick={() => handleConnectWallet('MetaMask')}
                      className="py-2 px-2 bg-surface-container hover:bg-surface-container-high border border-border-hairline hover:border-primary/50 rounded-DEFAULT text-center font-mono text-xs font-semibold text-on-surface flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="text-sm">🦊</span>
                      <span>MetaMask</span>
                    </button>
                    <button
                      type="button"
                      disabled={isConnecting}
                      onClick={() => handleConnectWallet('Trust Wallet')}
                      className="py-2 px-2 bg-surface-container hover:bg-surface-container-high border border-border-hairline hover:border-primary/50 rounded-DEFAULT text-center font-mono text-xs font-semibold text-on-surface flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="text-sm">🛡️</span>
                      <span>Trust Wallet</span>
                    </button>
                    <button
                      type="button"
                      disabled={isConnecting}
                      onClick={() => handleConnectWallet('WalletConnect')}
                      className="py-2 px-2 bg-surface-container hover:bg-surface-container-high border border-border-hairline hover:border-primary/50 rounded-DEFAULT text-center font-mono text-xs font-semibold text-on-surface flex flex-col items-center gap-1 transition-all cursor-pointer"
                    >
                      <span className="text-sm">⚡</span>
                      <span>WalletConnect</span>
                    </button>
                  </div>
                  {isConnecting && (
                    <div className="text-center text-[10px] font-mono text-primary animate-pulse">
                      Awaiting approval in {walletName}...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual MPC Cold Deposit Address */}
            <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-border-hairline flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                  Supported Asset
                </span>
                <span className="text-[10px] font-mono text-tertiary">Zero Inbound Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-primary/20 border border-primary/40 text-primary text-xs font-mono font-bold rounded-DEFAULT">
                  USDC
                </span>
                <span className="px-2 py-0.5 bg-surface-container text-outline text-xs font-mono rounded-DEFAULT">
                  USDT
                </span>
                <span className="px-2 py-0.5 bg-surface-container text-outline text-xs font-mono rounded-DEFAULT">
                  BTC
                </span>
                <span className="px-2 py-0.5 bg-surface-container text-outline text-xs font-mono rounded-DEFAULT">
                  ETH
                </span>
              </div>

              <div className="h-px bg-border-hairline my-0.5" />

              <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                Sovereign MPC Cold Deposit Address (ERC-20)
              </span>
              <div className="flex items-center justify-between bg-surface-container-lowest px-2.5 py-1.5 rounded-DEFAULT border border-border-hairline">
                <code className="text-xs font-mono text-on-surface truncate max-w-[340px]">
                  0x94A8D19F200c9261a81eC97669d0339dE78E916B
                </code>
                <button
                  type="button"
                  data-testid="copy-crypto-address-btn"
                  onClick={() =>
                    handleCopy('0x94A8D19F200c9261a81eC97669d0339dE78E916B', 'crypto')
                  }
                  className="flex items-center gap-1 text-primary hover:text-primary-fixed text-[11px] font-mono font-semibold ml-2 cursor-pointer"
                >
                  {copiedKey === 'crypto' ? <Check className="w-3.5 h-3.5 text-tertiary" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'crypto' ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 p-2 bg-surface-container-lowest rounded-DEFAULT border border-border-hairline">
                <QrCode className="w-10 h-10 text-primary shrink-0" />
                <div className="text-[11px] text-outline font-sans">
                  <p className="font-semibold text-on-surface">Geneva Enclave Cold Vault</p>
                  <p>Funds credited after 12 Ethereum network confirmations (~3 minutes).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Obsidian VIP Card Rail */}
        {activeDepositTab === 'card' && (
          <div className="p-4 pt-2 flex flex-col gap-3" data-testid="deposit-view-card">
            <div className="bg-surface-container-low p-3 rounded-DEFAULT border border-border-hairline flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-outline uppercase tracking-wider">
                  Obsidian Metal Card Limit
                </span>
                <span className="text-[10px] font-mono text-primary font-semibold">Tier 3 Black Card</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span className="text-xs font-mono font-bold text-on-surface">•••• 8912</span>
                </div>
                <span className="text-xs font-mono font-bold text-tertiary">$500,000.00 AVAILABLE</span>
              </div>
              <p className="text-[11px] text-outline font-sans mt-1">
                Instantly route liquidity from secondary corporate card lines directly into primary multi-asset treasury pots.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-border-hairline flex items-center justify-between text-[10px] font-mono text-outline">
          <span>ENCLAVE: GENEVA HS-M 01</span>
          <button
            type="button"
            onClick={closeModal}
            className="px-3 py-1 bg-surface-container-high hover:bg-surface-container text-on-surface rounded-DEFAULT border border-border-hairline font-mono text-xs transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
