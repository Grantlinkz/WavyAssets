import React from 'react';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { Lock, ShieldCheck, Key, CheckCircle2, Sparkles, HelpCircle, Wallet, Globe } from 'lucide-react';

export const WalletPanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();

  const securityNodes = [
    {
      id: 'node-zh',
      name: 'Zurich Military Bunker Enclave',
      hardware: 'Hardware Security Module (Level 4 Certified)',
      role: 'Master Key Shard A',
      status: 'Active • Verified',
      badgeStatus: 'active',
    },
    {
      id: 'node-ge',
      name: 'Geneva Freeport Deep Storage',
      hardware: 'Air-Gapped Cold Security Core',
      role: 'Two-Person Approval Key Shard B',
      status: 'Active • Air-Gapped',
      badgeStatus: 'active',
    },
    {
      id: 'node-ny',
      name: 'New York Equinix NY4 Cage',
      hardware: 'Real-Time Transaction Validator',
      role: 'Spending Validator Key Shard C',
      status: 'Active • Direct Connection',
      badgeStatus: 'active',
    },
  ];

  return (
    <div className="w-full space-y-6" data-testid="panel-wallet">
      {/* Hero Section */}
      <div className="w-full bg-surface-container-low p-6 rounded-sm border border-outline/30 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container-high text-primary font-mono text-[10px] uppercase tracking-widest rounded-sm border border-outline/20">
                [ DIGITAL MONEY WALLET // MULTI-CURRENCY CASH ]
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                MULTI-KEY VAULT PROTECTION
              </span>
            </div>

            <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              One secure digital money wallet for all your daily cash
            </h1>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Hold dollars, euros, and pounds in one place. Send money globally in seconds, earn interest on idle cash, and protect your funds with multi-key security.
            </p>

            <div className="text-[11px] font-mono text-outline">
              Custody Core: <span className="text-on-surface font-semibold">Digital Custody &amp; Multi-Sig MPC Enclave</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-open-vault"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Open Your Digital Wallet</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
                <span>Check Transfer Rates</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest p-4 rounded-sm border border-outline/20 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline/20">
              <span className="font-sans text-[11px] uppercase text-outline tracking-wider font-semibold">
                WALLET SECURITY &amp; COVERAGE
              </span>
              <span className="font-mono text-[10px] text-secondary font-semibold">
                100% PROOF OF RESERVES
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">INSURANCE COVER</div>
                <div className="font-mono text-xl font-bold text-primary pt-0.5">$500M</div>
                <div className="font-mono text-[9px] text-outline">Underwritten Vault</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">SECURITY RULE</div>
                <div className="font-mono text-xl font-bold text-on-surface pt-0.5">3-of-5</div>
                <div className="font-mono text-[9px] text-secondary">Multi-Key Approval</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">TRANSFER SPEED</div>
                <div className="font-mono text-xl font-bold text-secondary pt-0.5">&lt;1s</div>
                <div className="font-mono text-[9px] text-outline">Instant Domestic</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Features Breakdown: 3 Plain Benefit Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            CASH MANAGEMENT MADE SIMPLE AND SAFE
          </h2>
          <div className="group relative cursor-pointer">
            <span className="font-mono text-[11px] text-outline flex items-center gap-1 hover:text-primary transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              What is multi-key security?
            </span>
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-72 p-2.5 bg-surface-container-highest text-on-surface text-xs rounded-sm border border-outline shadow-lg z-20">
              Multi-key security requires two authorized approvals before any outgoing wire is sent, preventing unauthorized transfers.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Multi-Currency Balances</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Switch between USD, EUR, and GBP with real exchange rates and no surprise markups.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Zero FX Markup
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Key className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Multi-Key Security</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Your funds are protected by multi-signature safety rules—no single person can move your money without your sign-off.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/15 text-primary text-[10px] font-mono font-semibold">
                Two-Step Signoff
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Instant Global Transfers</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Move funds to bank accounts or wallets in over 120 countries at the click of a button.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                Settles in Seconds
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Nodes List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" />
            SECURE MULTI-LOCATION KEY VAULTS
          </span>
          <span className="font-mono text-[10px] text-outline">
            AUDITED PROTOCOL: AES-256
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {securityNodes.map((n) => (
            <div
              key={n.id}
              className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/50 transition-colors flex flex-col justify-between gap-3 shadow-sm"
            >
              <div className="space-y-1">
                <div className="font-sans font-bold text-sm text-on-surface">{n.name}</div>
                <div className="font-mono text-xs text-outline">{n.hardware}</div>
                <div className="font-mono text-[11px] text-primary font-semibold">{n.role}</div>
              </div>

              <div className="pt-2 border-t border-outline/20 flex items-center justify-between text-[11px] font-mono">
                <span className="text-secondary flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-secondary" />
                  {n.status}
                </span>
                <span className="text-outline text-[10px]">Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
