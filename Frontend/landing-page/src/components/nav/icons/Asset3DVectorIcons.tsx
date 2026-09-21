import React from 'react';

export interface Vector3DIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/**
 * 1. Crypto Yields & Cold Storage 3D Vector Icon
 * Volumetric 3D isometric gold & emerald coin with beveled rim, glowing sinusoidal wave crest, and floating shadow.
 */
export const Crypto3DVectorIcon: React.FC<Vector3DIconProps> = ({
  className = 'w-10 h-10',
  size = 40,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Ambient Ground Shadow */}
        <radialGradient id="crypto-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Outer Cylinder Rim Gradient (3D Edge) */}
        <linearGradient id="crypto-edge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#997A15" />
          <stop offset="50%" stopColor="#66500A" />
          <stop offset="100%" stopColor="#2E2405" />
        </linearGradient>

        {/* Top Coin Face (Global Gold to Warm Honey) */}
        <linearGradient id="crypto-face" x1="20%" y1="10%" x2="80%" y2="90%">
          <stop offset="0%" stopColor="#FFE785" />
          <stop offset="35%" stopColor="#D4AF37" />
          <stop offset="70%" stopColor="#AA820A" />
          <stop offset="100%" stopColor="#5E4700" />
        </linearGradient>

        {/* Inner Emerald Nucleus Ring */}
        <linearGradient id="crypto-emerald-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFB2" />
          <stop offset="100%" stopColor="#008A5E" />
        </linearGradient>

        {/* Inner Plate Surface */}
        <radialGradient id="crypto-inner-plate" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1C2129" />
          <stop offset="75%" stopColor="#0E1217" />
          <stop offset="100%" stopColor="#080A0D" />
        </radialGradient>

        {/* Crest Specular Highlight */}
        <linearGradient id="crypto-crest" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2A3" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>

      {/* 1. Ground Drop Shadow */}
      <ellipse cx="32" cy="53" rx="22" ry="5.5" fill="url(#crypto-shadow)" />

      {/* 2. 3D Coin Extruded Cylinder (Side Edge) */}
      <path
        d="M14 26 C14 36 22 43 32 43 C42 43 50 36 50 26 L50 33 C50 43 42 50 32 50 C22 50 14 43 14 33 Z"
        fill="url(#crypto-edge)"
      />

      {/* 3. Coin Beveled Edge Highlight Layer */}
      <ellipse cx="32" cy="27" rx="18" ry="11.5" fill="#5A4305" />

      {/* 4. Top Face Surface */}
      <ellipse cx="32" cy="25" rx="18" ry="11.5" fill="url(#crypto-face)" />

      {/* 5. Inner Inset Rim */}
      <ellipse cx="32" cy="25" rx="15" ry="9.5" fill="url(#crypto-inner-plate)" stroke="url(#crypto-emerald-ring)" strokeWidth="1.2" />

      {/* 6. Global Sinusoidal Wave Emblem + Key Crest */}
      <path
        d="M23 25 C25 21 28 21 30 24 C32 27 35 27 38 23"
        stroke="url(#crypto-emerald-ring)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M25 28 C27 25 30 25 32 27 C34 29 37 29 39 26"
        stroke="url(#crypto-crest)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* 7. Central Floating Diamond Pivot */}
      <polygon points="32,19 35,23 32,27 29,23" fill="url(#crypto-crest)" />

      {/* 8. Specular Glint */}
      <ellipse cx="24" cy="20" rx="3.5" ry="1.2" fill="#FFFFFF" fillOpacity="0.6" transform="rotate(-15 24 20)" />
    </svg>
  );
};

/**
 * 2. Global Stocks & Pre-IPO 3D Vector Icon
 * Volumetric 3D isometric ascending candlestick pedestals with an extruded growth trend arrow and glassmorphic depth.
 */
