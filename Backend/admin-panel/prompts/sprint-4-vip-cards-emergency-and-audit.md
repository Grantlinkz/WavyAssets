# Implementation Plan — Sprint 4: VIP Cards, Emergency Platform Freeze, Audit Trail & Hardening

**Subsystem:** `Backend/admin-panel`  
**Internal Port:** `4002`  
**Mandatory Git Branch:** `backend-admin-panel`  
**Reference Strategy:** [`tools/IMPLEMENTATION_STRATEGY.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/admin-panel/tools/IMPLEMENTATION_STRATEGY.md)  
**UI Blueprints Reference:**
- [`Frontend/admin-panel/tools/UI/wavyassets_admin_panel_vip_obsidian_metal_cards/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/wavyassets_admin_panel_vip_obsidian_metal_cards/)
- [`Frontend/admin-panel/tools/UI/wavyassets_admin_panel_emergency_platform_freeze/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/wavyassets_admin_panel_emergency_platform_freeze/)
- [`Frontend/admin-panel/tools/UI/wavyassets_admin_panel_audit_log_activity_history/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/wavyassets_admin_panel_audit_log_activity_history/)

---

## 1. Objectives & Executive Overview

Sprint 4 delivers the final operational modules, system-wide safety controls, regulatory transparency infrastructure, and comprehensive automated test suites for the WavyAssets Sovereign Admin Panel:

1. **Obsidian VIP Metal Cards Management (`VipCardsModule` at `/api/v1/admin/vip-cards`)**:
   - VIP card inventory & catalog retrieval (`GET /api/v1/admin/vip-cards`) with user identity, card tier (`OBSIDIAN`, `BLACK`, `SILVER`), card type (`PHYSICAL`, `VIRTUAL`), last 4 digits, daily spend limits, frozen status, and shipping custody tracking.
   - Administrator metal card minting engine (`POST /api/v1/admin/vip-cards/mint`):
     - Validates user existence and prevents duplicate card issuance.
     - Generates last 4 digits and stores encrypted card PIN via `CryptoService` (AES-256-GCM). Zero plaintext PIN storage per PCI-DSS Level 1.
     - Configures daily spend limits ($10k - $500k+) and shipping status.
     - Logs differential `AdminAuditLog` entry.
   - 1-Click Instant Lock/Unlock Freeze Toggle (`PATCH /api/v1/admin/vip-cards/:id/toggle-freeze`):
     - Inverts `VipCard.isFrozen` state.
     - Broadcasts real-time WebSocket event `vip_card:frozen_state_changed` to client viewports and room `user:<userId>` (<50ms latency).
     - Logs differential `AdminAuditLog` record (`VIP_CARD_FREEZE_TOGGLE`).
   - Card Parameters Governance (`PATCH /api/v1/admin/vip-cards/:id/parameters`):
     - Dynamic adjustment of daily spend limits, card mode, and shipping custody status.

2. **Emergency Platform Freeze & Kill-Switch Engine (`EmergencyModule` at `/api/v1/admin/emergency`)**:
   - Status Telemetry Deck (`GET /api/v1/admin/emergency/status`):
     - Returns live emergency status (`isFrozen`, `frozenAt`, `frozenBy`, `reason`, `activeSessionsCount`, `activeCardsCount`, `pendingWiresCount`, `pendingWiresVolume`).
   - Super Admin Platform Freeze (`POST /api/v1/admin/emergency/freeze`):
     - Validates exact confirmation phrase: `CONFIRM EMERGENCY PLATFORM FREEZE`.
     - Validates documented incident justification (minimum length statutory FINMA record).
     - Halts mutations across the platform, sets state to `FROZEN`, and immediately broadcasts `platform:emergency_freeze` over `/ws/admin`.
     - Records immutable `AdminAuditLog` with `PLATFORM_EMERGENCY_FREEZE`.
   - Platform Recovery & Unfreeze (`POST /api/v1/admin/emergency/unfreeze`):
     - Validates exact confirmation phrase: `CONFIRM EMERGENCY PLATFORM UNFREEZE`.
     - Validates documented unfreeze reason.
     - Restores platform state to `ACTIVE` and broadcasts `platform:emergency_unfreeze`.
     - Records `AdminAuditLog` with `PLATFORM_EMERGENCY_UNFREEZE`.
   - Mutation Lockdown Guard / Middleware (`EmergencyLockdownGuard`):
     - Blocks all mutating operational requests (POST/PUT/PATCH/DELETE on treasury, user funding, cards, deposit rails) when platform freeze is active, with exception for emergency endpoints and auth. Returns HTTP 403 with `ERR_PLATFORM_EMERGENCY_FREEZE`.

