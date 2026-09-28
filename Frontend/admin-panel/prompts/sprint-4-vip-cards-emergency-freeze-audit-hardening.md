#### Implementation Plan: Sprint 4 — VIP Card Minting, Emergency Freeze, Audit Trail & Hardening

**Sprint:** Sprint 4  
**Epic:** Obsidian VIP Metal Cards Engine, Emergency Platform Kill-Switch & Immutable Audit Trail Deck  
**Target Platform:** WavyAssets Sovereign Institutional Admin Command Deck (`Frontend/admin-panel`)  
**Mandatory Branch:** `frontend-admin-panel`  
**Reference Files:**
- `GEMINI.md` (System Governance, Invariants, Zero Mock Data, Pre-Commit Verification)
- `.ai/agent.md` & `.ai/architecture.md` (React 19 + TypeScript + Vite, Zustand 5, TanStack Query v5)
- `.ai/code-standards.md` (Micro-chamfer 4px geometry, Obsidian Dark tokens, Tabular lining figures, Zero CLS)
- `.ai/ui-context.md` (Live API contracts, Zero mock data, Rigid skeleton loaders)
- `.ai/progress-tracker.md` (Sprint 4 deliverables)
- `tools/UI/wavyassets_admin_panel_vip_obsidian_metal_cards/` (Stitch UI prototype)
- `tools/UI/wavyassets_admin_panel_emergency_platform_freeze/` (Stitch UI prototype)
- `tools/UI/wavyassets_admin_panel_audit_log_activity_history/` (Stitch UI prototype)

---

## 1. Objectives & Scope

### 1. Obsidian VIP Metal Cards Management Deck (`/vip-cards` & `VipCardsView.tsx`)
- **Institutional Telemetry Ribbon**: Network status (VISA Infinite / Direct Core Active), Card Vault inventory (142 Unminted Tungsten Blanks), Armored Logistics status, ISO-8583/EMV-L1 protocol chip.
- **KPI Metrics Row**:
  - Active Card Portfolio (38 cards, authorized daily capacity $15.4M/day)
  - 24h Settlement Volume ($3,184,920.00, 99.8% Auth Rate)
  - Terminal Killswitches (3 Locked)
  - Swiss Vault Inventory (142 Blanks, 42g Tungsten)
- **High-Density Table Toolbar**: Filter tabs (All Cards, Active, Locked, In Transit) and search by cardholder, masked PAN, CIF.
- **High-Density Cardholder Table**:
  - Columns: Cardholder Name & CIF, Card Tier & Substrate Density (Obsidian 42g Tungsten, Sovereign 28g Steel, Titanium 18g), Masked PAN (`•••• •••• •••• 8492`), Daily Limit ($50,000 - $1,000,000), Medium (Physical Metal vs Virtual NFC), Vault & Courier Status, Terminal State (Active vs Locked), Actions.
  - Sub-50ms 1-click Lock / Unlock toggle with instant optimistic UI update and live backend sync.
  - Rigid `.wavy-skeleton` table loader (`min-height: 540px`, zero CLS).
- **Interactive 3D Metal Card Minting Engine (`MintVipCardModal.tsx`)**:
  - Left column: Dynamic metallic card preview with gold brushed finish, EMV gold contact chip, Swiss cross holographic emblem, real-time laser-engraved cardholder name embossing, masked PAN, Valid Thru, Visa Infinite branding, and CNC calibration spec box (weight, milling, PVD DLC coating).
  - Right column: Client CIF selector, laser-engraved name input (max 26 chars uppercase), metal alloy radio tiles (Obsidian 42g, Sovereign 28g, Titanium 18g), daily spend limit slider ($50k - $1M with secondary officer warning > $500k), card format (Physical vs Virtual), and armored courier destination.
  - Strict Zod schema validation and operator sign-off badge.

### 2. Emergency Platform Freeze (`EmergencyFreezeModal.tsx` & Platform Lockdown Banner)
- Triggerable via TopBar "Emergency Stop" button (`power_settings_new`), keyboard shortcut, and URL/state trigger.
- Visuals: 540px carbon `#0F141F` modal with red emergency halo (`box-shadow: 0 0 0 2px #EF4444`), DEFCON Custody Level 1 status, and FINMA Art. 88 statutory reference.
- Telemetry pre-halt snapshot (active sessions, cards, pending wires, HSM gateways).
- 5-step operational impact sequence checklist (terminate sessions, lock VIP cards, freeze settlement rails, enforce read-only APIs, FINMA incident dispatch).
- Exact phrase typing security guard: `CONFIRM EMERGENCY PLATFORM FREEZE` with clipboard copy and real-time match verification.
- Mandatory documented incident justification (minimum 30 characters for Swiss FINMA statutory record).
- Dual-control officer attestation indicator.
- Global persistent lockdown banner and mutation freeze state when active.