export const Stocks3DVectorIcon: React.FC<Vector3DIconProps> = ({
  className = 'w-10 h-10',
  size = 40,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient id="stocks-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Green Pillar Front & Side */}
        <linearGradient id="stocks-green-side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00C288" />
          <stop offset="100%" stopColor="#006646" />
        </linearGradient>
        <linearGradient id="stocks-green-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00E6A1" />
          <stop offset="100%" stopColor="#009462" />
        </linearGradient>
        <linearGradient id="stocks-green-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#70FFD0" />
          <stop offset="100%" stopColor="#00C288" />
        </linearGradient>

        {/* Gold Pillar Front & Side */}
        <linearGradient id="stocks-gold-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBD865" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <linearGradient id="stocks-gold-side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#AA8518" />
          <stop offset="100%" stopColor="#614A0A" />
        </linearGradient>
        <linearGradient id="stocks-gold-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFF2B2" />
          <stop offset="100%" stopColor="#E2BD44" />
        </linearGradient>

        {/* Arrow Gradient */}
        <linearGradient id="stocks-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C288" />
          <stop offset="60%" stopColor="#62FFAF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="32" cy="54" rx="24" ry="5.5" fill="url(#stocks-shadow)" />

      {/* 3D Pillar 1 (Left - Short Base Pillar) */}
      <g>
        {/* Front Face */}
        <path d="M12 36 L21 41 L21 51 L12 46 Z" fill="#202A36" />
        {/* Side Face */}
        <path d="M21 41 L27 38 L27 48 L21 51 Z" fill="#131B24" />
        {/* Top Face */}
        <path d="M12 36 L18 33 L27 38 L21 41 Z" fill="#3D4D61" />
      </g>

      {/* 3D Pillar 2 (Center - Emerald Yield Pillar) */}
      <g>
        {/* Front Face */}
        <path d="M24 26 L34 32 L34 50 L24 44 Z" fill="url(#stocks-green-front)" />
        {/* Side Face */}
        <path d="M34 32 L41 28 L41 46 L34 50 Z" fill="url(#stocks-green-side)" />
        {/* Top Face */}
        <path d="M24 26 L31 22 L41 28 L34 32 Z" fill="url(#stocks-green-top)" />
      </g>

      {/* 3D Pillar 3 (Right - Tall Global Gold Pillar) */}
      <g>
        {/* Front Face */}
        <path d="M37 16 L48 23 L48 48 L37 41 Z" fill="url(#stocks-gold-front)" />
        {/* Side Face */}
        <path d="M48 23 L55 19 L55 44 L48 48 Z" fill="url(#stocks-gold-side)" />
        {/* Top Face */}
        <path d="M37 16 L44 12 L55 19 L48 23 Z" fill="url(#stocks-gold-top)" />
      </g>

      {/* Extruded 3D Ascending Growth Arrow */}
      <path
        d="M13 41 Q 25 32 35 24 L 47 14"
        stroke="url(#stocks-arrow)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* 3D Arrow Head */}
      <polygon points="53,9 43,12 47,19" fill="#FFFFFF" />
      <polygon points="53,9 47,19 50,21" fill="#00C288" />
    </svg>
  );
};

/**
 * 3. AI Systematic Funds & H100 Mesh 3D Vector Icon
 * Volumetric 3D isometric AI neural processor / GPU compute core with beveled golden heat-sink fins and cyan circuit channels.
 */
export const AiFunds3DVectorIcon: React.FC<Vector3DIconProps> = ({
  className = 'w-10 h-10',
  size = 40,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient id="ai-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="ai-die-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#252F3F" />
          <stop offset="100%" stopColor="#111722" />
        </linearGradient>

        <linearGradient id="ai-gold-bevel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F9DB74" />
          <stop offset="100%" stopColor="#9C7710" />
        </linearGradient>

        <linearGradient id="ai-core-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00FFF0" />
          <stop offset="50%" stopColor="#00A2FF" />
          <stop offset="100%" stopColor="#0044FF" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="32" cy="54" rx="23" ry="5.5" fill="url(#ai-shadow)" />

      {/* Substrate Base Bottom (Isometric Prism) */}
      <path d="M12 36 L32 48 L52 36 L52 41 L32 53 L12 41 Z" fill="#0A0D12" />
      <path d="M12 36 L32 48 L32 53 L12 41 Z" fill="#151C26" />
      <path d="M32 48 L52 36 L52 41 L32 53 Z" fill="#0D131C" />

      {/* Substrate Gold Pin Border */}
      <path d="M12 34 L32 46 L52 34 L32 22 Z" fill="url(#ai-gold-bevel)" />

      {/* Main Silicon Chip Die (Elevated Top Surface) */}
      <path d="M16 32 L32 42 L48 32 L32 22 Z" fill="url(#ai-die-top)" stroke="#3B485C" strokeWidth="1" />

      {/* Gold Heat-Spreader Cap */}
      <path d="M21 30 L32 37 L43 30 L32 23 Z" fill="#1A212D" stroke="url(#ai-gold-bevel)" strokeWidth="1.2" />

      {/* Neural AI Glowing Core */}
      <path d="M26 29 L32 33 L38 29 L32 25 Z" fill="url(#ai-core-glow)" />

      {/* Laser Etched Neural Grid Vectors */}
      <line x1="32" y1="25" x2="32" y2="16" stroke="#00FFF0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="26" y1="29" x2="17" y2="24" stroke="#00FFF0" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="38" y1="29" x2="47" y2="24" stroke="#00FFF0" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="32" y1="33" x2="32" y2="40" stroke="#00FFF0" strokeWidth="1.2" strokeLinecap="round" />

      {/* Micro Quantum Computing Data Nodes */}
      <circle cx="32" cy="15" r="2" fill="#FFFFFF" />
      <circle cx="16" cy="23" r="1.6" fill="#00FFF0" />
      <circle cx="48" cy="23" r="1.6" fill="#00FFF0" />
      <circle cx="32" cy="41" r="1.6" fill="#F9DB74" />
    </svg>
  );
};

/**
 * 4. Fractional Prime Real Estate 3D Vector Icon
 * Volumetric 3D isometric luxury commercial glass skyscraper with setback terraces and gold architectural crown spire.
 */
export const RealEstate3DVectorIcon: React.FC<Vector3DIconProps> = ({
  className = 'w-10 h-10',
  size = 40,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient id="re-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="re-glass-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A658A" />
          <stop offset="50%" stopColor="#25354D" />
          <stop offset="100%" stopColor="#141E2C" />
        </linearGradient>

        <linearGradient id="re-glass-side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A2636" />
          <stop offset="100%" stopColor="#0C121A" />
        </linearGradient>

        <linearGradient id="re-gold-crown" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE07A" />
          <stop offset="100%" stopColor="#C49B20" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="32" cy="54" rx="22" ry="5" fill="url(#re-shadow)" />

      {/* Foundation Pedestal */}
      <path d="M16 48 L32 55 L48 48 L32 41 Z" fill="#0C1017" />

      {/* Tower Tier 1 (Main Base Body) */}
      {/* Front Glass Facade */}
      <path d="M20 28 L32 34 L32 50 L20 44 Z" fill="url(#re-glass-front)" stroke="#3E5473" strokeWidth="0.8" />
      {/* Side Shadow Facade */}
      <path d="M32 34 L44 28 L44 44 L32 50 Z" fill="url(#re-glass-side)" stroke="#263447" strokeWidth="0.8" />

      {/* Tower Tier 2 (Setback Mid-Rise) */}
      <path d="M23 20 L32 25 L32 34 L23 29 Z" fill="url(#re-glass-front)" />
      <path d="M32 25 L41 20 L41 29 L32 34 Z" fill="url(#re-glass-side)" />
      <path d="M23 20 L32 15 L41 20 L32 25 Z" fill="#4B6385" />

      {/* Tower Tier 3 (Upper Penthouse Level) */}
      <path d="M26 14 L32 18 L32 24 L26 20 Z" fill="url(#re-glass-front)" />
      <path d="M32 18 L38 14 L38 20 L32 24 Z" fill="url(#re-glass-side)" />
      <path d="M26 14 L32 10 L38 14 L32 18 Z" fill="url(#re-gold-crown)" />

      {/* Architectural Gold Crown Spire */}
      <line x1="32" y1="10" x2="32" y2="4" stroke="url(#re-gold-crown)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="32" cy="4" r="1.5" fill="#FFE58F" />

      {/* Window Grid Floor Lines */}
      <line x1="20" y1="36" x2="32" y2="42" stroke="#5D7FA8" strokeWidth="0.7" strokeOpacity="0.6" />
      <line x1="20" y1="40" x2="32" y2="46" stroke="#5D7FA8" strokeWidth="0.7" strokeOpacity="0.6" />
      <line x1="32" y1="42" x2="44" y2="36" stroke="#374A61" strokeWidth="0.7" strokeOpacity="0.6" />
      <line x1="32" y1="46" x2="44" y2="40" stroke="#374A61" strokeWidth="0.7" strokeOpacity="0.6" />

      {/* Subtle Emerald Penthouse Beacon Glow */}
      <circle cx="32" cy="18" r="1.5" fill="#00C288" />
    </svg>
  );
};

/**
 * 5. Exotic Hypercar & Horology Depots 3D Vector Icon
 * Volumetric 3D aerodynamic hypercar silhouette with sculpted speed curves, tinted canopy, and extruded alloy wheels with gold calipers.
 */
export const Cars3DVectorIcon: React.FC<Vector3DIconProps> = ({
  className = 'w-10 h-10',
  size = 40,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        {/* Car Underbody Ground Shadow */}
        <radialGradient id="car-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.6" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Chassis Metallic Crimson/Global Gloss Gradient */}
        <linearGradient id="car-body" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#FF4D4D" />
          <stop offset="35%" stopColor="#D62020" />
          <stop offset="75%" stopColor="#8A0C0C" />
          <stop offset="100%" stopColor="#4A0505" />
        </linearGradient>

        {/* Windshield Glass Tint */}
        <linearGradient id="car-glass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7AEBFF" />
          <stop offset="50%" stopColor="#1C384A" />
          <stop offset="100%" stopColor="#0B161E" />
        </linearGradient>

        {/* Gold Alloy Wheel Calipers */}
        <linearGradient id="car-gold-wheel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFDE7A" />
          <stop offset="100%" stopColor="#A37B08" />
        </linearGradient>
      </defs>

      {/* 1. Ground Drop Shadow */}
      <ellipse cx="32" cy="51" rx="26" ry="6" fill="url(#car-shadow)" />

      {/* 2. Aerodynamic Lower Chassis / Diffuser */}
      <path
        d="M7 44 L14 47 L48 47 L58 43 L55 39 L47 38 L16 38 L9 41 Z"
        fill="#11141A"
      />

      {/* 3. Sculpted Hypercar Body Shell (3D Perspective) */}
      <path
        d="M8 41 C9 38 14 36 21 35 L26 28 C28 25 35 24 43 26 L50 33 C54 34 57 37 57 41 L55 44 L48 44 C47 40 44 38 40 38 C36 38 33 40 32 44 L25 44 C24 40 21 38 17 38 C13 38 10 40 9 44 Z"
        fill="url(#car-body)"
        stroke="#FF7B7B"
        strokeWidth="0.8"
      />

      {/* 4. Streamlined Glass Cockpit Canopy */}
      <path
        d="M26 34 L29 28 C31 26 36 25 42 27 L46 34 Z"
        fill="url(#car-glass)"
        stroke="#457896"
        strokeWidth="0.8"
      />

      {/* 5. Front LED Headlight Beam / Glint */}
      <polygon points="53,38 57,37 58,40 54,40" fill="#00FFF0" />

      {/* 6. Front Extruded 3D Alloy Wheel & Rim */}
      <g>
        <circle cx="41" cy="44" r="6" fill="#15171C" stroke="#2B303B" strokeWidth="1.2" />
        <circle cx="41" cy="44" r="3.5" fill="url(#car-gold-wheel)" />
        <circle cx="41" cy="44" r="1.5" fill="#15171C" />
      </g>

      {/* 7. Rear Extruded 3D Alloy Wheel & Rim */}
      <g>
        <circle cx="18" cy="44" r="6" fill="#15171C" stroke="#2B303B" strokeWidth="1.2" />
        <circle cx="18" cy="44" r="3.5" fill="url(#car-gold-wheel)" />
        <circle cx="18" cy="44" r="1.5" fill="#15171C" />
      </g>

      {/* 8. Aerodynamic Roofline Specular Highlight */}
      <path
        d="M27 28 C31 26 36 25 42 27"
        stroke="#FFFFFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </svg>
  );
};

