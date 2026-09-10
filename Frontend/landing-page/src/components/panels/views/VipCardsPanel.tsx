import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { Lock, CreditCard, Shield, Sparkles, HelpCircle, CheckCircle2, Globe, PhoneCall } from 'lucide-react';
import vipCardsVideo from '../../../assets/verticals/vip cards.mp4';

export const VipCardsPanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const cardTiers = [
    {
      id: 'titanium-black',
      name: 'WavyAssets Sovereign Obsidian Titanium',
      material: 'Solid Grade-5 Laser-Etched Titanium (28g)',
      creditLine: 'Up to $10,000,000 Instant Line',
      collateral: '1:1 Multi-Asset Non-Liquidation Pledge',
      fxSpread: '0.00% Zero-FX in 140+ Jurisdictions',
      perks: 'Compliant Swiss IBAN • Unlimited ATM Vault Withdrawals • Net-Jet Concierge',
      status: 'Card Active',
    },
    {
      id: 'pure-gold',
      name: 'WAVY 18K Solid Gold Fiduciary Card',
      material: 'Hand-Milled 18K Yellow Gold with NFC Core',
      creditLine: 'Up to $25,000,000 Sovereign Line',
      collateral: 'Direct Geneva Freeport Vault Lien',
      fxSpread: 'Institutional Wholesale Interbank',
      perks: 'Freeport Physical Vault Key • Armed Custody Escort • Dedicated Private Banker',
      status: 'Invitation Only',
    },
  ];

  return (
    <div className="w-full space-y-6" data-testid="panel-vip-cards">
      {/* Hero Section */}
      <div className="w-full bg-surface-container-low p-6 rounded-sm border border-outline/30 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <motion.div
            className="lg:col-span-7 space-y-4"
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 bg-surface-container-high text-primary font-mono text-[10px] uppercase tracking-widest rounded-sm border border-outline/20">
                ASSET-BACKED METAL CARDS • GLOBAL CONCIERGE
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                ZERO FOREIGN FEES WORLDWIDE
              </span>
            </div>

            <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Spend anywhere with a titanium card backed by your assets
            </h1>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Unlock purchasing power backed by your crypto, stocks, or gold without selling your
              holdings. Spend in over 140 countries with zero foreign transaction fees.
            </p>

            <div className="text-[11px] font-mono text-outline">
              Spending Facility: <span className="text-on-surface font-semibold">VIP Concierge &amp; Collateral Metal Cards</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-request-card"
                onClick={() => openAuthModal('private-wealth')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Request Your Titanium Card</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('private-wealth')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Review Card Benefits</span>
              </button>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-5 w-full flex items-center justify-center"
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 30, scale: shouldReduceMotion ? 1 : 0.98 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.85, delay: shouldReduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="relative w-full h-[260px] sm:h-[280px] rounded-sm overflow-hidden bg-surface-container-lowest border border-outline/30 shadow-lg group hover:border-primary/50 transition-all duration-300">
              <video
                ref={videoRef}
                src={vipCardsVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                data-testid="vip-cards-video"
                className="w-full h-full object-cover rounded-sm pointer-events-none"
              />

              {/* Ambient Edge Vignette */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-lowest/70 via-transparent to-surface-container-lowest/20" />

              {/* Top Status Pill Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-surface-container-lowest/80 backdrop-blur-xs border border-outline/30 text-[10px] font-mono text-on-surface shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-semibold text-secondary">LIVE</span>
                <span className="text-outline/40">|</span>
                <span className="text-on-surface-variant uppercase tracking-wider text-[9px]">VIP CONCIERGE &amp; CARDS</span>
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-sm bg-surface-container-lowest/80 backdrop-blur-xs border border-outline/30 shadow-xs">
                <span className="font-mono text-[9px] text-outline uppercase tracking-wider">
                  ASSET-BACKED LINE
                </span>
                <span className="font-mono text-[10px] font-bold text-primary">
                  0.00% ZERO-FX SURCHARGE
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Core Features Breakdown: 3 Plain Benefit Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            PREMIUM SPENDING PRIVILEGES WITHOUT EXTRA FEES
          </h2>
          <div className="group relative cursor-pointer">
            <span className="font-mono text-[11px] text-outline flex items-center gap-1 hover:text-primary transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              What is asset-backed spending?
            </span>
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-72 p-2.5 bg-surface-container-highest text-on-surface text-xs rounded-sm border border-outline shadow-lg z-20">
              Asset-backed borrowing lets you spend cash while keeping your investments growing in your account.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Zero Foreign Fees</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Spend in over 140 currencies at true bank-to-bank exchange rates with zero hidden markups.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                <CheckCircle2 className="w-3 h-3" /> 0% Foreign Fees
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Backed by Your Portfolio</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Borrow against your stocks, cars, or crypto at low interest rates without selling your assets.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/15 text-primary text-[10px] font-mono font-semibold">
                Flexible Credit
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">24/7 Personal Concierge</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Book flights, reserve private dining, or arrange transport with a dedicated human specialist.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                Immediate Response
              </span>
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
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-sm border border-outline/20">
                    {card.status}
                  </span>
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
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
