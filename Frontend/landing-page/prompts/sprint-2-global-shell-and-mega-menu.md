# Sprint 2 Implementation Prompt: Global Shell, 3D Ambient Canvas & Services Mega-Menu

## Unit Overview
- **Sprint**: Sprint 2 (Week 2)
- **Unit**: Global Institutional Shell, 3D Ambient Mesh Canvas & 7-Vertical Services Mega-Menu
- **Target Files**:
  - `src/components/canvas/AmbientCanvas.tsx` [NEW]
  - `src/components/nav/GlobalHeader.tsx` [NEW]
  - `src/components/nav/ServicesMegaMenu.tsx` [NEW]
  - `src/components/nav/CategoryFilter.tsx` [NEW]
  - `src/components/nav/MegaMenuDiagnostics.tsx` [NEW]
  - `src/store/useTerminalStore.ts` [MODIFY]
  - `src/App.tsx` [MODIFY]
  - `Tests/UnitTest/megaMenu.test.ts` [NEW]
  - `.ai/progress-tracker.md` [MODIFY]

---

## 1. Context & Specifications Reference
- **`tools/Implementation Strategy And Timeline.pdf`**: Sprint 2 milestones, GPU lifecycle guardrails, accessibility standards, and non-blocking WebGL requirements.
- **`tools/UI/2 aura_assets_expanded_services_mega_menu_deep_dive/code.html`**: Complete layout, typography, tags, category filter buttons, 7 asset verticals with diagnostic telemetry panel, Merkle proof status badges, and ESC dismissal hotkey.
- **`tools/UI/2 aura_assets_foundation_global_shell_terminal/code.html`**: Header navigation hierarchy, status chips (`TERMINAL ONLINE • SLA 99.999% • NYC / LON FIX`), action buttons (`Log In`, `Get Started`), and responsive drawer behaviors.
- **`GEMINI.md`**: Micro-chamfer geometry (`4px` / `0.25rem` default, `8px` / `0.5rem` for modals/flyouts, zero pill shapes >8px), Obsidian Dark (`#08090B`) / Luxury Light (`#f9f9ff`), `JetBrains Mono` tabular lining figures, sub-50ms panel swaps, and zero CLS.

---

## 2. Planned Changes & Implementation Steps

### A. Terminal Store Enhancement (`src/store/useTerminalStore.ts`)
- Add reactive mega-menu open/close state:
  - `isMegaMenuOpen: boolean`
  - `setMegaMenuOpen: (open: boolean) => void`
  - `toggleMegaMenu: () => void`
  - `megaMenuCategory: 'all' | 'liquid-digital' | 'dma-equities' | 'physical-vaults'`
  - `setMegaMenuCategory: (category: ...) => void`
- Ensure ESC key handling and hash change synchronization (`#/services/:assetId`) automatically update active state and close the menu.

### B. 3D Kinetic Ambient Canvas (`src/components/canvas/AmbientCanvas.tsx`)
- Implement a lightweight, elegant React Three Fiber + Three.js background canvas.
- Features:
  - Kinetic cursor-following geometry/points/wireframe grid with smooth lerp damping (`threejs-fundamentals`).
  - Decoupled from DOM interactions via `pointer-events-none fixed inset-0 z-0 opacity-40`.
  - **Clean WebGL Lifecycle**:
    - Explicit disposal of geometries, materials, and canvas context on component unmount.
    - Visibility throttling: listens to `document.addEventListener("visibilitychange")` and suspends/throttles the render loop when `document.hidden` is true.
  - **Accessibility**: Detects `prefers-reduced-motion` and falls back to a calm, static ambient gradient/mesh without continuous rotation.
  - Theme-reactive color adjustments (gold/emerald highlights on dark obsidian vs. subtle champagne/slate on luxury light).

### C. Institutional Global Header (`src/components/nav/GlobalHeader.tsx`)
- Fixed at the top (`sticky top-0 z-50 h-16 w-full backdrop-blur-xl border-b border-outline`).
- Header contents:
  - Left: Scalable vector `BrandLogo`, live latency indicator (`TERMINAL ONLINE • SLA 99.999% • NYC / LON FIX`), SECURED enclave status.
  - Center: Nav anchors (`Services` with toggle chevron and active indicator, `About`, `Client Voices`, `Contact`, `Research`).
  - Right: `ThemeToggle`, `Terminal Login` trigger (opens `UnifiedAuthModal` in login mode), and `Request Mandate` / `Get Started` trigger.
  - Mobile responsive hamburger toggle drawer.