3. **Regulatory Audit Trail & Differential State Logging (`AuditModule` at `/api/v1/admin/audit`)**:
   - Filterable Audit Query (`GET /api/v1/admin/audit`):
     - Query parameters: `adminId`, `action`, `targetEntity`, `startDate`, `endDate`, `search`, `page`, `limit`.
     - Formats before/after JSON diffs for side-by-side inspection (`DiffModal`).
     - Blind-indexes IP addresses and redacts all sensitive credential tokens.
   - Statutory Regulatory Export (`GET /api/v1/admin/audit/export`):
     - Exports audit logs in structured format for FINMA / regulatory inspection.
   - Reusable `AuditService`:
     - Centralizes differential logging with sanitized payloads and caller attribution.

4. **Comprehensive Automated Test Suites & Hardening**:
   - Unit Tests in `Tests/UnitTest/`:
     - `vip-cards.service.test.ts`: Card minting, PIN AES-256-GCM encryption, 1-click toggle freeze, parameter updates, duplicate card rejection.
     - `emergency.service.test.ts`: Freeze phrase verification, unfreeze phrase verification, justification length validation, telemetry capture, event broadcasting.
     - `audit.service.test.ts`: Diff formatting, query filtering, IP masking, export generation.
   - Integration Tests in `Tests/IntegrationTest/`:
     - `vip-cards-emergency-audit.test.ts`: End-to-end testing of minting, freezing, emergency lockdown guard blocking, audit trail persistence, and WebSocket emissions.
   - Security Audit & Zero PII Verification:
     - No plaintext card PINs in responses or database.
     - Strict class-validator DTO boundaries with universal `{ success, data, timestamp }` envelope.
     - Sub-50ms query execution.

---

## 2. Technical Component Breakdown

### Unit 4.1: `VipCardsModule`
- **Files**:
  - `src/modules/vip-cards/dto/mint-card.dto.ts`
  - `src/modules/vip-cards/dto/update-card-parameters.dto.ts`
  - `src/modules/vip-cards/dto/vip-card-query.dto.ts`
  - `src/modules/vip-cards/vip-cards.service.ts`
  - `src/modules/vip-cards/vip-cards.controller.ts`
  - `src/modules/vip-cards/vip-cards.module.ts`
- **Events Gateway Enhancement**:
  - Add `emitVipCardFrozenStateChanged(payload)` in `EventsGateway`.

### Unit 4.2: `EmergencyModule`
- **Files**:
  - `src/modules/emergency/dto/freeze-platform.dto.ts`
  - `src/modules/emergency/dto/unfreeze-platform.dto.ts`
  - `src/modules/emergency/emergency.service.ts`
  - `src/modules/emergency/emergency.controller.ts`
  - `src/modules/emergency/emergency.module.ts`
  - `src/common/guards/emergency-lockdown.guard.ts`

### Unit 4.3: `AuditModule`
- **Files**:
  - `src/modules/audit/dto/audit-query.dto.ts`
  - `src/modules/audit/audit.service.ts`
  - `src/modules/audit/audit.controller.ts`
  - `src/modules/audit/audit.module.ts`

### Unit 4.4: App Wiring, Test Suites & Progress Tracker
- Wire `VipCardsModule`, `EmergencyModule`, `AuditModule`, and `EmergencyLockdownGuard` into `app.module.ts` and `main.ts`.
- Write unit tests in `Tests/UnitTest/`.
- Write integration tests in `Tests/IntegrationTest/`.
- Run typecheck (`npx tsc --noEmit`) and full test suite (`npm test`).
- Update `.ai/progress-tracker.md`.
