# Implementation Plan — Sprint 2: User Lifecycle & KYC Compliance Engine

**Subsystem:** `Backend/admin-panel`  
**Internal Port:** `4002`  
**Mandatory Git Branch:** `backend-admin-panel`  
**Reference Strategy:** [`tools/IMPLEMENTATION_STRATEGY.md`](../tools/IMPLEMENTATION_STRATEGY.md)  
**UI Contracts Reference:** [`Frontend/admin-panel/tools/UI/wavyassets_admin_panel_user_directory_governance/`](../../Frontend/admin-panel/tools/UI/wavyassets_admin_panel_user_directory_governance/) & [`Frontend/admin-panel/tools/UI/wavyassets_admin_panel_compliance_aml_review/`](../../Frontend/admin-panel/tools/UI/wavyassets_admin_panel_compliance_aml_review/)

---

## 1. Objectives & Scope for Sprint 2

Sprint 2 establishes the administrative core for user governance, balance tracking, and regulatory identity verification. It directly realizes:
1. **User Lifecycle & Directory (`UsersModule`)**:
   - Query directory with aggregated segregated balances (`AVAILABLE_CASH` vs `INVESTED_CAPITAL`), tier filtering, and status filtering.
   - Sovereign User creation with initial capital and ledger accounts.
   - Account kill-switch (`/suspend` and `/unsuspend`) severing active JWT sessions.
   - Cascading account deletion guarded by confirmation token (`email`).
   - Direct balance adjustments (`/fund-balance`) enforced by strict double-entry ledger bookkeeping and immutable audit logging.
2. **KYC & FINMA AMLA Compliance Verification Engine (`ComplianceModule`)**:
   - Pending identity dossier queue.
   - Document verification and secure signed preview metadata.
   - 1-click tier elevation (`upgrade-tier`) elevating client withdrawal thresholds across the platform with FINMA AML checklist validation and audit logging.
3. **Automated Testing & Invariant Verification**:
   - Unit tests for user balance calculations, double-entry ledger conservation, and compliance tier upgrades.
   - Integration tests covering all Sprint 2 endpoints, authorization guards, and standardized response envelopes.

---

## 2. Unit Breakdown

### Unit 2.1: `UsersModule` DTOs, Service & Controller
- **Path**: `src/modules/users/`
  - `dto/create-user.dto.ts`:
    - `email`: string (IsEmail)
    - `fullName`: string (IsString)
    - `tier`: string (IsEnum: RETAIL | PRIVATE_WEALTH | INSTITUTIONAL)
    - `kycTier`: string (IsEnum: TIER_1 | TIER_2 | TIER_3)
    - `startingCashBalance`: number (Optional, positive)
    - `isCorporate`: boolean (Optional)
    - `passphrase`: string (Optional, defaults to high-entropy temporary password)
  - `dto/fund-balance.dto.ts`:
    - `accountType`: string (AVAILABLE_CASH | INVESTED_CAPITAL)
    - `currency`: string (USD | EUR | CHF | USDC | BTC | ETH)
    - `amount`: number (Min: 0.01)
    - `direction`: string (CREDIT | DEBIT)
    - `auditReason`: string (MinLength: 5)
    - `referenceId`: string (Idempotency key)
  - `dto/user-query.dto.ts`:
    - `search`?: string
    - `tier`?: string
    - `kycTier`?: string
    - `status`?: string ('ALL' | 'Active' | 'Locked' | 'ACTIVE' | 'SUSPENDED')
    - `page`?: number
    - `limit`?: number
  - `users.service.ts`:
    - `findAll(query)`: Aggregates balances (`availableCash`, `investedCapital`, `totalBalance`) per user, links VIP card status if issued, and returns paginated result.
    - `findById(id)`: Full dossier including active sessions count, ledger accounts breakdown, KYC documents, VIP card, and transaction history.
    - `create(dto, adminId)`: Creates user, hashes password via `CryptoService`, seeds `AVAILABLE_CASH` and `INVESTED_CAPITAL` accounts, seeds initial funding transaction if requested, and logs audit action.
    - `suspend(id, adminId)`: Sets `isActive = false`, cascades deletion of all active `Session` rows to drop auth sessions immediately, logs `USER_SUSPEND` audit.
    - `unsuspend(id, adminId)`: Restores `isActive = true`, logs `USER_UNSUSPEND` audit.
    - `deleteUser(id, confirmationKey, adminId)`: Validates confirmation key (`user.email`), removes user and cascades ledger/session records, logs `USER_DELETE` audit.
    - `fundBalance(userId, dto, adminId)`: Atomic `$transaction` that creates `LedgerTransaction`, `LedgerEntry`, adjusts `LedgerAccount.balance`, verifies non-negative cash balances, and creates `AdminAuditLog` diff.
  - `users.controller.ts`:
    - `GET /api/v1/admin/users` & `GET /api/v1/users`
    - `GET /api/v1/admin/users/:id` & `GET /api/v1/users/:id`
    - `POST /api/v1/admin/users` & `POST /api/v1/users`
    - `PATCH /api/v1/admin/users/:id/suspend` & `PATCH /api/v1/users/:id/suspend`
    - `PATCH /api/v1/admin/users/:id/unsuspend` & `PATCH /api/v1/users/:id/unsuspend`
    - `DELETE /api/v1/admin/users/:id` & `DELETE /api/v1/users/:id`
    - `POST /api/v1/admin/users/:id/fund-balance` & `POST /api/v1/users/:id/fund-balance`
  - `users.module.ts`: Wires controller, service, Prisma, and Crypto services.

