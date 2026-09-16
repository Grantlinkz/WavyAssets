# Architecture Context — WavyAssets Sovereign Backend User Dashboard

## Technical Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Framework & Engine** | NestJS 11 (Express platform) | Modular enterprise backend, dependency injection, decorators, validation pipes |
| **Language & Tooling** | TypeScript 5.7+ (Strict Mode) | Complete type safety, strict null checking (`noImplicitAny`, `strictNullChecks`) |
| **ORM & Data Layer** | Prisma ORM 6.4+ | Type-safe query generation, migrations, connection pooling, transactional boundaries |
| **Database Engines** | SQLite (Dev) / PostgreSQL 16 (Prod) | Zero-friction local development, multi-region clustering in production |
| **Real-Time Gateway** | `@nestjs/websockets` + Socket.IO 4.8 | High-frequency telemetry streaming (`/ws/portfolio`) for tickers and command-bar updates |
| **Authentication & Crypto** | `@nestjs/jwt`, `argon2`, `@simplewebauthn/server` | JWT issuance, Argon2id passwords, HMAC-SHA256 tokens, WebAuthn FIDO2 attestation |
| **Job Scheduling** | `@nestjs/schedule` | Deterministic cron scheduling for DCA recurrent buys, rental yield compounding, cash sweep |
| **Security & Hardening** | Helmet, `@nestjs/throttler`, rate-limiting | Multi-tier rate limiting (10 req/s public, 50 req/s auth), CORS lockdown to `:5173`/`:5174` |
| **Validation** | `class-validator` + `class-transformer` | Strict DTO ingress sanitization (`whitelist: true, forbidNonWhitelisted: true`) |
| **Testing Suite** | Vitest 3.0 + Supertest | High-speed unit tests (ledger math, time-locks) and integration tests (REST & WebSockets) |
| **Containerization** | Docker Multi-Stage + Compose | Lightweight Alpine container (`wavyassets/user-dashboard-backend:1.0.0`) on port 4001:4000 |

---

## Directory Architecture & Modular Boundaries

```
Backend/user-dashboard/
├── .ai/                       # AI project context, architecture, code standards, progress tracker
├── .ai.md                     # Application building context & reading sequence
├── GEMINI.md                  # Root AI governance, error handling, invariants, commit standards
├── .gitignore
├── Dockerfile                 # Multi-stage production NestJS runner
├── docker-compose.yml         # Container networking (Port 4001:4000)
├── nest-cli.json
├── package.json
├── prisma/
│   ├── dev.db                 # SQLite local data store
│   ├── migrations/            # Version-controlled migrations
│   ├── schema.prisma          # Complete 7-vertical institutional schema
│   └── seed.ts                # Deterministic seed data (initial positions, orders, assets)
├── src/
│   ├── app.module.ts          # Root module orchestrating all feature domains
│   ├── main.ts                # Bootstrap, validation pipe, helmet, CORS, Swagger setup
│   ├── common/                # Shared utilities across all modules
│   │   ├── constants/         # System limits, fee schedules, error codes
│   │   ├── decorators/        # @CurrentUser(), @KycProtected(), @WebAuthnGate()
│   │   ├── exceptions/        # Custom domain exceptions (QuarantineTimeLockException, etc.)
│   │   ├── filters/           # GlobalExceptionFilter (strict redaction, no stack traces)
│   │   ├── guards/            # JwtAuthGuard, KycTierGuard, TimeLockGuard
│   │   ├── interceptors/      # RedactedLoggingInterceptor, TransformResponseInterceptor
│   │   ├── pipes/             # StrictValidationPipe
│   │   └── utils/             # CryptoUtils (AES-256-GCM, HMAC-SHA256), LedgerMath
│   ├── config/                # Environment configuration & validation (Joi/class-validator)
│   ├── modules/
│   │   ├── auth/              # Handoff ticket consumption, JWT issuance, session management
│   │   ├── dashboard/         # Command bar aggregator, Net Worth calculator, allocation engine
│   │   ├── crypto/            # Holdings, custody segregation, DCA scheduler, staking compounding
│   │   ├── stocks/            # DMA order book, order execution engine, DRIP, corporate actions
│   │   ├── ai-funds/          # Quant telemetry, risk calibrator, rationale audit feed, circuit breaker
│   │   ├── real-estate/       # SPV decks, rental distribution ledger, secondary P2P OTC market
│   │   ├── cars/              # Vault inventory, Hagerty index tracker, drive booking engine
│   │   ├── vip-cards/         # Tier progression, card controls, WebAuthn-guarded CVV/PIN reveal
│   │   ├── wallet/            # Double-entry ledger, Available vs Invested split, cash sweep pot, FX
│   │   ├── compliance/        # Tiered KYC tracker, dossier upload, Form 8949 tax pack generator
│   │   ├── security/          # Device sessions, WebAuthn FIDO2 attestation, 48h Time-Lock engine
│   │   ├── websocket/         # Socket.IO gateway (/ws/portfolio) for live net worth & ticker streaming
│   │   └── jobs/              # Cron scheduler (DCA runner, rental compounding, time-lock release)
│   └── tools/                 # Architectural specifications, migration scripts
├── Tests/
│   ├── UnitTest/              # Unit tests (Ledger double-entry math, time-lock validator, P&L formulas)
│   └── IntegrationTest/       # End-to-end API tests (Supertest + in-memory Prisma client)
├── tsconfig.build.json
├── tsconfig.json
└── vitest.config.ts           # Ultra-fast Vitest test runner configuration
```

