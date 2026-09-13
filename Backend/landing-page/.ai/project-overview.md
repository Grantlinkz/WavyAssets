# Project Overview — WavyAssets Landing Page Backend

## Overview

**WavyAssets Landing Page Backend** (`Backend/landing-page`) is the institutional-grade, high-availability server-side gateway powering the public marketing terminal (`Frontend/landing-page`), orchestrating cryptographic two-step authentication, institutional mandate intake, continuous multi-asset market telemetry, and frictionless client session hand-off to the **User Dashboard** (`Frontend/user-dashboard`).

Constructed using **NestJS 11**, **TypeScript strict mode**, **Prisma ORM 6**, and **SQLite** (with zero-friction migration path to PostgreSQL for production), this service establishes the defensive security perimeter and operational backbone for the WavyAssets sovereign wealth platform.

---

## Primary Objective

Develop an enterprise-grade backend service engineered to:
1. Support **100,000+ monthly active visitors** with sub-50ms API latency (`< 50ms SLA`).
2. Securely process high-value institutional capital mandates ($50k–$10M+ allocations).
3. Deliver continuous real-time market telemetry (crypto, equities, gold bullion, treasuries) and Enclave proof-of-reserves.
4. Execute cryptographic two-step authentication (Argon2id + 6-digit OTP via Resend email / Telegram Enclave bot) with seamless session hand-off to the `user-dashboard`.

---

## Target Personas

1. **Prospective Institutional Allocators & Family Offices**: Submitting multi-million-dollar capital mandate inquiries and requesting custom vault terms.
2. **High-Net-Worth Individuals & Sovereign Allocators**: Simulating portfolio compounding allocations ($50k–$10M) and transitioning into active onboarding.
3. **Registered Returning Clients**: Authenticating via 2-step verification directly from the landing page `UnifiedAuthModal` to enter the User Dashboard without re-authentication friction.
4. **Automated Market Aggregators & Regulators**: Inspecting public cryptographic proof of reserves, Enclave HSM cluster status, and compliance disclosures.

---

## Problem Definition & Resolution

The public frontend (`Frontend/landing-page`) features high-fidelity simulation, dynamic asset panels, and interactive modals (`UnifiedAuthModal`, `ContactModal`). Without a dedicated backend layer:
- **Authentication was client-side only**: Submissions mocked OTP verification without issuing signed cryptographic sessions or routing to the dashboard.
- **Lead data was ephemeral**: Inquiries were logged locally in the browser console without secure database persistence, corporate domain verification, or CRM dispatch.
- **Telemetry feeds were hardcoded**: Market tickers and Enclave node statuses relied on static arrays rather than dynamic, low-latency streams.
- **Portfolio simulation intent was lost**: Simulator allocations ($50k–$10M) were discarded upon navigation rather than carried into client onboarding.

This backend resolves these operational challenges through 5 dedicated core service modules.

---

## Core Service Modules

```
                               ┌─────────────────────────────┐
                               │   NestJS API Gateway (:4000)│
                               └──────────────┬──────────────┘
                                              │
         ┌──────────────────┬─────────────────┼─────────────────┬──────────────────┐
         ▼                  ▼                 ▼                 ▼                  ▼
  ┌──────────────┐   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
  │  AuthModule  │   │  LeadModule  │  │ TelemetryMod │  │SimulationMod │   │ComplianceMod │
  │  /auth/*     │   │  /leads/*    │  │ /telemetry/* │  │/simulation/* │   │/compliance/* │
  │  2-Step OTP  │   │  Domain Score│  │ Ticker & WS  │  │ Intent Save  │   │/newsletter/* │
  │  JWT & Cookie│   │  AES-256 PII │  │ Enclave Proof│  │ Pre-fill     │   │ Audit Logs   │
  └──────────────┘   └──────────────┘  └──────────────┘  └──────────────┘   └──────────────┘
```

### 1. Authentication & Session Gateway (`/api/v1/auth`)
- **Step 1 (`/api/v1/auth/initiate`)**: Validates credentials using Argon2id password hashing or initiates mandate onboarding.
- **Step 2 (`/api/v1/auth/verify-otp`)**: Validates cryptographically random 6-digit OTP (5-minute TTL, constant-time verification, max 3 attempts).
- **Multi-Channel OTP Delivery**:
  - Primary: Resend Transactional Email API (`security@wavyassets.com`) with Swiss typography.
  - Institutional Enclave Tier: Telegram Enclave bot dispatch (`TELEGRAM_ENCLAVE_BOT_TOKEN`).
  - Local Sandbox Mode: Console output or static sandbox OTP (`DEV_STATIC_OTP=123456`) strictly restricted to `NODE_ENV=development`.
