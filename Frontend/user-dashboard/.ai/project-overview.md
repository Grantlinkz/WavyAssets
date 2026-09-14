# Project Overview — WavyAssets Sovereign Institutional User Dashboard

## Overview

The **WavyAssets User Dashboard** (`Frontend/user-dashboard`) is the authenticated sovereign financial command terminal of the WavyAssets wealth platform. While the public landing page (`Frontend/landing-page`) establishes brand authority and initiates client onboarding, the User Dashboard delivers low-latency portfolio orchestration, digital custody management, and trade execution across **all seven sovereign asset verticals**:

1. **Crypto Investment & Yield Aggregation** (`crypto`): Spot holdings, sovereign MPC vs Web3 connected wallets, automated DCA scheduler, staking telemetry & tax-lot export.
2. **Global Stocks & Pre-IPO Allocations** (`stocks`): Direct Market Access (DMA) Level-2 order book, position analytics (VWAP, Beta), active orders, pre/post-market pricing.
3. **AI Systematic & Quantitative Funds** (`ai-funds`): Risk profile calibrator, algorithmic strategy performance (Sharpe, Sortino, max drawdown), audit-grade execution rationale log, emergency freeze circuit breaker.
4. **Tokenized Prime Real Estate** (`real-estate`): SPV performance decks, fractional token counts, monthly rental distribution tracker, occupancy SLA, secondary P2P order book.
5. **Exotic Vehicles & Horology Vault** (`cars`): Asset portfolio cards, Hagerty benchmark valuation index, bonded vault physical logistics (Geneva FreePort, Zurich, London), drive booking calendar, cryptographic provenance logs.
6. **VIP Concierge & Collateral Metal Cards** (`vip-cards`): 3D Obsidian metal card visualizer, virtual/physical toggles, spend limits, biometric/WebAuthn reveal for CVV/PIN, concierge launcher.
7. **Digital Custody & Multi-Sig MPC Wallet** (`wallet`): Unified ledger with Available vs Invested capital split, fiat on/off-ramp stepper, auto-sweep idle cash into 5.2% institutional money market funds, cross-currency FX converter, automated tax statements.

The interface merges Swiss typographic rigor (`Noto Serif`), high-contrast financial data tables (`Inter` with tabular figures), precision 2px–4px micro-chamfers, and Obsidian Dark / Luxury Light parity.

---

## Goals & Primary Invariants

1. **Sub-50ms View Swapping**: Instant, seamless transitions across all asset verticals and command views without full page reloads.
2. **Zero Cumulative Layout Shift (CLS)**: Pre-dimensioned skeleton loaders (`min-height: 540px`) and tabular lining figures across all real-time feeds to prevent layout jitter.
3. **Obsidian Dark & Luxury Light Parity**: Instrument-grade financial terminal aesthetics abiding strictly by the 4px micro-chamfer token system (zero generic consumer pill buttons > 8px).
4. **Zero-Trust Security Ergonomics**:
   - One-click PII and balance masking (`maskBalances` privacy toggle) rendering values as `••••••••` for public display.
   - Biometric and hardware WebAuthn (FIDO2 / YubiKey) triggers for high-risk operations (card PIN/CVV reveal, high-value transfers).
   - Inviolable 24-to-48 hour security lock on newly registered withdrawal addresses.
5. **Consolidated Portfolio Orchestration**: Universal Global Command Bar aggregating multi-asset net worth, dynamic 24h/all-time P&L deltas, interactive 3D radial allocation donut, and rapid execution action rails.

---

## Session Lifecycle & Auth Handoff Architecture

The user dashboard operates in tight coordination with `Frontend/landing-page` (port `5173`) and the backend gateway (port `4000`):

1. **Authentication on Marketing Site**: User completes email / OTP verification on the landing page.
2. **Handoff Ticket Generation**: Backend generates a single-use, deterministic HMAC-SHA256 hashed handoff ticket and redirects to:  
   `http://localhost:5174/auth/callback?ticket=<handoffTicket>`
3. **Ticket Exchange**: Dashboard client exchanges the ticket via `POST /api/v1/auth/exchange-ticket`.
4. **Session Establishment**: Backend burns the ticket, issues a 15-minute access JWT, and sets an HttpOnly refresh cookie. The client initializes `useAuthStore` with user identity, tier (`RETAIL`, `PRIVATE_WEALTH`, `INSTITUTIONAL`), and permissions.

---

## Scope & Functional Areas

### In Scope (6-Sprint Implementation Roadmap)

- **Sprint 1: Foundation, Shell & Auth Handoff**: Vite 8 + React 19 setup, Tailwind v4 design tokens, `/auth/callback` ticket exchange, sidebar navigation, and Vitest suite.
- **Sprint 2: Global Command Bar & 3D Allocation Engine**: Consolidated Net Worth, 24h / All-time P&L with timeframe selectors, 3D radial allocation donut visualizer (Three.js / Drei), privacy toggle (`maskBalances`), and action rail modal launchers.
- **Sprint 3: Liquid Asset Modules**: Live Crypto module (holdings, custody separation, DCA, staking), Stocks module (DMA order book, positions, execution hub), Unified Wallet module (Available vs Invested ledger, fiat ramp, cash sweep).
- **Sprint 4: Alternative Asset Modules**: AI Systematic Funds (Sharpe gauges, rationale feed, circuit breaker), Tokenized Real Estate (SPV decks, rental tracker, P2P secondary board), Exotic Cars & Horology (Hagerty valuation, drive booking, vault telemetry).
- **Sprint 5: VIP Cards, Compliance & Security Command Center**: 3D Obsidian card visualizer with biometric gate, Tiered KYC/AML tracker, Unified Tax Pack generator (Form 8949 / Schedule D), Security Command Center (device sessions, 24-48h address whitelist lock).
- **Sprint 6: Performance Optimization, Hardening & Enterprise Deployment**: Sub-50ms benchmark audit, WebGL frame throttling on blur, Docker multi-stage build + Nginx Alpine static server, full test suite verification.

### Out of Scope (Client Frontend Boundary)

- Backend core database operations or Prisma migrations (consumed via REST & WebSocket APIs).
- Direct on-chain node validation or physical vault robotic management (simulated telemetry and audit feeds are provided via the API layer).

---

## Success Criteria & SLAs

1. **Sub-50ms View Swaps**: Panel switches between asset verticals execute in under 50ms without page reloads.
2. **CLS = 0**: Pre-dimensioned skeleton containers preserve exact geometry during asset data loading.
3. **60 FPS Graphics with GPU Cleanup**: All Three.js canvases cleanly deallocate memory (`.dispose()`) on unmount and throttle down to 5–10 FPS when the browser tab is hidden.
4. **Strict Security Compliance**: Zero plaintext secrets or sensitive tokens in client logs or local storage; mandatory biometric triggers for high-risk actions.
5. **100% Passing Test Suites**: Comprehensive unit and integration test coverage across all calculations, stores, formatters, and module interactions in `Tests/UnitTest/` and `Tests/IntegrationTest/`.