---

## Cross-Domain Authentication Handoff Protocol

Users authenticate on the marketing landing page (`Frontend/landing-page` -> `Backend/landing-page`). Upon 2FA OTP validation, `Backend/landing-page` generates an ephemeral, single-use `handoffTicket`. The User Dashboard client captures this ticket upon redirection and immediately exchanges it:

```
[Landing Page Auth Flow]
       │ (Generates handoffTicket: cryptographically random 32-byte hex)
       ├──► Stores HMAC-SHA256 hash (UTF-8 raw ticket string input, lowercase hex output) in Session.handoffTicketHash (expires in 120s) using shared HANDOFF_TICKET_SECRET
       ▼
[Redirect: http://localhost:5174/auth/callback?ticket=<rawTicket>]
       │
       ▼
[Frontend: POST /api/v1/auth/exchange-ticket]
       │ Body: { ticket: "<rawTicket>" }
       ▼
[Backend user-dashboard AuthService.exchangeTicket()]
       ├── 1. Compute ticketHash = HMAC-SHA256(rawTicket, HANDOFF_TICKET_SECRET) in lowercase hex
       ├── 2. Atomically query and burn Session where id = sessionId AND handoffTicketHash = ticketHash
       ├── 3. Generate Dashboard Access Token (JWT, 15-minute expiry)
       ├── 5. Generate Refresh Token, persist hash in Session.refreshTokenHash
       └── 6. Return AuthExchangeResponse { success: true, accessToken, user: { id, email, fullName, tier, kycTier } }
```

---

## Relational Database Schema Architecture

The Prisma schema defines the complete multi-asset ledger, user identities, and asset vertical models:

- **Identity & Session**:
  - `User`: Core account profile, KYC tier (`TIER_1`, `TIER_2`, `TIER_3`), membership tier (`RETAIL`, `PRIVATE_WEALTH`, `INSTITUTIONAL`), corporate status.
  - `Session`: Hashed refresh tokens (`refreshTokenHash`), ephemeral handoff tickets (`handoffTicketHash`), IP, user agent, expiration.
  - `WebAuthnCredential`: FIDO2 public keys, credential IDs, signature counters for hardware security assertions.
  - `WhitelistDestination`: Whitelisted crypto addresses and bank IBANs under deterministic 48-hour time-lock (`status: QUARANTINE`, `quarantineUntil`).
