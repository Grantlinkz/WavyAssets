import React from 'react';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
export type SpinnerVariant = 'default' | 'orbital' | 'minimal' | 'pulse';

export interface FaviconSpinnerProps {
  /** Size tier of the spinner: 'xs' (18px), 'sm' (24px), 'md' (40px), 'lg' (64px), 'xl' (96px), 'fullscreen' */
  size?: SpinnerSize;
  /** Primary status message displayed beneath spinner */
  label?: string;
  /** Secondary subtle subtitle */
  sublabel?: string;
  /** Animation preset variant */
  variant?: SpinnerVariant;
  /** Additional container styling */
  className?: string;
  /** Custom accessible label */
  ariaLabel?: string;
}

const sizeDimensions: Record<SpinnerSize, { icon: number; container: string }> = {
  xs: { icon: 18, container: 'w-4.5 h-4.5' },
  sm: { icon: 24, container: 'w-6 h-6' },
  md: { icon: 40, container: 'w-10 h-10' },
  lg: { icon: 64, container: 'w-16 h-16' },
  xl: { icon: 96, container: 'w-24 h-24' },
  fullscreen: { icon: 72, container: 'w-18 h-18' },
};

/**
 * WavyAssets Institutional Favicon Loading Spinner
 * Uses the authentic WavyAssets obsidian vault squircle, flowing sinusoidal gold/emerald
 * waves, and continuous orbital conduit rotation.
 */
export const FaviconSpinner: React.FC<FaviconSpinnerProps> = ({
  size = 'md',
  label,
  sublabel,
  variant = 'default',
  className = '',
  ariaLabel,
}) => {
  const isFullscreen = size === 'fullscreen';
  const { icon: pxSize } = sizeDimensions[size];

  const spinnerGraphic = (
    <div
      role="status"
      aria-label={ariaLabel || label || 'Loading...'}
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: pxSize, height: pxSize }}
    >
      {/* 1. Ambient Radial Gold Glow for depth */}
      {size !== 'xs' && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-40 blur-md transition-all"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.45) 0%, rgba(0,194,136,0.15) 50%, transparent 75%)',
            animation: 'wavy-glow 2.4s ease-in-out infinite alternate',
          }}
        />
      )}

      {/* 2. Rotating Orbital Conduit Ring */}
      {variant !== 'minimal' && (
        <svg
          viewBox="0 0 100 100"
          className="absolute -inset-2.5 w-[calc(100%+20px)] h-[calc(100%+20px)] pointer-events-none"
          style={{
            animation: 'wavy-rotate 2.2s linear infinite',
          }}
        >
          <defs>
            <linearGradient id="orbitGradDashboard" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="1" />
              <stop offset="45%" stopColor="#00C288" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#D4AF37" stopOpacity="0.1" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="url(#orbitGradDashboard)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="90 180"
          />
        </svg>
      )}

      {/* 3. Core Favicon SVG with animated sinusoidal waves */}
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
      >
        {/* Obsidian Vault Squircle */}
        <rect
          width="64"
          height="64"
          rx="14"
          fill="#08090B"
        />
        <rect
          x="1"
          y="1"
          width="62"
          height="62"
          rx="13"
          stroke="#D4AF37"
          strokeWidth="1.8"
          strokeOpacity="0.75"
        />

        {/* Ambient Radial Core */}
        <circle cx="32" cy="32" r="18" fill="#D4AF37" fillOpacity="0.12" />

        {/* Primary Sinusoidal Wave in Global Gold (Kinetic Flow) */}
        <path
          d="M 12 33 C 18 19, 26 19, 32 33 C 38 47, 46 47, 52 33"
          stroke="#D4AF37"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="40 10"
          style={{
            animation: 'wavy-flow-primary 1.8s ease-in-out infinite alternate',
          }}
        />

        {/* Secondary Harmonic Wave in Emerald Accent (Dynamic Phase Offset) */}
        <path
          d="M 12 42 C 18 28, 26 28, 32 42 C 38 56, 46 56, 52 42"
          stroke="#00C288"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.9"
          strokeDasharray="36 12"
          style={{
            animation: 'wavy-flow-secondary 1.8s ease-in-out infinite alternate',
          }}
        />

        {/* Apex Gold Spark with rhythmic breathing pulse */}
        <circle
          cx="32"
          cy="17"
          r="3.2"
          fill="#D4AF37"
          style={{
            animation: 'wavy-spark 1.4s ease-in-out infinite',
            transformOrigin: '32px 17px',
          }}
        />
      </svg>

      {/* Embedded High-Performance Keyframes */}
      <style>{`
        @keyframes wavy-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes wavy-flow-primary {
          0% { stroke-dashoffset: 0; opacity: 0.85; }
          100% { stroke-dashoffset: 24; opacity: 1; filter: drop-shadow(0 0 3px rgba(212,175,55,0.7)); }
        }
        @keyframes wavy-flow-secondary {
          0% { stroke-dashoffset: 16; opacity: 0.7; }
          100% { stroke-dashoffset: -12; opacity: 1; filter: drop-shadow(0 0 3px rgba(0,194,136,0.6)); }
        }
        @keyframes wavy-spark {
          0%, 100% { transform: scale(0.9); opacity: 0.75; }
          50% { transform: scale(1.3); opacity: 1; filter: drop-shadow(0 0 5px #D4AF37); }
        }
        @keyframes wavy-glow {
          0% { transform: scale(0.92); opacity: 0.3; }
          100% { transform: scale(1.12); opacity: 0.6; }
        }
      `}</style>
    </div>
  );

  // If label or fullscreen container is requested, wrap in an institutional layout
  if (isFullscreen) {
    return (
      <div
        className="fixed inset-0 z-50 bg-[#08090B]/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-on-surface"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center text-center max-w-sm p-8 rounded-sm border border-border-hairline bg-[#0E1015]/80 shadow-2xl">
          {spinnerGraphic}
          {label && (
            <div className="mt-5 text-sm font-sans font-semibold tracking-wide text-on-surface">
              {label}
            </div>
          )}
          {sublabel && (
            <div className="mt-1 text-xs font-mono tracking-wider text-on-surface-variant">
              {sublabel}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (label || sublabel) {
    return (
      <div className="flex flex-col items-center justify-center gap-2.5 text-center">
        {spinnerGraphic}
        {label && (
          <span className="text-xs font-sans font-medium tracking-wide text-on-surface">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-[11px] font-mono tracking-wider text-on-surface-variant">
            {sublabel}
          </span>
        )}
      </div>
    );
  }

  return spinnerGraphic;
};

export default FaviconSpinner;
