# WavyAssets Landing Page Backend - Complete Architecture Documentation

> High-availability NestJS API gateway, cryptographic authentication engine, live syndicate telemetry broadcaster, and institutional mandate pipeline for the WavyAssets platform.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technical Stack](#technical-stack)
3. [Module Architecture](#module-architecture)
4. [Directory Structure](#directory-structure)
5. [Database Schema](#database-schema)
6. [API Contract Matrix](#api-contract-matrix)
7. [Security Architecture](#security-architecture)
8. [Error Handling](#error-handling)
9. [Authentication Flow](#authentication-flow)
10. [Deployment](#deployment)
11. [Development Workflow](#development-workflow)

---

## System Overview

The **Landing Page Backend** serves as the secure API gateway connecting the public marketing terminal to the core institutional sovereign wealth infrastructure and orchestrating seamless client hand-off into the **User Dashboard**.

### Architecture Diagram

```
                    PUBLIC INTERNET / CLIENT TRAFFIC
                                   │
                                   ▼
            ┌──────────────────────────────────────────────┐
            │    Reverse Proxy / Cloudflare / WAF          │
            │    (Rate Limiting, SSL, DDoS Shield)         │
            └──────────────────────┬───────────────────────┘
                                   │
                                   ▼
            ┌──────────────────────────────────────────────┐
            │        NestJS API Gateway (:4000)            │
            │   Helmet | CORS | Throttler | Redacted Log   │
            └──────┬───────────────┬────────────────┬──────┘
                   │               │                │
      ┌────────────┴─────┐  ┌──────┴──────┐  ┌──────┴──────────────┐
      │                  │  │             │  │                     │
      ▼                  ▼  ▼             ▼  ▼                     ▼
 ┌──────────────┐  ┌──────────────┐   ┌──────────────┐         ┌──────────────┐
 │  AuthModule  │  │  LeadModule  │   │ TelemetryMod │         │SimulationMod │
 │  2-Step OTP  │  │  AES-256 PII │   │ Multi-Asset  │         │ Intent Save  │
 │ Handoff Exch │  │  Blind Index │   │ WS Ticker    │         │ 30-day TTL   │
 └──────┬───────┘  └──────┬───────┘   └──────┬───────┘         └──────┬───────┘
        │                  │                  │                        │
        │           ┌──────┴──────────┐       │                 ┌──────┴───────┐
        │           │  NewsletterMod  │       │                 │ComplianceMod │
        │           │  Double Opt-In  │       │                 │ Audit Vault  │
        │           └──────┬──────────┘       │                 └──────┬───────┘
        │                  │                  │                        │
        └──────────────────┼──────────────────┴────────────────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │      Prisma ORM Layer        │
            └──────────────┬───────────────┘
                           │
                           ▼
            ┌──────────────────────────────┐
            │    SQLite Relational DB      │
            │   (dev.db / local storage)   │
            └──────────────────────────────┘
```

---

## Technical Stack

| Layer | Technology | Role & Justification |
| :--- | :--- | :--- |
| **Framework & Runtime** | NestJS 11 + Node.js 24 + TypeScript (strict) | Enterprise modular architecture, dependency injection, strict typing, high throughput |
| **Database & ORM** | SQLite + Prisma ORM 6.0 | Fast, zero-config local persistence with deterministic migrations; seamless transition to PostgreSQL |
| **Password Hashing** | Argon2id | Memory-hard cryptographic password hashing resistant to GPU/ASIC cracking |
| **Encryption at Rest** | AES-256-GCM | Authenticated field-level encryption for sensitive institutional lead PII (email, phone, telegram) |
| **Sessions & Tokens** | JWT (Ed25519 / HMAC-SHA256) + HttpOnly Cookies | Stateless access verification paired with secure, tamper-proof refresh cookies |
| **Rate Limiting** | `@nestjs/throttler` | Dual-tier sliding window rate limiting (120 req/min general, 5 req/min auth/leads) |
| **Security Headers** | Helmet + CORS Middleware | Strict CSP, HSTS, frame denial, and origin whitelisting |
| **Real-Time Streaming** | WebSockets (`@nestjs/websockets`) / SSE | Low-latency live market ticker stream (`/ws/ticker`) to marketing clients |
| **Email Gateway** | Resend API | Transactional 2FA OTP delivery with Swiss typography and delivery telemetry |
| **Enclave Dispatch** | Telegram Bot API | Encrypted dual-channel 2FA dispatch for accredited and institutional accounts |
| **API Documentation** | `@nestjs/swagger` + OpenAPI 3.0 | Auto-generated, interactive Swagger UI available at `/api/docs` |
| **Testing Engine** | Vitest + Supertest | Blazing fast ESM unit testing and E2E integration test execution |

---

## Module Architecture

### Module Overview

The application is organized into 8 feature modules, each with its own controller, service, DTOs, and sub-components:

```
src/modules/
├── auth/                    # Authentication & Dashboard Handoff
├── leads/                   # Institutional Lead Pipeline
├── telemetry/               # Live Market Data & WebSocket Streaming
├── simulation/              # Portfolio Intent Tokenization
├── newsletter/              # Research Newsletter Subscriptions
├── compliance/              # Regulatory Audit Trail
├── health/                  # Health & Readiness Probes
└── prisma/                  # Database Connection Management
```

### 1. Auth Module (`/api/v1/auth`)

**Purpose**: 2-step OTP authentication, JWT session management, and secure dashboard handoff

**Files**:
- `auth.controller.ts` - HTTP endpoints for auth flow
- `auth.service.ts` - Business logic for OTP, JWT, handoff tickets
- `auth.module.ts` - Module configuration and dependency injection
- `dto/auth.dto.ts` - Request/response DTOs
- `guards/auth.guard.ts` - JWT authentication guard
- `services/email.service.ts` - Resend email integration
- `services/telegram.service.ts` - Telegram bot integration

**Endpoints**:
- `POST /api/v1/auth/initiate` - Initiate auth flow, dispatch OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP, issue JWT & handoff ticket
- `POST /api/v1/auth/exchange` - Consume handoff ticket, issue dashboard JWT
- `POST /api/v1/auth/refresh` - Rotate access token via refresh cookie
- `POST /api/v1/auth/logout` - Revoke session, clear cookies
- `GET /api/v1/auth/me` - Fetch authenticated user profile

**Security Features**:
- Argon2id password hashing (memory-hard, GPU-resistant)
- Cryptographically random 6-digit OTP (5-minute TTL)
- Dual-channel OTP delivery (Email + Telegram)
- JWT access tokens (short-lived)
- HttpOnly/SameSite=Strict refresh cookies
- Single-use handoff tickets (never in URL query)
- Production sandbox guard (blocks DEV_STATIC_OTP)

---

### 2. Leads Module (`/api/v1/leads`)

**Purpose**: Institutional capital mandate ingestion with PII encryption

**Files**:
- `leads.controller.ts` - Lead inquiry endpoint
- `leads.service.ts` - Business logic for validation, encryption, CRM dispatch
- `leads.module.ts` - Module configuration
- `dto/lead.dto.ts` - Lead inquiry DTO

**Endpoints**:
- `POST /api/v1/leads/inquire` - Submit institutional lead inquiry

**Security Features**:
- AES-256-GCM field encryption (fullName, workEmail, telegram)
- HMAC-SHA256 blind index for fast lookups (workEmailHash)
- Corporate domain validation (blocks disposable domains)
- Anti-spam honeypot detection
- Priority Telegram alerts for institutional leads
- Webhook dispatch to institutional CRM

---

### 3. Telemetry Module (`/api/v1/telemetry`, `/ws/ticker`)

**Purpose**: Live market data broadcasting and Enclave proof-of-reserves

**Files**:
- `telemetry.controller.ts` - REST endpoints for telemetry
- `telemetry.service.ts` - Quote caching, data aggregation
- `telemetry.module.ts` - Module configuration
- `dto/telemetry.dto.ts` - Telemetry DTOs
- `gateways/ticker.gateway.ts` - WebSocket gateway for real-time streaming

**Endpoints**:
- `GET /api/v1/telemetry/ticker` - Cached REST snapshot of market benchmarks
- `WS /ws/ticker` - Real-time WebSocket ticker stream
- `GET /api/v1/telemetry/enclave` - Cryptographic proof-of-reserves & HSM telemetry

**Data Points**:
- Crypto: BTC, ETH, SOL, WAVY-YIELD
- Equities: AAPL, NVDA, TSLA, SPY
- Commodities & Treasuries: US 10Y, XAU/USD, BRENT
- Enclave: Merkle root, node statuses, Tier AUM

**Performance**:
- In-memory circuit-breaker cache
- Sub-50ms API latency SLA
- WebSocket broadcast every 3 seconds

---

### 4. Simulation Module (`/api/v1/simulation`)

**Purpose**: Portfolio simulator intent tokenization for onboarding

**Files**:
- `simulation.controller.ts` - Intent save/retrieve endpoints
- `simulation.service.ts` - Token generation, validation, expiration
- `simulation.module.ts` - Module configuration
- `dto/simulation.dto.ts` - Simulation DTOs

**Endpoints**:
- `POST /api/v1/simulation/save` - Tokenize simulator parameters
- `GET /api/v1/simulation/:token` - Fetch simulated parameters

**Features**:
- Issues `sim_<hex>` token with 30-day sliding TTL
- Stores capital amount, risk posture, projected yield
- Pre-fills onboarding form in user dashboard

---

### 5. Newsletter Module (`/api/v1/newsletter`)

**Purpose**: Double opt-in research newsletter subscription

**Files**:
- `newsletter.controller.ts` - Subscription management endpoints
- `newsletter.service.ts` - Verification, confirmation, unsubscription
- `newsletter.module.ts` - Module configuration
- `dto/newsletter.dto.ts` - Newsletter DTOs

**Endpoints**:
- `POST /api/v1/newsletter/subscribe` - Register for research dispatches
- `GET /api/v1/newsletter/verify` - Activate double opt-in subscriber
- `POST /api/v1/newsletter/unsubscribe` - One-click unsubscribe

**Features**:
- Swiss double opt-in verification email via Resend
- Verification token with expiration
- GDPR-compliant unsubscription

---

### 6. Compliance Module (`/api/v1/compliance`)

**Purpose**: Regulatory disclosure audit trail

**Files**:
- `compliance.controller.ts` - Acknowledgment endpoint
- `compliance.service.ts` - Audit logging with IP anonymization
- `compliance.module.ts` - Module configuration
- `dto/compliance.dto.ts` - Compliance DTOs

**Endpoints**:
- `POST /api/v1/compliance/ack` - Record regulatory disclosure acknowledgment

**Security Features**:
- IP address anonymization via HMAC-SHA256
- Zero raw IP persistence (GDPR compliant)
- Actor tracking for SEC/FINMA disclaimers

---

### 7. Health Module (`/health`)

**Purpose**: Container orchestration health probes

**Files**:
- `health.controller.ts` - Liveness and readiness endpoints
- `health.service.ts` - Health check logic
- `health.module.ts` - Module configuration

**Endpoints**:
- `GET /health/live` - Process liveness probe (uptime, status)
- `GET /health/ready` - Readiness probe (DB connectivity, memory)

**Usage**:
- Kubernetes/Render health checks
- Container orchestration
- Load balancer health probes

---

### 8. Prisma Module

**Purpose**: Database connection lifecycle management

**Files**:
- `prisma.module.ts` - Module configuration
- `prisma.service.ts` - Prisma Client singleton

**Features**:
- Connection pooling
- Query logging in development
- Lifecycle hooks (before/after middleware)
- Transaction support

---

## Directory Structure

```
Backend/landing-page/
├── prisma/
│   ├── schema.prisma             # Relational models, enums, and database indexes
│   └── migrations/               # Deterministic SQL migration history
├── src/
│   ├── common/                   # Shared architectural infrastructure
│   │   ├── decorators/           # Custom parameter & metadata decorators (@CurrentUser, @Public)
│   │   ├── dto/                  # Shared base DTOs and query pagination
│   │   ├── filters/              # Global error filters (AllExceptionsFilter, HttpExceptionFilter)
│   │   ├── guards/               # Security guards (AuthGuard, ThrottlerGuard, ProductionSandboxGuard)
│   │   ├── interceptors/         # Response envelope transform & PII redaction interceptors
│   │   ├── pipes/                # Global validation pipe with class-validator
│   │   └── utils/                # Crypto utils (AES-256-GCM cipher, Argon2id helper, OTP generator)
│   ├── config/                   # Strongly typed environment configuration (@nestjs/config)
│   │   ├── configuration.ts      # Environment variable schema and defaults
│   │   └── env.validation.ts     # Joi/Zod validation of process.env at boot
│   ├── modules/                  # Isolated domain feature modules
│   │   ├── auth/                 # /api/v1/auth (2-Step OTP, Argon2id, JWT, Dashboard hand-off)
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   ├── guards/
│   │   │   └── services/
│   │   ├── leads/                # /api/v1/leads (Institutional contact ingestion, AES encryption, CRM webhook)
│   │   │   ├── leads.controller.ts
│   │   │   ├── leads.service.ts
│   │   │   ├── leads.module.ts
│   │   │   └── dto/
│   │   ├── telemetry/            # /api/v1/telemetry & /ws/ticker (Live quotes, Enclave proof-of-reserves)
│   │   │   ├── telemetry.controller.ts
│   │   │   ├── telemetry.service.ts
│   │   │   ├── telemetry.module.ts
│   │   │   ├── dto/
│   │   │   └── gateways/
│   │   ├── simulation/           # /api/v1/simulation (Intent tokenization, portfolio pre-fill)
│   │   │   ├── simulation.controller.ts
│   │   │   ├── simulation.service.ts
│   │   │   ├── simulation.module.ts
│   │   │   └── dto/
│   │   ├── newsletter/           # /api/v1/newsletter (Double opt-in research subscription)
│   │   │   ├── newsletter.controller.ts
│   │   │   ├── newsletter.service.ts
│   │   │   ├── newsletter.module.ts
│   │   │   └── dto/
│   │   ├── compliance/           # /api/v1/compliance (Audit trail for SEC/FINMA disclaimers)
│   │   │   ├── compliance.controller.ts
│   │   │   ├── compliance.service.ts
│   │   │   ├── compliance.module.ts
│   │   │   └── dto/
│   │   ├── health/               # /health/live & /health/ready (Uptime, memory, SQLite probe)
│   │   │   ├── health.controller.ts
│   │   │   ├── health.service.ts
│   │   │   └── health.module.ts
│   │   └── prisma/               # PrismaService connection lifecycle management
│   │       ├── prisma.module.ts
│   │       └── prisma.service.ts
│   ├── app.module.ts             # Root application module wiring
│   └── main.ts                   # Application bootstrap, Swagger setup, global pipes/filters
├── Tests/
│   ├── UnitTest/                 # Fast, isolated unit test suites
│   │   ├── auth/                 # Password hashing, OTP generation, sliding expiration
│   │   ├── crypto/               # AES-256-GCM encryption & decryption correctness
│   │   ├── leads/                # Corporate domain validation, honeypot filters
│   │   ├── simulation/           # Intent calculation and token serialization
│   │   └── telemetry/            # Quote caching engine, circuit breaker fallback
│   └── IntegrationTest/          # Multi-component & E2E integration test suites
│       ├── auth-flow/            # Complete 2-step OTP verification and JWT issuance
│       ├── leads-pipeline/       # Lead ingestion, encrypted DB write, webhook trigger
│       ├── sandbox-guard/        # Rejection of DEV_STATIC_OTP with HTTP 403 in production
│       └── telemetry-stream/     # WebSocket/REST ticker delivery and Enclave telemetry
├── Dockerfile                    # Multi-stage production container
├── docker-compose.yml            # Local development orchestration
├── docker-entrypoint.sh          # Container startup script
├── dist-runner.js               # Production entrypoint resolver
├── render.yaml                   # Render deployment configuration
├── vercel.json                   # Vercel serverless configuration
├── .env.example                  # Environment variable template
├── package.json                 # Dependencies and scripts
└── tsconfig.json                # TypeScript strict mode configuration
```

---

## Database Schema

### Canonical Schema Reference

See [`prisma/schema.prisma`](prisma/schema.prisma) for the authoritative database schema definition.

### Models

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id               String            @id @default(uuid())
  email            String            @unique
  fullName         String?
  passphraseHash   String
  tier             String            @default("PRIVATE_WEALTH") // RETAIL | PRIVATE_WEALTH | INSTITUTIONAL
  isCorporate      Boolean           @default(false)
  isActive         Boolean           @default(true)
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  sessions         Session[]
  otpCodes         OtpCode[]
  simulationIntent SimulationIntent?
}

model Session {
  id                String   @id @default(uuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshTokenHash  String   @unique // Deterministic HMAC-SHA256 hash (bearer credentials never stored plaintext)
  handoffTicketHash String?  @unique // Deterministic HMAC-SHA256 hash (bearer credentials never stored plaintext)
  ipAddress         String?
  userAgent         String?
  expiresAt         DateTime
  createdAt         DateTime @default(now())
}

model OtpCode {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  email       String
  hashedCode  String
  attempts    Int      @default(0)
  isConsumed  Boolean  @default(false)
  expiresAt   DateTime
  createdAt   DateTime @default(now())

  @@index([email, expiresAt])
}

model LeadInquiry {
  id                 String   @id @default(uuid())
  fullNameEncrypted  String   // AES-256-GCM encrypted
  workEmailEncrypted String   // AES-256-GCM encrypted
  workEmailHash      String   // Blind index HMAC-SHA256 for fast lookup
  companyName        String
  websiteUrl         String?
  telegramEncrypted  String?  // AES-256-GCM encrypted
  service            String   // CRYPTO | STOCKS | AI_FUNDS | REAL_ESTATE | VIP_CARDS | CARS | WALLET
  allocationRange    String   // e.g. "$5M - $10M"
  domainScore        Float    @default(1.0)
  isSpam             Boolean  @default(false)
  crmDispatched      Boolean  @default(false)
  createdAt          DateTime @default(now())

  @@index([workEmailHash])
}

model SimulationIntent {
  id              String   @id @default(uuid())
  token           String   @unique
  userId          String?  @unique
  user            User?    @relation(fields: [userId], references: [id])
  capitalAmount   Float
  riskPosture     Int      // 1: Capital Preservation, 2: Balanced, 3: Alpha
  projectedYield  Float
  expiresAt       DateTime
  createdAt       DateTime @default(now())
}

model NewsletterSubscriber {
  id              String    @id @default(uuid())
  email           String    @unique
  verificationToken String? @unique
  isConfirmed     Boolean   @default(false)
  confirmedAt     DateTime?
  createdAt       DateTime @default(now())
}

model AuditLog {
  id              String   @id @default(uuid())
  action          String
  actorId         String?
  ipAddressHash   String
  userAgent       String?
  metadata        String?  // JSON string
  createdAt       DateTime @default(now())
}
```

### Security Properties

1. **No Plaintext Secrets**: Refresh tokens and handoff tickets are stored as HMAC-SHA256 hashes
2. **Field-Level Encryption**: Sensitive PII in LeadInquiry is AES-256-GCM encrypted
3. **Blind Indexing**: Fast lookups via deterministic hashes without exposing plaintext
4. **IP Anonymization**: Audit logs store HMAC-SHA256 hashed IPs (GDPR compliant)
5. **Cascade Deletion**: User deletion cascades to sessions and OTP codes

---

## API Contract Matrix

Interactive OpenAPI 3 / Swagger documentation is available at **`http://localhost:4000/api/docs`**.

### 1. Authentication & Dashboard Hand-Off (`/api/v1/auth`)

| Method   | Endpoint                    | Description                                                        | Request Body / Query                              | Security & Invariants                                                             |
| :------- | :-------------------------- | :----------------------------------------------------------------- | :------------------------------------------------ | :-------------------------------------------------------------------------------- |
| `POST`   | `/api/v1/auth/initiate`    | Step 1: Validate credentials or register, dispatch 6-digit OTP     | `{ email, passphrase, fullName?, tier?, mode }` | 5-minute sliding TTL; generic anti-enumeration responses                          |
| `POST`   | `/api/v1/auth/verify-otp`  | Step 2: Verify OTP, issue JWT, set refresh cookie & handoff ticket | `{ challengeId, otpCode }`                      | **Production Sandbox Guard**: Rejects dev static OTP with `403 Forbidden`          |
| `POST`   | `/api/v1/auth/exchange`    | Burn single-use exchange ticket and issue dashboard JWT            | `{ ticket? }` or `wavy_handoff` cookie           | Single-use burned token at rest; 60s TTL                                          |
| `POST`   | `/api/v1/auth/refresh`     | Rotate session and issue fresh access token                        | HttpOnly `refreshToken` cookie                   | Silent session renewal                                                            |
| `POST`   | `/api/v1/auth/logout`      | Revoke session and clear cookies                                   | HttpOnly `refreshToken` cookie                   | Clears cookies across domains                                                     |
| `GET`    | `/api/v1/auth/me`          | Fetch authenticated user profile                                   | Bearer JWT token                                  | Whitelisted UserDto response                                                      |

### 2. Institutional Mandates & Lead Pipeline (`/api/v1/leads`)

| Method   | Endpoint                  | Description                          | Request Body                                                                                                  | Security & Invariants                                                                                                            |
| :------- | :------------------------ | :----------------------------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| `POST`   | `/api/v1/leads/inquire`  | Ingest institutional capital mandate | `{ fullName, workEmail, companyName, websiteUrl?, telegram?, service, allocationRange, notes?, honeypot? }` | AES-256-GCM contact encryption; HMAC-SHA256 blind index (`workEmailHash`); blocks disposable domains; priority Telegram alerts |

### 3. Portfolio Simulation Intent (`/api/v1/simulation`)

| Method   | Endpoint                      | Description                                        | Request Body / Params                              | Security & Invariants                             |
| :------- | :---------------------------- | :------------------------------------------------- | :------------------------------------------------- | :------------------------------------------------ |
| `POST`   | `/api/v1/simulation/save`    | Tokenize simulator parameters for onboarding       | `{ capitalAmount, riskPosture, projectedYield }`   | Issues `sim_<hex>` token with 30-day sliding TTL   |
| `GET`    | `/api/v1/simulation/:token`  | Fetch simulated parameters for onboarding pre-fill | Route param `:token`                              | Validates expiration                              |

### 4. Live Syndicate Telemetry & Ticker (`/api/v1/telemetry`, `/ws/ticker`)

| Protocol | Route                         | Description                                      | Benchmarks & Metrics                                                                                                                                                                   |
| :------- | :---------------------------- | :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/v1/telemetry/ticker`   | Cached REST snapshot of 11 market benchmarks     | Crypto (`BTC`, `ETH`, `SOL`, `WAVY-YIELD`), Equities (`AAPL`, `NVDA`, `TSLA`, `SPY`), Commodities & Treasuries (`US 10Y`, `XAU/USD`, `BRENT`) + 7-day sparklines |
| `WS`     | `/ws/ticker`                  | Real-time continuous WebSocket ticker stream     | Broadcasts `ticker:quotes` event every 3 seconds to active subscribers                                                                                                                |
| `GET`    | `/api/v1/telemetry/enclave`  | Cryptographic proof-of-reserves & node telemetry | Deterministic SHA-256 Merkle root, 14.2ms clearing latency, Geneva/Zurich/New York HSM node statuses, $17.22B Tier AUM                                                                 |

### 5. Research Newsletter & Regulatory Compliance (`/api/v1/newsletter`, `/api/v1/compliance`)

| Method   | Endpoint                           | Description                                 | Request Body / Query                | Security & Invariants                                           |
| :------- | :--------------------------------- | :------------------------------------------ | :---------------------------------- | :-------------------------------------------------------------- |
| `POST`   | `/api/v1/newsletter/subscribe`    | Register for research dispatches            | `{ email }`                         | Dispatches Swiss double opt-in verification email via Resend    |
| `GET`    | `/api/v1/newsletter/verify`       | Activate double opt-in subscriber           | Query param `?token=`               | Confirms subscription                                           |
| `POST`   | `/api/v1/newsletter/unsubscribe`  | One-click unsubscribe                       | `{ email }`                         | Removes record                                                  |
| `POST`   | `/api/v1/compliance/ack`          | Record regulatory disclosure acknowledgment | `{ action, actorId?, metadata? }`   | Anonymizes IP via deterministic HMAC-SHA256 (`ipAddressHash`)   |

### 6. Health & Readiness Probes (`/health`)

| Method  | Endpoint          | Description                                     | Response Details                       |
| :------ | :---------------- | :---------------------------------------------- | :------------------------------------- |
| `GET`   | `/health/live`    | Process liveness probe                          | Uptime seconds, status `ok`           |
| `GET`   | `/health/ready`   | Process readiness & database connectivity probe | SQLite connectivity, memory heap usage |

---

## Security Architecture

### 1. Production Sandbox Guard (Non-Negotiable)

Development mock codes (`DEV_STATIC_OTP`) and console fallback emails are strictly forbidden when `NODE_ENV=production`. Any attempt to submit dev mock codes in production is rejected with **`HTTP 403 Forbidden`** and logged as an intrusion anomaly.

**Implementation**: `env.validation.ts` validates environment at bootstrap.

### 2. Field-Level Encryption at Rest (AES-256-GCM)

Sensitive lead contact details (`fullName`, `workEmail`, `telegram`) are encrypted using AES-256-GCM authenticated encryption (`iv:authTag:ciphertext`).

**Implementation**: `CryptoService.encryptField()` / `decryptField()`

### 3. HMAC-SHA256 Blind Indexing

Fast exact-match lookups (`workEmailHash`) are performed via deterministic blind index hashing, ensuring zero plaintext contact details in SQLite.

**Implementation**: `CryptoService.hashBlindIndex()`

### 4. Zero Raw IP Persistence

Regulatory compliance acknowledgments hash the user's IP address with HMAC-SHA256 before writing to `AuditLog`.

**Implementation**: `CryptoService.hashIpAddress()`

### 5. Zero PII Logging

The `PiiRedactionInterceptor` masks emails (`a***@domain.ch`), passwords, authorization tokens, and OTP codes before stdout emission.

**Implementation**: `PiiRedactionInterceptor` in `main.ts`

### 6. Global Error Shielding (`AllExceptionsFilter`)

Catches all unhandled exceptions and Prisma database errors (e.g. `P2002`), stripping internal stack traces and returning sanitized JSON responses.

**Implementation**: `AllExceptionsFilter` in `common/filters/`

### 7. Circuit-Breaker Resilience (<50ms SLA)

In-memory quote caching engine guarantees uninterrupted responses even during upstream liquidity provider downtime.

**Implementation**: `TelemetryService` with in-memory cache

### 8. Rate Limiting

Dual-tier sliding window rate limiting:
- General: 120 requests/minute
- Auth/Leads: 5 requests/minute

**Implementation**: `ThrottlerModule` in `app.module.ts`

### 9. CORS Whitelisting

Strict origin whitelisting with allowed origins for client, dashboard, and production frontend.

**Implementation**: `app.enableCors()` in `main.ts`

### 10. Security Headers

Helmet middleware with:
- Content Security Policy (CSP)
- HSTS (HTTP Strict Transport Security)
- Frameguard (prevents clickjacking)
- Referrer Policy
- MIME type sniffing prevention

**Implementation**: `helmet()` middleware in `main.ts`

---

## Error Handling

### Global Error Architecture

All exceptions flow through a unified defensive error architecture:

```
                  Client Request
                        │
                        ▼
                [Route Controller]
                        │
       Throws Exception (Http / System)
                        │
                        ▼
            [AllExceptionsFilter (Global)]
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
  HttpException?                 Unknown Error?
         │                             │
  Extract Status                Status = 500
  Sanitize Message              Message = "Internal institutional error"
         │                             │
         └──────────────┬──────────────┘
                        │
                        ▼
            [Log Error (PII-Redacted)]
                        │
                        ▼
          [Return Standard Envelope]
          {
            "success": false,
            "error": "Sanitized error message",
            "timestamp": "2026-09-11T05:00:00.000Z"
          }
```

### Standardized Response Envelope

All endpoints return a uniform contract:

```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```

### Error Response Example

```json
{
  "success": false,
  "error": "Invalid or expired authentication token",
  "timestamp": "2026-10-07T12:34:56.789Z"
}
```

---

## Authentication Flow

### Dashboard Handoff Handshake

```
Landing Page (Client)               Backend Gateway                User Dashboard
     │                                    │                              │
     │ 1. POST /api/v1/auth/verify-otp    │                              │
     │───────────────────────────────────>│                              │
     │                                    │                              │
     │ 2. Return short-lived ticket &     │                              │
     │    set HttpOnly secure exchange cookie                            │
     │<───────────────────────────────────│                              │
     │                                                                   │
     │ 3. Client navigates to /auth/exchange (No ticket in URL query)    │
     │──────────────────────────────────────────────────────────────────>│
     │                                                                   │
     │                                    │ 4. POST /api/v1/auth/exchange
     │                                    │    (Reads secure cookie / body)
     │                                    │<─────────────────────────────│
     │                                    │ 5. Session confirmed & ticket│
     │                                    │    consumed (single-use)     │
     │                                    │─────────────────────────────>│
```

### Security Note

**Zero Bearer Credentials in URL Queries**:
The `handoffTicket` must never appear in URL query parameters (`?ticket=...`). URL query strings are retained in browser history, proxy logs, Referer headers, and web analytics. Instead, tickets are securely transferred via short-lived `HttpOnly`, `SameSite=Lax`, `Secure` exchange cookies or an explicit POST body to the dashboard exchange endpoint, which immediately invalidates and consumes the ticket.

---

## Deployment

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env

# 3. Generate Prisma client & apply SQLite migrations
npx prisma generate
npx prisma db push

# 4. Start development server with hot-reload
npm run start:dev

# 5. Run full automated Vitest test suite (72/72 tests passing)
npm test

# 6. Typecheck with TypeScript strict mode (0 errors)
npx tsc --noEmit

# 7. Lint codebase
npm run lint
```

### Production Cloud Deployment (Render & Vercel)

#### Render Deployment (Recommended API Gateway Hosting)

The service is deployed on Render as `wavyassets-backend` via [`render.yaml`](render.yaml):
- **Build Command**: `npm install --include=dev && npm run build:render`
  - Runs `prisma generate && prisma db push --skip-generate && nest build` ensuring PostgreSQL tables are created and synchronized.
- **Start Command**: `npm run start:prod` (`node dist-runner.js`)
- **Health Check Path**: `/health/live` (with root route `HEAD /` and `GET /` support).
- **Environment Secrets**: Managed as documented in [`.env.prod`](.env.prod).

#### Vercel Serverless Function Deployment

Configured via [`vercel.json`](vercel.json) using `@vercel/node` routing requests to `dist/main.js`.

### Docker & Docker Compose Orchestration

The repository includes a hardened, multi-stage production container running as an unprivileged `node` user with volume persistence, health probes, and Docker Compose orchestration.

#### 1. Production Deployment (Recommended)

```bash
# Start container in detached mode with persistent SQLite storage
docker compose up -d --build

# Inspect container health and readiness status
docker compose ps
curl -f http://localhost:4000/health/ready

# View streaming logs
docker compose logs -f backend

# Graceful shutdown
docker compose down
```

#### 2. Local Development Orchestration (Live Hot-Reload)

```bash
# Start in development mode with live source-code mount
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

#### 3. Standalone Docker Run

```bash
# Manual image build and container launch
docker build -t wavyassets/landing-page-backend:1.0.0 .
docker run -d -p 4000:4000 -v landing_backend_data:/app/prisma --name wavyassets-landing-backend --env-file .env wavyassets/landing-page-backend:1.0.0
docker inspect --format='{{json .State.Health.Status}}' wavyassets-landing-backend
```

#### 4. Monorepo Integration

- **Root Compose**: `docker compose up -d` (All 6 frontends & backends on `wavyassets-network`)
- **Backend Stack Compose**: `docker compose -f Backend/docker-compose.yml up -d` (All 3 backends on `wavyassets-backend-network`)
- **Container Name**: `wavyassets-landing-backend`
- **Internal API Gateway**: Port `:4000` (Swagger: `http://localhost:4000/api/docs`, Health: `http://localhost:4000/health/live`)

---

## Development Workflow

### Non-Negotiable Architectural Invariants

1. **Production Sandbox Guard**: In `NODE_ENV=production`, any presence or submission of `DEV_STATIC_OTP` or use of `EMAIL_PROVIDER=console` is strictly forbidden, immediately rejected with HTTP `403 Forbidden`, and flagged as an intrusion anomaly.
2. **Zero PII Logging**: All emitted logs must redact passwords, OTP codes, bearer tokens, full names, and sensitive email prefixes.
3. **Secure Error Shielding**: Client responses must never leak stack traces, internal errors, or database infrastructure details.
4. **Sub-50ms API Latency**: Core read endpoints (telemetry, health, intent retrieval) must respond in `< 50ms`.
5. **Deterministic Testing**: All business logic and security boundaries must be validated by automated tests in `Tests/UnitTest/` and `Tests/IntegrationTest/`.
6. **Documentation Synchronization**: OpenAPI/Swagger documentation at `/api/docs` and `.ai/` context files must be maintained in strict lockstep with implementation.

### Quality Metrics

- **Automated Vitest Suites**: **22 test files, 72 / 72 tests passing (100%)**.
- **TypeScript Strict Mode**: **0 type errors**.
- **OpenAPI / Swagger Documentation**: Available at **`/api/docs`**.
- **Governance Alignment**: Fully compliant with [`GEMINI.MD`](GEMINI.MD) and [`.ai/`](.ai/) specifications.

### File Naming Conventions

- **Controllers**: `<module>.controller.ts`
- **Services**: `<module>.service.ts`
- **Modules**: `<module>.module.ts`
- **DTOs**: `<module>.dto.ts` (in `dto/` subdirectory)
- **Guards**: `<guard>.guard.ts` (in `guards/` subdirectory)
- **Tests**: `<feature>.test.ts` (in `Tests/UnitTest/` or `Tests/IntegrationTest/`)

### Code Standards

- **TypeScript Strict Mode**: Enabled
- **Class Validation**: All DTOs use `class-validator` decorators
- **Error Handling**: All errors go through `AllExceptionsFilter`
- **Response Format**: All responses use standardized envelope
- **Security**: All sensitive data is encrypted or hashed
- **Logging**: All logs are PII-redacted

---

## References

- **Project README**: [`README.md`](README.md)
- **AI Context**: [`.ai/architecture.md`](.ai/architecture.md)
- **Agent Protocol**: [`.ai/AGENT.md`](.ai/AGENT.md)
- **Database Schema**: [`prisma/schema.prisma`](prisma/schema.prisma)
- **API Documentation**: http://localhost:4000/api/docs
- **Environment Template**: [`.env.example`](.env.example)

---

*Last Updated: 2026-10-07*