- **Double-Entry Ledger**:
  - `LedgerAccount`: Segregated balance containers (`AVAILABLE_CASH`, `INVESTED_CAPITAL`, `STAKING_ESCROW`, `FEE_RECEIVABLE`) per currency (`USD`, `EUR`, `CHF`, `USDC`, `BTC`, `ETH`).
  - `LedgerTransaction`: Master transaction records with idempotency reference IDs (`referenceId`), transaction types (`DEPOSIT`, `WITHDRAWAL`, `TRADE`, `STAKE`, `REWARD`, `DIVIDEND`, `SWEEP`), and statuses (`PENDING`, `SETTLED`, `FAILED`).
  - `LedgerEntry`: Balanced journal lines linking an amount (+ credit, - debit) to a `LedgerAccount` and `LedgerTransaction`.
- **7 Asset Verticals**:
  - `CryptoHolding` & `DcaSchedule`: Multi-custody crypto balances, acquisition costs, APY, DCA recurrent schedules.
  - `StockPosition` & `StockOrder`: Equity shares, exchange, cost basis, DRIP toggle, and order book states.
  - `AiFundPosition` & `AiRationaleLog`: Strategy allocation, unrealized alpha, circuit breaker state, and immutable algorithmic decision log.
  - `RealEstateProperty`, `RealEstateShare`, `RealEstateOtcOrder`: Fractional properties, token counts, rental yields, SPV documentation, and secondary market orders.
  - `ExoticCar`, `CarShare`, `DriveBooking`: Bonded vault inventory, VIN, Hagerty index, fractional shares, track day bookings.
  - `VipCard`: Card tier (`SILVER`, `OBSIDIAN`, `BLACK`), spending limits, freeze state, encrypted CVV/PIN.
  - `KycDocument` & `AuditLog`: Compliance identity documents, verification flags, and sanitized tamper-evident audit logs.

---

## Real-Time WebSocket Gateway (`/ws/portfolio`)

The WebSocket gateway enables real-time synchronization between the backend and `Frontend/user-dashboard`:

- **Namespace**: `/ws/portfolio`
- **Authentication**: Client passes JWT in connection handshake (`auth: { token: "..." }`). The gateway validates the token via `JwtService` and assigns the socket to user-isolated room `user:<userId>`.
- **Broadcast Events**:
  - `portfolio:tick`: Pushes updated consolidated net worth and 24h P&L whenever spot prices update. Throttled to max 1 update / 2000ms per client.
  - `allocation:rebalanced`: Dispatched immediately when an order, trade, deposit, or dividend execution alters asset weights.
  - `orderbook:depth`: Pushes Level-2 order book depth for subscribed stock/crypto symbols.
  - `security:alert`: High-priority alert dispatched on session termination or quarantine state changes.

---

## Non-Negotiable Architectural Invariants

1. **Ledger Zero-Sum Invariant**: For every `LedgerTransaction`, the sum of amounts across all associated `LedgerEntry` records must equal zero ($\sum \text{Debits} + \sum \text{Credits} = 0$). Any unbalanced transaction must be rejected and rolled back in `prisma.$transaction`.
2. **Deterministic 48-Hour Quarantine**: Any withdrawal request pointing to a destination where `status === 'QUARANTINE'` or `NOW() < quarantineUntil` must fail immediately with `QuarantineTimeLockException` (HTTP 403 Forbidden).
3. **Double-Spend & Overdraw Prevention**: Any trade, order, or withdrawal must atomically reserve funds from `AVAILABLE_CASH` to `ESCROW` or `INVESTED_CAPITAL` within a serializable database transaction.
4. **Two-Tier Error Handling**:
   - **Code-Based**: Every service and controller must throw semantic, strongly-typed NestJS exceptions (`BadRequestException`, `NotFoundException`, `ForbiddenException`, etc.) or custom domain exceptions.
   - **Global Filter**: `GlobalExceptionFilter` must intercept all uncaught exceptions, log the full internal diagnostic with a unique `correlationId`, and return a sanitized, consistent custom unified JSON response envelope to the client with zero stack trace or internal database leakage.
5. **Redacted Logging**: Sensitive values (passwords, tokens, tickets, CVVs, PINs, full IBANs, email addresses) must never appear in application logs or WebSocket payloads.
