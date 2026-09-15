import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import { formatMaskedCurrency, type VerticalAllocation } from '../../lib/calculations';

interface AllocationDonut3DProps {
  className?: string;
  size?: number;
}

export const AllocationDonut3D: React.FC<AllocationDonut3DProps> = ({
  className = '',
  size = 32,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const allocations = usePortfolioStore((s) => s.allocations);
  const maskBalances = useDashboardStore((s) => s.maskBalances);

  const [hoveredSegment, setHoveredSegment] = useState<VerticalAllocation | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGL availability
    const isSupported = (() => {
      try {
        return Boolean(
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl')
        );
      } catch {
        return false;
      }
    })();

    if (!isSupported) {
      queueMicrotask(() => setHasWebGL(false));
      return;
    }

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    } catch {
      queueMicrotask(() => setHasWebGL(false));
      return;
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffecd2, 2.0);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);

    // Build segmented 3D torus segments
    const geometriesToDispose: THREE.BufferGeometry[] = [];
    const materialsToDispose: THREE.Material[] = [];
    const meshes: { mesh: THREE.Mesh; data: VerticalAllocation }[] = [];

    const totalPct = allocations.reduce((acc, a) => acc + a.actualPct, 0) || 100;
    let currentAngle = 0;

    allocations.forEach((item) => {
      const arcAngle = (item.actualPct / totalPct) * Math.PI * 2;
      // Torus geometry segment: radius 1.2, tube 0.45
      const segmentGeo = new THREE.TorusGeometry(1.15, 0.4, 16, 32, arcAngle - 0.05);
      const segmentMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(item.color),
        roughness: 0.35,
        metalness: 0.65,
      });

      geometriesToDispose.push(segmentGeo);
      materialsToDispose.push(segmentMat);

      const mesh = new THREE.Mesh(segmentGeo, segmentMat);
      mesh.rotation.z = currentAngle;
      group.add(mesh);

      meshes.push({ mesh, data: item });
      currentAngle += arcAngle;
    });

    // Subtle isometric tilt
    group.rotation.x = 0.55;

    // Raycaster for hover detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const handleMouseMove = (event: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      setTooltipPos({
        x: event.clientX,
        y: event.clientY,
      });

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(group.children);

      if (intersects.length > 0) {
        const hit = meshes.find((m) => m.mesh === intersects[0].object);
        if (hit) {
          setHoveredSegment(hit.data);
          return;
        }
      }
      setHoveredSegment(null);
    };

    const handleMouseLeave = () => {
      setHoveredSegment(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop with visibility throttling (Performance Invariant)
    let animationFrameId: number;
    let isHidden = document.hidden;

    const handleVisibilityChange = () => {
      isHidden = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const animate = () => {
      if (!isHidden) {
        group.rotation.z += 0.006;
        renderer?.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Deterministic WebGL Cleanup hook
    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);

      geometriesToDispose.forEach((geo) => geo.dispose());
      materialsToDispose.forEach((mat) => mat.dispose());
      scene.remove(group);
      renderer?.dispose();
      renderer?.forceContextLoss();
    };
  }, [allocations, size]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
      data-testid="allocation-donut-3d"
    >
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="cursor-pointer transition-transform duration-200 hover:scale-105"
        />
      ) : (
        /* Fallback 2D SVG Radial Donut for Headless/Test/No-WebGL Environments */
        <svg
          width={size}
          height={size}
          viewBox="0 0 32 32"
          className="cursor-pointer"
          data-testid="donut-svg-fallback"
        >
          <circle cx="16" cy="16" r="12" fill="none" stroke="#232A38" strokeWidth="4" />
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="#f2ca50"
            strokeWidth="4"
            strokeDasharray="26 75"
            strokeDashoffset="0"
          />
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="#ecc160"
            strokeWidth="4"
            strokeDasharray="15 75"
            strokeDashoffset="-26"
          />
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="#5fe7a2"
            strokeWidth="4"
            strokeDasharray="15 75"
            strokeDashoffset="-41"
          />
        </svg>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredSegment && (
        <div
          data-testid="donut-segment-tooltip"
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-12 bg-surface-container-highest border border-border-hairline px-2.5 py-1.5 rounded-DEFAULT shadow-xl text-left"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold uppercase text-on-surface">
            <span
              className="w-2 h-2 rounded-xs"
              style={{ backgroundColor: hoveredSegment.color }}
            />
            <span>{hoveredSegment.shortName}</span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-xs font-mono font-bold text-on-surface tabular-nums">
              {formatMaskedCurrency(hoveredSegment.actualValue, maskBalances)}
            </span>
            <span className="text-[10px] font-mono text-tertiary">
              {hoveredSegment.actualPct.toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
