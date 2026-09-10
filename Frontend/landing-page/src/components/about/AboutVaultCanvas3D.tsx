import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTerminalStore } from '../../store/useTerminalStore';

interface VaultMeshProps {
  reducedMotion: boolean;
  theme: 'dark' | 'light';
  isHovered: boolean;
}

const VaultCoreMesh: React.FC<VaultMeshProps> = ({
  reducedMotion,
  theme,
  isHovered,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Floating ambient particle dust
  const [particlePositions, particleCount] = useMemo(() => {
    const count = 48;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.0 + Math.random() * 1.5;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return [positions, count];
  }, []);

  // Track pointer for smooth damping parallax
  useEffect(() => {
    if (reducedMotion || typeof window === 'undefined') return;

    const handlePointerMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.targetX = x * 0.35;
      pointerRef.current.targetY = y * 0.35;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [reducedMotion]);

  useFrame((_, delta) => {
    // Smooth pointer lerp
    pointerRef.current.x +=
      (pointerRef.current.targetX - pointerRef.current.x) * 0.05;
    pointerRef.current.y +=
      (pointerRef.current.targetY - pointerRef.current.y) * 0.05;

    if (groupRef.current) {
      groupRef.current.rotation.y = pointerRef.current.x * 0.6;
      groupRef.current.rotation.x = -pointerRef.current.y * 0.4;
    }

    if (!reducedMotion) {
      const speedMult = isHovered ? 1.6 : 1.0;

      // Vault Core facet rotation
      if (coreRef.current) {
        coreRef.current.rotation.y += delta * 0.25 * speedMult;
        coreRef.current.rotation.x += delta * 0.15 * speedMult;
      }

      // Inner glowing core pulse
      if (innerRef.current) {
        innerRef.current.rotation.y -= delta * 0.3 * speedMult;
      }

      // Multi-axis orbital custody rings
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z += delta * 0.22 * speedMult;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.x -= delta * 0.18 * speedMult;
        ring2Ref.current.rotation.y += delta * 0.12 * speedMult;
      }
      if (ring3Ref.current) {
        ring3Ref.current.rotation.y += delta * 0.28 * speedMult;
        ring3Ref.current.rotation.z -= delta * 0.15 * speedMult;
      }

      // Gentle particle drift
      if (particlesRef.current) {
        particlesRef.current.rotation.y += delta * 0.08;
      }
    }
  });

  const gold = '#D4AF37';
  const emerald = '#00C288';
  const cyan = '#00E5FF';
  const borderWire = theme === 'dark' ? '#3A4050' : '#8A94A6';

  return (
    <group ref={groupRef}>
      {/* 1. Outer Polyhedral Sovereign Vault (Dodecahedron Facet Lattice) */}
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[1.35, 0]} />
        <meshStandardMaterial
          color={gold}
          wireframe={true}
          roughness={0.2}
          metalness={0.85}
          emissive={gold}
          emissiveIntensity={0.25}
        />
      </mesh>

      {/* 2. Semi-Transparent Solid Core Shield */}
      <mesh>
        <dodecahedronGeometry args={[1.25, 0]} />
        <meshPhysicalMaterial
          color={theme === 'dark' ? '#0F1115' : '#FFFFFF'}
          transparent={true}
          opacity={theme === 'dark' ? 0.75 : 0.6}
          roughness={0.1}
          metalness={0.4}
          clearcoat={1}
        />
      </mesh>

      {/* 3. Glowing Emerald MPC Enclave Nucleus */}
      <mesh ref={innerRef}>
        <octahedronGeometry args={[0.65, 0]} />
        <meshStandardMaterial
          color={emerald}
          emissive={emerald}
          emissiveIntensity={0.7}
          wireframe={true}
        />
      </mesh>

      {/* 4. Primary Orbital Custody Ring (Digital Assets / Cold Vaults) */}
      <mesh ref={ring1Ref} rotation={[0.4, 0.2, 0]}>
        <torusGeometry args={[1.9, 0.024, 16, 80]} />
        <meshStandardMaterial
          color={gold}
          emissive={gold}
          emissiveIntensity={0.3}
          metalness={0.9}
        />
      </mesh>

      {/* 5. Second Orbital Custody Ring (DMA Equities & Real Estate) */}
      <mesh ref={ring2Ref} rotation={[-0.6, 0.8, 0.3]}>
        <torusGeometry args={[2.2, 0.02, 16, 80]} />
        <meshStandardMaterial
          color={cyan}
          emissive={cyan}
          emissiveIntensity={0.25}
          metalness={0.8}
        />
      </mesh>

      {/* 6. Third Orbital Ring (Treasury & Concierge Metal Cards) */}
      <mesh ref={ring3Ref} rotation={[0.8, -0.4, 0.6]}>
        <torusGeometry args={[2.45, 0.018, 16, 80]} />
        <meshStandardMaterial
          color={borderWire}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* 7. Ambient Particle Dust Substrate */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
            count={particleCount}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          color={gold}
          transparent={true}
          opacity={0.65}
          sizeAttenuation={true}
        />
      </points>
    </group>
  );
};

export const AboutVaultCanvas3D: React.FC = () => {
  const resolvedTheme = useTerminalStore((state) => state.resolvedTheme);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // WebGL Render Loop Throttling on document.hidden and IntersectionObserver
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Canvas intersection observer
    let observer: IntersectionObserver | null = null;
    if (containerRef.current && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsVisible(entry.isIntersecting && !document.hidden);
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(containerRef.current);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (observer) observer.disconnect();
    };
  }, []);

  const isServerOrMock =
    typeof window === 'undefined' ||
    typeof document === 'undefined' ||
    typeof document.createElement === 'undefined';

  return (
    <div
      ref={containerRef}
      data-testid="about-vault-canvas-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] flex items-center justify-center select-none overflow-hidden"
    >
      {/* Soft Radial Backlight Spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center z-0"
      >
        <div className="w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="w-56 h-56 rounded-full bg-secondary/10 blur-2xl -translate-y-4" />
      </div>

      {!isServerOrMock ? (
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 48 }}
          frameloop={isVisible ? 'always' : 'never'}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          className="relative z-10 w-full h-full"
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <ambientLight intensity={resolvedTheme === 'dark' ? 0.7 : 0.9} />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.2}
            color="#FFFFFF"
          />
          <pointLight
            position={[-4, -3, 2]}
            intensity={0.8}
            color="#D4AF37"
          />
          <pointLight
            position={[3, -4, -2]}
            intensity={0.6}
            color="#00C288"
          />

          <VaultCoreMesh
            reducedMotion={reducedMotion}
            theme={resolvedTheme}
            isHovered={isHovered}
          />
        </Canvas>
      ) : (
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 text-outline font-mono text-xs">
          <div className="w-32 h-32 rounded-full border border-primary/40 flex items-center justify-center mb-2">
            <span className="w-16 h-16 rounded-full bg-primary/20 animate-pulse" />
          </div>
          <span>3D SOVEREIGN VAULT CORE // WEBGL ACCELERATED</span>
        </div>
      )}

      {/* Telemetry pill overlay badge */}
      <div className="pointer-events-none absolute bottom-3 left-4 z-20 flex items-center gap-2 px-2.5 py-1 rounded-sm bg-surface-container-lowest/80 border border-outline/30 backdrop-blur-md">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
          SOVEREIGN CUSTODY NODE // VERIFIED
        </span>
      </div>
    </div>
  );
};
