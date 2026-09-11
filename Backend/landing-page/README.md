# WavyAssets Landing Page Backend

> High-availability NestJS API gateway, cryptographic authentication engine, live syndicate telemetry broadcaster, and institutional mandate pipeline for the WavyAssets platform.

[![NestJS](https://img.shields.io/badge/NestJS-11.0-e0234e?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0-2D3748?logo=prisma)](https://www.prisma.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-Proprietary-gold)](LICENSE)

---

## Architecture Overview

The **Landing Page Backend** (`Backend/landing-page`) serves as the secure gateway connecting the public-facing terminal (`Frontend/landing-page`) to the institutional ecosystem and orchestrating seamless client hand-off into the **User Dashboard** (`Frontend/user-dashboard`).

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
     │  2-Step OTP  │     │  Inquiries   │   │ Ticker / WS  │         │ Intent Save  │
     │  JWT Cookie  │     │  PGP / CRM   │   │ Enclave Proof│         │ Onboarding   │
     └──────┬───────┘     └──────┬───────┘   └──────┬───────┘         └──────┬───────┘
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

## API Contract Matrix

### 1. Authentication & Session Gateway (`/api/v1/auth`)

| Method | Endpoint | Description | Request Body / Params | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/initiate` | Step 1: Validate email/passphrase or initiate mandate creation | `{ email, passphrase, fullName?, tier?, mode }` | `{ success: true, step: 2, challengeId: string }` |
| `POST` | `/api/v1/auth/verify-otp` | Step 2: Validate 6-digit OTP and issue JWT session | `{ challengeId, otpCode: "123456" }` | `{ success: true, user: { id, email, tier }, handoffTicket: string }` (Sets HttpOnly JWT Cookie) |
| `POST` | `/api/v1/auth/logout` | Revoke active session and clear cookies | None | `{ success: true }` |
| `GET` | `/api/v1/auth/session` | Validate active session for client hydration | None (Bearer / Cookie) | `{ authenticated: boolean, user?: UserDto }` |

### 2. Institutional Mandates & Lead Pipeline (`/api/v1/leads`)

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/leads/inquire` | Submit institutional contact form with domain scoring | `{ fullName, workEmail, telegram, companyName, websiteUrl, service, allocation }` | `{ success: true, leadId: string, message: "Mandate recorded" }` |

### 3. Live Telemetry & Syndicate Ticker (`/api/v1/telemetry`)

| Protocol | Endpoint | Description | Output Format |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/telemetry/ticker` | Snapshot of active market quotes & 24h deltas | `[ { symbol: "BTC/USD", price: 92450.00, change24h: 2.8 }, ... ]` |
| `WS` | `/ws/ticker` | Real-time continuous market quote stream | Push event every 1000ms with updated tickers |
| `GET` | `/api/v1/telemetry/enclave` | Cryptographic Merkle root and HSM cluster status | `{ merkleRoot, hsmStatus: "HEALTHY", latencyMs: 14, aum: { institutional: 12.4e9, privateWealth: 4.82e9 } }` |

### 4. Portfolio Simulation & Intent Persistence (`/api/v1/simulation`)

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/simulation/save` | Tokenize simulator parameters for onboarding | `{ capital: 250000, aggressiveness: 2, projectedYield: 14.8 }` | `{ intentToken: "sim_abc123" }` |
| `GET` | `/api/v1/simulation/:token` | Fetch simulated allocation by intent token | Route param `:token` | `{ capital, aggressiveness, posture }` |

### 5. Newsletter & Disclosures (`/api/v1/newsletter`, `/api/v1/compliance`)

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/newsletter/subscribe` | Register for PGP-encrypted research dispatch | `{ email: "allocator@familyoffice.ch" }` |
| `POST` | `/api/v1/compliance/ack` | Audit log regulatory disclosure acceptance | `{ disclosureVersion: "2026.1", jurisdiction: "CH" }` |

---

## Database Schema (Prisma / SQLite)

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  fullName      String?
  passwordHash  String
  tier          String    @default("institutional") // institutional | private-wealth
  isVerified    Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  otps          OtpCode[]
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash    String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())
}

model OtpCode {
  id         String   @id @default(uuid())
  userId     String?
  email      String
  codeHash   String
  attempts   Int      @default(0)
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  user       User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model LeadInquiry {
  id          String   @id @default(uuid())
  fullName    String
  workEmail   String
  companyName String
  websiteUrl  String?
  telegram    String?
  service     String
  allocation  String
  riskScore   Float    @default(0.0)
  status      String   @default("PENDING") // PENDING | CONTACTED | DISQUALIFIED
  createdAt   DateTime @default(now())
}

model SimulationIntent {
  token          String   @id @default(uuid())
  capital        Float
  aggressiveness Int
  projectedYield Float
  createdAt      DateTime @default(now())
  expiresAt      DateTime
}

model NewsletterSubscriber {
  id          String   @id @default(uuid())
  email       String   @unique
  isConfirmed Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model ComplianceAuditLog {
  id                String   @id @default(uuid())
  disclosureVersion String
  jurisdiction      String
  ipHash            String
  createdAt         DateTime @default(now())
}
```

---

## Security & Reliability Invariants

1. **Transactional Email Gateway via Resend (Primary)**: All customer OTP verification codes and mandate receipts dispatch through the Resend API with verified SPF/DKIM/DMARC records.
2. **Encrypted Enclave Dispatch via Telegram (Accredited Tier)**: For verified accredited allocators and institutional clients, dual real-time 2FA telemetry dispatches via an authenticated Telegram Enclave alert bot.
3. **Strict Production Sandbox Lock (Non-Negotiable)**: Development testing mechanisms (`DEV_STATIC_OTP`, `EMAIL_PROVIDER="console"`) are hard-coded to be disabled when `NODE_ENV=production`. Any attempt to present a mock OTP in production is rejected with `403 Forbidden` and logged as a security intrusion.
4. **Zero PII Logging**: All emitted logs redact personal identifiers, passwords, authorization tokens, and OTP codes before standard output.
5. **Brute-Force Lockouts**: Repeated invalid OTP submissions trigger exponential backoff and account locking after 3 consecutive failures.
6. **Domain Verification**: Ingested leads are scored against a strict MX and disposable domain blocklist.
7. **Sub-50ms Response Time**: Static cache and in-memory rate limiters ensure public endpoints respond in under 50ms.

---

## Local Development & Quick Start

```bash
# 1. Navigate to the backend directory
cd Backend/landing-page

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env

# 4. Generate Prisma client & apply SQLite migrations
npx prisma migrate dev --name init

# 5. Start development server with hot-reload
npm run start:dev

# 6. Run automated test suite
npm test

# 7. Run E2E integration tests
npm run test:e2e
```

---

## Specification Reference

For the comprehensive 6-week architecture roadmap, security threat models, and evaluation criteria, review:
[`Backend/landing-page/tools/WavyAssets LandingPage Backend Execution.md`](tools/WavyAssets%20LandingPage%20Backend%20Execution.md)
