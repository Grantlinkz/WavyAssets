import React, { useState, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sliders, Lock } from 'lucide-react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { calculatePortfolioMetrics } from '../../lib/calculator';
import { formatCurrency } from '../../lib/formatters';
import { DonutChart3D } from './DonutChart3D';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { simulationApi } from '../../lib/api';

const QUICK_CAPITALS = [
  { label: '$100K', value: 100000 },
  { label: '$250K', value: 250000 },
  { label: '$500K', value: 500000 },
  { label: '$1.0M', value: 1000000 },
  { label: '$5.0M', value: 5000000 },
];

export interface PortfolioSimulatorProps {
  initialCapital?: number;
  initialAggressiveness?: number;
}

export const PortfolioSimulator: React.FC<PortfolioSimulatorProps> = ({
  initialCapital,
  initialAggressiveness,
}) => {
  const storeCapital = useTerminalStore((state) => state.simulator.capital);
  const storeAggressiveness = useTerminalStore((state) => state.simulator.aggressiveness);
  const capital = initialCapital ?? storeCapital;
  const aggressiveness = initialAggressiveness ?? storeAggressiveness;

  const setSimulatorCapital = useTerminalStore((state) => state.setSimulatorCapital);
  const setSimulatorAggressiveness = useTerminalStore(
    (state) => state.setSimulatorAggressiveness
  );
  const openAuthModal = useTerminalStore((state) => state.openAuthModal);

  // Specular Mouse Spotlight Tracking
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, active: false });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePos((prev) => ({ ...prev, active: false }));
  }, []);

  const shouldReduceMotion = useReducedMotion();
  const metrics = calculatePortfolioMetrics(capital, aggressiveness);

  const handleProceed = async () => {
    try {
      const res = await simulationApi.saveSimulation({
        capitalAmount: capital,
        riskPosture: aggressiveness,
        projectedYield: metrics.blendedApy,
      });
      if (res.data?.token) {
        console.info(`[Simulator] Portfolio intent tokenized: ${res.data.token}`);
      }
    } catch (err) {
      console.warn('[Simulator] Simulation intent persistence offline fallback active:', err);
    }
    openAuthModal('institutional');
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-surface-container-low rounded-lg p-6 lg:p-8 shadow-xl border border-outline/30 overflow-hidden"
    >
      {/* Dynamic Specular Spotlight Overlay */}
      {mousePos.active && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-100"
          style={{
            background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(212, 175, 55, 0.04), transparent 75%)`,
          }}
        />
      )}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders & Allocation Parameters (Animates from Left) */}
        <motion.div
          data-testid="simulator-left-column"
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{ willChange: 'transform, opacity' }}
          className="lg:col-span-6 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-6">
            {/* Header / Parameter Bar */}
            <div className="flex items-center justify-between pb-3 bg-surface-container-lowest/60 px-3.5 py-2 rounded-sm border border-outline/20">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 font-mono">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                PORTFOLIO ESTIMATION SETTINGS
              </span>
              <span className="text-[10px] text-secondary font-mono">
                REAL-TIME ESTIMATES
              </span>
            </div>

            {/* Slider 1: Capital Allocation */}
            <div className="space-y-3 bg-surface-container p-4 rounded-sm border border-outline/20">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface">
                  Your Investment Amount
                </span>
                <span
                  data-testid="capital-display"
                  className="font-mono text-2xl text-primary font-bold"
                >
                  <AnimatedNumber
                    value={capital}
                    formatter={formatCurrency}
                    flashOnChange
                  />
                </span>
              </div>

              <input
                type="range"
                data-testid="capital-slider"
                min={50000}
                max={10000000}
                step={25000}
                value={capital}
                onChange={(e) => setSimulatorCapital(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-highest rounded-sm appearance-none cursor-pointer accent-primary"
              />

              <div className="flex items-center justify-between font-mono text-[10px] text-outline">
                <span>$50K</span>
                <span>$2.5M</span>
                <span>$5.0M</span>
                <span>$10.0M</span>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {QUICK_CAPITALS.map((quick) => (
                  <motion.button
                    key={quick.value}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    onClick={() => setSimulatorCapital(quick.value)}
                    className={`px-2.5 py-1 rounded-sm font-mono text-xs transition-colors border ${
                      capital === quick.value
                        ? 'bg-primary-container text-on-primary-container border-primary font-semibold shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                        : 'bg-surface-container-high hover:bg-surface-bright text-on-surface border-transparent'
                    }`}
                  >
                    {quick.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Slider 2: Strategy Mandate & Risk Posture */}
            <div className="space-y-3 bg-surface-container p-4 rounded-sm border border-outline/20">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface">
                  Investment Strategy &amp; Growth Goal
                </span>
                <motion.span
                  key={metrics.posture.name}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  data-testid="risk-badge"
                  className="font-mono text-xs px-2 py-0.5 rounded-sm bg-secondary/10 text-secondary border border-secondary/30 font-semibold"
                >
                  {metrics.posture.name.toUpperCase()} ({metrics.blendedApy}%)
                </motion.span>
              </div>

              <input
                type="range"
                data-testid="risk-slider"
                min={1}
                max={3}
                step={1}
                value={aggressiveness}
                onChange={(e) => setSimulatorAggressiveness(Number(e.target.value))}
                className="w-full h-2 bg-surface-container-highest rounded-sm appearance-none cursor-pointer accent-primary"
              />

              <div className="grid grid-cols-3 font-mono text-[10px] text-outline gap-1 pt-1">
                <span className="text-left">
                  1. Steady &amp; Safe
                  <br />
                  <span className="text-on-surface-variant font-bold">8.6% Target</span>
                </span>
                <span className="text-center">
                  2. Balanced Growth
                  <br />
                  <span className="text-secondary font-bold">14.2% Target</span>
                </span>
                <span className="text-right">
                  3. High Growth
                  <br />
                  <span className="text-primary font-bold">22.4% Target</span>
                </span>
              </div>
            </div>

            {/* Micro Fiduciary Description */}
            <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-lowest/80 p-3 rounded-sm border border-outline/20">
              See how your money can grow with a diversified portfolio across high-growth stocks,
              smart automated AI funds, collector cars, and commercial properties.
            </p>
          </div>

          {/* Parameter Chips Footer */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="bg-surface-container p-2.5 rounded-sm space-y-1 border border-outline/20">
              <div className="font-mono text-[10px] text-outline uppercase">REBALANCE</div>
              <div className="font-mono text-[11px] text-on-surface font-medium">
                Continuous Epoch
              </div>
            </div>
            <div className="bg-surface-container p-2.5 rounded-sm space-y-1 border border-outline/20">
              <div className="font-mono text-[10px] text-outline uppercase">ENCLAVE</div>
              <div className="font-mono text-[11px] text-on-surface font-medium">
                Zurich / NY4 Equinix
              </div>
            </div>
            <div className="bg-surface-container p-2.5 rounded-sm space-y-1 border border-outline/20">
              <div className="font-mono text-[10px] text-outline uppercase">CROSS-MARGIN</div>
              <div className="font-mono text-[11px] text-on-surface font-medium">
                1:1 Non-Hypothecated
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Visual Return Matrix & SVG Donut (Animates from Right) */}
        <motion.div
          data-testid="simulator-right-column"
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: 0.85,
            delay: shouldReduceMotion ? 0 : 0.1,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ willChange: 'transform, opacity' }}
          className="lg:col-span-6 bg-surface-container p-6 rounded-md flex flex-col justify-between space-y-6 border border-outline/20"
        >
          <div>
            <div className="flex items-center justify-between pb-3 bg-surface-container-low px-3 py-2 rounded-sm border border-outline/20">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface">
                PORTFOLIO BREAKDOWN &amp; ESTIMATED RETURN
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm bg-secondary/10 text-secondary font-bold">
                LIVE ESTIMATE
              </span>
            </div>

            {/* SVG Donut Visualizer */}
            <DonutChart3D
              blendedApy={metrics.blendedApy}
              weights={metrics.posture.weights}
            />

            {/* Projected Net Return Readout */}
            <div className="bg-surface-container-lowest p-4 rounded-sm space-y-2 border border-outline/20 mt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-outline font-mono">
                  ESTIMATED 12-MONTH RETURN
                </span>
                <span
                  data-testid="monthly-runrate"
                  className="font-mono text-xs text-secondary font-semibold"
                >
                  <AnimatedNumber
                    value={metrics.monthlyRunrate}
                    formatter={(val) => `+${formatCurrency(val)} / mo`}
                  />
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span
                  data-testid="annual-return"
                  className="font-mono text-2xl sm:text-3xl text-secondary font-bold"
                >
                  <AnimatedNumber
                    value={metrics.annualReturn}
                    formatter={formatCurrency}
                    flashOnChange
                  />
                </span>
                <span className="font-mono text-[10px] text-outline">
                  AFTER ESTIMATED FEES
                </span>
              </div>
            </div>

            {/* Risk Metrics Matrix */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-mono text-[10px] text-outline uppercase">
                  MAX 3-YEAR DIP
                </div>
                <div className="font-mono text-xs text-on-surface font-bold mt-0.5">
                  {metrics.posture.maxDrawdown}%
                </div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-mono text-[10px] text-outline uppercase">
                  RISK-REWARD SCORE
                </div>
                <div className="font-mono text-xs text-secondary font-bold mt-0.5">
                  {metrics.posture.sharpeRatio}
                </div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-mono text-[10px] text-outline uppercase">
                  ASSET PROTECTION
                </div>
                <div className="font-mono text-xs text-primary font-bold mt-0.5">
                  {metrics.posture.capitalShield}
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-outline/20">
            <motion.button
              type="button"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={handleProceed}
              className="w-full sm:flex-1 py-3 px-4 rounded-sm bg-primary-container text-on-primary-container text-xs uppercase font-bold tracking-wider hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Start Investing With This Mix</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => openAuthModal('institutional')}
              className="w-full sm:w-auto py-3 px-4 rounded-sm bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs uppercase font-semibold tracking-wider transition-colors border border-outline/30"
            >
              <span>Adjust Investment Mix</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
