import React, { useEffect, useState } from 'react';
import { motion, useSpring, useReducedMotion, useAnimationControls } from 'framer-motion';

export interface AnimatedNumberProps {
  value: number;
  formatter: (val: number) => string;
  className?: string;
  flashOnChange?: boolean;
}

/**
 * Institutional Rolling Financial Counter
 * Physics-driven number interpolation using Framer Motion springs.
 * Renders formatted value immediately for SSR zero-CLS and test parity.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  formatter,
  className = '',
  flashOnChange = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [springValue, setSpringValue] = useState<number>(value);
  const controls = useAnimationControls();

  const spring = useSpring(value, {
    stiffness: 280,
    damping: 32,
    mass: 0.8,
  });

  useEffect(() => {
    if (shouldReduceMotion) return;

    spring.set(value);

    if (flashOnChange) {
      controls.start({
        filter: ['brightness(1.45)', 'brightness(1)'],
        transition: { duration: 0.4, ease: 'easeOut' },
      });
    }
  }, [value, spring, flashOnChange, shouldReduceMotion, controls]);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const unsubscribe = spring.on('change', (latest: number) => {
      setSpringValue(latest);
    });

    return () => unsubscribe();
  }, [spring, shouldReduceMotion]);

  const display = shouldReduceMotion ? formatter(value) : formatter(springValue);

  return (
    <motion.span
      animate={controls}
      className={`tabular-nums inline-block ${className}`}
    >
      {display}
    </motion.span>
  );
};