/**
 * 6. VIP Titanium Concierge Cards 3D Vector Icon
 * Volumetric 3D floating perspective titanium credit card with beveled edges, gold EMV chip, and holographic wave deboss.
 */
export const VipCards3DVectorIcon: React.FC<Vector3DIconProps> = ({
  className = 'w-10 h-10',
  size = 40,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient id="card-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Titanium Metal Face */}
        <linearGradient id="card-titanium-face" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4A5260" />
          <stop offset="30%" stopColor="#2D333F" />
          <stop offset="70%" stopColor="#1E232C" />
          <stop offset="100%" stopColor="#12161D" />
        </linearGradient>

        {/* 3D Chamfered Edge */}
        <linearGradient id="card-edge" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8C97A8" />
          <stop offset="100%" stopColor="#1F2530" />
        </linearGradient>

        {/* Gold EMV Contact Chip */}
        <linearGradient id="card-chip" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE07A" />
          <stop offset="100%" stopColor="#A88114" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="32" cy="54" rx="24" ry="5.5" fill="url(#card-shadow)" />

      {/* Extruded 3D Card Thickness (Bottom Edge) */}
      <path
        d="M10 38 L38 52 L56 38 L56 41 L38 55 L10 41 Z"
        fill="url(#card-edge)"
      />

      {/* Main Perspective Card Body Surface */}
      <path
        d="M10 38 L28 17 L56 31 L38 52 Z"
        fill="url(#card-titanium-face)"
        stroke="#677387"
        strokeWidth="1"
      />

      {/* Gold EMV Contact Chip (Isometric Rectangle) */}
      <path
        d="M20 33 L26 26 L31 29 L25 36 Z"
        fill="url(#card-chip)"
        stroke="#FFF0A8"
        strokeWidth="0.6"
      />
      <line x1="23" y1="30" x2="28" y2="33" stroke="#664F0A" strokeWidth="0.6" />

      {/* Global Wave Watermark Accent Lines */}
      <path
        d="M33 42 C38 41 42 38 48 39"
        stroke="#00C288"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
      <path
        d="M36 45 C41 44 45 41 51 42"
        stroke="#D4AF37"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />

      {/* VIP Global Crown Deboss Accent */}
      <polygon points="46,26 48,29 44,28" fill="#D4AF37" />

      {/* Specular Titanium Edge Glint */}
      <line x1="28" y1="17" x2="56" y2="31" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.6" />
    </svg>
  );
};

