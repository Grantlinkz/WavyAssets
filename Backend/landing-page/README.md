# WavyAssets Landing Page Backend

> High-availability NestJS API gateway, cryptographic authentication engine, live syndicate telemetry broadcaster, and institutional mandate pipeline for the WavyAssets platform.

[![NestJS](https://img.shields.io/badge/NestJS-11.0-e0234e?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://www.sqlite.org/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2_Passing-success?logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Stage-blue?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary-gold)](LICENSE)

---

## 1. System Architecture Overview

The **Landing Page Backend** (`Backend/landing-page`) serves as the secure API gateway connecting the public marketing terminal (`Frontend/landing-page`) to the core institutional sovereign wealth infrastructure and orchestrating seamless client hand-off into the **User Dashboard** (`Frontend/user-dashboard`).

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
             ┌────────────────┴─────┐  ┌──────┴──────┐  ┌──────┴──────────────┐
             │                      │  │             │  │                     │
             ▼                      ▼  ▼             ▼  ▼                     ▼
      ┌──────────────┐     ┌──────────────┐   ┌──────────────┐         ┌──────────────┐
      │  AuthModule  │     │  LeadModule  │   │ TelemetryMod │         │SimulationMod │
      │  2-Step OTP  │     │  AES-256 PII │   │ Multi-Asset  │         │ Intent Save  │
      │ Handoff Exch │     │  Blind Index │   │ WS Ticker    │         │ 30-day TTL   │
      └──────┬───────┘     └──────┬───────┘   └──────┬───────┘         └──────┬───────┘
             │                    │                  │                        │
             │             ┌──────┴──────────┐       │                 ┌──────┴───────┐
             │             │  NewsletterMod  │       │                 │ComplianceMod │
             │             │  Double Opt-In  │       │                 │ Audit Vault  │
             │             └──────┬──────────┘       │                 └──────┬───────┘
             │                    │                  │                        │
             └────────────────────┼──────────────────┴────────────────────────┘
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

## 2. API Contract Matrix

Interactive OpenAPI 3 / Swagger documentation is available at **`http://localhost:4000/api/docs`**.

### 1. Authentication & Dashboard Hand-Off (`/api/v1/auth`)

| Method   | Endpoint                    | Description                                                        | Request Body / Query                              | Security & Invariants                                                             |
| :------- | :-------------------------- | :----------------------------------------------------------------- | :------------------------------------------------ | :-------------------------------------------------------------------------------- |
| `POST` | `/api/v1/auth/initiate`   | Step 1: Validate credentials or register, dispatch 6-digit OTP     | `{ email, passphrase, fullName?, tier?, mode }` | 5-minute sliding TTL; generic anti-enumeration responses                          |
| `POST` | `/api/v1/auth/verify-otp` | Step 2: Verify OTP, issue JWT, set refresh cookie & handoff ticket | `{ challengeId, otpCode }`                      | **Production Sandbox Guard**: Rejects dev static OTP with `403 Forbidden` |
| `POST` | `/api/v1/auth/exchange`   | Burn single-use exchange ticket and issue dashboard JWT            | `{ ticket? }` or `wavy_handoff` cookie        | Single-use burned token at rest; 60s TTL                                          |
| `POST` | `/api/v1/auth/refresh`    | Rotate session and issue fresh access token                        | HttpOnly`refreshToken` cookie                   | Silent session renewal                                                            |
| `POST` | `/api/v1/auth/logout`     | Revoke session and clear cookies                                   | HttpOnly`refreshToken` cookie                   | Clears cookies across domains                                                     |
| `GET`  | `/api/v1/auth/me`         | Fetch authenticated user profile                                   | Bearer JWT token                                  | Whitelisted UserDto response                                                      |

### 2. Institutional Mandates & Lead Pipeline (`/api/v1/leads`)

| Method   | Endpoint                  | Description                          | Request Body                                                                                                  | Security & Invariants                                                                                                            |
| :------- | :------------------------ | :----------------------------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/v1/leads/inquire` | Ingest institutional capital mandate | `{ fullName, workEmail, companyName, websiteUrl?, telegram?, service, allocationRange, notes?, honeypot? }` | AES-256-GCM contact encryption; HMAC-SHA256 blind index (`workEmailHash`); blocks disposable domains; priority Telegram alerts |

### 3. Portfolio Simulation Intent (`/api/v1/simulation`)

| Method   | Endpoint                      | Description                                        | Request Body / Params                              | Security & Invariants                             |
| :------- | :---------------------------- | :------------------------------------------------- | :------------------------------------------------- | :------------------------------------------------ |
| `POST` | `/api/v1/simulation/save`   | Tokenize simulator parameters for onboarding       | `{ capitalAmount, riskPosture, projectedYield }` | Issues`sim_<hex>` token with 30-day sliding TTL |
| `GET`  | `/api/v1/simulation/:token` | Fetch simulated parameters for onboarding pre-fill | Route param`:token`                              | Validates expiration                              |

### 4. Live Syndicate Telemetry & Ticker (`/api/v1/telemetry`, `/ws/ticker`)

| Protocol | Route                         | Description                                      | Benchmarks & Metrics                                                                                                                                                                   |
| :------- | :---------------------------- | :----------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/api/v1/telemetry/ticker`  | Cached REST snapshot of 11 market benchmarks     | Crypto (`BTC`, `ETH`, `SOL`, `WAVY-YIELD`), Equities (`AAPL`, `NVDA`, `TSLA`, `SPY`), Commodities & Treasuries (`US 10Y`, `XAU/USD`, `BRENT`) + 7-day sparklines |
| `WS`   | `/ws/ticker`                | Real-time continuous WebSocket ticker stream     | Broadcasts`ticker:quotes` event every 3 seconds to active subscribers                                                                                                                |
| `GET`  | `/api/v1/telemetry/enclave` | Cryptographic proof-of-reserves & node telemetry | Deterministic SHA-256 Merkle root, 14.2ms clearing latency, Geneva/Zurich/New York HSM node statuses, $17.22B Tier AUM                                                                 |

### 5. Research Newsletter & Regulatory Compliance (`/api/v1/newsletter`, `/api/v1/compliance`)

| Method   | Endpoint                           | Description                                 | Request Body / Query                | Security & Invariants                                           |
| :------- | :--------------------------------- | :------------------------------------------ | :---------------------------------- | :-------------------------------------------------------------- |
| `POST` | `/api/v1/newsletter/subscribe`   | Register for research dispatches            | `{ email }`                       | Dispatches Swiss double opt-in verification email via Resend    |
| `GET`  | `/api/v1/newsletter/verify`      | Activate double opt-in subscriber           | Query param`?token=`              | Confirms subscription                                           |
| `POST` | `/api/v1/newsletter/unsubscribe` | One-click unsubscribe                       | `{ email }`                       | Removes record                                                  |
| `POST` | `/api/v1/compliance/ack`         | Record regulatory disclosure acknowledgment | `{ action, actorId?, metadata? }` | Anonymizes IP via deterministic HMAC-SHA256 (`ipAddressHash`) |

### 6. Health & Readiness Probes (`/health`)

| Method  | Endpoint          | Description                                     | Response Details                       |
| :------ | :---------------- | :---------------------------------------------- | :------------------------------------- |
| `GET` | `/health/live`  | Process liveness probe                          | Uptime seconds, status`ok`           |
| `GET` | `/health/ready` | Process readiness & database connectivity probe | SQLite connectivity, memory heap usage |

---

## 3. Database Schema (Prisma / SQLite)

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
  refreshTokenHash  String   @unique // Deterministic HMAC-SHA256 hash (never persist plaintext bearer tokens)
  handoffTicketHash String?  @unique // Deterministic HMAC-SHA256 hash (never persist plaintext bearer tickets)
  ipAddress         String?
  userAgent         String?
  expiresAt         DateTime
  createdAt         DateTime @default(now())
}

model OtpCode {
  id         String   @id @default(uuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  email      String
  hashedCode String
  attempts   Int      @default(0)
  isConsumed Boolean  @default(false)
  expiresAt  DateTime
  createdAt  DateTime @default(now())

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
  id             String   @id @default(uuid())
  token          String   @unique
  userId         String?  @unique
  user           User?    @relation(fields: [userId], references: [id])
  capitalAmount  Float
  riskPosture    Int      // 1: Capital Preservation, 2: Balanced Growth, 3: Max Alpha
  projectedYield Float
  expiresAt      DateTime
  createdAt      DateTime @default(now())
}

model NewsletterSubscriber {
  id                String    @id @default(uuid())
  email             String    @unique
  verificationToken String?   @unique
  isConfirmed       Boolean   @default(false)
  confirmedAt       DateTime?
  createdAt         DateTime  @default(now())
}

model AuditLog {
  id            String   @id @default(uuid())
  action        String
  actorId       String?
  ipAddressHash String
  userAgent     String?
  metadata      String?  // JSON string
  createdAt     DateTime @default(now())
}
```

---

## 4. Security Invariants & Defensive Safeguards

1. **Production Sandbox Guard (Non-Negotiable)**:
   Development mock codes (`DEV_STATIC_OTP`) and console fallback emails are strictly forbidden when `NODE_ENV=production`. Any attempt to submit dev mock codes in production is rejected with **`HTTP 403 Forbidden`** and logged as an intrusion anomaly.
2. **Field-Level Encryption at Rest (AES-256-GCM)**:
   Sensitive lead contact details (`fullName`, `workEmail`, `telegram`) are encrypted using AES-256-GCM authenticated encryption (`iv:authTag:ciphertext`).
3. **HMAC-SHA256 Blind Indexing**:
   Fast exact-match lookups (`workEmailHash`) are performed via deterministic blind index hashing, ensuring zero plaintext contact details in SQLite.
4. **Zero Raw IP Persistence**:
   Regulatory compliance acknowledgments hash the user's IP address with HMAC-SHA256 before writing to `AuditLog`.
5. **Zero PII Logging**:
   The `PiiRedactionInterceptor` masks emails (`a***@domain.ch`), passwords, authorization tokens, and OTP codes before stdout emission.
6. **Global Error Shielding (`AllExceptionsFilter`)**:
   Catches all unhandled exceptions and Prisma database errors (e.g. `P2002`), stripping internal stack traces and returning sanitized JSON responses.
7. **Circuit-Breaker Resilience (<50ms SLA)**:
   In-memory quote caching engine guarantees uninterrupted responses even during upstream liquidity provider downtime.

---

## 5. Local Development & Quick Start

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

---

## 6. Docker & Docker Compose Orchestration

The repository includes a hardened, multi-stage production container running as an unprivileged `node` user with volume persistence, health probes, and Docker Compose orchestration:

### 1. Production Deployment (Recommended)
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

### 2. Local Development Orchestration (Live Hot-Reload)
```bash
# Start in development mode with live source-code mount
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### 3. Standalone Docker Run
```bash
# Manual image build and container launch
docker build -t wavyassets/landing-page-backend:latest .
docker run -d -p 4000:4000 --name wavyassets-backend --env-file .env wavyassets/landing-page-backend:latest
docker inspect --format='{{json .State.Health.Status}}' wavyassets-backend
```

---

## 7. Quality & Verification Metrics

- **Automated Vitest Suites**: **22 test files, 72 / 72 tests passing (100%)**.
- **TypeScript Strict Mode**: **0 type errors**.
- **OpenAPI / Swagger Documentation**: Available at **`/api/docs`**.
- **Governance Alignment**: Fully compliant with [`GEMINI.MD`](GEMINI.MD) and [`.ai/`](.ai/) specifications.
