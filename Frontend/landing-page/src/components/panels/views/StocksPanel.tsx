import React, { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { Lock, Building2, Globe2, Sparkles, HelpCircle, ShieldCheck, CheckCircle2, TrendingUp } from 'lucide-react';
import stockVideo from '../../../assets/verticals/stock.mp4';

export const StocksPanel: React.FC = () => {
  const { openAuthModal } = useTerminalStore();
  const shouldReduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const blocks = [
    {
      id: 'block-1',
      ticker: 'SPACEX',
      company: 'Space Exploration Technologies Corp.',
      type: 'Secondary Series N Common Shares',
      valuation: '$210B Implied',
      available: '$18.5M Block',
      discount: '-4.8% vs Primary',
      status: 'Available',
    },
    {
      id: 'block-2',
      ticker: 'STRIPE',
      company: 'Stripe, Inc.',
      type: 'Direct Private Secondary SPV',
      valuation: '$70B Implied',
      available: '$12.0M Block',
      discount: '-6.2% vs Tender',
      status: 'Filling Soon',
    },
    {
      id: 'block-3',
      ticker: 'ANTHROPIC',
      company: 'Anthropic PBC',
      type: 'Preferred Convertible Note Series C',
      valuation: '$18.5B Implied',
      available: '$25.0M Block',
      discount: 'Direct Allocation',
      status: 'Open',
    },
    {
      id: 'block-4',
      ticker: 'BYTEDANCE',
      company: 'ByteDance Ltd.',
      type: 'Global Institutional Offshore SPV',
      valuation: '$268B Implied',
      available: '$30.0M Block',
      discount: '-8.5% Net',
      status: 'Pending',
    },
  ];

  return (
    <div className="w-full space-y-6" data-testid="panel-stocks">
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
                INVEST IN STOCKS ONLINE • PRE-IPO EQUITIES
              </span>
              <span className="px-2 py-0.5 bg-secondary/15 text-secondary font-mono text-[10px] uppercase tracking-wider rounded-sm flex items-center gap-1 border border-secondary/20">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                BNY MELLON CUSTODY
              </span>
            </div>

            <h1 className="font-headline-xl text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Invest in stocks online and own high-growth companies
            </h1>

            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Trade shares in over 40 global markets with transparent pricing. Get early access to
              pre-IPO companies before they hit public exchanges.
            </p>

            <div className="text-[11px] font-mono text-outline">
              Trading Desk: <span className="text-on-surface font-semibold">Global Stocks &amp; Pre-IPO Direct Market Access</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                data-testid="btn-request-block"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary-container font-sans text-xs uppercase rounded-sm hover:bg-primary-hover transition-colors font-bold shadow-sm cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Buy Your First Shares</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('institutional')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-container text-on-surface font-sans text-xs uppercase rounded-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline/20"
              >
                <Globe2 className="w-3.5 h-3.5 text-outline" />
                <span>View Pre-IPO Companies</span>
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
                src={stockVideo}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                data-testid="stocks-video"
                className="w-full h-full object-cover rounded-sm"
              />

              {/* Ambient Edge Vignette */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-container-lowest/70 via-transparent to-surface-container-lowest/20" />

              {/* Top Status Pill Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-surface-container-lowest/80 backdrop-blur-xs border border-outline/30 text-[10px] font-mono text-on-surface shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="font-semibold text-secondary">LIVE</span>
                <span className="text-outline/40">|</span>
                <span className="text-on-surface-variant uppercase tracking-wider text-[9px]">DIRECT MARKET ACCESS</span>
              </div>

              {/* Bottom Telemetry Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-sm bg-surface-container-lowest/80 backdrop-blur-xs border border-outline/30 shadow-xs">
                <span className="font-mono text-[9px] text-outline uppercase tracking-wider">
                  LOW-LATENCY ORDER FLOW
                </span>
                <span className="font-mono text-[10px] font-bold text-primary">
                  EQUINIX NY4 • PRE-IPO ALLOCATIONS
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
            TRANSPARENT STOCK TRADING BUILT FOR YOU
          </h2>
          <div className="group relative cursor-pointer">
            <span className="font-mono text-[11px] text-outline flex items-center gap-1 hover:text-primary transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              How do Pre-IPO shares work?
            </span>
            <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-72 p-2.5 bg-surface-container-highest text-on-surface text-xs rounded-sm border border-outline shadow-lg z-20">
              Pre-IPO shares let you purchase private company stock before it trades on public stock exchanges.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Direct Market Access</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Buy shares on major global exchanges without hidden markups or middlemen taking a cut.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Zero Markups
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Pre-IPO Opportunities</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              Own shares in leading private technology companies like SpaceX and Stripe before their public debut.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-primary/15 text-primary text-[10px] font-mono font-semibold">
                Verified Allocation
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/40 transition-colors space-y-2">
            <div className="w-8 h-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-sans font-bold text-sm text-on-surface">Clear Fee Protection</h3>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
              See the exact price you pay before you hit confirm. No hidden spreads or surprise charges.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-secondary/15 text-secondary text-[10px] font-mono font-semibold">
                100% Transparent
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Blocks Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-primary uppercase tracking-widest font-bold flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            AVAILABLE PRE-IPO SHARE PACKAGES
          </span>
          <span className="font-mono text-[10px] text-outline">
            SAFE SETTLEMENT: BNY MELLON
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blocks.map((b) => (
            <div
              key={b.id}
              className="bg-surface-container-low p-4 rounded-sm border border-outline/20 hover:border-primary/50 transition-colors flex flex-col justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-sm text-primary">{b.ticker}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-sm border border-outline/20">
                      {b.status}
                    </span>
                    <span className="font-mono text-xs font-bold text-secondary bg-secondary/15 px-2 py-0.5 rounded-sm border border-secondary/20">
                      {b.discount}
                    </span>
                  </div>
                </div>
                <div className="font-sans font-semibold text-sm text-on-surface">{b.company}</div>
                <p className="font-sans text-xs text-outline">{b.type}</p>
              </div>

              <div className="pt-3 border-t border-outline/20 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-[10px] text-outline uppercase block">
                    Company Valuation
                  </span>
                  <span className="font-mono font-semibold text-on-surface">{b.valuation}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-outline uppercase block">
                    Available Amount
                  </span>
                  <span className="font-mono text-base font-bold text-primary">{b.available}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
