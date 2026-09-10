# WavyAssets — Sovereign Multi-Asset Institutional Platform

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-black?logo=three.js)](https://threejs.org/)
[![Vitest](https://img.shields.io/badge/Tests-113%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel_Ready-black?logo=vercel)](https://vercel.com)

> **WavyAssets Institutional Terminal**  
> High-discretion sovereign digital wealth management, institutional custody, and multi-asset orchestration across 7 asset verticals.

---

## 1. Platform Overview

**WavyAssets** is an institutional-grade financial operating environment engineered for sovereign individuals, family offices, and high-net-worth institutional allocators. The platform unites Swiss typographic discipline, physical vault security paradigms, and low-latency financial terminal ergonomics to orchestrate capital across physical, digital, and systematic asset classes.

### The 7 Core Asset Verticals
1. **Crypto Investment & Yield Aggregation** (`crypto`): Institutional Bitcoin and Ethereum staking strategies with automated downside protection and multi-signature offline cold storage.
2. **Global Stocks & Pre-IPO Allocations** (`stocks`): Secondary private equity opportunities (SpaceX, Stripe, OpenAI) and direct market equity trading across 42 global exchanges.
3. **AI Systematic & Quantitative Funds** (`ai-funds`): Autonomous algorithmic trading and yield harvesting powered by dedicated GPU compute clusters with 100% automated execution.
4. **Tokenized Prime Real Estate** (`real-estate`): Direct fractional access to prime commercial office towers, industrial logistics centers, and multi-family residential holdings.
5. **VIP Concierge & Collateral Metal Cards** (`vip-cards`): Custom-minted obsidian metal charge cards backed by sovereign multi-currency digital balances with 0% foreign transaction fees.
6. **Exotic Vehicles & Horology Vault** (`cars`): Physical vault custody and fractional investment in provenance-verified rare supercars, classic automobiles, and horology pieces.
7. **Digital Custody & Multi-Sig MPC Wallet** (`wallet`): Institutional multi-party computation (MPC) cold storage with Merkle-tree cryptographic proof of reserves.

---

## 2. Repository Structure

```
WavyAssets/ (Git Root)
├── Frontend/
│   └── landing-page/                 # Sovereign Institutional Terminal Frontend
│       ├── public/                   # Static assets, robots.txt, sitemap.xml, favicon
│       ├── src/
│       │   ├── assets/               # Videos, testimonial portraits, media
│       │   ├── components/           # UI, 3D canvases, navigation, simulator, panels
│       │   ├── lib/                  # Formatters, mathematical calculator, locale
│       │   ├── store/                # Zustand global terminal store
│       │   ├── App.tsx               # Root command deck
│       │   └── index.css             # Tailwind v4 custom properties & theme engine
│       ├── Tests/                    # 113 automated unit & integration tests
│       ├── prompts/                  # Implementation prompt history
│       ├── tools/                    # Single source of truth specifications & designs
│       ├── vercel.json               # Vercel deployment & security headers configuration
│       └── vite.config.ts            # Vite 8 config with vendor chunk splitting
└── README.md                         # Monorepo architecture & platform documentation
```

---

## 3. Technology Stack

- **Framework & Runtime**: React 19 + Vite 8 + TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) + `tw-animate-css`
- **Design Tokens**: Obsidian Dark (`#08090B`) & Luxury Light (`#F9F9FF`), 4px micro-chamfers (0 pills >8px)
- **Component Primitives**: shadcn/ui on top of Radix UI (`dialog`, `slider`, `navigation-menu`, `skeleton`, `input-otp`, `button`)
- **3D & WebGL**: Three.js (`0.185`) + React Three Fiber (`9.7`) + Drei (`10.7`)
- **Physics & Motion**: Framer Motion (`13.2`) with `useReducedMotion()` fallbacks
- **State Management**: Zustand (`5.0`) with localStorage sync and hash routing engine
- **Typography**: `Noto Serif` (editorial headers & UX narrative), `Inter` & `JetBrains Mono` with `tabular-nums`
- **Testing Engine**: Vitest 5.0 + React Testing Library + jsdom (113 passing tests across 20 suites)

---

## 4. Engineering Invariants & Quality Standards

1. **Sub-50ms View Swaps**: Dynamic asset sub-views switch in under 50ms via client-side hash routing (`#/services/:assetId`).
2. **Zero Cumulative Layout Shift (CLS)**: Pre-dimensioned skeleton loaders (`min-height: 540px`) eliminate layout shifts during asset transitions.
3. **Deterministic WebGL Lifecycle**: Explicit GPU resource deallocation (`geometry.dispose()`, `material.dispose()`) and render-loop throttling on `document.hidden` and off-screen viewport culling.
4. **Information Density without Sensory Fatigue**: Strict 4px/8px micro-chamfer boundaries; no generic consumer pill shapes.
5. **Security & Redacted Logging**: Zero PII, credential, or token leakage in logs; client error boundaries prevent stack exposure.
6. **Strict Content Security Policy**: Prohibits `unsafe-eval` and unauthorized script injection.

---

## 5. Development & Testing Workflow

```bash
# 1. Navigate to the landing page directory
cd Frontend/landing-page

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Run automated test suite (113 tests)
npm test

# 5. Run linter
npm run lint

# 6. Typecheck and build production bundle
npm run build
```

---

## 6. Production Deployment (Vercel)

The repository includes complete production deployment automation in [`Frontend/landing-page/vercel.json`](Frontend/landing-page/vercel.json):

1. Import the repository in [vercel.com](https://vercel.com).
2. Set **Root Directory** to `Frontend/landing-page`.
3. Framework Preset: `Vite`.
4. Click **Deploy**.

- **SPA Rewrites**: `/(.*) -> /index.html` prevents 404 errors on deep-links and hash routes.
- **Security Headers**: Automatic HSTS, strict CSP without `unsafe-eval`, X-Frame-Options DENY, and nosniff.
- **CDN Caching**: Static chunks cached with 1-year immutable headers.
- **Crawler Indexing**: `public/robots.txt` and `public/sitemap.xml` automatically served at domain root.

---

## 7. Security, Compliance & License

- **Security Audits**: Architecture aligns with SOC-2 Type II controls and MPC zero-knowledge proof of reserves.
- **Strict Data Sanitization**: All institutional mandating and auth OTP interactions execute within isolated memory boundaries.
- **Proprietary**: © WavyAssets Sovereign Institutional Terminal. All rights reserved.