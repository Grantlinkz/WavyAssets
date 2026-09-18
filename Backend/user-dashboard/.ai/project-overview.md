# Project Overview — WavyAssets Sovereign User Dashboard Backend

## Overview

**WavyAssets Backend User Dashboard** (`Backend/user-dashboard`) is the sovereign financial core and transactional backbone of the WavyAssets wealth platform. While the public landing-page gateway (`Backend/landing-page` and `Frontend/landing-page`) provides client acquisition and initial authentication handoff, the user dashboard backend manages, orchestrates, and persists institutional portfolio operations across **all seven sovereign asset verticals**:

1. **Crypto Investment & Staking Yield** (`/api/v1/crypto`)
2. **Global Stocks & Pre-IPO Allocations** (`/api/v1/stocks`)
3. **AI Systematic & Quantitative Funds** (`/api/v1/ai-funds`)
4. **Tokenized Prime Real Estate** (`/api/v1/real-estate`)
5. **VIP Concierge & Collateral Metal Cards** (`/api/v1/vip-cards`)
6. **Exotic Vehicles & Horology Vault** (`/api/v1/cars`)
7. **Digital Custody, Sovereign Wallet & Double-Entry Ledger** (`/api/v1/wallet`)

The backend is engineered for **10,000 active institutional and retail accounts** with sub-30ms query latency for aggregate portfolio queries, sub-second WebSocket telemetry streaming, and uncompromising cryptographic guarantees.

---

## Goals

1. **Double-Entry Financial Integrity**: Maintain a mathematically rigorous ledger where every balance change across Available vs Invested capital, escrow, staking, and asset token holdings balances exactly ($\sum \text{Debits} + \sum \text{Credits} = 0$).
2. **Universal Command Bar Aggregation**: Provide a unified, sub-30ms aggregate endpoint (`GET /api/v1/dashboard/command-bar`) and real-time Socket.IO stream (`/ws/portfolio`) supplying consolidated net worth, 1D/1W/1M/1Y/ALL returns, 7-vertical allocation weights, and KYC tier limits.
3. **Seamless Authentication Handoff**: Safely validate and consume ephemeral single-use HMAC-SHA256 hashed handoff tickets issued by `Backend/landing-page` (`POST /api/v1/auth/exchange-ticket`), issuing short-lived access JWTs and rotating HttpOnly secure refresh tokens.
4. **Inviolable 48-Hour Quarantine Time-Lock**: Enforce a mandatory 48-hour freeze on any newly whitelisted external crypto wallet or bank wire IBAN destination, requiring 2-of-2 hardware key confirmation.
5. **Robust Two-Tier Error Handling**: Guard all API endpoints with code-based domain exceptions and a global exception filter, ensuring zero internal stack trace or database schema leakage to clients.
6. **Zero-Trust Security & Compliance**: Encrypt all sensitive data at rest (AES-256-GCM for card CVV/PIN and PII, Argon2id for passphrases, HMAC-SHA256 for tokens), enforce strict rate limiting, and log only redacted telemetry.

---

## 7 Core Asset Verticals

1. **Crypto Investment & Yield Aggregation** (`crypto`):
   - Multi-custody balance tracking (WavyAssets Cold Vault vs connected Web3 wallet vs Staking contracts).
   - Dynamic gas estimation preview (EIP-1559 base fee, priority fee, USD equivalent).
   - Automated Dollar-Cost Averaging (DCA) scheduler with cron execution.
   - Staking yield compounding engine.
   - FIFO/LIFO tax-lot CSV export.
2. **Global Stocks & Pre-IPO Allocations** (`stocks`):
   - Simulated/DMA Level-2 order book depth (top 10 bids/asks, spread, VWAP).
   - Active position tracking with DMA pricing, beta, and 52-week range.
   - Order placement engine supporting `MARKET`, `LIMIT`, and `STOP_LOSS` with balance reservation.
   - Dividend Re-Investment Plan (DRIP) manager and corporate action calendar.
