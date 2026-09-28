# Architecture Context — WavyAssets Frontend Admin Command Deck

**Subsystem**: `Frontend/admin-panel`  
**Port**: `5175`  
**Mandatory Git Branch**: `frontend-admin-panel`  
**Runtime**: React 19.2 + TypeScript (strict mode) + Vite 8.2  
**Design Reference**: [`tools/UI/institutional_vault_capital/DESIGN.md`](../tools/UI/institutional_vault_capital/DESIGN.md) & [`tools/UI/`](../tools/UI/)  
**Official Branding**: [`Frontend/landing-page/src/components/common/BrandLogo.tsx`](../../landing-page/src/components/common/BrandLogo.tsx) & [`Frontend/landing-page/public/favicon.svg`](../../landing-page/public/favicon.svg)  

---

## 1. Technical Stack

| Layer | Technology | Role & Justification |
| :--- | :--- | :--- |
| **Framework & Runtime** | React 19.2 + Vite 8.2 + TypeScript | Native compiler optimizations, strict typing, sub-second HMR |
| **Styling & Tokens** | Tailwind CSS v4 + `@tailwindcss/postcss` | Obsidian dark tokens, hairline borders, micro-chamfer 4px (`--radius: 0.25rem`) per `DESIGN.md` |
| **Headless UI** | Radix UI + shadcn/ui | Accessible primitives (`Dialog`, `DropdownMenu`, `Tabs`, `Switch`, `Tooltip`) |
| **Official Branding** | SVG BrandLogo + Favicon | Squircle frame, dual sinusoidal wave (Gold `#D4AF37` / Emerald `#00C288`), apex spark, pulsing `SECURED` badge |
| **State Management** | Zustand 5.0 + Immer | Modular reactive stores (`useAdminAuthStore`, `useTreasuryStore`, etc.) |
| **Data Fetching** | TanStack Query v5 | Auto-revalidation, optimistic updates, query caching, live query invalidation |
| **Real-Time Client** | Socket.IO Client 4.8 | Low-latency bi-directional sync with backend (`/ws/admin`) |
| **Forms & Validation** | React Hook Form + Zod | High-performance forms with client-side schema validation |
| **Testing Engine** | Vitest 5.0 + RTL + jsdom | Deterministic unit and component integration tests |

---

## 2. Directory Boundaries & Module Topology

```
Frontend/admin-panel/
├── public/
│   └── favicon.svg               # Official WavyAssets institutional favicon
├── src/
│   ├── api/
│   │   ├── client.ts             # Axios instance with JWT interceptor & unwrap
│   │   ├── inquiriesApi.ts       # GET leads, PATCH status, POST convert-lead
│   │   ├── usersApi.ts           # GET users, POST create, PATCH suspend, POST fund-balance
│   │   ├── complianceApi.ts      # GET queue, GET document URL, POST upgrade-tier
│   │   ├── treasuryApi.ts        # GET deposits, POST approve, GET withdrawals, POST sign-off
│   │   ├── railsApi.ts           # GET rails, PUT fiat, PUT crypto
│   │   ├── vipCardsApi.ts        # GET cards, POST mint, PATCH toggle-freeze
│   │   ├── emergencyApi.ts      # POST emergency-freeze, GET freeze-status
│   │   └── auditApi.ts           # GET audit logs
│   ├── components/
│   │   ├── common/
│   │   │   ├── BrandLogo.tsx     # Official institutional logo component
│   │   │   ├── ErrorBoundary.tsx # Full-page institutional fallback boundary
│   │   │   ├── SkeletonTable.tsx # .wavy-skeleton shimmer table (min-height: 540px)
│   │   │   └── StatusBadge.tsx   # 20px status chips (success, warning, danger, telemetry)
│   │   ├── layout/
│   │   │   ├── TopBar.tsx        # Logo, search [Cmd+K], Live Sync: 18ms, Emergency Stop, operator
│   │   │   ├── AdminSidebar.tsx  # Staging env, 8 route links with badges, ledger balance status
│   │   │   ├── UrgentTicker.tsx  # Ticker banner (wires, KYC, withdrawals > $100k)
│   │   │   └── CommandBar.tsx    # Cmd+K global modal palette
│   │   ├── modules/
│   │   │   ├── overview/         # ExecutiveOverviewDeck, PrimaryMetricGrid, SettlementLedgerTable
│   │   │   ├── institutional/    # MultiAssetAllocationBreakdown, ShardTelemetryDeck
│   │   │   ├── inquiries/        # InquiriesTable, LeadDetailDrawer, LeadConvertModal
│   │   │   ├── users/            # UserDirectoryTable, CreateUserModal, DirectFundingModal
│   │   │   ├── compliance/       # KycQueueTable, SplitScreenDocInspector, FinmaAmlChecklist
│   │   │   ├── treasury/         # PendingDepositsTable, DepositReceiptViewer, DualSignOffCard
│   │   │   ├── rails/            # FiatRailForm, CryptoVaultMatrix, LiveSyncPreview
│   │   │   ├── vip-cards/        # CardRegistryTable, MintVipCardModal, Card3DPreview
│   │   │   ├── emergency/        # EmergencyFreezeModal, EmergencyLockdownOverlay
│   │   │   └── audit/            # AuditLogTable, DiffModal
│   │   └── ui/                   # Button, Dialog, Dropdown, Table, Badge, Switch, Tooltip
│   ├── hooks/
│   │   ├── useSocketSync.ts      # Socket.IO connection & event handlers
│   │   └── usePermissions.ts     # Role-based action checker
│   ├── store/
│   │   ├── useAdminAuthStore.ts  # Active session, JWT, operator role
│   │   ├── useInquiriesStore.ts  # Leads filter & selection
│   │   ├── useUserRegistryStore.ts # Directory state & modal toggles
│   │   ├── useComplianceStore.ts # Active KYC review item
│   │   ├── useTreasuryStore.ts   # Deposit & withdrawal queues
│   │   ├── useDepositRailStore.ts# Editable rail state
│   │   ├── useVipCardStore.ts    # Card minting form state
│   │   ├── useEmergencyStore.ts  # System-wide platform freeze state
│   │   └── useAuditStore.ts      # Filter & active diff state
│   ├── styles/
│   │   └── index.css             # Tailwind CSS v4 variables & micro-chamfer tokens per DESIGN.md
│   ├── App.tsx
│   └── main.tsx
└── Tests/
    ├── UnitTest/                 # Store logic, validation schemas, permission tests
    └── IntegrationTest/          # Component rendering, modals, and tab flows
```

---

## 3. Strict Live Data Connection & Shimmer States

- All queries fetch directly from `http://localhost:4002/api/v1`.
- Zero mock or fallback datasets are authored into components or stores.
- Loading states render rigid `.wavy-skeleton` shimmer rows matching exact table widths (`min-height: 540px`, zero CLS).
