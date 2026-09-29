# Implementation Plan — Sprint 1: Administrative Foundation, Database Extensions & Mandate Intake

**Subsystem:** `Backend/admin-panel`  
**Internal Port:** `4002`  
**Mandatory Git Branch:** `backend-admin-panel`  
**Reference Strategy:** [`tools/IMPLEMENTATION_STRATEGY.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/admin-panel/tools/IMPLEMENTATION_STRATEGY.md)  
**UI Contracts Reference:** [`Frontend/admin-panel/src/api/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/src/api/) & [`Frontend/admin-panel/tools/UI/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/)

---

## 1. Objectives & Scope for Sprint 1

### Unit 1.1: Project Scaffold, Persistence & Database Extensions
- Configure `package.json` matching monorepo enterprise stack (NestJS 11, TypeScript 5.7+, Prisma ORM 6.4+, Vitest 3.0+, Argon2, JWT, Helmet).
- Configure `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `vitest.config.ts`, `.env.example`, and `.env` (Port `4002`, SQLite for dev).
- Augment unified `prisma/schema.prisma` with:
  - `AdminRole` (SUPER_ADMIN, TREASURY_OFFICER, COMPLIANCE_OFFICER, CONCIERGE, DESK_LEAD)
  - `AdminUser` & `AdminSession`
  - `AdminAuditLog`
  - `FiatDepositRailConfig` & `CryptoDepositRailConfig`
  - `TreasurySignOff`
  - Integrated with User, LedgerAccount, LedgerTransaction, LedgerEntry, LeadInquiry, KycDocument, VipCard, etc.
- Generate Prisma Client and seed script (`prisma/seed.ts`) populating:
  - 5 preconfigured institutional operators (`e.vance@wavyassets.ch`, `a.wright@wavyassets.ch`, `m.thorne@wavyassets.ch`, `j.delacroix@wavyassets.ch`, `s.lindqvist@wavyassets.ch`)
  - Global Fiat Deposit Rail (`WavyAssets Sovereign Custody AG`, Swiss IBAN, UBS SWIFT)
  - Crypto MPC Vault Rails (USDC, USDT, BTC, ETH)
  - Realistic encrypted `LeadInquiry` records with AES-256-GCM
  - Initial `LedgerAccount` balances and sample settlement transactions for telemetry metrics.

### Unit 1.2: Core Infrastructure, Security Enclave & Admin Auth Module
- **Utilities**:
  - `CryptoService`: Argon2id hashing/verification, AES-256-GCM authenticated cipher (`iv:authTag:ciphertext`), HMAC-SHA256 blind indexing, IP address hashing.
  - `TotpService`: RFC 6238 Time-based One-Time Password verification and secret generation.
- **Common Middleware & Guards**:
  - `GlobalExceptionFilter`: Standardized error envelope `{ success: false, error: message, timestamp }` with zero PII/stack leakage.
  - `ResponseEnvelopeInterceptor`: Standardized response envelope `{ success: true, data: T, timestamp }`.
  - `AdminAuthGuard`, `RolesGuard`, `ProductionSandboxGuard`.
  - `@Roles()`, `@CurrentAdmin()`, `@Public()` decorators.
- **`AdminAuthModule`** (`/api/v1/admin/auth` and `/api/v1/auth`):
  - `POST /login`: Operator authentication via Argon2id + optional TOTP, issuing 15-min JWT access token and session refresh token.
  - `POST /refresh`: Refresh token rotation.
  - `POST /logout`: Invalidate session.
  - `GET /me`: Current operator profile and role permissions.

### Unit 1.3: Executive Overview & Telemetry Deck (`OverviewModule`)
- Wire up `/api/v1/overview` and `/api/v1/admin/overview`:
  - `GET /metrics`: Aggregated total vault balance ($142.8M+), 24h change (+3.4%), liquid capital ($28.4M+), active rails count, action queue triage counters (unverified wires, KYC reviews, dual sign-offs), 24h net settlement, and node latency telemetry (18ms).
  - `GET /settlements` & `GET /settlement-ledger`: Filterable real-time stream of settlement records matching the frontend table contract.

### Unit 1.4: Investor Inquiries & Lead Conversion (`InquiriesModule`)
- Wire up `/api/v1/inquiries` and `/api/v1/admin/inquiries`:
  - `GET /`: Paginated and status-filtered lead inquiries with real-time AES-256-GCM decryption of contact details (`fullName`, `workEmail`, `telegram`) for authorized operators.
  - `GET /:id`: Detailed telemetry view.
  - `PATCH /:id/status`: Workflow stage transitions (`NEW`, `IN_REVIEW`, `MANDATE_SENT` / `MANDATE_ISSUED`, `ARCHIVED`) with timestamped desk operator notes.
  - `POST /:id/convert` & `POST /users/convert`: Atomic conversion of qualified lead into sovereign `User` and initialized `AVAILABLE_CASH` ledger account.

### Unit 1.5: Automated Testing & Verification
- Unit test suites in `Tests/UnitTest/`:
  - `crypto.service.test.ts`
  - `totp.service.test.ts`
  - `admin-auth.service.test.ts`
  - `overview.service.test.ts`
  - `inquiries.service.test.ts`
- Integration test suite in `Tests/IntegrationTest/`:
  - `admin-api.test.ts` verifying complete request/response lifecycle, guards, and status codes.
- Typecheck (`npx tsc --noEmit`) and build (`npm run build`).
- Git commits following conventional commit specification.