3. **AI Systematic & Quantitative Funds** (`ai-funds`):
   - Quantitative performance telemetry (Sharpe ratio 3.12, Sortino 4.05, max drawdown, 1Y alpha).
   - Risk posture calibration (`preservation`, `balanced`, `high-vol`).
   - Immutable audit feed of algorithmic trading rationales and execution slippage.
   - GPU compute cluster (H100) yield tracking and claiming.
   - Emergency circuit breaker toggle to halt automated trading during extreme volatility.
4. **Tokenized Prime Real Estate** (`real-estate`):
   - Fractional property decks (Zurich Commercial, Mayfair Luxury Residences), valuations, token counts, and SPV links.
   - Rental dividend distribution ledger and cadence tracking.
   - Secondary P2P OTC bulletin board for fractional share trading with atomic settlement.
   - Signed document vault with time-limited pre-signed URLs for deeds and appraisal affidavits.
5. **Exotic Vehicles & Horology Vault** (`cars`):
   - Fractional and sole-title vehicle and timepiece portfolio (Ferrari 250 GT, Bugatti Chiron, Patek 5711).
   - Dynamic price tracking synchronized with Hagerty indices and auction benchmarks.
   - Bonded vault climate and security telemetry (Geneva FreePort, Zurich Vault).
   - Fleet rental monetization ledger and track day drive booking engine.
6. **VIP Concierge & Collateral Metal Cards** (`vip-cards`):
   - Card tier status (`Silver`, `Obsidian`, `Black Fiduciary`) and AUM progression metrics.
   - Card controls (instant freeze/unfreeze, spending limits, virtual/physical toggle).
   - WebAuthn/biometric-gated ephemeral 60-second CVV/PIN reveal.
   - Courier shipment tracking (FedEx/DHL API integration/mock).
7. **Digital Custody, Sovereign Wallet & Ledger** (`wallet`):
   - Available Balance (liquid cash, USDC/USDT) vs Invested Capital segregation.
   - Multi-stage fiat wire and crypto deposit/withdrawal state machine (`INITIATED` -> `PENDING_REVIEW` -> `SETTLED`).
   - Auto-sweep idle cash into institutional money market yield pots.
   - Instant multi-currency FX conversion with real-time zero-spread quote locking.

---

## System Boundaries & Scope

### In Scope
- NestJS 11 modular monolith with feature modules for each asset class, auth, compliance, security, and websockets.
- Prisma ORM with SQLite (local development) and PostgreSQL 16 (production deployment).
- Cross-domain handoff ticket exchange protocol with `Backend/landing-page`.
- REST API layer (`/api/v1/*`) with strict validation pipes and response transformers.
- WebSocket gateway (`/ws/portfolio`) for real-time net worth and ticker streaming.
- Double-entry ledger engine enforcing mathematical balance conservation.
- 48-Hour withdrawal whitelist quarantine engine.
- Comprehensive two-tier error handling (global filter and code-based exceptions).
- Unit and integration test suites in `Tests/UnitTest/` and `Tests/IntegrationTest/`.

### Out of Scope (Managed by Other Subsystems)
- Public marketing landing page UI (handled by `Frontend/landing-page`).
- Public user registration and initial credentials collection (handled by `Backend/landing-page`).
- User dashboard browser frontend (handled by `Frontend/user-dashboard`).
- External blockchain node infrastructure (handled via mocked or public RPC adapters).

---

## Service Level Agreements & Performance Metrics

1. **Sub-30ms Aggregation Latency**: `GET /api/v1/dashboard/command-bar` responds in under 30ms under typical loads.
2. **Sub-50ms View Hydration**: All vertical detail endpoints respond in under 50ms.
3. **Sub-Second WebSocket Telemetry**: Ticker updates and net worth ticks pushed within 1 second of market change (throttled to max 1 update / 1000ms per client).
4. **100% Ledger Balance Integrity**: Zero tolerance for unbalanced ledger entries ($\sum \text{Debits} + \sum \text{Credits} = 0$).
5. **Zero Stack Trace Leaks**: Zero unhandled 500 error responses leaking stack traces, database schema, or internal file paths to clients.
6. **100% Test Passing Rate**: All unit and integration test suites passing in CI/CD before any deployment.
