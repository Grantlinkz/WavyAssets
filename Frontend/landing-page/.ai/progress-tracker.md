# Progress Tracker — WavyAssets Institutional Terminal

## Project Status

- **Current Phase**: Sprint 1 (Week 1) Preparation / Foundation Setup
- **Overall Roadmap**: 6-Week Sprints defined in `tools/Implementation Strategy And Timeline.pdf`

---

## 6-Sprint Roadmap Status

### [ ] Sprint 1 (Week 1): Foundation, Design Tokens, Theme Engine & i18n
- [x] Analyze `tools/` specifications, PDFs, and UI code prototypes.
- [x] Update `.ai/` system context and `GEMINI.md` governance files.
- [ ] Migrate `tools/UI/1 global/DESIGN.md` CSS custom properties into `src/index.css` (Obsidian Dark & Luxury Light palettes).
- [ ] Implement system-first theme detector, localStorage cache, and theme toggle control.
- [ ] Configure tabular figure formatting rules and currency formatters with ISO fallbacks.

### [ ] Sprint 2 (Week 2): Global Shell, 3D Ambient Mesh & Mega-Menu
- [ ] Mount fixed `GlobalHeader` with brand logo, nav anchors, theme toggle, and auth triggers.
- [ ] Build Three.js / React Three Fiber `AmbientCanvas` with kinetic cursor-following mesh.
- [ ] Construct 7-vertical `ServicesMegaMenu` with spring physics and 3D perspective hover tilt.

### [ ] Sprint 3 (Week 3): Interactive Portfolio Simulator & 3D Allocation Donut
- [ ] Build dual Radix Slider controls (Capital: $10k–$10M, Aggressiveness: 1–5).
- [ ] Implement real-time compounding return calculation engine with tabular monospaced outputs.
- [ ] Build 3D radial donut visualizer (`DonutChart3D`) with reactive segment animations.

### [ ] Sprint 4 (Week 4): Standardized Asset Panels & Hash-Routing Engine
- [ ] Build standardized `AssetContainer` frame with explicit min-height (540px) to guarantee CLS = 0.
- [ ] Implement client-side `# /services/:assetId` hash router with deep linking.
- [ ] Create lazy-loaded sub-view chunks for all 7 asset classes (Crypto, Stocks, AI Funds, Real Estate, VIP Cards, Cars, Wallet).
- [ ] Instrument view-switch telemetry and sub-50ms transition benchmark.

### [ ] Sprint 5 (Week 5): Trust Infrastructure, Unified Auth Modal & Regulatory Footer
- [ ] Construct root-mounted `UnifiedAuthModal` with Step 1 credentials and Step 2 6-digit Input-OTP.
- [ ] Implement `ClientVoices` social proof grid with specular highlights and Private Wealth vs. Institutional filter toggle.
- [ ] Assemble compliance-ready footer, multi-column sitemap, and regulatory legal disclaimers.

### [ ] Sprint 6 (Week 6): Performance Profiling, Hardening & Go-Live
- [ ] Implement WebGL render loop throttling on `document.hidden` and off-screen canvas culling.
- [ ] Audit WCAG accessibility, keyboard focus traps, and `prefers-reduced-motion` compliance.
- [ ] Optimize production bundles, verify sub-50ms swap latency, and run test suites.

---

## Completed Items

- Scaffolded React 19 + TypeScript + Vite 8 project.
- Configured Tailwind CSS v4 and initialized shadcn/ui primitives (`button`, `dialog`, `navigation-menu`, `skeleton`, `slider`).
- Installed `@react-three/fiber`, `@react-three/drei`, `three`, `framer-motion`, `lucide-react`, `zustand`, `input-otp`.
- Synthesized full platform requirements from `tools/` into `.ai/` and `GEMINI.md`.

---

## Next Up

- **Sprint 1 Task 1**: Update `src/index.css` with the full Sovereign Institutional Terminal design tokens from `tools/UI/1 global/DESIGN.md`.
- **Sprint 1 Task 2**: Create `src/store/useTerminalStore.ts` for theme, active tab, and modal state management.
