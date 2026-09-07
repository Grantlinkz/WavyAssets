import React from 'react';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { Lock, CreditCard, Shield } from 'lucide-react';

export const VipCardsPanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();

  const cardTiers = [
    {
      id: 'titanium-black',
      name: 'Valiance Sovereign Obsidian Titanium',
      material: 'Solid Grade-5 Laser-Etched Titanium (28g)',
      creditLine: 'Up to $10,000,000 Instant Line',
      collateral: '1:1 Multi-Asset Non-Liquidation Pledge',
      fxSpread: '0.00% Zero-FX in 140+ Jurisdictions',
      perks: 'Compliant Swiss IBAN • Unlimited ATM Vault Withdrawals • Net-Jet Concierge',
    },
    {
      id: 'pure-gold',
      name: 'Aura 18K Solid Gold Fiduciary Card',
      material: 'Hand-Milled 18K Yellow Gold with NFC Core',
      creditLine: 'Up to $25,000,000 Sovereign Line',
      collateral: 'Direct Geneva Freeport Vault Lien',
      fxSpread: 'Institutional Wholesale Interbank',
      perks: 'Freeport Physical Vault Key • Armed Custody Escort • Dedicated Private Banker',
    },
  ];

  return (
    <div className="w-full space-y-6" data-testid="panel-vip-cards">
      {/* Hero */}
      <div className="w-full bg-surface-container-low p-6 rounded-sm border border-outline/30 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container-high text-primary font-mono text-[10px] uppercase tracking-widest rounded-sm border border-outline/20">
                [ COLLATERALIZED PAYMENT RAILS // PURE METAL CONCIERGE ]
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                ZERO FX MARKUP WORLDWIDE
              </span>
            </div>

            <h3 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              VIP Concierge &amp; Collateral Metal Cards
            </h3>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Programmatic credit lines instantly collateralized by your crypto, equities, and bonded
              hypercars without triggering taxable liquidation events. Enjoy pure titanium physical
              cards, unlimited global spending, and 24/7 bespoke sovereign concierge.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-request-card"
                onClick={() => openAuthModal('private-wealth')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Request Concierge Invitation</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('private-wealth')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Lien &amp; Collateral Term Sheet</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-surface-container-lowest p-4 rounded-sm border border-outline/20 space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-outline/20">
              <span className="font-sans text-[11px] uppercase text-outline tracking-wider font-semibold">
                CARD INFRASTRUCTURE METRICS
              </span>
              <span className="font-mono text-[10px] text-secondary font-semibold">
                GLOBAL MASTERCARD WORLD ELITE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">MAX INSTANT LINE</div>
                <div className="font-mono text-xl font-bold text-primary pt-0.5">$25M</div>
                <div className="font-mono text-[9px] text-secondary">Zero Liquidation</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">FX SPREAD</div>
                <div className="font-mono text-xl font-bold text-secondary pt-0.5">0.00%</div>
                <div className="font-mono text-[9px] text-outline">True Interbank</div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-sans text-[10px] text-outline uppercase">CONCIERGE SLA</div>
                <div className="font-mono text-xl font-bold text-on-surface pt-0.5">&lt;60s</div>
                <div className="font-mono text-[9px] text-outline">Dedicated Desk</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cardTiers.map((card) => (
          <div
            key={card.id}
            className="bg-surface-container-low p-5 rounded-sm border border-outline/20 hover:border-primary/50 transition-colors flex flex-col justify-between gap-4 shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-sans font-bold text-base text-on-surface">{card.name}</div>
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="font-mono text-xs text-outline">{card.material}</div>
              <div className="font-mono text-sm font-bold text-primary pt-1">
                {card.creditLine}
              </div>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                {card.perks}
              </p>
            </div>

            <div className="pt-3 border-t border-outline/20 flex items-center justify-between text-xs font-mono">
              <span className="text-secondary font-semibold">{card.fxSpread}</span>
              <span className="text-outline">{card.collateral}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
