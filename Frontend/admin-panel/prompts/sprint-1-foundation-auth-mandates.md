#### Implementation Plan: Sprint 1 — Deck Foundation, Admin Auth & Mandate Intake

**Sprint:** Sprint 1**Epic:** Sovereign Command Deck Foundation, Shell Navigation, Operator Auth & Mandate Ingestion Feed**Target Platform:** WavyAssets Sovereign Institutional Admin Command Deck (`Frontend/admin-panel`)**Mandatory Branch:** `frontend-admin-panel`**Reference Files:**

- `tools/IMPLEMENTATION_STRATEGY.md` (Sections 1, 2, 3, 4, 5.1)
- `tools/UI/institutional_vault_capital/DESIGN.md` (Design tokens, micro-chamfer 4px geometry, typography)
- `tools/UI/wavyassets_admin_panel_overview/code.html` (Executive overview prototype)
- `tools/UI/wavyassets_admin_panel_investor_inquiries/code.html` (Mandate inquiries & detail drawer prototype)
- `tools/UI/wavyassets_admin_panel_table_skeleton_loaders/code.html` (Rigid skeleton loaders & shimmer animation)
- `Frontend/landing-page/public/favicon.svg` (Official sovereign favicon)
- `Frontend/landing-page/src/components/common/BrandLogo.tsx` (Official brand logo component)

---

## 1. Objectives

1. **Scaffold Runtime & Tooling**:

   - Initialize Vite 8 + React 19 + TypeScript (strict mode) configuration running on port `5175`.
   - Configure Tailwind CSS v4 (`@tailwindcss/postcss`) with design tokens mapped from `tools/UI/institutional_vault_capital/DESIGN.md`.
   - Setup Vitest 5 with `@testing-library/react` and `jsdom`.
   - Configure API proxying to `http://localhost:4002` for `/api/v1` and WebSocket at `http://localhost:4002/ws/admin`.
2. **Official Branding Integration**:

   - Copy official favicon to `public/favicon.svg` and link in `index.html`.
   - Implement `BrandLogo.tsx` adapting the official sinusoidal wave squircle, `#D4AF37` / `#00C288` dual curves, apex spark, and pulsing `#00C288` `SECURED` badge.
3. **Persistent Shell & Navigation Architecture**:

   - `TopBar`: Air-gapped institutional header with official `BrandLogo`, global search trigger (`Cmd + K`), live sync status indicator (`● Live Sync: 18ms`, `#06B6D4`), emergency system stop button (`#EF4444`), operator badge (`EV Eleanor Vance [Treasury Officer]`), and urgent attention ticker banner.
   - `AdminSidebar`: Fixed 260px left navigation rail with staging environment indicator, 8 vertical navigation modules with status chips, 100% balanced ledger indicator, and Swiss regulatory footer.
   - `CommandPalette`: `Cmd+K` global search across users, transactions, lead inquiries, and cards.
4. **Zero-CLS Rigid Skeleton Loaders**:

   - `SkeletonTable.tsx`: Standardized `.wavy-skeleton` shimmer animation (`linear-gradient(90deg, #141B29 25%, #1D2232 50%, #141B29 75%)`) with 540px minimum container height and exact column dimensions to guarantee CLS = 0.00.
   - Pre-table metric cards skeleton states.
5. **Operator Auth & RBAC State Machine**:

   - `useAdminAuthStore`: Operator identity (`id`, `name`, `email`, `role`: `SUPER_ADMIN` | `TREASURY_OFFICER` | `COMPLIANCE_OFFICER` | `CONCIERGE` | `DESK_LEAD`, `token`), authentication state, login mutation hook, session token storage, logout, RBAC permission checker (`hasPermission`).
   - `AdminLoginModal.tsx` / Login Gateway: Air-gapped institutional access gate with operator credentials, role selection, 2FA/token validation, connecting to live API endpoint `POST /api/v1/auth/admin-login` with session storage.
6. **Executive Overview & Telemetry Deck (`/` or `/overview`)**:

   - Primary 4-Metric Grid: Total Vault Balance (`$142,890,420.00`), Liquid Settlement Capital (`$28,450,110.50`), Action Queue (`10 Pending`), 24h Net Settlement (`+$12,410,900.00`).
   - Real-time shard telemetry indicator (`Hydrating Live Shards: 14ms RTT`).
   - Real-time settlement ledger table with time horizon filter (`Last 24 Hours`) and multi-asset currency switcher (`USD / CHF / EUR`).
   - Data hooks connecting to live backend endpoints with TanStack Query.
7. **Mandate Inquiries Deck (`/inquiries`)**:

   - Filter tabs: `All (48)`, `New (12)`, `In Review (18)`, `Mandate Sent (14)`, `Archived (4)`.
   - Real-time search by company name, email, or telegram handle.
   - Chronological `LeadInquiry` data table with Received Time, Company / Investor with trust score badge (`98% Verified Domain`), Contact Person, Asset Interest, Investment Bracket, Status, and Action.
   - Slide-over `LeadDetailDrawer.tsx` with full decrypted telemetry (Telegram handle, corporate IP address, referrer source), workflow state switcher (1-click transition), and quick "Convert to Active User" action.
   - Lead Conversion Modal (`LeadConvertModal.tsx`) pre-filling user onboarding details.
