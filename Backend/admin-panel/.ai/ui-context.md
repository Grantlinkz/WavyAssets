# UI Context & Interoperability — WavyAssets Backend Admin Panel

**Subsystem**: `Backend/admin-panel`  
**Frontend Peer**: `Frontend/admin-panel` (Port `5175`)  
**Client Dashboard Peer**: `Backend/user-dashboard` (Port `4000`)  
**Landing Page Peer**: `Backend/landing-page` (Port `4001`)  
**Mandatory Git Branch**: `backend-admin-panel`  
**UI Reference Blueprints**: [`Frontend/admin-panel/tools/UI/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/)  

---

## 1. Interoperability & Live Data Rule

> [!CRITICAL]
> **No Static or Mock Fallbacks in Frontend**:
> The `Frontend/admin-panel` is built simultaneously in a duplicate workspace. It makes **live REST requests to `http://localhost:4002/api/v1` and WebSocket connections to `http://localhost:4002/ws/admin`**.
> 
> Therefore, every endpoint defined below must be genuinely implemented, connected to the unified Prisma relational store, and return live data conforming to the response envelope.

---

## 2. Live UI Data Contracts & Endpoint Mappings

The backend provides the exact data shapes and mutation contracts required by the 12 Stitch UI screens in `Frontend/admin-panel/tools/UI/`:

### 2.1 Executive Overview & Telemetry Deck (`tools/UI/wavyassets_admin_panel_overview`)
- **`GET /api/v1/admin/overview/metrics`**:
  ```typescript
  export interface OverviewMetricsDto {
    totalVaultBalance: number; // Aggregate across 7 asset verticals (e.g. $142,890,420.00)
    vaultBalanceDelta24h: number; // e.g. +3.4%
    liquidSettlementCapital: number; // e.g. $28,450,110.50
    activeLiquidityRailsCount: number; // e.g. 4 tier-1 rails
    actionQueue: {
      unverifiedWires: number; // e.g. 3
      pendingKycReviews: number; // e.g. 5
      pendingDualSignOffs: number; // e.g. 2 (> $100k)
      totalPending: number; // e.g. 10
    };
    netSettlement24h: {
      amount: number;
      direction: 'INFLOW' | 'OUTFLOW';
      status: 'SETTLED' | 'PENDING';
    };
    telemetry: {
      rttMs: number;
      heartbeatStatus: 'NOMINAL' | 'DEGRADED';
      ledgerStatus: '100% Balanced';
    };
  }
  ```
- **`GET /api/v1/admin/overview/settlement-ledger`**:
  Paginated list of recent cross-rail settlements with tabular formatting (`txId`, `timestamp`, `assetRail`, `counterparty`, `direction`, `amount`, `status`).

### 2.2 Investor Inquiries & Lead Conversion (`tools/UI/wavyassets_admin_panel_investor_inquiries`)
- **`GET /api/v1/admin/inquiries`**: Returns lead inquiries with decrypted work email/telegram for authorized roles, corporate domain trust score (0-100), and stage (`NEW`, `IN_REVIEW`, `MANDATE_ISSUED`, `ARCHIVED`).
- **`POST /api/v1/admin/inquiries/:id/convert`**: Atomically creates an institutional `User` record and initialized `LedgerAccount` from an approved inquiry.

### 2.3 User Directory & Direct Capital Funding (`tools/UI/wavyassets_admin_panel_user_directory_governance`)
- **`GET /api/v1/admin/users`**: Directory with aggregated `availableCash` and `investedCapital` segregated balances.
- **`POST /api/v1/admin/users/:id/fund-balance`**: Direct balance adjustment requiring mandatory `auditReason`, positive `amount`, `currency`, and `accountType`, booked via double-entry transaction.
- **`PATCH /api/v1/admin/users/:id/suspend`**: Kill-switch toggle halting user login and execution.

### 2.4 KYC & Compliance AML Review (`tools/UI/wavyassets_admin_panel_compliance_aml_review`)
- **`GET /api/v1/admin/compliance/queue`**: Pending tier elevation dossiers.
- **`GET /api/v1/admin/compliance/:id/document/:docId`**: Ephemeral secure signed URL for passport/incorporation documents.
- **`POST /api/v1/admin/compliance/:id/upgrade-tier`**: 1-click tier elevation (`TIER_1` -> `INSTITUTIONAL`) with FINMA AML checklist validation.

### 2.5 Treasury Operations & Dual Sign-Off (`tools/UI/wavyassets_admin_panel_treasury_settlements`)
- **`POST /api/v1/admin/treasury/deposits/:id/approve`**: 1-click ledger credit matching bank wire / crypto receipts.
- **`POST /api/v1/admin/treasury/withdrawals/:id/sign-off`**: FINMA AMLA Article 14 dual-sign-off engine. Withdrawals $> \$100\text{k}$ require two distinct officer approvals before capital release.

### 2.6 Global Deposit Rails Command (`tools/UI/wavyassets_admin_panel_global_deposit_coordinates`)
- **`GET /api/v1/admin/deposit-rails` & `PUT /api/v1/admin/deposit-rails/fiat`, `PUT /api/v1/admin/deposit-rails/crypto`**:
  Dynamic parameters for Swiss IBAN, BIC/SWIFT, Clearing rail, Memo format, and crypto MPC vault addresses. Emits `deposit_rail:updated` in real-time.

### 2.7 VIP Obsidian Metal Cards (`tools/UI/wavyassets_admin_panel_vip_obsidian_metal_cards`)
- **`POST /api/v1/admin/vip-cards/mint`**: Metal card provisioning with custom spend limit ($10k - $500k).
- **`PATCH /api/v1/admin/vip-cards/:id/toggle-freeze`**: 1-click instant lock/unlock toggle, broadcasting `vip_card:frozen_state_changed` ($<50$ms SLA).

### 2.8 Emergency Platform Freeze & Kill-Switch (`tools/UI/wavyassets_admin_panel_emergency_platform_freeze`)
- **`POST /api/v1/admin/emergency/freeze` & `POST /api/v1/admin/emergency/unfreeze`**:
  Super Admin dual-key authorization halting all deposits, withdrawals, trading, and card spending across the platform with mandatory written justification. Broadcasts `platform:emergency_freeze`.
- **`GET /api/v1/admin/emergency/status`**: System freeze health and lockdown status.

### 2.9 Immutable Audit Trail (`tools/UI/wavyassets_admin_panel_audit_log_activity_history`)
- **`GET /api/v1/admin/audit`**: Filterable audit trail providing structured JSON `beforeState` and `afterState` diffs for side-by-side inspection (`DiffModal`).

---

## 3. Real-Time WebSocket Gateway (`/ws/admin`)

The gateway broadcasts operational events to admin and client viewports:
- `lead:new`: New lead inquiry submitted on landing page.
- `kyc:uploaded`: User submitted KYC upgrade documents.
- `treasury:deposit_pending`: New inbound wire or crypto deposit awaiting verification.
- `treasury:withdrawal_pending`: New outbound withdrawal requiring sign-off.
- `vip_card:frozen_state_changed`: Broadcast to client `ObsidianMetalCard.tsx` when an admin toggles card freeze.
- `deposit_rail:updated`: Broadcast to client `DepositModal.tsx` when fiat or crypto parameters change.
- `platform:emergency_freeze`: Broadcast system-wide when emergency kill-switch is triggered.
- `platform:emergency_unfreeze`: Broadcast when emergency lockdown is resolved.
- `overview:metrics_tick`: Real-time telemetry heartbeat (18ms RTT) and pending action queue counts.

---

## 4. Standard Response Envelope

```typescript
export interface StandardResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```
All endpoints output this structure. Client uses TanStack Query v5 to unwrap `data`.
