import React, { useMemo, useState, useEffect } from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';

/**
 * WavyBackground — Seamless Looping Diagonal Sine-Wave Stripes
 * Dark Mode: Alternates between Licorice (#08090B) and Jet Black (#0F1115).
 * Light Mode: Alternates between Pure White (#FFFFFF) and Soft Alabaster (#EDF2FB).
 * Infinitely translates along the horizontal axis with a linear timing function.
 * Tiling is mathematically continuous across tile boundaries (CLS = 0, zero seam).
 */
export interface WavyBackgroundProps {
  theme?: 'dark' | 'light';
}

export const WavyBackground: React.FC<WavyBackgroundProps> = ({ theme }) => {
  const storeResolvedTheme = useTerminalStore((state) => state.resolvedTheme);
  const resolvedTheme = theme || storeResolvedTheme;
  const isLight = resolvedTheme === 'light';

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Monitor prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Monitor visibility for render throttling
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Precompute seamless diagonal sine-wave stripes
  const stripes = useMemo(() => {
    const W = 1440;
    const S = 64; // stripe height pitch
    const N = 3; // 3 full sine waves across W
    const A = 36; // sine wave amplitude
    const k = 768 / 1440; // slope ensures (k * W) is an exact even multiple of S (12 * 64 = 768)
    const stepCount = 90;
    const dx = W / stepCount;

    const items: { d: string; fill: string; key: number }[] = [];

    // Theme-driven colors
    const color1 = isLight ? '#FFFFFF' : '#08090B';
    const color2 = isLight ? '#EDF2FB' : '#0F1115';

    // Cover vertical span from -800 to 1400 so diagonal fills any screen ratio
    for (let i = -16; i <= 24; i++) {
      const c1 = i * S;
      const c2 = (i + 1) * S;

      const topPoints: string[] = [];
      const bottomPoints: string[] = [];

      for (let s = 0; s <= stepCount; s++) {
        const x = s * dx;
        const sine = A * Math.sin((2 * Math.PI * N * x) / W);
        const yTop = k * x + sine + c1;
        const yBottom = k * x + sine + c2;

        topPoints.push(`${x.toFixed(1)},${yTop.toFixed(1)}`);
        bottomPoints.unshift(`${x.toFixed(1)},${yBottom.toFixed(1)}`);
      }

      const d = `M ${topPoints.join(' L ')} L ${bottomPoints.join(' L ')} Z`;
      const fill = Math.abs(i) % 2 === 0 ? color1 : color2;

      items.push({ d, fill, key: i });
    }

    return items;
  }, [isLight]);

  return (
    <div
      data-testid="wavy-background"
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-colors duration-300 ${
        isLight ? 'bg-[#FFFFFF]' : 'bg-[#08090B]'
      }`}
    >
      {/* 200% width sliding track with linear horizontal translation */}
      <div
        data-testid="wavy-track"
        className={`flex w-[200%] h-full ${
          !reducedMotion && isTabVisible ? 'animate-wave-seamless' : ''
        }`}
        style={{
          willChange: 'transform',
        }}
      >
        {/* Tile 1 */}
        <div className="w-1/2 h-full shrink-0 relative">
          <svg
            className="w-full h-full block"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {stripes.map((stripe) => (
              <path
                key={`t1-${stripe.key}`}
                d={stripe.d}
                fill={stripe.fill}
                stroke={stripe.fill}
                strokeWidth="0.5"
              />
            ))}
          </svg>
        </div>

        {/* Tile 2: Exact duplicate for continuous 100% seamless looping */}
        <div className="w-1/2 h-full shrink-0 relative">
          <svg
            className="w-full h-full block"
            viewBox="0 0 1440 900"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {stripes.map((stripe) => (
              <path
                key={`t2-${stripe.key}`}
                d={stripe.d}
                fill={stripe.fill}
                stroke={stripe.fill}
                strokeWidth="0.5"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* Subtle institutional atmospheric vignette to anchor typography readability */}
      <div
        className={`pointer-events-none absolute inset-0 ${
          isLight
            ? 'bg-gradient-to-b from-white/50 via-transparent to-white/70'
            : 'bg-gradient-to-b from-[#08090B]/40 via-transparent to-[#08090B]/60'
        }`}
      />
    </div>
  );
};
