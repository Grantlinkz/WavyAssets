import React from "react";

interface BrandLogoProps {
  className?: string;
  showSecuredBadge?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "h-8 w-auto",
  showSecuredBadge = true,
}) => {
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 185 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
        aria-label="WavyAssetss Institutional Logo"
      >
        {/* Vault Frame */}
        <rect
          x="1"
          y="4"
          width="28"
          height="28"
          rx="3"
          className="fill-surface-container-high stroke-primary"
          strokeWidth="1.2"
        />
        {/* Sovereign Triangle Glyph */}
        <polygon
          points="15,9 24,26 6,26"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Core Node */}
        <circle cx="15" cy="20" r="2.2" fill="#D4AF37" />

        {/* Brand Typography */}
        <text
          x="38"
          y="23"
          className="fill-on-surface font-sans font-bold tracking-[0.1em]"
          fontSize="15"
        >
          WAVY
        </text>
        <text
          x="88"
          y="23"
          fill="#D4AF37"
          className="font-sans font-medium tracking-[0.1em]"
          fontSize="15"
        >
          ASSETS
        </text>

        {/* Institutional Proof Indicator */}
        {showSecuredBadge && (
          <g>
            <text
              x="152"
              y="15"
              fill="#00C288"
              className="font-mono font-semibold tracking-wider"
              fontSize="6.5"
            >
              SECURED
            </text>
            <circle
              cx="147"
              cy="13"
              r="1.5"
              fill="#00C288"
              className="animate-pulse"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
