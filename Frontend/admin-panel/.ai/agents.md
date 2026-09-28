# Agents Context & Roles — WavyAssets Frontend Admin Command Deck

> Note: Companion to [agent.md](./agent.md).

This file outlines the administrative frontend architecture, operational boundaries, and development workflows for agents building `Frontend/admin-panel`.

---

## 1. Primary Operating Persona

- **Title**: Principal Sovereign Frontend & Command Deck Architect
- **Focus**: High-density financial command interfaces, micro-chamfer token adherence, zero Cumulative Layout Shift (CLS), sub-50ms interaction latency, real-time WebSocket state synchronization, official institutional branding, and zero mock/static data.
- **Mandatory Git Branch**: **`frontend-admin-panel`**
- **Design Specifications**: [`tools/UI/institutional_vault_capital/DESIGN.md`](../tools/UI/institutional_vault_capital/DESIGN.md) & [`tools/UI/`](../tools/UI/)
- **Official Branding**: [`Frontend/landing-page/src/components/common/BrandLogo.tsx`](../../landing-page/src/components/common/BrandLogo.tsx) & [`Frontend/landing-page/public/favicon.svg`](../../landing-page/public/favicon.svg)

---

## 2. Core Operational Domains

```
Frontend/admin-panel/
├── public/
│   └── favicon.svg       # Official WavyAssets institutional favicon
├── src/
│   ├── api/              # Live API clients (TanStack Query v5 / Axios)
│   ├── components/
│   │   ├── common/       # BrandLogo, ErrorBoundary, SkeletonTable (.wavy-skeleton), StatusBadge
│   │   ├── layout/       # TopBar, AdminSidebar, UrgentTicker, CommandBar
│   │   ├── modules/
│   │   │   ├── overview/ # PrimaryMetricGrid, SettlementLedgerTable
│   │   │   ├── institutional/ # MultiAssetBreakdown, NodeTelemetry
│   │   │   ├── inquiries/# InquiriesTable, LeadDetailDrawer, LeadConvertModal
│   │   │   ├── users/    # UserDirectoryTable, CreateUserModal, DirectFundingModal, SuspendUserModal
│   │   │   ├── compliance/# KycQueueTable, SplitScreenDocInspector, FinmaAmlChecklist
│   │   │   ├── treasury/ # DepositsTable, PendingWithdrawalsTable, DualSignOffCard
│   │   │   ├── rails/    # FiatRailForm, CryptoVaultMatrix, LiveSyncPreview
│   │   │   ├── vip-cards/# CardRegistryTable, MintVipCardModal, Card3DPreview
│   │   │   ├── emergency/# EmergencyFreezeModal, EmergencyStatusBanner
│   │   │   └── audit/    # AuditLogTable, DiffModal
│   │   └── ui/           # Radix UI primitives & micro-chamfer 4px styling
│   ├── hooks/            # useSocketSync, usePermissions
│   ├── store/            # Zustand 5 slice stores
│   ├── styles/           # Tailwind CSS v4 design tokens per DESIGN.md
│   ├── App.tsx
│   └── main.tsx
└── Tests/                # Vitest unit & component integration tests
```

---

## 3. Strict Live Data Connection

The frontend connects directly to `Backend/admin-panel` running on port `4002`:
- **API Base**: `http://localhost:4002/api/v1`
- **WebSocket Gateway**: `http://localhost:4002/ws/admin`
- **Rule**: No static values or mock fallbacks. Components must fetch live data, handle `.wavy-skeleton` loading states (`min-height: 540px`), and surface real backend errors.
