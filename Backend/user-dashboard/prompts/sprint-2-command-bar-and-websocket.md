# Implementation Prompt — Sprint 2: Universal Command Bar Aggregator & Real-Time WebSocket Gateway

**Target Sprint:** Sprint 2  
**Architecture Reference:** [`tools/IMPLEMENTATION_STRATEGY.md`](tools/IMPLEMENTATION_STRATEGY.md) (Sections 4, 10)  
**System Governance:** [`GEMINI.md`](GEMINI.md)  
**UI Contract Reference:** [`.ai/ui-context.md`](.ai/ui-context.md)  

---

## 1. Objectives & Deliverables

1. **Dashboard Module (`src/modules/dashboard/`)**:
   - `dashboard.controller.ts`:
     - `GET /api/v1/dashboard/command-bar`: Returns the consolidated multi-asset aggregate payload adhering strictly to `.ai/ui-context.md` (net worth, currency, returns for 1D/1W/1M/1Y/ALL, 7-vertical allocation matrix with exact color tokens, KYC status, and privacy mask state).
     - `GET /api/v1/dashboard/action-rail`: Returns user operational limits and capabilities (KYC tier daily limits, deposit eligibility, withdrawal eligibility, time-lock destination status).
   - `dashboard.service.ts`:
     - Multi-asset aggregation pipeline computing actual values and allocation percentages across all asset classes:
       - `crypto`: `CryptoHolding` (vault, web3, staked)
       - `stocks`: `StockPosition`
       - `ai-funds`: `AiFundPosition`
       - `real-estate`: `RealEstateShare` * `RealEstateProperty.tokenPriceUsd`
       - `cars`: `CarShare.sharePct / 100` * `ExoticCar.insuredValue`
       - `wallet`: `LedgerAccount` where `accountType === 'AVAILABLE_CASH'`
     - Dynamic returns calculation engine for 1D, 1W, 1M, 1Y, and ALL time horizons.
     - Sub-30ms execution performance through parallelized Prisma queries and caching.
   - `dto/command-bar.dto.ts` and `dto/action-rail.dto.ts`: Strict response models and validation.

2. **WebSocket Gateway Module (`src/modules/websocket/`)**:
   - `portfolio.gateway.ts`:
     - Socket.IO gateway bound to `/ws/portfolio` namespace with CORS configuration matching frontend origins.
     - JWT-authenticated handshake (`handshake.auth.token` or `handshake.headers.authorization`).
     - Automatic room segregation to `user:<userId>`.
     - Client subscription handler: `@SubscribeMessage('portfolio:subscribe')`.
     - Throttled tick broadcast method: `broadcastPortfolioTick(userId, payload)` (throttled to 2000ms max per client).
     - Event broadcast method: `broadcastAllocationRebalanced(userId, payload)`.
   - `websocket.module.ts`: Exporting `PortfolioGateway` for cross-module real-time emission.

3. **AppModule Integration**:
   - Register `DashboardModule` and `WebsocketModule` into `src/app.module.ts`.

4. **Automated Unit & Integration Test Suite (`Tests/UnitTest/`)**:
   - `Tests/UnitTest/dashboard/aggregationPipeline.test.ts`: Tests for multi-asset aggregation math, zero-division safeguards, allocation percentage distribution, return calculations, and latency limits.
   - `Tests/UnitTest/websocket/portfolioGateway.test.ts`: Tests for socket authentication, room isolation, client subscription, and broadcast throttling.

---

## 2. Invariants & Acceptance Criteria

- All REST responses conform to RFC 7807 / standard envelopes (`{ success: true, statusCode: 200, data: ... }`).
- Color tokens strictly match frontend Obsidian design tokens (`#E5C158`, `#53DC98`, `#926F13`, `#D4AF37`, `#BA1A1A`, `#8B9BB4`).
- All tests pass with zero failures.
- TypeScript compiler passes with zero errors (`npx tsc --noEmit`).
- Git commits adhere to conventional commit standards.