/**
 * 7. Digital Custody & Global Wallet 3D Vector Icon
 * Volumetric 3D isometric bank vault safe and hardened multi-sig hardware wallet with heavy combination dial and reinforced bolts.
 */
export const Wallet3DVectorIcon: React.FC<Vector3DIconProps> = ({
  className = 'w-10 h-10',
  size = 40,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <radialGradient id="vault-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <linearGradient id="vault-face" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#303A4A" />
          <stop offset="50%" stopColor="#1B222C" />
          <stop offset="100%" stopColor="#0E1217" />
        </linearGradient>

        <linearGradient id="vault-side" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B222C" />
          <stop offset="100%" stopColor="#080B0F" />
        </linearGradient>

        <linearGradient id="vault-top" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#46546A" />
          <stop offset="100%" stopColor="#252F3E" />
        </linearGradient>

        <linearGradient id="vault-gold-dial" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE07A" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#785B07" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="32" cy="54" rx="23" ry="5.5" fill="url(#vault-shadow)" />

      {/* Isometric Cube Chassis */}
      {/* 1. Top Face */}
      <path d="M14 26 L32 17 L50 26 L32 35 Z" fill="url(#vault-top)" stroke="#596B85" strokeWidth="0.8" />
      {/* 2. Left Front Door Face */}
      <path d="M14 26 L32 35 L32 51 L14 42 Z" fill="url(#vault-face)" stroke="#45546A" strokeWidth="0.8" />
      {/* 3. Right Side Face */}
      <path d="M32 35 L50 26 L50 42 L32 51 Z" fill="url(#vault-side)" stroke="#273240" strokeWidth="0.8" />

      {/* Vault Door Inset Plate */}
      <path d="M17 29 L29 35 L29 47 L17 41 Z" fill="#131820" stroke="#D4AF37" strokeWidth="0.8" />

      {/* Heavy 3D Combination Dial / Wheel */}
      <ellipse cx="23" cy="38" rx="4.5" ry="3" fill="url(#vault-gold-dial)" stroke="#FFF0A8" strokeWidth="0.6" />
      <circle cx="23" cy="38" r="1.5" fill="#131820" />

      {/* Dial Spokes */}
      <line x1="23" y1="35" x2="23" y2="41" stroke="#4A3905" strokeWidth="0.8" />
      <line x1="19" y1="38" x2="27" y2="38" stroke="#4A3905" strokeWidth="0.8" />

      {/* Hardened Biometric / MPC LED Security Status Indicator */}
      <circle cx="27" cy="32" r="1.2" fill="#00FFB2" />
      <circle cx="27" cy="32" r="2.2" fill="#00FFB2" fillOpacity="0.3" />

      {/* Reinforced Titanium Corner Bolt Studs */}
      <circle cx="18" cy="31" r="0.8" fill="#A4B3C7" />
      <circle cx="18" cy="40" r="0.8" fill="#A4B3C7" />
      <circle cx="28" cy="45" r="0.8" fill="#A4B3C7" />

      {/* Global Crest Laser Micro-Emboss on Vault Top */}
      <polygon points="32,22 35,26 32,30 29,26" fill="#D4AF37" fillOpacity="0.8" />
    </svg>
  );
};