8. **Automated Verification**:

   - Deliver >= 15 passing Vitest tests across unit and integration suites in `Tests/UnitTest/` and `Tests/IntegrationTest/`.

---

## 2. Component & Architecture Layout

```
Frontend/admin-panel/
├── public/
│   └── favicon.svg                    # Official WavyAssets favicon
├── src/
│   ├── api/
│   │   ├── client.ts                  # Axios / Fetch client with 401 interceptor & standard envelope unwrapping
│   │   ├── overview.ts                # Overview metrics & settlement ledger queries
│   │   └── inquiries.ts               # Lead inquiries queries & mutations
│   ├── components/
│   │   ├── auth/
│   │   │   └── AdminLoginModal.tsx    # Institutional operator access gate with role picker
│   │   ├── common/
│   │   │   ├── BrandLogo.tsx          # Official BrandLogo with squircle wave emblem
│   │   │   ├── CommandPalette.tsx     # Cmd+K global search palette
│   │   │   ├── ErrorBoundary.tsx      # Sovereign institutional error boundary
│   │   │   └── SkeletonTable.tsx      # Rigid table skeleton loader (540px min-height, zero CLS)
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx        # Master layout wrapper with TopBar and AdminSidebar
│   │   │   ├── AdminSidebar.tsx       # 260px fixed left navigation rail with notification chips
│   │   │   └── TopBar.tsx             # Persistent header with operator badge, search, live sync & emergency stop
│   │   ├── inquiries/
│   │   │   ├── LeadDetailDrawer.tsx   # Slide-over dossier inspector with decrypted telemetry
│   │   │   ├── LeadConvertModal.tsx   # 1-click conversion to active user modal
│   │   │   └── InquiriesTable.tsx     # High-density inquiries data table
│   │   └── overview/
│   │       ├── MetricCard.tsx         # 4-metric overview card with delta indicator
│   │       └── SettlementLedger.tsx   # Real-time settlement ledger table
│   ├── lib/
│   │   ├── formatters.ts              # Tabular currency, percentage, and date formatters
│   │   └── utils.ts                   # clsx + twMerge utility
│   ├── store/
│   │   ├── useAdminAuthStore.ts       # Operator identity, role, permissions, token
│   │   └── useAdminNavStore.ts        # Active route, drawer state, kill-switch modal state
│   ├── views/
│   │   ├── OverviewView.tsx           # Executive Overview & Telemetry Deck
│   │   └── InquiriesView.tsx          # Mandate Inquiries Feed
│   ├── App.tsx                        # Root administrative command deck router & provider mount
│   ├── main.tsx                       # React 19 root mount
│   └── index.css                      # Tailwind v4 theme tokens, micro-chamfer 4px & .wavy-skeleton shimmer
├── Tests/
│   ├── UnitTest/
│   │   ├── adminAuthStore.test.ts     # Operator session & RBAC unit tests
│   │   ├── formatters.test.ts         # Financial numbers & tabular figure unit tests
│   │   ├── BrandLogo.test.tsx         # Official branding component tests
│   │   └── SkeletonTable.test.tsx     # Rigid skeleton loader dimensions & CLS tests
│   └── IntegrationTest/
│       ├── navigationShell.test.tsx   # TopBar, AdminSidebar & CommandPalette integration tests
│       └── mandateInquiries.test.tsx  # Inquiries filtering, drawer inspection & conversion tests
├── index.html
├── package.json
├── postcss.config.mjs
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 3. Acceptance Criteria & Invariants

- [X] **Branch Invariant**: All code developed and committed on `frontend-admin-panel`.
- [X] **Zero Static Data Invariant**: Live TanStack Query hooks connecting to backend API at `http://localhost:4002/api/v1` and WebSocket at `http://localhost:4002/ws/admin`.
- [X] **Zero CLS Invariant**: Pre-dimensioned rigid skeleton tables (`min-height: 540px`) with `.wavy-skeleton` shimmer animation.
- [X] **Sub-50ms SLA**: Local filtering, search queries, status updates, and tab switching execute in $<50$ms.
- [X] **Institutional Micro-Chamfer Token System**: Strict 4px border-radius (`rounded-[4px]`), deep obsidian background (`#090D14`), hairline dividers (`#1E293B`), bullion gold accents (`#D4AF37`), cyan telemetry (`#06B6D4`).
- [X] **Tabular Lining Figures**: Monospace numbers (`font-mono tabular-nums`) across all financial amounts, hashes, and dates.
- [X] **Role-Based Access Control**: Operator actions masked based on assigned role.
- [X] **Automated Testing Suite**: Minimum 15 passing automated tests across unit and integration suites.
- [X] Strict TypeScript (`tsc --noEmit`) passes with 0 errors.