- **Session Issuance & Hand-off**: Issues signed JWT access tokens paired with `HttpOnly`, `Secure`, `SameSite=Strict` refresh cookies and one-time dashboard exchange tickets.

### 2. Institutional Mandates & Lead Pipeline (`/api/v1/leads`)
- **Mandate Ingestion (`/api/v1/leads/inquire`)**: Validates `fullName`, `workEmail`, `telegram`, `companyName`, `websiteUrl`, `service`, `allocation` using `class-validator`.
- **Corporate Domain Verification**: Rejects disposable/temporary email providers (Mailinator, TempMail).
- **Field-Level Encryption**: Sensitive PII (email, phone/telegram) encrypted at rest using AES-256-GCM.
- **Webhook Dispatch**: Automated dispatch to institutional CRM / custody desk notifications (Slack/Telegram webhook).

### 3. Live Syndicate Ticker & Market Telemetry (`/api/v1/telemetry`, `/ws/ticker`)
- **Multi-Asset Ticker Feed**: REST endpoint (`/api/v1/telemetry/ticker`) and WebSocket stream (`/ws/ticker`) pushing live prices, 24h deltas, and volumes for Crypto (BTC, ETH, SOL, WAVY-YIELD), Equities (AAPL, NVDA, TSLA, SPY), and Treasuries/Commodities (US 10Y, Gold, Oil).
- **Cryptographic Enclave Telemetry (`/api/v1/telemetry/enclave`)**: Publishes Merkle root hash of reserves, HSM cluster status (Geneva, Zurich, NY), clearing latency (14ms), and Tier AUM metrics ($4.82B vs $12.40B).
- **In-Memory Resilient Cache**: Circuit-breaker pattern serving cached quotes during external feed degradation.

### 4. Portfolio Simulation & Intent Persistence (`/api/v1/simulation`)
- **Intent Tokenization (`/api/v1/simulation/save`)**: Captures user simulation parameters ($50k–$10M capital, risk posture, blended APY) and returns a unique `intentToken`.
- **Registration Pre-fill**: Resolves `intentToken` during auth to pre-configure client dashboard asset allocation.

### 5. Newsletter & Compliance Disclosures (`/api/v1/newsletter`, `/api/v1/compliance`)
- **Double Opt-In Research Subscription (`/api/v1/newsletter/subscribe`)**: Cryptographically signed confirmation token before subscriber activation.
- **Regulatory Audit Trail (`/api/v1/compliance/ack`)**: Immutable logging of user acknowledgments of SEC Rule 206(4)-1, FINMA, and GDPR disclaimers with IP hash and disclaimer version.

---

## Scope

### In Scope
- NestJS 11 modular server application with TypeScript strict mode.
- SQLite relational database managed via Prisma ORM 6 schemas and migrations.
- Complete OpenAPI/Swagger documentation exposed at `/api/docs`.
- Defensive global middleware (Helmet, CORS, rate limiting, PII-redacted logging, standardized error filters).
- Cryptographic authentication with Argon2id, 6-digit OTP, JWT session issuance, and dashboard exchange tickets.
- Institutional lead intake with AES-256-GCM encryption, corporate domain scoring, and CRM webhooks.
- Multi-asset ticker REST & WebSocket feeds with in-memory caching.
- Double opt-in newsletter and regulatory audit logging.
- Comprehensive Vitest unit and integration test suites in `Tests/UnitTest/` and `Tests/IntegrationTest/`.
- Production Dockerfile and `.env.example` configurations.

### Out of Scope (Landing Page Backend Phase)
- Internal ledger transaction settlement engine (handled by core banking/custody microservices).
- Real fiat payment wire ingestion (handled by banking partner rails in `user-dashboard`).
- User profile and portfolio rebalancing operations (handled inside `Frontend/user-dashboard`).

---

## Success Criteria & Operational SLAs

1. **API Latency SLA**: Under 50ms average response time for cached telemetry and core endpoints.
2. **Uptime & Scalability**: High availability designed to sustain 100k+ MAU with sliding window rate limiting.
3. **Zero Leaked Exceptions**: All errors caught and transformed into sanitized standard JSON envelopes without leaking stack traces, database schemas, or system paths.
4. **Strict Production Sandbox Invariant**: 100% guarantee that sandbox bypass codes (`DEV_STATIC_OTP`) are rejected with `403 Forbidden` in production environments.
5. **Deterministic Test Coverage**: Fast Vitest test suites verifying critical pathways with high branch coverage.
