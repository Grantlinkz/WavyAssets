import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTerminalStore } from '../../store/useTerminalStore';

interface GyroscopeMeshProps {
  reducedMotion: boolean;
  theme: 'dark' | 'light';
  isHovered: boolean;
}

const GyroscopeMesh: React.FC<GyroscopeMeshProps> = ({
  reducedMotion,
  theme,
  isHovered,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const coreRef = useRef<THREE.Mesh>(null);
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // 7 Tier metadata
  const tiers = useMemo<Array<{
    id: string;
    name: string;
    radius: number;
    tube: number;
    color: string;
    tiltX: number;
    tiltY: number;
    tiltZ: number;
    speed: number;
  }>>(
    () => [
      { id: 'crypto', name: 'Crypto & Yield', radius: 2.1, tube: 0.024, color: '#00E5FF', tiltX: 0.45, tiltY: 0, tiltZ: 0.25, speed: 0.22 },
      { id: 'stocks', name: 'DMA Equities', radius: 1.82, tube: 0.026, color: theme === 'dark' ? '#C0C7D6' : '#6A7282', tiltX: -0.55, tiltY: 0.35, tiltZ: 0, speed: -0.2 },
      { id: 'ai-funds', name: 'Quant AI Mesh', radius: 1.55, tube: 0.022, color: '#00C288', tiltX: 0, tiltY: 0.8, tiltZ: -0.2, speed: 0.25 },
      { id: 'real-estate', name: 'Tokenized Deeds', radius: 1.28, tube: 0.025, color: '#D4AF37', tiltX: 0.9, tiltY: -0.5, tiltZ: 0, speed: -0.18 },
      { id: 'cars', name: 'Provenance Vaults', radius: 1.02, tube: 0.028, color: theme === 'dark' ? '#3A4050' : '#8A94A6', tiltX: -0.35, tiltY: 0, tiltZ: 1.1, speed: 0.24 },
      { id: 'vip-cards', name: 'Titanium Metal Cards', radius: 0.78, tube: 0.022, color: '#E5C158', tiltX: 0, tiltY: -1.1, tiltZ: 0.4, speed: -0.22 },
      { id: 'wallet', name: 'MPC Custody Core', radius: 0.42, tube: 0.03, color: '#00E5FF', tiltX: 0, tiltY: 0, tiltZ: 0, speed: 0.15 },
    ],
    [theme]
  );

  // Track pointer for smooth damping parallax
  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') return;

    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.targetX = x * 0.4;
      pointerRef.current.targetY = y * 0.4;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [reducedMotion]);

  // Animation Loop: slow-axis rotation (0.2 rad/s), gentle vertical bob, and cursor damping
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // 1. Gentle floating vertical bob (sine wave)
    if (!reducedMotion) {
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.08;
    }

    // 2. Smooth damping on cursor parallax tracking
    pointerRef.current.x = THREE.MathUtils.damp(
      pointerRef.current.x,
      pointerRef.current.targetX,
      6,
      delta
    );
    pointerRef.current.y = THREE.MathUtils.damp(
      pointerRef.current.y,
      pointerRef.current.targetY,
      6,
      delta
    );

    groupRef.current.rotation.y = pointerRef.current.x * 0.75;
    groupRef.current.rotation.x = -pointerRef.current.y * 0.75;

    // 3. Smooth expansion interpolation on hover
    const targetScale = isHovered ? 1.08 : 1.0;
    groupRef.current.scale.setScalar(
      THREE.MathUtils.damp(groupRef.current.scale.x, targetScale, 5, delta)
    );

    // 4. Continuous multi-axis rotation across all 7 orbital rings
    if (!reducedMotion) {
      ringRefs.current.forEach((ring, idx) => {
        if (!ring) return;
        const config = tiers[idx];
        ring.rotation.z += config.speed * delta;
        ring.rotation.x += (config.speed * 0.5) * delta;
      });

      // Core spin
      if (coreRef.current) {
        coreRef.current.rotation.y += delta * 0.35;
        coreRef.current.rotation.x += delta * 0.2;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* 6 Concentric Orbital Rings */}
      {tiers.slice(0, 6).map((tier, idx) => (
        <mesh
          key={tier.id}
          ref={(el) => {
            ringRefs.current[idx] = el;
          }}
          rotation={[tier.tiltX, tier.tiltY || 0, tier.tiltZ || 0]}
        >
          {/* Low polygon TorusGeometry budget for 60fps performance */}
          <torusGeometry args={[tier.radius, tier.tube, 16, 48]} />
          <meshStandardMaterial
            color={tier.color}
            roughness={0.15}
            metalness={0.88}
            emissive={tier.color}
            emissiveIntensity={isHovered ? 0.35 : 0.15}
          />
        </mesh>
      ))}

      {/* 7th Tier: Central MPC Sovereign Vault Core */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color="#D4AF37"
          roughness={0.15}
          metalness={0.92}
          wireframe={false}
          emissive="#D4AF37"
          emissiveIntensity={isHovered ? 0.45 : 0.25}
        />
      </mesh>

      {/* Wireframe Shield Cage around Core */}
      <mesh>
        <sphereGeometry args={[0.54, 16, 16]} />
        <meshBasicMaterial
          color="#00E5FF"
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

const emptySubscribe = () => () => {};

export const HeroAssetGyroscope: React.FC = () => {
  const resolvedTheme = useTerminalStore((state) => state.resolvedTheme);
  const isClient = React.useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(true);

  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Monitor prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Throttle WebGL rendering loop on tab blur
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const handleVisibility = () => setIsTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  return (
    <div
      data-testid="hero-asset-gyroscope"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-[480px] h-[300px] sm:h-[360px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing pointer-events-auto"
    >
      {/* 3D WebGL Canvas Viewport - Clean, unobstructed */}
      <div
        data-testid="gyroscope-canvas-container"
        className="absolute inset-0 w-full h-full flex items-center justify-center"
      >
        {isClient && isTabVisible ? (
          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 42 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
            }}
            dpr={[1, 1.5]}
            frameloop={isTabVisible && !reducedMotion ? 'always' : 'demand'}
          >
            <ambientLight intensity={themeLightIntensity(resolvedTheme)} />
            <directionalLight position={[4, 5, 4]} intensity={1.4} color="#FFFFFF" />
            <pointLight position={[-4, -3, -2]} intensity={1.8} color="#00E5FF" />
            <pointLight position={[3, -2, 3]} intensity={1.6} color="#D4AF37" />

            <GyroscopeMesh
              reducedMotion={reducedMotion}
              theme={resolvedTheme}
              isHovered={isHovered}
            />
          </Canvas>
        ) : (
          /* High-Performance SSR Skeleton / Fallback */
          <div className="w-32 h-32 rounded-full border border-primary/30 border-t-primary animate-spin opacity-30" />
        )}
      </div>
    </div>
  );
};

function themeLightIntensity(theme: 'dark' | 'light'): number {
  return theme === 'dark' ? 0.8 : 1.2;
}