### D. 7-Vertical Services Mega-Menu (`src/components/nav/ServicesMegaMenu.tsx`)
- Positioned docked directly underneath the header with backdrop blur and micro-chamfer borders (`rounded-md border border-outline-variant/40 shadow-2xl`).
- Built with Framer Motion spring physics animation (`opacity`, `y: -8` -> `y: 0`, `willChange: "transform, opacity"`).
- Structural Components:
  1. **Top Context Bar**:
     - Status pulse, title: `Sovereign Multi-Asset Custody & Execution Verticals`.
     - Enclave badges: `7 ACTIVE ENCLAVES`, `MERKLE PROOFS: HOURLY`, `FIPS 140-3 HSM VERIFIED`, `CROSS-MARGIN: 1:1 CONSOLIDATED`.
  2. **Category Filter Ribbon (`CategoryFilter.tsx`)**:
     - Filter tabs: `All Verticals (7)`, `Liquid Digital`, `DMA Equities`, `Physical Vaults`.
     - Hotkey cue: `PRESS ESC TO DISMISS`.
  3. **7 Sovereign Asset Cards**:
     - `crypto`: Crypto Yields & Cold Storage (+18.4% APY, MPC Multi-Sig, Basis Arbitrage)
     - `stocks`: Global Stocks & DMA (42 EXCHANGES, 0.04ms Equinix NY4)
     - `ai-funds`: AI Systematic Funds & H100 Mesh (12,400 H100s, 99.98% Utilization)
     - `real-estate`: Fractional Prime Real Estate (6.4% NET YIELD, Zurich Freehold & Manhattan Class-A)
     - `cars`: Exotic Hypercar & Horology Depots ($348M VAULTED, Freeport Audited)
     - `vip-cards`: VIP Titanium Concierge Cards ($5M Instant Line, 0% FX Overspread)
     - `wallet`: Sovereign Wallet & Core Global Finance (SWIFT, Fedwire, SEPA Instant, Merkle MPC - spans 2 columns)
     - Clicking any vertical calls `setActiveAssetId(id)`, updates URL hash `#/services/:id`, and dismisses mega-menu in <50ms.
  4. **Active Vertical Diagnostics Panel (`MegaMenuDiagnostics.tsx`)**:
     - Aggregated Collateral Capacity gauge ($1,248,500,000 avail, 62% allocated, 38% buffer).
     - Execution telemetry: Clearing latency (0.038ms), daily net sweeps (04:00 UTC), cross-margin ratio (100%).
     - Action triggers: `Download Asset Class Mandate`, `Launch Deep Simulator`, and `Direct Enclave API Docs`.
  5. **Footer Bar**:
     - SEC Custody Reg #801-128491, Zurich Freeport Vault Deposit audited, ESC dismiss prompt.

### E. App Integration & Layout (`src/App.tsx`)
- Mount `AmbientCanvas` in the background.
- Mount `GlobalHeader` and integrate `ServicesMegaMenu` overlay.
- Keep the live syndicate ticker stream below the header with smooth layout flow.
- Maintain Zero CLS (`min-height: 540px`).

### F. Unit & Integration Testing (`Tests/UnitTest/megaMenu.test.ts`)
- Unit test coverage:
  - Mega-menu open/close state machine transitions in Zustand.
  - Category filter filtering logic for the 7 asset verticals.
  - Keyboard listener test: pressing `Escape` triggers close.
  - Hash navigation sync: selecting an asset updates active ID and hash.
- Run `tsc -b`, `npm run lint`, and Vitest (`npm test`).

---

## 3. Acceptance Criteria
1. **Visual Fidelity & Micro-Chamfer**: Adheres strictly to `tools/UI/2 aura_assets_expanded_services_mega_menu_deep_dive/code.html` and `GEMINI.md` (4px/8px micro-chamfers, no rounded pills >8px).
2. **WebGL Decoupling & Lifecycle**: `AmbientCanvas` renders non-blockingly, disposes buffers/geometries on unmount, and throttles when `document.hidden`.
3. **Accessibility**: Full keyboard support (ESC closes, Tab navigation works) and `prefers-reduced-motion` compliance.
4. **Sub-50ms Transition**: Asset selection instantly triggers hash change and closes the menu seamlessly.
5. **Quality Gates**: All Vitest unit tests pass; TypeScript compiles with 0 errors (`tsc -b`); ESLint clean.
