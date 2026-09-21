import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTerminalStore } from '../../store/useTerminalStore';

interface MeshSubstrateProps {
  reducedMotion: boolean;
  theme: 'dark' | 'light';
}

const MeshSubstrate: React.FC<MeshSubstrateProps> = ({ reducedMotion, theme }) => {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Global palette colors based on active theme
  const particleColor = useMemo(() => {
    return theme === 'dark' ? '#D4AF37' : '#997d26'; // Global gold
  }, [theme]);

  // Generate deterministic grid of geometric coordinate points
  const [positions, count] = useMemo(() => {
    const rows = 35;
    const cols = 35;
    const numPoints = rows * cols;
    const pos = new Float32Array(numPoints * 3);
    const spacing = 0.55;
    const xOffset = ((cols - 1) * spacing) / 2;
    const yOffset = ((rows - 1) * spacing) / 2;

    let idx = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * spacing - xOffset;
        const y = i * spacing - yOffset;
        // Subtle spherical curvature
        const dist = Math.sqrt(x * x + y * y);
        const z = -Math.cos(dist * 0.4) * 0.8;

        pos[idx * 3] = x;
        pos[idx * 3 + 1] = y;
        pos[idx * 3 + 2] = z;
        idx++;
      }
    }
    return [pos, numPoints];
  }, []);

  // Mouse tracking with lerp damping
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouseRef.current.targetX = x * 0.35;
      mouseRef.current.targetY = y * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (reducedMotion) {
      // Keep static orientation for accessibility
      meshRef.current.rotation.set(0.2, 0, 0);
      return;
    }

    // Smooth lerp damping towards cursor target
    const current = mouseRef.current;
    current.x += (current.targetX - current.x) * 0.05;
    current.y += (current.targetY - current.y) * 0.05;

    meshRef.current.rotation.y = current.x * 0.45;
    meshRef.current.rotation.x = -current.y * 0.45 + 0.15;
    // Slow perpetual pulse rotation
    meshRef.current.rotation.z += delta * 0.02;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color={particleColor}
        transparent={true}
        opacity={theme === 'dark' ? 0.45 : 0.3}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
};

export const AmbientCanvas: React.FC = () => {
  const resolvedTheme = useTerminalStore((state) => state.resolvedTheme);
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  const [isTabVisible, setIsTabVisible] = useState(true);

  // Monitor prefers-reduced-motion media query
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // WebGL Lifecycle & Visibility Throttling: Pause/Throttle loop on document.hidden
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div
      aria-hidden="true"
      data-testid="ambient-canvas-wrapper"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none transition-opacity duration-700"
      style={{
        opacity: isTabVisible ? (resolvedTheme === 'dark' ? 0.55 : 0.35) : 0,
      }}
    >
      {isTabVisible && (
        <Canvas
          camera={{ position: [0, 0, 7], fov: 45, near: 0.1, far: 100 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          frameloop={isTabVisible && !reducedMotion ? 'always' : 'demand'}
          dpr={[1, 1.5]} // Capped device pixel ratio for smooth 60fps
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <MeshSubstrate reducedMotion={reducedMotion} theme={resolvedTheme} />
        </Canvas>
      )}
    </div>
  );
};
