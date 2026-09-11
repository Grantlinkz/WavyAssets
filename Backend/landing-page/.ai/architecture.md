# Architecture Context — WavyAssets Landing Page Backend

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

## Directory Boundaries & Module Ownership

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
│   │   ├── leads/                # /api/v1/leads (Institutional contact ingestion, AES encryption, CRM webhook)
│   │   ├── telemetry/            # /api/v1/telemetry & /ws/ticker (Live quotes, Enclave proof-of-reserves)
│   │   ├── simulation/           # /api/v1/simulation (Intent tokenization, portfolio pre-fill)
│   │   ├── newsletter/           # /api/v1/newsletter (Double opt-in research subscription)
│   │   ├── compliance/           # /api/v1/compliance (Audit trail for SEC/FINMA disclaimers)
│   │   ├── health/               # /health/live & /health/ready (Uptime, memory, SQLite probe)
│   │   └── prisma/               # PrismaService connection lifecycle management
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
├── tools/                        # Specification source-of-truth documents
└── prompts/                      # Human-in-the-loop implementation prompts
```

---

## Storage Model & Prisma Schema

The relational schema represents institutional entities, security credentials, and regulatory trails:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum TrustTier {
  RETAIL
  PRIVATE_WEALTH
  INSTITUTIONAL
}

enum ServiceVertical {
  CRYPTO
  STOCKS
  AI_FUNDS
  REAL_ESTATE
  VIP_CARDS
  CARS
  WALLET
}

model User {
  id               String      @id @default(uuid())
  email            String      @unique
  passphraseHash   String
  fullName         String?
  tier             TrustTier   @default(PRIVATE_WEALTH)
  corporateDomain  Boolean     @default(false)
  isActive         Boolean     @default(true)
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt
  sessions         Session[]
  otpCodes         OtpCode[]
  simulationIntent SimulationIntent?
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshToken String   @unique
  handoffTicket String? @unique
  userAgent    String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())
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
  id              String          @id @default(uuid())
  fullName        String
  workEmailEncrypted String       // AES-256-GCM encrypted
  workEmailHash   String          // Blind index for lookups
  companyName     String
  websiteUrl      String?
  telegramEncrypted String?       // AES-256-GCM encrypted
  service         ServiceVertical
  allocationRange String
  domainScore     Float           @default(1.0)
  isSpam          Boolean         @default(false)
  crmDispatched   Boolean         @default(false)
  createdAt       DateTime        @default(now())
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
  createdAt       DateTime  @default(now())
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

---

## Global Error Handling Architecture

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

---

## Dashboard Handoff Handshake

```
Landing Page (Client)               Backend Gateway                User Dashboard
     │                                    │                              │
     │ 1. POST /api/v1/auth/verify-otp    │                              │
     │───────────────────────────────────>│                              │
     │                                    │                              │
     │ 2. Return handoffTicket & cookie   │                              │
     │<───────────────────────────────────│                              │
     │                                                                   │
     │ 3. Redirect: /dashboard?ticket=handoff_abc123                    │
     │──────────────────────────────────────────────────────────────────>│
     │                                                                   │
     │                                    │ 4. Exchange ticket for session
     │                                    │<─────────────────────────────│
     │                                    │ 5. Session confirmed         │
     │                                    │─────────────────────────────>│
```

---

## Non-Negotiable Architectural Invariants

1. **Production Sandbox Guard**: In `NODE_ENV=production`, any presence or submission of `DEV_STATIC_OTP` or use of `EMAIL_PROVIDER=console` is strictly forbidden, immediately rejected with HTTP `403 Forbidden`, and flagged as an intrusion anomaly.
2. **Zero PII Logging**: All emitted logs must redact passwords, OTP codes, bearer tokens, full names, and sensitive email prefixes.
3. **Secure Error Shielding**: Client responses must never leak stack traces, internal errors, or database infrastructure details.
4. **Sub-50ms API Latency**: Core read endpoints (telemetry, health, intent retrieval) must respond in `< 50ms`.
5. **Deterministic Testing**: All business logic and security boundaries must be validated by automated tests in `Tests/UnitTest/` and `Tests/IntegrationTest/`.
6. **Documentation Synchronization**: OpenAPI/Swagger documentation at `/api/docs` and `.ai/` context files must be maintained in strict lockstep with implementation.
