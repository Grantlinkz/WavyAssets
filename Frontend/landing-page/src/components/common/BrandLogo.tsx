import React from "react";
import { useTerminalStore } from "../../store/useTerminalStore";

interface BrandLogoProps {
  className?: string;
  showSecuredBadge?: boolean;
  onNavigateHome?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "h-8 w-auto",
  showSecuredBadge = true,
  onNavigateHome,
}) => {
  const handleHomeClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (onNavigateHome) {
      onNavigateHome();
      return;
    }
    if (typeof window !== "undefined") {
      if (window.location.hash) {
        window.location.hash = "";
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    useTerminalStore.getState().setMegaMenuOpen(false);
  };

  return (
    <a
      href="#"
      onClick={handleHomeClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleHomeClick(e);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="WavyAssets Home"
      className={`inline-flex items-center select-none cursor-pointer group focus:outline-none focus:ring-1 focus:ring-primary/60 rounded-xs transition-opacity hover:opacity-90 ${className}`}
      data-testid="brand-logo-link"
    >
      <svg
        viewBox="0 0 196 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        aria-label="WavyAssets Institutional Logo"
      >
        {/* Vault Squircle Frame */}
        <rect
          x="2"
          y="2"
          width="32"
          height="32"
          rx="6"
          className="fill-surface-container stroke-primary/80 group-hover:stroke-primary transition-colors"
          strokeWidth="1.2"
        />
        {/* Subtle Ambient Radial Glow */}
        <circle cx="18" cy="18" r="10" fill="#D4AF37" fillOpacity="0.12" />

        {/* Primary Sinusoidal Wave in Global Gold */}
        <path
          d="M 7 19 C 10 11, 14 11, 18 19 C 22 27, 26 27, 29 19"
          stroke="#D4AF37"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Secondary Harmonic Wave in Emerald Accent */}
        <path
          d="M 7 24 C 10 16, 14 16, 18 24 C 22 32, 26 32, 29 24"
          stroke="#00C288"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.9"
        />
        {/* Apex Vault Spark */}
        <circle cx="18" cy="9" r="1.6" fill="#D4AF37" />

        {/* Brand Typography */}
        <text
          x="42"
          y="23"
          className="fill-on-surface font-sans font-bold tracking-[0.12em]"
          fontSize="15"
        >
          WAVY
        </text>
        <text
          x="94"
          y="23"
          fill="#D4AF37"
          className="font-sans font-medium tracking-[0.12em]"
          fontSize="15"
        >
          ASSETS
        </text>

        {/* Institutional Proof Indicator */}
        {showSecuredBadge && (
          <g>
            <text
              x="162"
              y="15"
              fill="#00C288"
              className="font-mono font-semibold tracking-wider"
              fontSize="6.5"
            >
              SECURED
            </text>
            <circle
              cx="157"
              cy="13"
              r="1.5"
              fill="#00C288"
              className="animate-pulse"
            />
          </g>
        )}
      </svg>
    </a>
  );
};
