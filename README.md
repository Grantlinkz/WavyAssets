# WavyAssets — Sovereign Institutional Platform

> **Valiance / Aura Assets Institutional Terminal**  
> High-discretion sovereign digital wealth management, institutional custody, and multi-asset orchestration across 7 asset verticals.

---

## 1. Platform Overview

**WavyAssets** is an institutional-grade financial operating environment engineered for sovereign individuals, family offices, and high-net-worth institutional allocators. The platform marries Swiss typographic precision, physical vault security paradigms, and low-latency financial terminal ergonomics to orchestrate capital across physical, digital, and systematic asset classes.

### The 7 Core Asset Verticals
1. **Crypto Investment & Yield Aggregation** (`crypto`): Sovereign staking yields, multi-chain settlement arbitrage, and fiduciary risk matrix models.
2. **Global Stocks & Pre-IPO Allocations** (`stocks`): Direct Market Access (0.03ms DMA latency) and pre-IPO liquidity pools across 42 global exchanges.
3. **AI Systematic & Quantitative Funds** (`ai-funds`): Algorithmic multi-factor alpha strategies, dynamic delta rebalancing, and live Sharpe ratio tracking.
4. **Tokenized Prime Real Estate** (`real-estate`): Fractional prime commercial and luxury residential holdings with immutable deed registries.
5. **VIP Concierge & Collateral Metal Cards** (`vip-cards`): Obsidian metal debit/charge cards backed by multi-currency crypto treasury balances with 0% FX spread.
6. **Exotic Vehicles & Horology Vault** (`cars`): Provenance-verified exotic vehicles, museum-grade timepieces, and reserve bid mechanics.
7. **Digital Custody & Multi-Sig MPC Wallet** (`wallet`): Institutional multi-party computation (MPC) cold storage with Merkle-tree cryptographic proof of reserves.

---

## 2. Repository Branch Architecture & Separation

This repository employs a strict branch-segregated architecture to decouple public presentation, authenticated client workspaces, and infrastructure:

```
wavyassets/ (Git Root)
├── [main]                 # Sovereign platform root, governance, specifications & monorepo orchestration
└── [Public-Landing-Page]  # Independent branch containing Frontend/landing-page (React 19 + Vite 8 + Three.js)
```

| Branch | Purpose | Scope |
| :--- | :--- | :--- |
| **`main`** | **Platform Core & Architecture** | Canonical documentation, architectural blueprints, sprint roadmaps, and monorepo governance. |
| **`Public-Landing-Page`** | **Public Terminal Frontend** | High-performance institutional landing page (`Frontend/landing-page`) featuring 3D WebGL ambient mesh, interactive simulator, and sub-50ms panel swaps. |

> [!IMPORTANT]
> The `main` branch maintains strict isolation from the public landing page application files. Landing page development, client bundles, and dependencies reside exclusively on the `Public-Landing-Page` branch.

---

## 3. Technology Stack (Institutional Terminal)

- **Framework & Runtime**: React 19 + Vite 8 + TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) + `tw-animate-css`
- **Design Tokens**: Obsidian Dark (`#08090B`) & Luxury Light (`#F9F9FF`), 4px micro-chamfers (0 pills >8px)
- **Component Primitives**: shadcn/ui on top of Radix UI (`dialog`, `slider`, `navigation-menu`, `skeleton`, `input-otp`, `button`)
- **3D & WebGL**: Three.js (`0.185`) + React Three Fiber (`9.7`) + Drei (`10.7`)
- **Physics & Motion**: Framer Motion (`13.2`)
- **State Management**: Zustand (`5.0`)
- **Typography**: `Inter` (structural navigation) and `JetBrains Mono` (tabular financial figures)
- **Testing**: Vitest + jsdom

---

## 4. Engineering Invariants & Quality Standards

1. **Sub-50ms View Swaps**: Dynamic asset sub-views switch in under 50ms via client-side hash routing (`#/services/:assetId`).
2. **Zero Cumulative Layout Shift (CLS)**: Pre-dimensioned skeleton loaders (`min-height: 540px`) eliminate layout shifts during asset transitions.
3. **Deterministic WebGL Lifecycle**: Explicit GPU resource deallocation (`geometry.dispose()`, `material.dispose()`) and render-loop throttling on `document.hidden`.
4. **Information Density without Sensory Fatigue**: Strict 4px/8px micro-chamfer boundaries; no generic consumer pill shapes.
5. **Security & Redacted Logging**: Zero PII, credential, or token leakage in logs; client error boundaries prevent stack exposure.

---

## 5. Development & Contribution Workflow

To work on the public landing page terminal:

```bash
# 1. Switch to the dedicated landing page branch
git checkout Public-Landing-Page

# 2. Navigate to the application directory
cd Frontend/landing-page

# 3. Install dependencies
npm install

# 4. Start local development terminal
npm run dev

# 5. Run test suite
npm test

# 6. Typecheck and build
npm run build
```

---

## 6. Security, Compliance & License

- **Security Audits**: Architecture aligns with SOC-2 Type II controls and MPC zero-knowledge proof of reserves.
- **Strict Data Sanitization**: All institutional mandating and auth OTP interactions execute within isolated memory boundaries.
- **Proprietary**: © WavyAssets / Valiance Institutional. All rights reserved.