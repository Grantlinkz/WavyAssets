# Architecture Context — WavyAssets Backend Admin Panel

**Subsystem**: `Backend/admin-panel`  
**Port**: `4002`  
**Mandatory Git Branch**: `backend-admin-panel`  
**Runtime**: NestJS 11 + Node.js 24 + TypeScript (strict mode)  

**UI Blueprints Reference**: [`Frontend/admin-panel/tools/UI/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/)  

---

## 1. Technical Stack

| Layer | Technology | Role & Justification |
| :--- | :--- | :--- |
| **Framework & Engine** | NestJS 11 + Express | Enterprise modular architecture, dependency injection, decorators, built-in lifecycle management |
| **Language & Tooling** | TypeScript 5.7+ (Strict Mode) | End-to-end type safety across DTOs, controllers, and services |
| **ORM & Data Layer** | Prisma ORM 6.4+ | Type-safe queries, atomic `$transaction` blocks, deterministic migrations |
| **Database Engine** | PostgreSQL 16 (Prod) / SQLite `dev.db` (Dev) | Seamless unified persistence across monorepo |
| **Authentication & RBAC** | Argon2id + TOTP + @nestjs/jwt | High-entropy admin security, time-based OTP, role-based guard |
| **Encryption at Rest** | Node.js Crypto (AES-256-GCM) | Authenticated field-level encryption for lead PII and card PINs |
| **Real-Time Gateway** | @nestjs/websockets + Socket.IO 4.8 | Live event streaming between Admin Panel and User Dashboard (`/ws/admin`) |
| **Rate Limiting** | @nestjs/throttler | Tiered sliding window: 100 req/min read, 10 req/min write actions |
| **Validation & Serialization**| class-validator + class-transformer | Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true` |
| **Testing Engine** | Vitest 3.0 + Supertest | Blazing fast ESM unit tests and E2E integration suites |

---

## 2. Directory Structure & Module Boundaries

```
Backend/admin-panel/
├── prisma/
│   ├── schema.prisma         # Extended unified schema
│   └── migrations/           # Migration history
├── src/
│   ├── common/
│   │   ├── decorators/       # @Roles(), @CurrentAdmin(), @AuditAction()
│   │   ├── dto/              # Base query & pagination DTOs
│   │   ├── exceptions/       # DualSignOffRequiredException, LedgerImbalanceException
│   │   ├── filters/          # GlobalExceptionFilter, HttpExceptionFilter
│   │   ├── guards/           # AdminAuthGuard, RolesGuard, ProductionSandboxGuard
│   │   ├── interceptors/     # ResponseEnvelopeInterceptor, AuditLoggerInterceptor
│   │   ├── pipes/            # Global ValidationPipe
│   │   └── utils/            # AES-256-GCM, Argon2id, TotpValidator
│   ├── config/               # Configuration module & env validation
│   ├── modules/
│   │   ├── admin-auth/       # /api/v1/admin/auth (Login, TOTP, JWT, Refresh)
│   │   ├── overview/         # /api/v1/admin/overview (Total vault balance, liquid capital, action queue, 24h net settlement)
│   │   ├── inquiries/        # /api/v1/admin/inquiries (Decrypted leads, workflow stages, convert-lead)
│   │   ├── users/            # /api/v1/admin/users (Directory, kill-switch, fund-balance)
│   │   ├── compliance/       # /api/v1/admin/compliance (KYC queue, tier elevation)
│   │   ├── treasury/         # /api/v1/admin/treasury (Deposits, dual sign-off withdrawals)
│   │   ├── deposit-rails/    # /api/v1/admin/deposit-rails (Fiat IBAN & Crypto MPC matrix)
│   │   ├── vip-cards/        # /api/v1/admin/vip-cards (Minting & real-time freeze)
│   │   ├── emergency/        # /api/v1/admin/emergency (Platform freeze/unfreeze, dual-key execution)
│   │   ├── audit/            # /api/v1/admin/audit (Differential audit logs)
│   │   ├── events/           # /ws/admin (WebSocket broadcast to client dashboards)
│   │   └── prisma/           # PrismaService lifecycle management
│   ├── app.module.ts         # Root module wiring
│   └── main.ts               # Application bootstrap (port 4002, Swagger, pipes, filters)
└── Tests/
    ├── UnitTest/             # Financial ledger, dual sign-off, cipher unit tests
    └── IntegrationTest/      # Endpoints, guards, and WebSocket integration tests
```

---

## 3. Database Schema Extensions

```prisma
enum AdminRole {
  SUPER_ADMIN
  TREASURY_OFFICER
  COMPLIANCE_OFFICER
  CONCIERGE
  DESK_LEAD
}

model AdminUser {
  id             String         @id @default(uuid())
  email          String         @unique
  fullName       String
  passphraseHash String
  role           AdminRole      @default(DESK_LEAD)
  totpSecretHash String?
  isActive       Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  sessions       AdminSession[]
  auditLogs      AdminAuditLog[]
  signOffs       TreasurySignOff[]
}

model AdminSession {
  id                String    @id @default(uuid())
  adminId           String
  admin             AdminUser @relation(fields: [adminId], references: [id], onDelete: Cascade)
  refreshTokenHash  String    @unique
  ipAddress         String?
  userAgent         String?
  expiresAt         DateTime
  createdAt         DateTime  @default(now())
}

model AdminAuditLog {
  id            String     @id @default(uuid())
  adminId       String?
  admin         AdminUser? @relation(fields: [adminId], references: [id])
  action        String
  targetEntity  String
  targetId      String?
  diffBefore    String?
  diffAfter     String?
  reason        String?
  ipAddressHash String
  userAgent     String?
  createdAt     DateTime   @default(now())
}

model FiatDepositRailConfig {
  id              String   @id @default("GLOBAL_FIAT_RAIL")
  beneficiaryName String   @default("WavyAssets Sovereign Custody AG")
  swissIban       String   @default("CH93 0023 8812 4019 8821 0")
  bicSwift        String   @default("UBSWCHZH80A")
  clearingRail    String   @default("Swiss SIC RTGS / Fedwire DvP")
  memoFormat      String   @default("WY-{USER_REF}-TREASURY-03")
  updatedAt       DateTime @updatedAt
  updatedBy       String?
}

model CryptoDepositRailConfig {
  id              String   @id @default(uuid())
  asset           String
  network         String
  vaultAddress    String
  minDepositUsd   Float    @default(500.0)
  confirmations   Int      @default(3)
  isActive        Boolean  @default(true)
  updatedAt       DateTime @updatedAt
  updatedBy       String?

  @@unique([asset, network])
}

model TreasurySignOff {
  id            String    @id @default(uuid())
  withdrawalId  String
  officerId     String
  officer       AdminUser @relation(fields: [officerId], references: [id])
  action        String
  notes         String?
  signedAt      DateTime  @default(now())

  @@unique([withdrawalId, officerId])
}
```
