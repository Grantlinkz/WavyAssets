# Architecture Context — WavyAssets Sovereign Institutional User Dashboard

## Technical Stack

| Component Layer | Technology | Selection Rationale & Role |
| :--- | :--- | :--- |
| **Runtime & Framework** | **React 19.2 + TypeScript (Strict)** | Native compiler optimizations, zero type compromises (`tsconfig.app.json`), strict typing. |
| **Build & Tooling** | **Vite 8.2 + SWC** | Sub-second HMR, optimized chunk splitting, native backend proxying (`:5174` -> `:4000`). |
| **Styling & Design System** | **Tailwind CSS v4 + `@tailwindcss/postcss`** | Direct token sharing (`--surface`, `--primary`, `--radius: 0.25rem`, `--color-border-hairline`). |
| **UI Primitives** | **Radix UI + shadcn/ui** | Headless accessible components (`Dialog`, `Slider`, `DropdownMenu`, `Tabs`, `Input-OTP`, `Tooltip`). |
| **3D & Visualizers** | **Three.js + React Three Fiber + Drei** | Interactive 3D allocation donut, WebGL asset model viewer with explicit `.dispose()` lifecycle deallocation. |
| **Motion & Physics** | **Framer Motion 13.2** | Hardware-accelerated transitions, tabular counter animations (`AnimatedNumber`), and `useReducedMotion` fallbacks. |
| **State Management** | **Zustand 5.0 + Immer** | Low-overhead reactive stores with slice modularity (`useDashboardStore`, `useAuthStore`, `usePortfolioStore`). |
| **Web3 & Wallet Rail** | **Wagmi / Viem / AppKit** | Non-custodial wallet connection alongside sovereign custody balances. |
| **Data Fetching & Stream** | **TanStack Query v5 + Socket.IO Client** | Background revalidation, optimistic mutations, and real-time WebSocket ticker updates (`/ws/ticker`). |
| **Testing Suite** | **Vitest 5.0 + RTL + jsdom** | Deterministic, ultra-fast test execution in `Tests/UnitTest/` and `Tests/IntegrationTest/`. |

---

## Directory Boundaries & Component Ownership

```
Frontend/user-dashboard/
├── public/
│   ├── favicon.ico
│   └── manifests/
├── src/
│   ├── assets/                # Vault icons, 3D gltf models, vectors, brand emblems
│   ├── components/
│   │   ├── command-bar/       # Global Command Bar, Net Worth, 24h P&L, Mini Allocation Donut, Privacy Toggle
│   │   ├── nav/               # Sidebar Rail (expanded/collapsed), Mobile Header, Quick Action Triggers
│   │   ├── modules/
│   │   │   ├── crypto/        # HoldingsTable, CustodyBadges, DcaScheduler, StakingGauges, GasEstimator
│   │   │   ├── stocks/        # OrderBookTable, PositionCard, CorporateCalendar, DripManager, PrePostMarket
│   │   │   ├── ai-funds/      # StrategyMetrics, RationaleFeed, CircuitBreakerToggle, GpuYieldTelemetry
│   │   │   ├── real-estate/   # PropertyDeck, RentalYieldChart, SecondaryMarketOrderBook, SpvDocumentVault
│   │   │   ├── cars/          # VehicleCard, HagertyValuationChart, DriveBookingCalendar, BondedVaultStatus
│   │   │   ├── vip-cards/     # ObsidianCard3D, CardControls, PrivilegesList, ConciergeModal, BiometricGate
│   │   │   └── wallet/        # LedgerSplit (Available vs Invested), FiatRampWizard, CashSweepPot, TxHistoryTable
│   │   ├── compliance/        # KycTierTracker, TaxPackDownloader (8949/Schedule D), SecuritySessions
│   │   ├── modals/            # DepositModal, WithdrawModal, TradeModal, WhitelistLockModal, KycDrawer
│   │   ├── 3d/                # Three.js allocation donut, asset viewer, WebGL canvas wrapper
│   │   └── ui/                # shadcn primitives (Button, Dialog, Slider, InputOtp, Tooltip, DropdownMenu)
│   ├── hooks/                 # useSocketTicker, useWebAuthn, usePrivacyMask, useKeyboardShortcuts
│   ├── lib/
│   │   ├── api.ts             # Axios/Fetch client with token auto-refresh & retry logic
│   │   ├── formatters.ts      # Tabular currency, percentage, and date formatters
│   │   ├── calculations.ts    # Consolidated P&L, weighted yield, allocation math
│   │   └── webauthn.ts        # FIDO2 / YubiKey client-side authentication utilities
│   ├── store/
│   │   ├── useAuthStore.ts    # User identity, session tokens, KYC tier, 2FA/WebAuthn status
│   │   ├── useDashboardStore.ts# Privacy toggle (maskBalances), active vertical/tab, notifications
│   │   └── usePortfolioStore.ts# Aggregated net worth, positions, and live asset balances
│   ├── App.tsx                # Dashboard shell, command bar, routing layout, error boundaries
│   ├── main.tsx               # Root entrypoint with QueryClientProvider & ThemeProvider
│   └── index.css              # Shared Tailwind v4 tokens & micro-chamfer geometry
├── Tests/
│   ├── UnitTest/              # Unit tests (calculations, formatters, store state transitions)
│   └── IntegrationTest/       # Integration tests (command bar, modal flows, module switches)
├── Dockerfile                 # Multi-stage Vite build + Nginx Alpine static server
├── docker-compose.yml         # Container configuration (Port 5174:80)
├── package.json               # Dependencies and scripts (dev, build, test, lint)
├── tsconfig.json              # Strict TypeScript configuration
└── vite.config.ts             # Vite 8 config with chunk splitting & backend proxy
```

