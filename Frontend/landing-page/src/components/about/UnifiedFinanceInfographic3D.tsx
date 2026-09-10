import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShieldCheck,
  Globe2,
  Building2,
  Users,
  UserCheck,
  TrendingDown,
  Lock,
  Landmark,
  PieChart,
  LineChart,
  Coins,
  Cpu,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useTerminalStore } from '../../store/useTerminalStore';

export const UnifiedFinanceInfographic3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const resolvedTheme = useTerminalStore((state) => state.resolvedTheme);
  const isVisibleRef = useRef<boolean>(true);
  const [activeSegment, setActiveSegment] = useState<'family' | 'institutions' | 'investors' | null>(null);

  // Deterministic particle positions for ambient 3D depth
  const particles = useMemo(() => {
    const count = 36;
    const array = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const u = Math.abs(Math.sin(i * 14.123 + 45.67)) % 1;
      const v = Math.abs(Math.sin(i * 28.456 + 89.01)) % 1;
      const w = Math.abs(Math.sin(i * 57.789 + 12.34)) % 1;
      array[i * 3] = (u - 0.5) * 16;
      array[i * 3 + 1] = (v - 0.5) * 8;
      array[i * 3 + 2] = (w - 0.5) * 6;
    }
    return array;
  }, []);

  // WebGL 3D Scene Initialization
  useEffect(() => {
    const canvas = canvasRef.current;
    const canvasContainer = canvasContainerRef.current;
    if (!canvas || !canvasContainer || typeof window === 'undefined') return;

    let animationFrameId: number;
    const width = canvasContainer.clientWidth || 960;
    const height = canvasContainer.clientHeight || 460;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.2, 9.6);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Colors
    const goldColor = new THREE.Color('#D4AF37');
    const cyanColor = new THREE.Color('#00E5FF');
    const emeraldColor = new THREE.Color('#00C288');

    const isLight = resolvedTheme === 'light';

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isLight ? 1.1 : 0.7);
    scene.add(ambientLight);

    const goldLight = new THREE.DirectionalLight(goldColor, isLight ? 2.2 : 1.8);
    goldLight.position.set(-5, 6, 8);
    scene.add(goldLight);

    const cyanLight = new THREE.DirectionalLight(cyanColor, isLight ? 2.4 : 2.0);
    cyanLight.position.set(5, -4, 8);
    scene.add(cyanLight);

    const centerPointLight = new THREE.PointLight(cyanColor, 3, 10);
    centerPointLight.position.set(0, 0, 2);
    scene.add(centerPointLight);

    // ==========================================
    // 1. RIGHT SIDE: 3D Shield + Cyan Wave + Padlock (Close to far right)
    // ==========================================
    const centerGroup = new THREE.Group();
    centerGroup.scale.set(1.18, 1.18, 1.18);
    centerGroup.position.set(3.6, 0.25, 0);
    scene.add(centerGroup);

    // Shield base geometry
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.5);
    shieldShape.quadraticCurveTo(1.2, 1.4, 1.3, 0.4);
    shieldShape.quadraticCurveTo(1.2, -0.9, 0, -1.6);
    shieldShape.quadraticCurveTo(-1.2, -0.9, -1.3, 0.4);
    shieldShape.quadraticCurveTo(-1.2, 1.4, 0, 1.5);

    const extrudeSettings = {
      depth: 0.25,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08,
    };

    const shieldGeometry = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    shieldGeometry.center();

    const shieldMaterial = new THREE.MeshStandardMaterial({
      color: isLight ? 0x242a36 : 0x12151c,
      metalness: 0.92,
      roughness: 0.22,
      envMapIntensity: 1.2,
    });
    const shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
    centerGroup.add(shieldMesh);

    // Shield Golden Edge Wireframe Bevel
    const shieldWireGeo = new THREE.EdgesGeometry(shieldGeometry);
    const shieldWireMat = new THREE.LineBasicMaterial({ color: goldColor, linewidth: 2 });
    const shieldWire = new THREE.LineSegments(shieldWireGeo, shieldWireMat);
    centerGroup.add(shieldWire);

    // Stylized Cyan Ocean Wave wrapping around shield
    const waveCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.6, -0.8, 0.4),
      new THREE.Vector3(-1.2, 0.2, 0.6),
      new THREE.Vector3(-0.4, 0.8, 0.7),
      new THREE.Vector3(0.5, 0.6, 0.8),
      new THREE.Vector3(1.2, -0.1, 0.7),
      new THREE.Vector3(1.6, -0.9, 0.5),
      new THREE.Vector3(0.9, -1.3, 0.6),
      new THREE.Vector3(-0.2, -1.1, 0.7),
      new THREE.Vector3(0.3, -0.4, 0.85),
    ]);
    const waveTubeGeo = new THREE.TubeGeometry(waveCurve, 64, 0.09, 12, false);
    const waveTubeMat = new THREE.MeshStandardMaterial({
      color: cyanColor,
      emissive: new THREE.Color('#005577'),
      roughness: 0.15,
      metalness: 0.4,
    });
    const waveMesh = new THREE.Mesh(waveTubeGeo, waveTubeMat);
    centerGroup.add(waveMesh);

    // Heavy Padlock at heart of shield
    const lockGroup = new THREE.Group();
    lockGroup.position.set(0, -0.05, 0.45);
    centerGroup.add(lockGroup);

    // Padlock body
    const lockBodyGeo = new THREE.BoxGeometry(0.75, 0.65, 0.22);
    const lockBodyMat = new THREE.MeshStandardMaterial({
      color: 0x222834,
      metalness: 0.95,
      roughness: 0.18,
    });
    const lockBody = new THREE.Mesh(lockBodyGeo, lockBodyMat);
    lockGroup.add(lockBody);

    // Padlock body golden border
    const lockEdges = new THREE.EdgesGeometry(lockBodyGeo);
    const lockWire = new THREE.LineSegments(lockEdges, new THREE.LineBasicMaterial({ color: goldColor }));
    lockGroup.add(lockWire);

    // Padlock shackle (curved arch)
    const shackleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.2, 0),
      new THREE.Vector3(-0.22, 0.58, 0),
      new THREE.Vector3(0, 0.68, 0),
      new THREE.Vector3(0.22, 0.58, 0),
      new THREE.Vector3(0.22, 0.2, 0),
    ]);
    const shackleGeo = new THREE.TubeGeometry(shackleCurve, 32, 0.055, 12, false);
    const shackleMat = new THREE.MeshStandardMaterial({
      color: goldColor,
      metalness: 0.95,
      roughness: 0.15,
    });
    const shackleMesh = new THREE.Mesh(shackleGeo, shackleMat);
    lockGroup.add(shackleMesh);

    // Illuminated Keyhole (Glowing Cyan)
    const keyholeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16);
    keyholeGeo.rotateX(Math.PI / 2);
    const keyholeMat = new THREE.MeshBasicMaterial({ color: cyanColor });
    const keyholeMesh = new THREE.Mesh(keyholeGeo, keyholeMat);
    keyholeMesh.position.set(0, 0, 0.12);
    lockGroup.add(keyholeMesh);

    // ==========================================
    // 2. FAR LEFT: Glowing Globe & Orbital Rings (Far left)
    // ==========================================
    const leftGlobeGroup = new THREE.Group();
    leftGlobeGroup.scale.set(1.15, 1.15, 1.15);
    leftGlobeGroup.position.set(-4.8, 0.2, 0);
    scene.add(leftGlobeGroup);

    // Wireframe Globe Sphere
    const globeGeo = new THREE.SphereGeometry(1.35, 24, 24);
    const globeMat = new THREE.MeshStandardMaterial({
      color: 0x0a1e28,
      wireframe: true,
      roughness: 0.3,
      metalness: 0.8,
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    leftGlobeGroup.add(globeMesh);

    // Inner glowing core
    const innerGlobeGeo = new THREE.SphereGeometry(1.1, 16, 16);
    const innerGlobeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#002b36'),
      transparent: true,
      opacity: 0.65,
    });
    const innerGlobe = new THREE.Mesh(innerGlobeGeo, innerGlobeMat);
    leftGlobeGroup.add(innerGlobe);

    // Orbital Ring 1 (Tilted 35 deg)
    const ring1Geo = new THREE.TorusGeometry(1.9, 0.035, 12, 64);
    const ring1Mat = new THREE.MeshStandardMaterial({ color: goldColor, metalness: 0.9, roughness: 0.2 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 8;
    leftGlobeGroup.add(ring1);

    // Orbital Ring 2 (Counter-tilted)
    const ring2Geo = new THREE.TorusGeometry(1.7, 0.03, 12, 64);
    const ring2Mat = new THREE.MeshStandardMaterial({ color: cyanColor, metalness: 0.8, roughness: 0.2 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = -Math.PI / 3.5;
    ring2.rotation.y = -Math.PI / 6;
    leftGlobeGroup.add(ring2);

    // Satellite Asset Tokens on Orbital Ring
    const tokenGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.04, 16);
    tokenGeo.rotateX(Math.PI / 2);
    const tokenGoldMat = new THREE.MeshStandardMaterial({ color: goldColor, metalness: 0.95, roughness: 0.15 });
    const tokenCyanMat = new THREE.MeshStandardMaterial({ color: cyanColor, metalness: 0.9, roughness: 0.2 });

    const tokens: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const token = new THREE.Mesh(tokenGeo, i % 2 === 0 ? tokenGoldMat : tokenCyanMat);
      leftGlobeGroup.add(token);
      tokens.push(token);
    }

    // ==========================================
    // 3. CONNECTING BRIDGE & PIPELINES: Dynamic connection between far left & far right
    // ==========================================
    const pipelinesGroup = new THREE.Group();
    pipelinesGroup.position.set(0, 0.2, 0);
    scene.add(pipelinesGroup);

    // Dynamic Connection Bridge connecting Globe (far left) across open space to Shield (far right)
    const connectCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.6, 0.2, 0),
      new THREE.Vector3(-1.8, 0.5, 0.2),
      new THREE.Vector3(0.0, 0.3, 0.15),
      new THREE.Vector3(1.8, 0.55, 0.2),
      new THREE.Vector3(2.6, 0.25, 0),
    ]);
    const connectGeo = new THREE.TubeGeometry(connectCurve, 64, 0.038, 12, false);
    const connectMat = new THREE.MeshStandardMaterial({
      color: cyanColor,
      emissive: new THREE.Color('#005577'),
      roughness: 0.15,
      metalness: 0.5,
    });
    const connectMesh = new THREE.Mesh(connectGeo, connectMat);
    pipelinesGroup.add(connectMesh);

    // Outer sovereign gold spiral aura around the connection bridge
    const connectAuraCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.5, 0.12, 0),
      new THREE.Vector3(-1.8, 0.38, -0.15),
      new THREE.Vector3(0.0, 0.2, -0.1),
      new THREE.Vector3(1.8, 0.42, -0.15),
      new THREE.Vector3(2.7, 0.18, 0),
    ]);
    const connectAuraGeo = new THREE.TubeGeometry(connectAuraCurve, 48, 0.02, 8, false);
    const connectAuraMat = new THREE.MeshStandardMaterial({
      color: goldColor,
      emissive: new THREE.Color('#332200'),
      roughness: 0.25,
      metalness: 0.8,
    });
    const connectAuraMesh = new THREE.Mesh(connectAuraGeo, connectAuraMat);
    pipelinesGroup.add(connectAuraMesh);

    // Pipeline 1: Shield to Family Offices
    const pipe1Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.8, 0.6, 0),
      new THREE.Vector3(2.1, 1.1, 0.2),
      new THREE.Vector3(1.5, 1.2, 0),
    ]);
    const pipe1Geo = new THREE.TubeGeometry(pipe1Curve, 32, 0.03, 8, false);
    const pipe1Mat = new THREE.MeshStandardMaterial({
      color: cyanColor,
      emissive: new THREE.Color('#004455'),
      roughness: 0.2,
    });
    const pipe1 = new THREE.Mesh(pipe1Geo, pipe1Mat);
    pipelinesGroup.add(pipe1);

    // Pipeline 2: Shield to Institutions
    const pipe2Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.7, 0.1, 0),
      new THREE.Vector3(2.1, 0.1, 0.2),
      new THREE.Vector3(1.5, 0.1, 0),
    ]);
    const pipe2Geo = new THREE.TubeGeometry(pipe2Curve, 32, 0.035, 8, false);
    const pipe2Mat = new THREE.MeshStandardMaterial({
      color: goldColor,
      emissive: new THREE.Color('#443300'),
      roughness: 0.2,
    });
    const pipe2 = new THREE.Mesh(pipe2Geo, pipe2Mat);
    pipelinesGroup.add(pipe2);

    // Pipeline 3: Shield to Smart Investors
    const pipe3Curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(2.8, -0.4, 0),
      new THREE.Vector3(2.1, -0.9, 0.2),
      new THREE.Vector3(1.5, -1.0, 0),
    ]);
    const pipe3Geo = new THREE.TubeGeometry(pipe3Curve, 32, 0.03, 8, false);
    const pipe3Mat = new THREE.MeshStandardMaterial({
      color: emeraldColor,
      emissive: new THREE.Color('#004422'),
      roughness: 0.2,
    });
    const pipe3 = new THREE.Mesh(pipe3Geo, pipe3Mat);
    pipelinesGroup.add(pipe3);

    // Pipeline Flowing Pulse Photons
    const photonGeo = new THREE.SphereGeometry(0.06, 12, 12);
    const photonMat1 = new THREE.MeshBasicMaterial({ color: cyanColor });
    const photonMat2 = new THREE.MeshBasicMaterial({ color: goldColor });
    const photonMat3 = new THREE.MeshBasicMaterial({ color: emeraldColor });

    const photon1 = new THREE.Mesh(photonGeo, photonMat1);
    const photon2 = new THREE.Mesh(photonGeo, photonMat2);
    const photon3 = new THREE.Mesh(photonGeo, photonMat3);
    const bridgePhoton1 = new THREE.Mesh(photonGeo, photonMat1);
    const bridgePhoton2 = new THREE.Mesh(photonGeo, photonMat2);
    pipelinesGroup.add(photon1, photon2, photon3, bridgePhoton1, bridgePhoton2);

    // ==========================================
    // 4. AMBIENT PARTICLES
    // ==========================================
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particles, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.045,
      color: goldColor,
      transparent: true,
      opacity: 0.5,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // Track mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasContainer.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetX = x * 0.4;
      targetY = y * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisibleRef.current) return;

      const elapsed = clock.getElapsedTime();

      // Parallax damping
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;
      camera.position.x = mouseX;
      camera.position.y = 0.2 + mouseY;
      camera.position.z = 9.6;
      camera.lookAt(0, 0.2, 0);

      // Shield & Padlock gentle float & wave breathing (close to far right)
      if (!shouldReduceMotion) {
        centerGroup.position.x = 3.6;
        centerGroup.position.y = 0.25 + Math.sin(elapsed * 1.5) * 0.08;
        centerGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.06;
        waveMesh.rotation.z = Math.sin(elapsed * 1.2) * 0.04;

        // Far Left Globe rotation
        globeMesh.rotation.y += 0.006;
        innerGlobe.rotation.y -= 0.003;
        ring1.rotation.z += 0.008;
        ring2.rotation.z -= 0.006;

        // Animate tokens on orbital rings
        tokens.forEach((tok, idx) => {
          const tAngle = elapsed * 0.8 + (idx * Math.PI) / 2;
          const rRadius = 1.9;
          tok.position.x = Math.cos(tAngle) * rRadius;
          tok.position.y = Math.sin(tAngle) * rRadius * 0.5;
          tok.position.z = Math.sin(tAngle) * rRadius * 0.8;
          tok.rotation.y = tAngle;
        });

        // Animate pipeline photons
        const p1T = (elapsed * 0.4) % 1;
        const p2T = (elapsed * 0.45 + 0.33) % 1;
        const p3T = (elapsed * 0.38 + 0.66) % 1;
        photon1.position.copy(pipe1Curve.getPointAt(p1T));
        photon2.position.copy(pipe2Curve.getPointAt(p2T));
        photon3.position.copy(pipe3Curve.getPointAt(p3T));

        // Animate connecting bridge photons (from Globe on far left to Shield on far right)
        const bp1T = (elapsed * 0.28) % 1;
        const bp2T = (elapsed * 0.28 + 0.5) % 1;
        bridgePhoton1.position.copy(connectCurve.getPointAt(bp1T));
        bridgePhoton2.position.copy(connectCurve.getPointAt(bp2T));
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!canvasContainer) return;
      const newWidth = canvasContainer.clientWidth || 960;
      const newHeight = canvasContainer.clientHeight || 460;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Tab Visibility & IntersectionObserver Throttling
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const observer = new IntersectionObserver(([entry]) => {
      isVisibleRef.current = entry.isIntersecting;
    });
    observer.observe(canvasContainer);

    // Cleanup & Dispose
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      observer.disconnect();

      shieldGeometry.dispose();
      shieldMaterial.dispose();
      shieldWireGeo.dispose();
      shieldWireMat.dispose();
      waveTubeGeo.dispose();
      waveTubeMat.dispose();
      lockBodyGeo.dispose();
      lockBodyMat.dispose();
      lockEdges.dispose();
      shackleGeo.dispose();
      shackleMat.dispose();
      keyholeGeo.dispose();
      keyholeMat.dispose();
      globeGeo.dispose();
      globeMat.dispose();
      innerGlobeGeo.dispose();
      innerGlobeMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      tokenGeo.dispose();
      tokenGoldMat.dispose();
      tokenCyanMat.dispose();
      pipe1Geo.dispose();
      pipe1Mat.dispose();
      pipe2Geo.dispose();
      pipe2Mat.dispose();
      pipe3Geo.dispose();
      pipe3Mat.dispose();
      connectGeo.dispose();
      connectMat.dispose();
      connectAuraGeo.dispose();
      connectAuraMat.dispose();
      photonGeo.dispose();
      photonMat1.dispose();
      photonMat2.dispose();
      photonMat3.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, [particles, shouldReduceMotion, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      data-testid="unified-finance-infographic-3d"
      className="relative w-full rounded-md border border-slate-200 dark:border-outline/30 bg-white/95 dark:bg-[#08090B]/90 backdrop-blur-md overflow-hidden p-4 sm:p-6 lg:p-8 shadow-2xl space-y-3"
    >
      {/* 1. TOP HEADER & SUBHEADER BANNERS */}
      <div className="space-y-2.5 text-center max-w-4xl mx-auto relative z-20">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-primary/10 border border-primary/30 font-mono text-[10px] sm:text-xs text-primary uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>ABOUT WAVYASSETS • INSTITUTIONAL SOVEREIGNTY</span>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>WAVYASSETS ARCHITECTURE</span>
          </div>

          <h3 className="font-headline-lg text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-on-surface tracking-tight uppercase">
            WAVYASSETS: THE FUTURE OF UNIFIED FINANCE
          </h3>

          {/* Top Subheader Banner */}
          <div className="p-2 sm:p-2.5 rounded-sm bg-[#F4F6FB] dark:bg-[#0F1115] border border-slate-200 dark:border-outline/30 text-[10px] sm:text-xs font-mono font-bold text-slate-700 dark:text-on-surface-variant tracking-wider uppercase flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
            <span>
              WAVYASSETS UNIFIES: GLOBAL WEALTH MANAGEMENT | DIGITAL ASSET CUSTODY | INSTITUTIONAL YIELD GENERATION
            </span>
          </div>
        </div>

        {/* Directly Under: Editorial Narrative & Headline (from First Screenshot) */}
        <div className="pt-0.5 space-y-1.5 max-w-3xl mx-auto">

          <h2 className="font-headline-lg text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-on-surface font-bold tracking-tight leading-tight">
            Pioneering Multi-Asset Freedom and Cold-Storage Security
          </h2>

          <p className="font-sans text-sm sm:text-base text-slate-600 dark:text-on-surface-variant leading-relaxed">
            WavyAssets unifies global wealth management, digital asset custody, and institutional
            yield generation into a single platform. We eliminate the chaos of juggling separate
            brokers, banks, and custodians—giving family offices, institutions, and smart individual
            investors total control, mathematical transparency, and peace of mind.
          </p>
        </div>
      </div>

      {/* 2. MAIN INFOGRAPHIC 3D CANVAS & VECTOR OVERLAY GRID */}
      <div
        ref={canvasContainerRef}
        className="relative w-full min-h-[350px] lg:min-h-[370px] flex flex-col items-center justify-start pt-1 sm:pt-2 pb-1"
      >
        {/* Three.js 3D WebGL Canvas Layer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />

        {/* High-Tech Vector & Telemetry Layout Grid (Left, Center, Right, Far Right) */}
        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start pointer-events-auto">
          {/* ========================================================= */}
          {/* LEFT SIDE: PIONEERING MULTI-ASSET FREEDOM (3 cols on desktop) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-3 p-4 rounded-sm bg-[#F4F6FB]/90 dark:bg-[#0F1115]/80 border border-slate-200 dark:border-outline/30 backdrop-blur-sm shadow-lg">
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] font-black uppercase tracking-wider">
              <Globe2 className="w-4 h-4 text-primary" />
              <span>PIONEERING MULTI-ASSET FREEDOM</span>
            </div>

            <p className="font-sans text-[11px] text-slate-600 dark:text-on-surface-variant leading-relaxed">
              Convergence of traditional sovereign wealth and liquid digital assets on a single ledger.
            </p>

            {/* Asset Clusters */}
            <div className="space-y-2 pt-1">
              {/* Fiat Badges */}
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-slate-500 dark:text-outline uppercase tracking-wider block">
                  Global Fiat Currencies
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['$', '€', '¥', '£'].map((fiat) => (
                    <span
                      key={fiat}
                      className="px-2 py-0.5 rounded-sm bg-white dark:bg-[#161920] border border-slate-200 dark:border-outline/30 font-mono text-xs font-bold text-slate-900 dark:text-on-surface"
                    >
                      {fiat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Physical Gold */}
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-slate-500 dark:text-outline uppercase tracking-wider block">
                  Sovereign Metals
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-sm bg-[#D4AF37]/15 border border-[#D4AF37]/40 font-mono text-xs font-bold text-[#B38F1E] dark:text-[#D4AF37] flex items-center gap-1">
                    <Coins className="w-3 h-3 text-[#B38F1E] dark:text-[#D4AF37]" />
                    <span>Gold Bars &amp; Bullion Coins</span>
                  </span>
                </div>
              </div>

              {/* Crypto Assets */}
              <div className="space-y-1">
                <span className="font-mono text-[9px] text-slate-500 dark:text-outline uppercase tracking-wider block">
                  Digital Assets
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-sm bg-[#00E5FF]/10 border border-[#00B4D8]/30 dark:border-[#00E5FF]/30 font-mono text-xs font-bold text-[#008BB0] dark:text-[#00E5FF]">
                    ₿ Bitcoin
                  </span>
                  <span className="px-2 py-0.5 rounded-sm bg-[#00C288]/10 border border-[#00C288]/30 font-mono text-xs font-bold text-[#009E6E] dark:text-[#00C288]">
                    Ξ Ethereum
                  </span>
                </div>
              </div>
            </div>

            <div className="font-mono text-[9px] text-[#009E6E] dark:text-[#00C288] flex items-center gap-1 pt-1 font-semibold">
              <CheckCircle2 className="w-3 h-3 text-[#009E6E] dark:text-[#00C288]" />
              <span>Zero Settlement Slippage</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CENTERPIECE: COLD-STORAGE SECURITY (3 cols on desktop) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 flex flex-col items-center justify-end text-center pt-32 sm:pt-36 lg:pt-40">
            <div className="p-3 rounded-sm bg-white/95 dark:bg-[#08090B]/90 border border-primary/40 shadow-[0_0_25px_rgba(212,175,55,0.15)] space-y-1.5 max-w-[240px]">
              <div className="flex items-center justify-center gap-1.5 text-primary font-mono text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>COLD-STORAGE SECURITY</span>
              </div>
              <p className="font-sans text-[10px] text-slate-600 dark:text-on-surface-variant leading-tight">
                Multi-signature MPC cryptographic hardware enclaves wrapped by institutional ocean wave isolation.
              </p>
              <div className="font-mono text-[9px] px-2 py-0.5 rounded-sm bg-primary/10 text-primary uppercase font-bold tracking-widest">
                FIPS 140-2 LEVEL 4 HSM
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT SIDE: TARGET CLIENT SEGMENTS (3 cols on desktop) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-2.5">
            <div className="font-mono text-[10px] text-[#008BB0] dark:text-[#00E5FF] font-black uppercase tracking-widest flex items-center gap-1.5 px-1">
              <Cpu className="w-3.5 h-3.5 text-[#008BB0] dark:text-[#00E5FF]" />
              <span>TARGET CLIENT SEGMENTS</span>
            </div>

            {/* Segment 1: Family Offices */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveSegment('family')}
              className={`p-3 rounded-sm border transition-all cursor-pointer ${
                activeSegment === 'family'
                  ? 'bg-white dark:bg-[#161920] border-primary shadow-md'
                  : 'bg-[#F4F6FB]/90 dark:bg-[#0F1115]/85 border-slate-200 dark:border-outline/30 hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 text-slate-900 dark:text-on-surface font-sans text-xs font-bold">
                <div className="w-6 h-6 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <span>Family Offices</span>
              </div>
              <p className="font-sans text-[10px] text-slate-600 dark:text-on-surface-variant pt-1 leading-snug">
                Stylized family reviewing capital allocation and multi-generational mandates on digital tablet interfaces.
              </p>
            </motion.div>

            {/* Segment 2: Institutions */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveSegment('institutions')}
              className={`p-3 rounded-sm border transition-all cursor-pointer ${
                activeSegment === 'institutions'
                  ? 'bg-white dark:bg-[#161920] border-primary shadow-md'
                  : 'bg-[#F4F6FB]/90 dark:bg-[#0F1115]/85 border-slate-200 dark:border-outline/30 hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 text-slate-900 dark:text-on-surface font-sans text-xs font-bold">
                <div className="w-6 h-6 rounded-sm bg-[#00E5FF]/10 flex items-center justify-center text-[#008BB0] dark:text-[#00E5FF]">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <span>Institutions</span>
              </div>
              <p className="font-sans text-[10px] text-slate-600 dark:text-on-surface-variant pt-1 leading-snug">
                Sleek, modern skyscrapers representing sovereign corporate treasuries, hedge funds, and prime brokers.
              </p>
            </motion.div>

            {/* Segment 3: Smart Individual Investors */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={() => setActiveSegment('investors')}
              className={`p-3 rounded-sm border transition-all cursor-pointer ${
                activeSegment === 'investors'
                  ? 'bg-white dark:bg-[#161920] border-primary shadow-md'
                  : 'bg-[#F4F6FB]/90 dark:bg-[#0F1115]/85 border-slate-200 dark:border-outline/30 hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-2 text-slate-900 dark:text-on-surface font-sans text-xs font-bold">
                <div className="w-6 h-6 rounded-sm bg-[#00C288]/10 flex items-center justify-center text-[#009E6E] dark:text-[#00C288]">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
                <span>Smart Individual Investors</span>
              </div>
              <p className="font-sans text-[10px] text-slate-600 dark:text-on-surface-variant pt-1 leading-snug">
                Focused investor interacting with real-time floating holographic charts and algorithmic yield screens.
              </p>
            </motion.div>
          </div>

          {/* ========================================================= */}
          {/* FAR RIGHT: ELIMINATES THE CHAOS (3 cols on desktop) */}
          {/* ========================================================= */}
          <div className="lg:col-span-3 space-y-3 p-4 rounded-sm bg-[#F4F6FB]/90 dark:bg-[#0F1115]/85 border border-slate-200 dark:border-outline/30 backdrop-blur-sm shadow-lg">
            <div className="flex items-center gap-2 text-[#FF4D4D] font-mono text-[10px] font-black uppercase tracking-wider">
              <TrendingDown className="w-4 h-4 text-[#FF4D4D]" />
              <span>ELIMINATES THE CHAOS</span>
            </div>

            <p className="font-sans text-[11px] text-slate-600 dark:text-on-surface-variant leading-relaxed">
              Consolidates fragmented, scattered financial tools into a single, high-fidelity platform:
            </p>

            {/* Fragmented Tools Icons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-sm bg-white dark:bg-[#161920] border border-slate-200 dark:border-outline/20 space-y-1 text-center">
                <LineChart className="w-4 h-4 mx-auto text-slate-400 dark:text-outline" />
                <span className="font-sans text-[10px] text-slate-600 dark:text-on-surface-variant block">
                  Scattered Charts
                </span>
              </div>

              <div className="p-2 rounded-sm bg-white dark:bg-[#161920] border border-slate-200 dark:border-outline/20 space-y-1 text-center">
                <Landmark className="w-4 h-4 mx-auto text-slate-400 dark:text-outline" />
                <span className="font-sans text-[10px] text-slate-600 dark:text-on-surface-variant block">
                  Bank Facade
                </span>
              </div>

              <div className="p-2 rounded-sm bg-white dark:bg-[#161920] border border-slate-200 dark:border-outline/20 space-y-1 text-center">
                <Lock className="w-4 h-4 mx-auto text-slate-400 dark:text-outline" />
                <span className="font-sans text-[10px] text-slate-600 dark:text-on-surface-variant block">
                  Locked Safe
                </span>
              </div>

              <div className="p-2 rounded-sm bg-white dark:bg-[#161920] border border-slate-200 dark:border-outline/20 space-y-1 text-center">
                <PieChart className="w-4 h-4 mx-auto text-slate-400 dark:text-outline" />
                <span className="font-sans text-[10px] text-slate-600 dark:text-on-surface-variant block">
                  Pie Charts
                </span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-200 dark:border-outline/20 text-center font-mono text-[9px] text-[#008BB0] dark:text-[#00E5FF] uppercase font-bold tracking-wider">
              → Consolidated into WavyAssets
            </div>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM FOOTER PILL BANNER */}
      <div className="pt-1 sm:pt-2 flex items-center justify-center">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="px-6 py-2.5 rounded-full bg-white dark:bg-[#0F1115] border border-primary/50 text-center shadow-[0_0_20px_rgba(212,175,55,0.25)] flex items-center gap-2 cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-xs sm:text-sm font-black uppercase text-primary tracking-widest">
            TOTAL CONTROL, MATHEMATICAL TRANSPARENCY, AND PEACE OF MIND.
          </span>
        </motion.div>
      </div>
    </div>
  );
};