### Unit 2.2: `ComplianceModule` DTOs, Service & Controller
- **Path**: `src/modules/compliance/`
  - `dto/upgrade-kyc-tier.dto.ts`:
    - `userId`: string
    - `targetTier`: string (TIER_1 | TIER_2 | TIER_3 | INSTITUTIONAL)
    - `approvalNotes`: string
    - `checklist`?: string[]
  - `dto/verify-document.dto.ts`:
    - `documentId`: string
    - `isVerified`: boolean
    - `rejectionReason`?: string
  - `compliance.service.ts`:
    - `getQueue(query)`: Retrieves pending KYC verification dossiers awaiting review with user details, document list, and current tier.
    - `getDocument(docId)`: Returns signed ephemeral access URL/metadata and document properties.
    - `verifyDocument(dto, adminId)`: Updates `KycDocument.isVerified`, logs audit record.
    - `upgradeTier(dto, adminId)`: In `$transaction`, updates `User.kycTier` (or `User.tier`), marks related documents as verified, and records `AdminAuditLog` (`KYC_TIER_UPGRADE`).
  - `compliance.controller.ts`:
    - `GET /api/v1/admin/compliance/queue` & `GET /api/v1/compliance/queue`
    - `GET /api/v1/admin/compliance/documents/:docId` & `GET /api/v1/compliance/documents/:docId`
    - `POST /api/v1/admin/compliance/verify-document` & `POST /api/v1/compliance/verify-document`
    - `POST /api/v1/admin/compliance/upgrade-tier` & `POST /api/v1/admin/compliance/upgrade-tier`
    - `POST /api/v1/admin/compliance/:id/upgrade-tier` (supports both URL patterns)
  - `compliance.module.ts`: Wires controller, service, Prisma, and Crypto services.

### Unit 2.3: Root Wiring & Database Seed Expansion
- Register `UsersModule` and `ComplianceModule` in `src/app.module.ts`.
- Expand `prisma/seed.ts` with diverse sample client users across tiers (Retail, Private Wealth, Institutional) and corresponding KYC documents to populate the table views and compliance queue realistically.

### Unit 2.4: Automated Testing & Verification
- Unit test suites in `Tests/UnitTest/`:
  - `users.service.test.ts`: Test directory search, balance aggregation, kill-switch suspension, and double-entry atomic `$transaction` balance funding.
  - `compliance.service.test.ts`: Test compliance queue querying, document verification, and tier upgrades.
- Integration test suite in `Tests/IntegrationTest/`:
  - `users-and-compliance.test.ts`: End-to-end endpoint verification with auth headers, role enforcement, and response envelope validation.
- Typecheck (`npx tsc --noEmit`) and lint/build.
- Update `.ai/progress-tracker.md`.
- Commit changes under `backend-admin-panel`.
