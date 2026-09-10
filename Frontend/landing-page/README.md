# WavyAssets — Sovereign Multi-Asset Institutional Terminal

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-black?logo=three.js)](https://threejs.org/)
[![Vitest](https://img.shields.io/badge/Tests-113%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel_Ready-black?logo=vercel)](https://vercel.com)

> Sovereign multi-asset wealth management and institutional digital custody terminal, built to serve family offices, sovereign individuals, and high-net-worth institutional allocators.

---

## 1. Platform Overview

**WavyAssets** unifies sovereign digital asset custody, institutional yield generation, and cross-asset management into a single, high-performance financial command deck. Designed with Swiss typographic discipline and physical vault security principles, the terminal eliminates fragmented wealth management tools.

### The 7 Core Asset Verticals
1. **Crypto Staking & Yields** (`crypto`): Institutional Bitcoin and Ethereum staking strategies with automated downside protection and multi-signature offline cold storage.
2. **Global Stocks & Pre-IPO Shares** (`stocks`): Secondary private equity opportunities (SpaceX, Stripe, OpenAI) and direct market equity trading across 42 global exchanges.
3. **AI Quantitative Funds** (`ai-funds`): Autonomous algorithmic trading and yield harvesting powered by dedicated GPU compute clusters with 100% automated execution.
4. **Tokenized Prime Real Estate** (`real-estate`): Direct fractional access to prime commercial office towers, industrial logistics centers, and multi-family residential assets.
5. **Titanium Concierge Cards** (`vip-cards`): Custom-minted obsidian metal charge cards backed by sovereign multi-currency digital balances with 0% foreign transaction fees.
6. **Exotic Vehicles & Horology** (`cars`): Physical vault custody and fractional investment in provenance-verified rare supercars, classic automobiles, and horology pieces.
7. **Sovereign Multi-Sig Wallet** (`wallet`): Military-grade MPC (Multi-Party Computation) cold storage with Merkle-tree cryptographic proof of reserves.

---

## 2. Key Interactive Features

- **3D Kinetic Visualizers**:
  - **Orbital Asset Gyroscope** (`HeroAssetGyroscope.tsx`): Real-time multi-layered orbital gyroscope representing the 7 asset tiers with cursor parallax and off-screen rendering culling (`IntersectionObserver`).
  - **3D Unified Finance Infographic** (`UnifiedFinanceInfographic3D.tsx`): Expansive visualization linking the multi-asset currency globe with the cold-storage vault shield via streaming photon conduits.
  - **3D Reactive Donut** (`DonutChart3D.tsx`): Interactive radial asset breakdown reflecting dynamic mathematical portfolio allocations.
- **Opposing Kinematic Portfolio Simulator**:
  - Dual slider controls ($50,000 to $10,000,000 capital, 3 aggressiveness tiers: Capital Preservation, Balanced Growth, Maximum Alpha).
  - High-frequency rolling counters (`AnimatedNumber.tsx`) with zero Cumulative Layout Shift (CLS).
- **Sub-50ms Panel Swaps & Zero CLS**:
  - Instantaneous client-side hash routing (`#/services/:assetId`) across all 7 asset sub-views with pre-dimensioned `min-h-[540px]` containers.
- **Continuous Syndicate Ticker**:
  - Seamlessly translating rate ticker bar streaming real-time rates (BTC/USD, ETH/USD, SPX 500, GPU Compute yield, 10Y Sovereign).
- **Two-Step Institutional 2FA Auth**:
  - Client credentials modal with seamless step-2 6-digit `input-otp` security verification.
- **Sovereign Custom 404 Depository**:
  - Sanitized diagnostic recovery screen (`NotFoundPage.tsx`) with instant recovery routing.
- **Root Error Boundary**:
  - Institutional fail-safe (`TerminalErrorBoundary.tsx`) preventing stack trace or credential leakage.

---

## 3. Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Runtime & Build** | React 19, TypeScript 6 (Strict Mode), Vite 8 |
| **Styling & Tokens** | Tailwind CSS v4, `tw-animate-css`, Obsidian Dark (`#08090B`) & Luxury Light (`#F9F9FF`) |
| **UI Primitives** | Radix UI (`dialog`, `slider`, `navigation-menu`, `skeleton`, `input-otp`) + shadcn/ui |
| **3D & WebGL** | Three.js (0.185), React Three Fiber (9.7), Drei (10.7) |
| **Animation Engine** | Framer Motion (13.2) with GPU-accelerated transforms and `useReducedMotion()` fallbacks |
| **State Management** | Zustand 5.0 (system theme sync, hash routing, modal states) |
| **Typography** | `Noto Serif` (editorial headers & UX narrative), `Inter` & `JetBrains Mono` with `tabular-nums` |
| **Testing** | Vitest 5.0 + React Testing Library + jsdom (113 automated tests across 20 suites) |

---

## 4. Engineering Invariants & Security Guardrails

1. **Sub-50ms Panel Transitions**: Dynamic asset switches occur in `<50ms` via client-side hash state without full-page reloads.
2. **Zero Cumulative Layout Shift (CLS)**: The `AssetContainer` enforces an explicit `min-height: 540px` and uses pre-dimensioned skeleton loaders.
3. **Clean WebGL Lifecycle**:
   - Geometries, materials, and textures are explicitly disposed of on component unmount.
   - Render loops throttle or halt when browser tabs are blurred (`document.hidden`) or scrolled off-screen.
4. **WCAG 2.1 AA Accessibility**:
   - `#main-content` skip-to-content keyboard bypass.
   - Screen reader ARIA live regions for route and state announcements.
   - Full support for `prefers-reduced-motion` across all 3D canvases and ticker marquees.
5. **No Secret or Credential Leaks**:
   - Root error boundary isolates rendering faults with sanitized institutional messages, redacting internal stack traces.
   - Content Security Policy in `vercel.json` strictly forbids `unsafe-eval`.

---

## 5. Local Development & Testing

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+`

### Setup & Run

```bash
# Navigate to landing-page directory
cd Frontend/landing-page

# Install dependencies
npm install

# Start local development server
npm run dev

# Run automated Vitest test suite (113 tests)
npm test

# Run code linter
npm run lint

# Build production bundle with vendor code splitting
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Production Deployment (Vercel)

This application is fully optimized for **Vercel** with zero configuration required:

- **`vercel.json`**:
  - SPA catch-all rewrites (`/(.*) -> /index.html`) guaranteeing deep links and 404 pages never fail on browser reload.
  - Institutional security headers (strict CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
  - 1-year immutable caching on static assets (`/assets/*`).
- **Crawler Directives**:
  - `public/robots.txt` and `public/sitemap.xml` automatically served from the root.
- **Vendor Code Splitting**:
  - Pre-configured Rollup manual chunks in `vite.config.ts` (`three-vendor`, `motion-vendor`, `radix-vendor`, `react-vendor`) ensuring initial entry chunk is only **328 kB**.

### Quick Deploy via Vercel Dashboard
1. Push to GitHub: `git push origin Public-Landing-Page`
2. Import repository in [vercel.com](https://vercel.com)
3. Set **Root Directory** to `Frontend/landing-page`
4. Framework Preset: `Vite`
5. Click **Deploy**

---

## 7. License & Rights

© WavyAssets Sovereign Institutional Terminal. All rights reserved.
