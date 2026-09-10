import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const ContactSentinelGraphic: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      data-testid="contact-sentinel-graphic"
      className="relative w-full h-full min-h-[360px] sm:min-h-[460px] lg:min-h-[520px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B0D11] via-[#08090B] to-[#050608] rounded-r-md select-none"
    >
      {/* 1. Atmospheric Ambient Green Smoke & Vignette Layers */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-[#00E5FF]/5 blur-[90px]" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-[#A6FF00]/10 blur-[100px]" />
        {/* Subtle contour rings matching reference screenshot */}
        <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full border border-[#A6FF00]/10 blur-[1px]" />
        <div className="absolute top-1/3 -right-6 w-80 h-80 rounded-full border border-[#A6FF00]/5" />
      </div>

      {/* 2. Textured Dark Mascot Silhouette (SVGs with rich gradient and plush textures) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center justify-center w-full max-w-[340px]"
      >
        <svg
          viewBox="0 0 400 480"
          className="w-full h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Dark Felt / Wool Texture Gradients */}
            <linearGradient id="bodyGradient" x1="120" y1="60" x2="320" y2="460" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2A2E38" />
              <stop offset="35%" stopColor="#171A21" />
              <stop offset="70%" stopColor="#0F1115" />
              <stop offset="100%" stopColor="#08090B" />
            </linearGradient>

            <linearGradient id="headGradient" x1="140" y1="40" x2="300" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#323846" />
              <stop offset="40%" stopColor="#1A1E26" />
              <stop offset="85%" stopColor="#0D0F13" />
              <stop offset="100%" stopColor="#08090B" />
            </linearGradient>

            <linearGradient id="armGradient" x1="100" y1="220" x2="340" y2="400" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#282D37" />
              <stop offset="50%" stopColor="#14171E" />
              <stop offset="100%" stopColor="#0A0C10" />
            </linearGradient>

            {/* Neon Visor Glow */}
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Fine Stipple / Felt Noise */}
            <pattern id="stippleNoise" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.65" fill="#FFFFFF" opacity="0.04" />
              <circle cx="5" cy="5" r="0.6" fill="#000000" opacity="0.12" />
            </pattern>
          </defs>

          {/* Torso & Folded Arms */}
          <g transform="translate(10, 20)">
            {/* Back Torso */}
            <path
              d="M 120 240 C 90 280 80 380 90 460 L 330 460 C 340 380 330 280 290 240 Z"
              fill="url(#bodyGradient)"
            />

            {/* Left Arm (Folded in front) */}
            <path
              d="M 100 250 C 90 320 120 380 180 390 C 230 400 270 380 300 350 C 270 340 220 330 180 330 C 140 330 120 290 100 250 Z"
              fill="url(#armGradient)"
            />

            {/* Right Arm (Folded over left) */}
            <path
              d="M 310 250 C 320 320 290 375 240 395 C 190 410 150 390 130 365 C 160 360 210 350 250 340 C 280 330 300 290 310 250 Z"
              fill="url(#armGradient)"
            />

            {/* Head Silhouette */}
            <path
              d="M 140 180 C 130 100 170 50 220 50 C 270 50 310 100 300 180 C 295 240 275 260 220 260 C 165 260 145 240 140 180 Z"
              fill="url(#headGradient)"
            />

            {/* Fine Stipple Overlay for tactile felt look */}
            <path
              d="M 140 180 C 130 100 170 50 220 50 C 270 50 310 100 300 180 C 295 240 275 260 220 260 C 165 260 145 240 140 180 Z"
              fill="url(#stippleNoise)"
            />
            <path
              d="M 100 250 C 90 320 120 380 180 390 C 230 400 270 380 300 350 C 270 340 220 330 180 330 C 140 330 120 290 100 250 Z"
              fill="url(#stippleNoise)"
            />

            {/* Sleek Visor Eye Frame (Deep Recessed Jet Black) */}
            <rect
              x="220"
              y="126"
              width="68"
              height="34"
              rx="17"
              fill="#060709"
              stroke="#1C212B"
              strokeWidth="2"
            />

            {/* Vibrant Neon Lime/Green Visor Slit (Looking toward the form on the left!) */}
            <motion.g
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      opacity: [0.85, 1, 0.85],
                      scaleX: [1, 1.04, 1],
                    }
              }
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Diffuse Outer Glow */}
              <rect
                x="232"
                y="138"
                width="42"
                height="10"
                rx="5"
                fill="#A6FF00"
                filter="url(#neonGlow)"
                opacity="0.9"
              />
              {/* Intense Sharp Visor Core */}
              <rect
                x="233"
                y="139"
                width="40"
                height="8"
                rx="4"
                fill="#D2FF52"
              />
            </motion.g>
          </g>
        </svg>

        {/* Mascot Status Telemetry Ribbon */}
        <div className="flex items-center gap-2 px-3 py-1 -mt-4 rounded-sm bg-surface-container/80 border border-outline/30 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A6FF00] animate-pulse" />
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            AI DISPATCH SENTINEL // ONLINE
          </span>
        </div>
      </motion.div>
    </div>
  );
};
