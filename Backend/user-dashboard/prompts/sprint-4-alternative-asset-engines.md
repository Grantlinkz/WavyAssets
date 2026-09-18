# Implementation Prompt — Sprint 4: Alternative Asset Engines (AI Funds, Real Estate & Exotic Cars)

**Target Sprint:** Sprint 4  
**Architecture Reference:** [`tools/IMPLEMENTATION_STRATEGY.md`](tools/IMPLEMENTATION_STRATEGY.md) (Sections 5.3, 5.4, 5.5)  
**System Governance:** [`GEMINI.md`](GEMINI.md)  
**UI Contract Reference:** [`.ai/ui-context.md`](.ai/ui-context.md)  

---

## 1. Objectives & Deliverables

1. **AI Systematic & Quantitative Funds Engine (`src/modules/ai-funds/`)**:
   - `ai-funds.controller.ts`, `ai-funds.service.ts`, `dto/ai-funds.dto.ts`, `ai-funds.module.ts`:
     - `GET /api/v1/ai-funds/metrics`: Live quantitative telemetry (Sharpe ratio 3.12, Sortino 4.05, max drawdown -4.2%, 1-year alpha vs S&P 500, win rate 68.4%, 99% daily VaR, portfolio beta).
     - `POST /api/v1/ai-funds/risk-tier`: Calibrates strategy aggression (`preservation`, `balanced`, `high-vol`). Updates `AiFundPosition.strategyTier` with historical benchmark comparisons.
     - `GET /api/v1/ai-funds/rationale-feed`: Scannable immutable audit log of algorithmic execution decisions (`AiRationaleLog`) with strategy identifier, action type (`REBALANCE`, `HEDGE`, `ARBITRAGE`), asset symbol, reasoning, confidence score, and execution slippage in bps.
     - `GET /api/v1/ai-funds/compute-yield`: Live cluster telemetry (H100 GPU cluster 94.8% utilization, 128 nodes online, 99.98% uptime, hashrate/TFLOPs), and user's accrued and claimed GPU compute yield.
     - `POST /api/v1/ai-funds/claim-yield`: Claims accrued GPU compute revenue into platform wallet available cash (`AVAILABLE_CASH`) via double-entry balanced transaction. Updates `claimedYield += pendingYield`, `pendingYield = 0`.
     - `POST /api/v1/ai-funds/circuit-breaker`: Emergency stop toggle to freeze automated rebalancing and hedge positions instantly during extreme market dislocations (`circuitBreaker: boolean`). When circuit breaker is tripped, attempting fund rebalancing/trades throws `CircuitBreakerTriggeredException` (HTTP 403).

2. **Tokenized Prime Real Estate Engine (`src/modules/real-estate/`)**:
   - `real-estate.controller.ts`, `real-estate.service.ts`, `dto/real-estate.dto.ts`, `real-estate.module.ts`:
     - `GET /api/v1/real-estate/properties`: Fractional real estate inventory (Zurich Prime Commercial, Mayfair Luxury Residences, Frankfurt Tech Hub), valuation history, token count, token price, rental yield, legal SPV document links, and user's owned shares.
     - `GET /api/v1/real-estate/rental-distributions`: Projected vs actual rental yield ledger with distribution cadence (e.g. monthly rental payout calculation, accrued unpaid distributions, payout history).
     - `GET /api/v1/real-estate/occupancy`: Tenant profiles, remaining lease terms (WAULT / weighted average unexpired lease term), and property management performance SLAs.
     - `GET /api/v1/real-estate/otc-market`: P2P secondary liquidity order book (Bids, Offers, Share price, Yield spread, Order status).
     - `POST /api/v1/real-estate/otc-market/:orderId/execute`: Executes secondary market share transfer with atomic double-entry ledger settlement (buyer pays `AVAILABLE_CASH`, buyer receives `RealEstateShare.tokenCount`, order marked `FILLED`).
     - `GET /api/v1/real-estate/documents/:docId`: Generates time-limited pre-signed secure download URLs for property deeds, appraisal affidavits, and SPV tax filings (with cryptographic HMAC-SHA256 signature and expiration timestamp).

3. **Exotic Vehicles & Horology Vault Engine (`src/modules/cars/`)**:
   - `cars.controller.ts`, `cars.service.ts`, `dto/cars.dto.ts`, `cars.module.ts`:
     - `GET /api/v1/cars/inventory`: Fractional & sole-title vehicle portfolio (Ferrari 250 GT, Bugatti Chiron, Patek Philippe 5711 Nautilus), VIN, vault location, insured value, Hagerty index, user's ownership share.
     - `GET /api/v1/cars/valuations`: Dynamic price tracking synchronized with Hagerty indices, 1Y delta, 5Y historical CAGR, and auction benchmarks.
     - `GET /api/v1/cars/logistics`: Real-time bonded vault telemetry (Geneva FreePort, Zurich Vault), climate controls (21.2°C, 45% relative humidity), biometric security status, Lloyd's syndicate insurance coverage.
     - `GET /api/v1/cars/fleet-monetization`: Commercial media rental logs (commercial filming, concours events), days chartered, gross yield, and net distributions per share.
     - `POST /api/v1/cars/drive-bookings`: Calendar booking engine for allocating track days (Monaco GP Circuit, Nürburgring Nordschleife, Silverstone) with slot locking and concurrency control to prevent double booking.
     - `GET /api/v1/cars/:carId/provenance`: Cryptographically signed maintenance records, odometer affidavits, and high-resolution condition scans.

4. **Integration with Core Ecosystem**:
   - Wire `AiFundsModule`, `RealEstateModule`, and `CarsModule` into `app.module.ts`.
   - Leverage `WalletService` for double-entry transactions (e.g. GPU compute yield claiming, OTC share execution settlements).
   - Leverage `PortfolioGateway` and `DashboardService` for real-time allocation updates and cache invalidation.
   - Enforce `JwtAuthGuard` on all endpoints with `req.user.id`.
   - Full input validation using `class-validator` DTOs with `whitelist: true, forbidNonWhitelisted: true`.
   - Ensure RFC 7807 error envelopes and semantic exceptions (`NotFoundException`, `ConflictException`, `ForbiddenException`, `UnprocessableEntityException`, `CircuitBreakerTriggeredException`).

5. **Automated Unit & Integration Test Suites**:
   - Unit tests covering quant math, risk tier calibration, circuit breaker tripping, OTC share settlement, pre-signed document HMAC verification, and drive booking concurrency checks.
   - Integration tests verifying REST endpoints across `/api/v1/ai-funds`, `/api/v1/real-estate`, and `/api/v1/cars`.

---

## 2. Invariants & Acceptance Criteria

- Circuit breaker invariant: When active, algorithmic operations must fail immediately with `CircuitBreakerTriggeredException` (HTTP 403).
- Double-entry ledger invariant: Any financial movement (yield claim, OTC buy) must preserve $\sum \text{Debits} + \sum \text{Credits} = 0$.
- Concurrency invariant: Drive track bookings must prevent double booking for the same car on the same date/track slot (`ConflictException` HTTP 409).
- Document vault invariant: URLs must be cryptographically signed with HMAC-SHA256 and expire within 900 seconds.
- All unit and integration tests passing (`npm test`, `npm run test:e2e`).
- TypeScript typecheck passes with 0 errors (`npx tsc --noEmit`).
- Commits formatted according to conventional commits.