---

## State & Storage Model

1. **`useAuthStore`**:
   - `user`: Authenticated user entity (`id`, `email`, `fullName`, `tier: 'RETAIL' | 'PRIVATE_WEALTH' | 'INSTITUTIONAL'`, `isCorporate`).
   - `accessToken`: Volatile in-memory JWT (15m expiry).
   - `isAuthenticated`: Boolean state flag.
   - `kycTier`: Current compliance tier (`Tier 1`, `Tier 2`, `Tier 3`).
   - `webAuthnRegistered`: Boolean flag indicating hardware FIDO2 key availability.

2. **`useDashboardStore`**:
   - `maskBalances`: Boolean toggle. When active, all balances and monetary figures are rendered as masked bullets (`••••••••`).
   - `activeVertical`: Active route (`'crypto' | 'stocks' | 'ai-funds' | 'real-estate' | 'cars' | 'vip-cards' | 'wallet'`).
   - `timeframe`: Active P&L timeframe (`'1D' | '1W' | '1M' | '1Y' | 'ALL'`).
   - `isSidebarCollapsed`: Boolean toggle for desktop navigation rail width (64px vs 220px).

3. **`usePortfolioStore`**:
   - `netWorth`: Consolidated portfolio total aggregated across all 7 asset classes.
   - `pnl`: 24-hour and all-time profit/loss in monetary amount and percentage.
   - `allocation`: Normalized percentage weights across each vertical.
   - `positions`: Real-time holdings and balances per vertical.

4. **Storage Boundaries**:
   - `localStorage`: Restricted strictly to non-sensitive UI settings (`wavy_theme`, `wavy_dashboard_sidebar_collapsed`, `wavy_locale`).
   - **No tokens or secrets** in `localStorage`. Access tokens live exclusively in memory (`useAuthStore`); refresh tokens are held in secure `HttpOnly; SameSite=Strict; Secure` cookies.

---

## Non-Negotiable Architectural Invariants

1. **Sub-50ms View Swapping**: View transitions between asset verticals must execute in under 50ms without hard browser page reloads.
2. **Zero Cumulative Layout Shift (CLS)**: Dynamic module containers must enforce an explicit `min-height: 540px` and display pre-dimensioned skeleton loaders during transitions.
3. **Deterministic WebGL Lifecycle**:
   - All Three.js canvases must explicitly invoke `.dispose()` on geometries, materials, and textures in `useEffect` cleanup hooks.
   - The animation loop must throttle down to 5–10 FPS when the document is hidden (`document.hidden === true`) or when the canvas is scrolled out of viewport (`IntersectionObserver`).
4. **Tabular Lining Figures**: All financial figures, APYs, tickers, and balance numbers must render using `Inter` with `tabular-nums` styling to prevent layout jitter.
5. **Decoupled 3D Rendering**: Heavy Three.js computations must never block the main UI thread or interfere with DOM interaction responsiveness.
6. **Strict Error Boundaries**: Unhandled component rendering errors in dynamic sub-views or 3D visualizers must be caught by an `ErrorBoundary` that renders a graceful fallback UI without crashing the global command bar.
7. **Secure Error Handling**: Client responses must never leak stack traces, internal errors, or infrastructure details.
8. **Secure Logging**: All emitted logs must redact PII, authorization tokens, secrets, and private credentials.

---

## Git Commit Standards

- **Git Commit Frequency**: Commit code as you build. Every working session or phase must contain **at least two git commits**.
- **Conventional Commit Patterns**:
  - `feat:` for new features (e.g. `feat: add Global Command Bar net worth widget`)
  - `fix:` for bug fixes (e.g. `fix: resolve P&L percentage division by zero`)
  - `refactor:` for code refactoring (e.g. `refactor: extract allocation donut geometry`)
  - `docs:` for documentation updates (e.g. `docs: update progress-tracker and architecture context`)
  - `tests:` for test additions and modifications (e.g. `tests: add unit tests for net worth calculation`)
  - `chore:` for maintenance tasks and environment setup (e.g. `chore: configure vite proxy for backend socket`)
