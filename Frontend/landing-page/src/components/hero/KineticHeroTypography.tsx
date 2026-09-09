import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const words = [
  { text: 'Smart', highlight: false },
  { text: 'Multi-Asset', highlight: false },
  { text: 'Wealth', highlight: false },
  { text: '&', highlight: false },
  { text: 'Digital', highlight: false },
  { text: 'Money', highlight: false },
  { text: 'Wallet', highlight: false },
];

export const KineticHeroTypography: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Expressive easing curve for swift glide into resting clarity
  const expressiveEase = [0.22, 1, 0.36, 1] as const;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reducedMotion ? 0 : 0.06,
        delayChildren: 0.05,
      },
    },
  };

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: reducedMotion ? 0 : 30,
      filter: reducedMotion ? 'none' : 'blur(14px)',
      letterSpacing: reducedMotion ? '0em' : '-0.04em',
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      letterSpacing: '0em',
      transition: {
        duration: 0.85,
        ease: expressiveEase,
      },
    },
  };

  return (
    <div className="space-y-4 max-w-2xl select-none" data-testid="kinetic-hero-typography">
      {/* 1. Eyebrow Badge */}
      <motion.div
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 14, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.65, ease: expressiveEase }}
        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-sm bg-surface-container border border-outline/30 font-mono text-[11px] text-primary uppercase tracking-widest"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
        <span>SMART ASSET ALLOCATION • REAL-TIME ESTIMATES</span>
      </motion.div>

      {/* 2. Kinetic H1 Headline: Horizontal Cluster Expand + Vertical Slide + Gaussian Blur Clearing */}
      <motion.h1
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="font-headline-xl text-3xl sm:text-4xl lg:text-[42px] text-on-surface font-bold tracking-tight leading-[1.18] flex flex-wrap gap-x-2.5 gap-y-1"
      >
        {words.map((item, idx) => (
          <motion.span
            key={`${item.text}-${idx}`}
            variants={wordVariants}
            className="inline-block will-change-[transform,opacity,filter]"
          >
            {item.text}
          </motion.span>
        ))}
      </motion.h1>

      {/* 3. Subdeck Description */}
      <motion.p
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 18, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, delay: 0.35, ease: expressiveEase }}
        className="text-sm sm:text-base text-on-surface-variant leading-relaxed will-change-[transform,opacity,filter]"
      >
        Grow and protect your money across stocks, smart AI funds, classic cars, and commercial
        properties. Model your balance with our interactive calculator, or open an account in minutes.
      </motion.p>
    </div>
  );
};
