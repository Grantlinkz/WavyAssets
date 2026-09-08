import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';
import { useTerminalStore, type TrustMode } from '../../store/useTerminalStore';
import { trustMetricsData, type TrustMetricItem } from './trustData';

export type { TrustMetricItem };

interface TrustInfrastructureProps {
  initialTrustMode?: TrustMode;
}

export const TrustInfrastructure: React.FC<TrustInfrastructureProps> = ({ initialTrustMode }) => {
  const storeTrustMode = useTerminalStore((state) => state.trustMode);
  const setTrustMode = useTerminalStore((state) => state.setTrustMode);
  const trustMode = initialTrustMode ?? storeTrustMode;
  const currentMetrics = trustMetricsData[trustMode];

  return (
    <div className="w-full space-y-6" data-testid="trust-infrastructure-section">
      {/* 1. Top Live Protocol Status Bar */}
      <div className="w-full bg-surface-container-lowest py-2.5 px-4 sm:px-6 rounded-sm border border-outline/30 shadow-sm">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-[11px]">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="inline-block w-2 h-2 rounded-full bg-secondary shadow-sm animate-pulse" />
              <span className="uppercase tracking-widest font-semibold">ENCLAVE ACTIVE</span>
            </div>
            <span className="text-outline select-none">•</span>
            <span className="text-on-surface-variant uppercase tracking-wider">
              INSTITUTIONAL AUDIT PROOF <span className="text-outline">•</span> MERKLE ROOT:{' '}
              <span className="text-primary font-bold">0x9B41...F73D</span>
            </span>
            <span className="text-outline hidden lg:inline select-none">•</span>
            <span className="text-on-surface-variant hidden lg:inline uppercase tracking-wider">
              FIPS 140-3 LEVEL 4 HSM CLUSTERS VERIFIED
            </span>
          </div>

          <div className="flex items-center gap-4 text-outline uppercase tracking-wider">
            <span className="hidden sm:inline">
              CLEARING PARTNERS: <strong className="text-on-surface font-semibold">BNY MELLON</strong> &amp;{' '}
              <strong className="text-on-surface font-semibold">STATE STREET</strong>
            </span>
            <span className="bg-surface-container px-2 py-0.5 rounded-sm text-primary font-bold border border-outline/20">
              LATENCY: 0.042ms
            </span>
          </div>
        </div>
      </div>

      {/* 2. Header & Tier Switcher Section */}
      <div className="w-full flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-2 pb-2">
        <div className="space-y-2.5 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-surface-container border border-outline/30 text-primary font-mono text-[11px] uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>INSTITUTIONAL VERIFICATION • TRACK RECORD &amp; FIDUCIARY STANDARDS</span>
          </div>

          <h2 className="font-headline-xl text-2xl sm:text-3xl text-on-surface tracking-tight font-bold uppercase">
            Audited Performance &amp; Sovereign Trust
          </h2>

          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            Independent proof of reserves, multi-jurisdiction regulatory compliance, and guaranteed
            settlement across{' '}
            <span className="text-primary font-semibold font-mono">
              {trustMode === 'private-wealth' ? '$4.82B' : '$12.40B'}
            </span>{' '}
            in multi-asset allocations.
          </p>
        </div>

        {/* Segmented Tier Switcher */}
        <div
          data-testid="tier-switcher"
          className="inline-flex p-1 rounded-sm bg-surface-container-lowest border border-outline/30 self-start lg:self-end"
        >
          <button
            type="button"
            data-testid="tier-btn-private-wealth"
            onClick={() => setTrustMode('private-wealth')}
            className={`relative px-4 py-1.5 rounded-sm font-sans text-xs uppercase tracking-wider transition-colors flex items-center gap-2 z-10 cursor-pointer ${
              trustMode === 'private-wealth'
                ? 'text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {trustMode === 'private-wealth' && (
              <motion.span
                layoutId="activeTierIndicator"
                className="absolute inset-0 bg-surface-container border border-outline/40 rounded-sm -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                trustMode === 'private-wealth' ? 'bg-primary' : 'bg-transparent'
              }`}
            />
            Private Wealth
          </button>

          <button
            type="button"
            data-testid="tier-btn-institutional"
            onClick={() => setTrustMode('institutional')}
            className={`relative px-4 py-1.5 rounded-sm font-sans text-xs uppercase tracking-wider transition-colors flex items-center gap-2 z-10 cursor-pointer ${
              trustMode === 'institutional'
                ? 'text-primary font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {trustMode === 'institutional' && (
              <motion.span
                layoutId="activeTierIndicator"
                className="absolute inset-0 bg-surface-container border border-outline/40 rounded-sm -z-10 shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                trustMode === 'institutional' ? 'bg-primary' : 'bg-transparent'
              }`}
            />
            Institutional &amp; Funds
          </button>
        </div>
      </div>

      {/* 3. Audited Return Metrics Strip */}
      <div className="w-full bg-surface-container-low rounded-sm overflow-hidden border border-outline/30 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-outline/20">
          <AnimatePresence>
            {currentMetrics.map((metric) => (
              <motion.div
                key={`${trustMode}-${metric.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-5 bg-surface-container-lowest/70 flex flex-col justify-between gap-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-sans text-xs uppercase tracking-wider text-on-surface-variant font-medium">
                    {metric.label}
                  </span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded-sm uppercase font-semibold tracking-wider ${
                      metric.badgeType === 'emerald'
                        ? 'bg-secondary/15 text-secondary border border-secondary/20'
                        : 'bg-primary/15 text-primary border border-primary/20'
                    }`}
                  >
                    {metric.badge}
                  </span>
                </div>

                <div>
                  <div className="font-mono text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
                    {metric.value}
                  </div>
                  <div className="font-sans text-xs text-outline mt-1">{metric.subtitle}</div>
                </div>

                <div className="w-full bg-surface-container-highest h-1 rounded-sm overflow-hidden">
                  <motion.div
                    className={`h-full ${
                      metric.progressColor === 'secondary' ? 'bg-secondary' : 'bg-primary'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.progressPercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 4. Live Telemetry Stream Ribbon */}
        <div className="px-4 py-2 bg-surface-container-lowest/90 border-t border-outline/20 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] text-outline">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-on-surface font-semibold flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-secondary animate-pulse" />
              TELEMETRY STREAM:
            </span>
            <span>
              ROOT: <strong className="text-on-surface-variant">sha256:d82f9...7a10e4</strong>
            </span>
            <span className="hidden sm:inline">
              EPOCH: <strong className="text-on-surface-variant">#984,210</strong>
            </span>
            <span className="hidden md:inline">
              ATTESTOR: <strong className="text-on-surface-variant">ZURICH_HSM_03</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span>
              ISO/IEC 27001:2022 ID:{' '}
              <strong className="text-primary font-mono">BSI-IS-774019</strong>
            </span>
            <span className="inline-flex items-center text-secondary gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-secondary" /> VERIFIED SYNC
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
