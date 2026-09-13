# Project Overview — WavyAssets (WavyAssets / Aura Institutional Terminal)

## Overview

**WavyAssets** (branded as **WavyAssets** / **WavyAssetss Institutional Terminal**) is a high-discretion, sovereign digital wealth management and institutional custody platform. It provides sovereign individuals, family offices, and high-net-worth investors with an institutional-grade command terminal to monitor, allocate, and manage capital across 7 distinct asset classes: **Crypto & Staking Yield**, **Global Stocks & Pre-IPO**, **AI Systematic Funds**, **Real Estate**, **VIP Concierge Cards**, **Exotic Cars & Horology**, and **Digital Custody/Wallet**.

The platform merges Swiss typographic rigor, physical vault aesthetics, and ultra-high-performance financial terminal ergonomics, featuring real-time WebGL/Three.js 3D visualizers, client-side sub-50ms hash routing, and an interactive portfolio returns simulator.

---

## Goals

1. **Sub-50ms Dynamic Asset Swapping**: Deliver seamless client-side switching between all 7 asset classes via bookmarkable URLs (`#/services/:assetId`) with zero Cumulative Layout Shift (CLS) using skeleton screens.
2. **Interactive Capital Allocation Simulator**: Engage users with real-time portfolio modeling using dual-slider inputs (Capital: $10k–$10M, Aggressiveness: 1–5) synced to an interactive 3D radial allocation donut visualizer.
3. **High-Conversion Institutional Onboarding**: Guide prospective clients through a low-friction 2-step registration funnel featuring segmented 6-digit OTP two-factor verification powered by shadcn/ui Dialog and Input-OTP.
4. **Sovereign Trust & Institutional Verification**: Establish credibility via audited metrics (SOC2 Type II, Merkle-tree MPC Proof of Reserves), segmented Retail/Private Wealth vs. Institutional filter switches, and regulatory disclosures.
5. **Zero Sensory Fatigue & Uncompromised Performance**: Maintain 60 FPS across Obsidian Dark and Luxury Light modes, with automatic WebGL loop throttling, low-power GPU fallbacks, and WCAG accessibility compliance.

---

## Core User Flow

1. **Terminal Discovery & Brand Impression**: The user lands on the terminal, experiencing the ambient 3D cursor-reactive WebGL mesh, real-time monitored AUM ticker ($4.82B+), and key value propositions.
2. **Services Exploration via Mega-Menu**: The user accesses the fixed header navigation, hovering over "Services" to trigger the 7-vertical mega-menu with 3D perspective hover tilts and instant prefetch.
3. **Deep-Dive Sub-View Analysis**: Selecting an asset vertical (e.g., Crypto, AI Systematic, Real Estate) routes to `#/services/:id` in under 50ms without a page reload, displaying real-time metrics, risk models, and asset inventories.
4. **Interactive Returns Simulation**: The user interacts with the Discovery Hub, tuning capital allocation and risk profile sliders to compute real-time compound returns and inspect dynamic asset distributions on the 3D radial donut.
5. **Trust Verification**: The user reviews audited institutional track records, toggles between Private Wealth and Institutional verification tiers, and inspects regulatory credentials.
6. **Institutional Registration (Auth Modal)**: Triggered from any primary CTA, the root-mounted auth modal opens (<200ms), guides the client through Step 1 (credentials/KYC tier) and Step 2 (6-digit 2FA OTP), completing the initial conversion funnel.

---

## 7 Core Asset Verticals

1. **Institutional Crypto & Yield Aggregation** (`crypto`): Sovereign custody staking, multi-chain settlement arbitrage, execution mesh, and fiduciary risk matrix.
2. **Global Stocks & Pre-IPO Allocations** (`stocks`): Direct Market Access (0.03ms DMA latency), order book depth, and pre-IPO liquidity pools across 42 global exchanges.
3. **AI Systematic & Quantitative Funds** (`ai-funds`): Algorithmic multi-factor alpha models, automated delta rebalancing, and live Sharpe ratio tracking.
4. **Tokenized Real Estate & Infrastructure** (`real-estate`): Fractional prime commercial & luxury residential properties, deed registries, and net rental yields.
5. **VIP Concierge & Collateral Metal Cards** (`vip-cards`): Obsidian metal debit/charge cards backed by multi-currency crypto treasury balances with 0% FX spread.
6. **Exotic Vehicles & Horology Vault** (`cars`): Physical vehicle inventory, museum-grade timepieces, provenance certification, and reserve bid mechanics.
7. **Digital Custody, Wallet & Multi-Sig Vault** (`wallet`): Institutional multi-party computation (MPC) cold storage, zero-gas internal routing, and cryptographic proof of reserves.

---

## Scope

### In Scope

- Client-side routed Single Page Application (SPA) using React 19, TypeScript, and Vite 8.
- Full responsive implementation of the 4 core phases:
  - **Phase 1**: Global Header, 7-Vertical Mega-Menu, Ambient 3D Canvas, Hero Section, Live Metric Strips, and 2-Step Auth Modal (Radix Dialog + Input-OTP).
  - **Phase 2**: Interactive Portfolio Returns Simulator (Dual Radix Sliders + real-time compounding logic) and 3D Radial Allocation Donut Chart.
  - **Phase 3**: Standardized Asset Panel Container with hash-routing (`#/services/:assetId`), skeleton loaders, and 7 vertical sub-views.
  - **Phase 4**: Trust Infrastructure (Private Wealth vs. Institutional mode toggle, specular audit cards, compliance-ready global footer with sitemap and newsletter capture).
- Full Obsidian Dark and Luxury Light mode theme switching with system detection and persistence.
- High-density financial typography using `Noto Serif` and `Inter`.

### Out of Scope (Landing Page Phase)

- Live backend trade execution or settlement engine (simulated/mocked metrics and real-time feeds are used).
- Actual bank wire / ACH fiat payment processing (onboarding captures intents and KYC tier).
- Full user account management dashboard (handled in separate application portal).

---

## Success Criteria & SLAs

1. **Sub-50ms View Swaps**: Panel switches between asset verticals occur in under 50ms with zero page reload.
2. **Sub-100ms Menu Response**: Services mega-menu opens and responds in under 100ms.
3. **Sub-200ms Auth Modal Load**: Auth modal renders and traps focus within 200ms of trigger.
4. **Zero Cumulative Layout Shift (CLS)**: Skeleton containers preserve exact viewport geometry during asset loads.
5. **60 FPS Animation & GPU Lifecycle**: Three.js WebGL rendering throttles automatically when tab is blurred or scrolled out of view, with complete geometry/texture memory deallocation on unmount.
6. **100% WCAG Accessibility**: Full keyboard navigability, focus trapping, and `prefers-reduced-motion` compliance across both light and dark themes.