### 3. Immutable Audit Trail & State Inspector (`/audit` & `AuditLogView.tsx`)
- Header with Merkle hash chain verification indicator ("Hash Chain Verified — No Tampering", Merkle block reference).
- 4-metric telemetry strip: Total Log Entries, Today's Executions, Cryptographic Proof root hash, Statutory Retention (10 Years, FINMA Art. 73).
- Filter toolbar: Date range pills (Today, 7D, 30D, Custom), Category selectors (All Actions, Balance Credits, User Locks, KYC Approvals, Rail Updates, VIP Cards), Officer filter, and search.
- High-density Audit Log Table: Timestamp UTC, Authorized Officer with department chip, Action Type badge, Target Account / Entity, Statutory Justification, Node Origin, and "Diff View" action.
- Rigid `.wavy-skeleton` loader (`min-height: 540px`, zero CLS).
- **Side-by-Side JSON Diff Inspector Modal (`DiffModal.tsx`)**:
  - Audit record ID, action description, operator, SHA-256 hash, and Merkle block height.
  - Side-by-side JSON comparison: Before State vs After State with highlighted diff fields.
  - Ledger adjustment delta callout banner.
  - Double-entry ledger conservation invariant verification chip ("Debits Equal Credits").

### 4. API Client & Zustand Store Architecture
- `src/api/vipCards.ts`:
  - `GET /vip-cards` (list cards)
  - `POST /vip-cards/mint` (mint new VIP card)
  - `PATCH /vip-cards/:id/toggle-freeze` (1-click lock/unlock)
  - `PATCH /vip-cards/:id/limit` (update spending limit)
- `src/api/emergency.ts`:
  - `GET /emergency/status` (system freeze status)
  - `POST /emergency/freeze` (execute platform freeze with verification phrase & justification)
  - `POST /emergency/unfreeze` (lift emergency freeze with dual-officer sign-off)
- `src/api/audit.ts`:
  - `GET /audit/logs` (paginated, filtered audit events)
  - `GET /audit/logs/:id` (audit log detail with before/after diffs)
  - `GET /audit/merkle-verify` (cryptographic proof verification)
- Stores:
  - `src/store/useVipCardsStore.ts`
  - `src/store/useEmergencyStore.ts`
  - `src/store/useAuditStore.ts`
- Real-time WebSocket subscriptions for `vip_card:frozen_state_changed`, `vip_card:minted`, `platform:emergency_freeze`, `platform:emergency_unfreeze`, `audit:event_logged`.

### 5. Automated Testing & Verification
- Unit test suites in `Tests/UnitTest/`:
  - `vipCardsStore.test.ts`
  - `emergencyStore.test.ts`
  - `auditStore.test.ts`
- Integration test suites in `Tests/IntegrationTest/`:
  - `vipCardsView.test.tsx` (table, filters, lock toggle, mint modal preview)
  - `emergencyFreezeModal.test.tsx` (phrase matching, justification validation, freeze trigger)
  - `auditLogView.test.tsx` (audit table, category filter, diff modal)
- Zero-CLS verification, micro-chamfer token check, and TypeScript typecheck (`npx tsc --noEmit`).

---

## 2. Directory Layout & Proposed Components

```
Frontend/admin-panel/
├── src/
│   ├── api/
│   │   ├── vipCards.ts                  # VIP Cards live REST API client
│   │   ├── emergency.ts                 # Emergency Freeze live REST API client
│   │   └── audit.ts                     # Immutable Audit Trail live REST API client
│   ├── components/
│   │   ├── vip-cards/
│   │   │   ├── VipCardsTable.tsx        # High-density card ledger & 1-click lock toggle
│   │   │   ├── MintVipCardModal.tsx     # 3D interactive preview & minting modal
│   │   │   └── VipCard3DPreview.tsx     # Interactive metallic card component
│   │   ├── emergency/
│   │   │   ├── EmergencyFreezeModal.tsx # Red-halo dual-key freeze confirmation dialog
│   │   │   └── PlatformLockdownBanner.tsx # Global lockdown indicator banner
│   │   └── audit/
│   │       ├── AuditLogTable.tsx        # High-density audit event table
│   │       └── DiffModal.tsx            # Side-by-side JSON before/after state diff inspector
│   ├── store/
│   │   ├── useVipCardsStore.ts          # VIP card filters, mint drafts, selected card
│   │   ├── useEmergencyStore.ts         # Freeze status, reason, confirmation phrase
│   │   └── useAuditStore.ts             # Audit filters, pagination, active diff log
│   ├── views/
│   │   ├── VipCardsView.tsx             # Complete VIP Cards command view
│   │   └── AuditLogView.tsx             # Complete Immutable Audit Trail view
│   └── App.tsx                          # Connect /vip-cards and /audit-log views
└── Tests/
    ├── UnitTest/
    │   ├── vipCardsStore.test.ts
    │   ├── emergencyStore.test.ts
    │   └── auditStore.test.ts
    └── IntegrationTest/
        ├── vipCardsView.test.tsx
        ├── emergencyFreezeModal.test.tsx
        └── auditLogView.test.tsx
```
