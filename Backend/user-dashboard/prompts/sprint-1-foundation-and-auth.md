# Implementation Prompt — Sprint 1: Core Foundation, Prisma Schema & Auth Handoff Engine

**Target Sprint:** Sprint 1  
**Architecture Reference:** [`tools/IMPLEMENTATION_STRATEGY.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/tools/IMPLEMENTATION_STRATEGY.md) (Sections 2, 3, 7, 8, 9, 10)  
**System Governance:** [`GEMINI.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/user-dashboard/GEMINI.md)  

---

## 1. Objectives & Deliverables

1. **Scaffold & Configuration**:
   - `package.json`: NestJS 11, TypeScript 5.7+, Prisma ORM 6.4+, Vitest 3.0+, Argon2, Cookie-Parser, Helmet, WebSockets, Schedule.
   - `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `vitest.config.ts`.
   - `Dockerfile` (multi-stage Alpine runner) and `docker-compose.yml` (Port 4001:4000).
   - `.env.example` and `.env` for local SQLite development.
2. **Prisma Relational Database Architecture (`prisma/schema.prisma`)**:
   - User identity, tiers (`RETAIL`, `PRIVATE_WEALTH`, `INSTITUTIONAL`), and KYC tiers (`TIER_1`, `TIER_2`, `TIER_3`).
   - Session management with `refreshTokenHash` and single-use `handoffTicketHash`.
   - FIDO2 `WebAuthnCredential` and `WhitelistDestination` under 48-hour time-lock (`quarantineUntil`).
   - Double-entry ledger (`LedgerAccount`, `LedgerTransaction`, `LedgerEntry`).
   - All 7 sovereign asset vertical models:
     - `CryptoHolding` & `DcaSchedule`
     - `StockPosition` & `StockOrder`
     - `AiFundPosition` & `AiRationaleLog`
     - `RealEstateProperty`, `RealEstateShare`, `RealEstateOtcOrder`
     - `ExoticCar`, `CarShare`, `DriveBooking`
     - `VipCard`
     - `KycDocument` & `AuditLog`
   - Deterministic initial seed script (`prisma/seed.ts`).
3. **Core Architectural Infrastructure**:
   - `src/common/filters/global-exception.filter.ts`: RFC 7807 compliant error envelope, zero stack trace / DB leak, correlation ID tracking.
   - `src/common/interceptors/redacted-logging.interceptor.ts`: Redaction of auth headers, passwords, tickets, tokens, CVV/PIN, and PII.
   - `src/common/exceptions/`: Custom domain exceptions (`InvalidHandoffTicketException`, `QuarantineTimeLockException`, `LedgerImbalanceException`, `InsufficientAvailableBalanceException`).
   - `src/common/utils/crypto.utils.ts`: HMAC-SHA256 ticket and token hashing, AES-256-GCM symmetric encryption for CVV/PIN.
4. **Authentication & Session Handoff Module (`src/modules/auth/`)**:
   - `POST /api/v1/auth/exchange-ticket`: Exchanges ephemeral handoff ticket from `Backend/landing-page` for a 15-minute access JWT and secure HttpOnly refresh token cookie.
   - `POST /api/v1/auth/refresh`: Rotates refresh token and issues fresh access JWT.
   - `POST /api/v1/auth/logout`: Revokes active session.
   - `JwtAuthGuard` & `@CurrentUser()` decorator.
5. **Automated Vitest Test Suite (`Tests/UnitTest/`)**:
   - Test suite with minimum 15 passing tests validating ticket exchange cryptography, session revocation, exception filter shielding, crypto utilities, and auth guards.

---

## 2. Invariants & Acceptance Criteria

- `npm run build`: Zero TypeScript compilation errors.
- `npx prisma generate`: Generates type-safe Prisma client matching all models.
- `npm run test`: All unit tests passing in `Tests/UnitTest/`.
- No sensitive keys or tokens leaked in error responses or logs.
- Conventional commits adhering to `feat:`, `fix:`, `refactor:`, `docs:`, `tests:`, `chore:`.
