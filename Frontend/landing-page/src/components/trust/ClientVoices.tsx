import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useTerminalStore, type TrustMode } from '../../store/useTerminalStore';
import { testimonialsData, type TestimonialItem } from './trustData';

export type { TestimonialItem };

interface SpecularCardProps {
  item: TestimonialItem;
}

const SpecularCard: React.FC<SpecularCardProps> = ({ item }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, shineX: 50, shineY: 50, active: false });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, shineX, shineY, active: true });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt((prev) => ({ ...prev, rotateX: 0, rotateY: 0, active: false }));
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
      className="relative bg-surface-container-low rounded-sm p-6 flex flex-col justify-between gap-6 border border-outline/30 shadow-md hover:border-primary/50 transition-colors overflow-hidden group"
      data-testid={`testimonial-card-${item.id}`}
    >
      {/* Specular Radial Spotlight Layer */}
      {tilt.active && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 220px at ${tilt.shineX}% ${tilt.shineY}%, rgba(212, 175, 55, 0.12), transparent 70%)`,
          }}
        />
      )}

      {/* Top Header Strip: Badge & Monospace ID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`font-mono text-[10px] px-2 py-0.5 rounded-sm uppercase font-semibold tracking-wider ${
              item.badgeType === 'emerald'
                ? 'bg-secondary/15 text-secondary border border-secondary/20'
                : 'bg-primary/15 text-primary border border-primary/20'
            }`}
          >
            {item.badge}
          </span>
          <span className="font-mono text-[11px] text-outline tracking-wider font-semibold">
            {item.identifier}
          </span>
        </div>

        {/* Quote Content */}
        <p className="font-sans text-sm sm:text-[14px] text-on-surface leading-relaxed italic relative">
          {item.quote}
        </p>
      </div>

      {/* Bottom Allocator Profile Footer */}
      <div className="pt-4 bg-surface-container-lowest/60 -mx-6 -mb-6 p-4 px-6 border-t border-outline/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-sm bg-primary/15 text-primary border border-primary/30 flex items-center justify-center font-sans font-bold text-sm shrink-0">
            {item.initials}
          </div>
          <div className="min-w-0">
            <div className="font-sans text-sm text-on-surface font-semibold truncate">
              {item.name}
            </div>
            <div className="font-sans text-xs text-outline truncate">{item.role}</div>
            <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
              {item.location}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-mono text-[10px] text-outline uppercase tracking-wider">
            {item.allocatedLabel}
          </div>
          <div className="font-mono text-base font-bold text-primary">{item.allocatedAmount}</div>
        </div>
      </div>
    </motion.div>
  );
};

interface ClientVoicesProps {
  initialTrustMode?: TrustMode;
}

export const ClientVoices: React.FC<ClientVoicesProps> = ({ initialTrustMode }) => {
  const storeTrustMode = useTerminalStore((state) => state.trustMode);
  const trustMode = initialTrustMode ?? storeTrustMode;
  const testimonials = testimonialsData[trustMode];

  return (
    <div className="w-full space-y-6" data-testid="client-voices-section">
      {/* Section Header */}
      <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-primary uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>VERIFIED INVESTOR REVIEWS • CLIENT VOICES</span>
          </div>
          <h3 className="font-headline-lg text-2xl sm:text-3xl text-on-surface uppercase tracking-tight font-bold">
            Investor Testimonials
          </h3>
        </div>

        
      </div>

      {/* Testimonial Cards 3D Specular Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {testimonials.map((item) => (
            <SpecularCard key={`${trustMode}-${item.id}`} item={item} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
