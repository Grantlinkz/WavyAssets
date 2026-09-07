import React from 'react';
import { Sliders, Lock } from 'lucide-react';
import { useTerminalStore } from '../../store/useTerminalStore';
import { calculatePortfolioMetrics } from '../../lib/calculator';
import { formatCurrency } from '../../lib/formatters';
import { DonutChart3D } from './DonutChart3D';

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

  const metrics = calculatePortfolioMetrics(capital, aggressiveness);

  return (
    <div className="w-full bg-surface-container-low rounded-lg p-6 lg:p-8 shadow-xl border border-outline/30">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sliders & Allocation Parameters */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header / Parameter Bar */}
            <div className="flex items-center justify-between pb-3 bg-surface-container-lowest/60 px-3.5 py-2 rounded-sm border border-outline/20">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-2 font-mono">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                PORTFOLIO CALIBRATION PARAMETERS
              </span>
              <span className="text-[10px] text-outline font-mono">
                SLA: 0.04ms NY4 FIX
              </span>
            </div>

            {/* Slider 1: Capital Allocation */}
            <div className="space-y-3 bg-surface-container p-4 rounded-sm border border-outline/20">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface">
                  Target Allocation Capital
                </span>
                <span
                  data-testid="capital-display"
                  className="font-mono text-2xl text-primary font-bold"
                >
                  {formatCurrency(capital)}
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
                  <button
                    key={quick.value}
                    type="button"
                    onClick={() => setSimulatorCapital(quick.value)}
                    className={`px-2.5 py-1 rounded-sm font-mono text-xs transition-colors border ${
                      capital === quick.value
                        ? 'bg-primary-container text-on-primary-container border-primary font-semibold'
                        : 'bg-surface-container-high hover:bg-surface-bright text-on-surface border-transparent'
                    }`}
                  >
                    {quick.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Slider 2: Strategy Aggressiveness */}
            <div className="space-y-3 bg-surface-container p-4 rounded-sm border border-outline/20">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface">
                  Strategy Mandate &amp; Risk Posture
                </span>
                <span
                  data-testid="risk-posture-badge"
                  className="font-mono text-[11px] uppercase px-2.5 py-0.5 rounded-sm bg-secondary/15 text-secondary font-semibold"
                >
                  {metrics.posture.name} ({metrics.blendedApy}%)
                </span>
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
                  1. Capital Preservation
                  <br />
                  <span className="text-on-surface-variant font-bold">8.6% Target</span>
                </span>
                <span className="text-center">
                  2. Balanced Growth
                  <br />
                  <span className="text-secondary font-bold">14.2% Target</span>
                </span>
                <span className="text-right">
                  3. Maximum Alpha
                  <br />
                  <span className="text-primary font-bold">22.4% Target</span>
                </span>
              </div>
            </div>

            {/* Micro Fiduciary Description */}
            <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-lowest/80 p-3 rounded-sm border border-outline/20">
              Real-time programmatic cross-collateralization. Yields automatically harvest from
              Zurich bonded hypercar appreciation, clustered H100 compute GPU revenue, and
              liquid treasury arbitrage pooled under a single cross-margin vault.
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
        </div>

        {/* Right Column: Visual Return Matrix & SVG Donut */}
        <div className="lg:col-span-6 bg-surface-container p-6 rounded-md flex flex-col justify-between space-y-6 border border-outline/20">
          <div>
            <div className="flex items-center justify-between pb-3 bg-surface-container-low px-3 py-2 rounded-sm border border-outline/20">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-on-surface">
                BLENDED EXPOSURE &amp; RETURN MATRIX
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-sm bg-secondary/10 text-secondary font-bold">
                SLA ACTIVE
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
                  ESTIMATED 12-MONTH NET RETURN
                </span>
                <span
                  data-testid="monthly-runrate"
                  className="font-mono text-xs text-secondary font-semibold"
                >
                  +{formatCurrency(metrics.monthlyRunrate)} / Mo
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span
                  data-testid="annual-return"
                  className="font-mono text-2xl sm:text-3xl text-secondary font-bold"
                >
                  {formatCurrency(metrics.annualReturn)}
                </span>
                <span className="font-mono text-[10px] text-outline">
                  TAX ALPHA STRIPPED
                </span>
              </div>
            </div>

            {/* Risk Metrics Matrix */}
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-mono text-[10px] text-outline uppercase">
                  MAX 3-YR DRAWDOWN
                </div>
                <div className="font-mono text-xs text-on-surface font-bold mt-0.5">
                  {metrics.posture.maxDrawdown}%
                </div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-mono text-[10px] text-outline uppercase">
                  SHARPE RATIO
                </div>
                <div className="font-mono text-xs text-secondary font-bold mt-0.5">
                  {metrics.posture.sharpeRatio}
                </div>
              </div>
              <div className="bg-surface-container-low p-2.5 rounded-sm border border-outline/20">
                <div className="font-mono text-[10px] text-outline uppercase">
                  CAPITAL SHIELD
                </div>
                <div className="font-mono text-xs text-primary font-bold mt-0.5">
                  {metrics.posture.capitalShield}
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-outline/20">
            <button
              type="button"
              onClick={() => openAuthModal('institutional')}
              className="w-full sm:flex-1 py-3 px-4 rounded-sm bg-primary-container text-on-primary-container text-xs uppercase font-bold tracking-wider hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Mandate &amp; Export Simulation (PDF)</span>
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('institutional')}
              className="w-full sm:w-auto py-3 px-4 rounded-sm bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs uppercase font-semibold tracking-wider transition-colors border border-outline/30"
            >
              <span>Custom Weights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
