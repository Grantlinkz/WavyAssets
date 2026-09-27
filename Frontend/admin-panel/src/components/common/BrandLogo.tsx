import React from "react"

interface BrandLogoProps {
  className?: string
  showSecuredBadge?: boolean
  onClick?: () => void
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = "h-8 w-auto",
  showSecuredBadge = true,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      role="banner"
      aria-label="WavyAssets Sovereign Institutional Admin Command Deck"
      className={`inline-flex items-center select-none cursor-pointer group rounded-sm transition-opacity hover:opacity-90 ${className}`}
      data-testid="brand-logo"
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
          fill="#0F141F"
          stroke="#D4AF37"
          strokeOpacity="0.8"
          strokeWidth="1.2"
          className="group-hover:stroke-opacity-100 transition-colors"
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
          fill="#dee2f2"
          className="font-sans font-bold tracking-[0.12em]"
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
    </div>
  )
}
