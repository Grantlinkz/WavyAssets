import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { UnifiedFinanceInfographic3D } from './UnifiedFinanceInfographic3D';
import { useTerminalStore } from '../../store/useTerminalStore';
import {
  Layers,
  Landmark,
  ArrowRight,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const openAuthModal = useTerminalStore((state) => state.openAuthModal);

  const pillars = [
    {
      icon: Layers,
      title: 'Unified Multi-Asset Depository',
      description:
        'Manage crypto yields, global stocks, AI compute clusters, prime real estate, and exotic vehicles from one single, crystal-clear dashboard.',
    },
    {
      icon: Lock,
      title: 'Bank-Grade MPC Cold Storage',
      description:
        'Your capital is secured with multi-signature cryptographic keys and institutional hardware vaults, ensuring you maintain absolute ownership.',
    },
    {
      icon: Landmark,
      title: 'Direct Liquidity & Global Settlement',
      description:
        'Access flexible lines of credit against your reserves with zero foreign exchange markups and instant worldwide card settlement.',
    },
  ];

  return (
    <section
      id="about"
      data-testid="about-section"
      className="w-full py-16 scroll-mt-20 relative space-y-12"
    >
      {/* Subtle Divider Line */}
      <div className="w-full border-t border-outline/30" />

      {/* 3D Unified Finance Corporate Infographic Centerpiece with embedded headline & narrative */}
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        <UnifiedFinanceInfographic3D />
      </motion.div>

      {/* 3 Pillar Cards, Regulatory Credentials, & Action CTAs */}
      <div className="space-y-8 pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-sm bg-surface-container-low border border-outline/20 space-y-2 hover:border-primary/40 transition-colors"
              >
                <div className="w-7 h-7 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="font-sans text-xs font-bold text-on-surface">
                  {pillar.title}
                </div>
                <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-6 border-t border-outline/20">
          {/* Regulatory Credentials Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-mono text-[10px] px-2.5 py-1 rounded-sm bg-surface-container border border-outline/20 text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>SEC REGISTERED RIA 801-128491</span>
            </div>
            <div className="font-mono text-[10px] px-2.5 py-1 rounded-sm bg-surface-container border border-outline/20 text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span>FINMA REGULATED VQF SWITZERLAND</span>
            </div>
            <div className="font-mono text-[10px] px-2.5 py-1 rounded-sm bg-surface-container border border-outline/20 text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>SOC-2 TYPE II AUDITED</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => openAuthModal('institutional', 'mandate')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-primary-container text-on-primary-container font-sans text-xs uppercase font-bold tracking-wider hover:bg-primary-hover transition-colors shadow-sm cursor-pointer"
            >
              <span>Create Your Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <a
              href="#portfolio-simulator"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-sm bg-surface-container hover:bg-surface-container-high text-on-surface border border-outline/30 font-sans text-xs uppercase font-semibold tracking-wider transition-colors"
            >
              <span>Explore Simulator</span>
              <ExternalLink className="w-3.5 h-3.5 text-outline" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
