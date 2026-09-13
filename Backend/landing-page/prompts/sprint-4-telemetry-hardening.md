# Implementation Plan: Sprint 4 (Live Telemetry, WebSocket Ticker & Production Hardening)

## Context & Objectives
In Sprints 1, 2, and 3, the core gateway, defensive filters, SQLite database, cryptographic two-step authentication, institutional lead pipeline, simulation intent tokenization, double opt-in newsletter, and regulatory audit compliance modules were implemented and verified with 66/66 passing tests.

Sprint 4 delivers the final capstone deliverables defined in `tools/WavyAssets LandingPage Backend Execution.md`:
1. **Multi-Asset Syndicate Ticker Feed (`/api/v1/telemetry/ticker`, `/ws/ticker`)**: Streams real-time prices, 24h percentage deltas, volume, and 7-day sparkline charts for core asset benchmarks (Crypto, Equities, Commodities/Treasuries).
2. **Cryptographic Enclave & Proof-of-Reserves Telemetry (`/api/v1/telemetry/enclave`)**: Exposes live Merkle root proof-of-reserves, HSM cluster operational status (Geneva, Zurich, New York), 14ms clearing settlement latency, and Tier AUM metrics ($4.82B Private Wealth vs. $12.40B Institutional).
3. **Resilient Fallback Cache & Circuit Breakers**: In-memory caching engine that guarantees zero client interruption and low latency (<50ms SLA).
4. **Interactive OpenAPI 3 / Swagger Documentation**: Ensures complete endpoint coverage exposed at `/api/docs`.
5. **Production Docker Containerization**: Multi-stage minimal footprint Docker container with non-root security privileges and integrated healthcheck probes.

---

## Target Deliverables

### 1. Telemetry Module (`src/modules/telemetry/`)
- `AssetQuoteDto` & `EnclaveTelemetryDto` with OpenAPI schemas.
- `TelemetryService`:
  - Maintains in-memory cache for all 10 benchmarks:
    - *Crypto*: BTC/USD, ETH/USD, SOL/USD, WAVY-YIELD.
    - *Equities*: AAPL, NVDA, TSLA, SPY.
    - *Treasuries & Commodities*: US 10Y, XAU/USD (Gold Bullion), Brent Crude.
  - Generates 7-day compressed sparkline curves.
  - Computes deterministic SHA-256 Merkle root hash for vault reserve attestation.
  - Exposes HSM cluster operational telemetry across Geneva (CH-01), Zurich (CH-02), and New York (US-01) nodes.
- `TickerGateway`:
  - WebSocket gateway bound to `/ws/ticker` with CORS origin verification and periodic quote broadcasts.
- `TelemetryController`:
  - `GET /api/v1/telemetry/ticker` (REST fallback).
  - `GET /api/v1/telemetry/enclave` (Proof-of-reserves & HSM status).

### 2. Containerization & Deployment Hardening
- `Dockerfile`: Multi-stage build with unprivileged `node` user, minimal runtime layer, and health probe.
- `.dockerignore`: Exclusion rules for dev artifacts.

### 3. Automated Vitest Test Suites
- Unit tests:
  - `Tests/UnitTest/telemetry/telemetry.service.test.ts`
  - `Tests/UnitTest/telemetry/merkle-telemetry.test.ts`
- Integration tests:
  - `Tests/IntegrationTest/telemetry/telemetry-api.integration.test.ts`

### 4. Documentation & Governance
- Update `src/app.module.ts`.
- Update `.ai/progress-tracker.md`.
