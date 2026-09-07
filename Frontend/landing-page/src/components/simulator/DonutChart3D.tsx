import React, { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { formatPercent } from '../../lib/formatters';
import type { AssetWeight } from '../../lib/calculator';
import { AnimatedNumber } from '../common/AnimatedNumber';

interface DonutChart3DProps {
  blendedApy: number;
  weights: AssetWeight[];
}

export const DonutChart3D: React.FC<DonutChart3DProps> = ({ blendedApy, weights }) => {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 3D Gyroscope Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
    setHoveredSegment(null);
  }, [mouseX, mouseY]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6 select-none">
      {/* 3D Perspective Tilt Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ perspective: 800 }}
        className="relative w-48 h-48 flex items-center justify-center shrink-0 cursor-crosshair"
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="w-full h-full relative flex items-center justify-center"
        >
          {/* Ambient Glowing Radar Backing Ring */}
          <div className="absolute inset-2 rounded-full border border-primary/10 bg-gradient-to-tr from-primary/5 via-secondary/5 to-transparent pointer-events-none" />

          {/* Radial Donut SVG */}
          <svg
            className="w-full h-full -rotate-90 filter drop-shadow-lg"
            viewBox="0 0 100 100"
            aria-label={`Portfolio Allocation Donut Chart showing ${blendedApy}% blended return`}
          >
            {/* Passive track ring */}
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="currentColor"
              className="text-surface-container-highest/40"
              strokeWidth="11"
            />

            {weights.map((seg) => {
              const isHovered = hoveredSegment === seg.id;
              const strokeWidth = isHovered ? 14 : 12;

              return (
                <motion.circle
                  key={seg.id}
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  initial={false}
                  animate={{
                    strokeDasharray: `${seg.dashLength} ${238.76 - seg.dashLength}`,
                    strokeDashoffset: seg.dashOffset,
                    opacity: hoveredSegment && !isHovered ? 0.45 : 1,
                  }}
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="cursor-pointer transition-[stroke-width,opacity] duration-200"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 6px ${seg.color}90)` : 'none',
                  }}
                  onMouseEnter={() => setHoveredSegment(seg.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              );
            })}
          </svg>

          {/* Center Readout Gauge */}
          <div
            style={{ transform: 'translateZ(20px)' }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
          >
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              <AnimatedNumber
                value={blendedApy}
                formatter={formatPercent}
                className="font-mono text-xl sm:text-2xl font-bold text-secondary tracking-tight"
                flashOnChange
              />
            </div>
            <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest mt-0.5">
              Blended APY
            </span>
          </div>
        </motion.div>
      </div>

      {/* Dynamic Breakdown Rows with Kinetic Hover Feedback */}
      <div className="w-full space-y-2.5">
        {weights.map((weight) => {
          const isHovered = hoveredSegment === weight.id;
          return (
            <motion.div
              key={weight.id}
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onMouseEnter={() => setHoveredSegment(weight.id)}
              onMouseLeave={() => setHoveredSegment(null)}
              className={`flex items-center justify-between p-2.5 rounded-sm transition-all cursor-pointer border ${
                isHovered
                  ? 'bg-surface-container border-primary/50 shadow-[0_0_12px_rgba(212,175,55,0.15)]'
                  : 'bg-surface-container-low border-transparent hover:bg-surface-container/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0 transition-transform duration-200"
                  style={{
                    backgroundColor: weight.color,
                    transform: isHovered ? 'scale(1.25)' : 'scale(1)',
                    boxShadow: isHovered ? `0 0 8px ${weight.color}` : 'none',
                  }}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isHovered ? 'text-on-surface font-semibold' : 'text-on-surface'
                  }`}
                >
                  {weight.name}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-on-surface">
                {weight.percentage}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
