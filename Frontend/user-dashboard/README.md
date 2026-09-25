# WavyAssets Sovereign Institutional User Dashboard

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_v6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0_(131_tests)-729B1B?logo=vitest&logoColor=white)](https://vitest.dev/)
[![FINMA AMLA Art. 9](https://img.shields.io/badge/Compliance-FINMA_AMLA_Art._9-D4AF37)](https://www.finma.ch/)

> **Institutional-grade sovereign asset management dashboard** serving family offices, high-net-worth sovereign individuals, and institutional allocators across **all seven sovereign asset verticals**.

---

## 🏛 Overview & Vision

The **WavyAssets User Dashboard** (`Frontend/user-dashboard`) functions as an authenticated command center designed to eliminate the distinction between traditional institutional finance and sovereign Web3 custody. Built with a zero-compromise institutional aesthetic (Obsidian Dark default, 2px–4px micro-chamfer geometry, tabular lining figures), the dashboard delivers real-time portfolio intelligence, atomic settlement rails, and air-gapped cryptographic governance.

---

## 🌐 The Seven Sovereign Asset Verticals

| Vertical | Identifier | Core Capabilities |
| :--- | :--- | :--- |
| **Crypto Investment & Yield** | `crypto` | Spot holdings blotter, sovereign MPC vs external Web3 custody separation, automated DCA scheduler, staking telemetry & tax-lot CSV export. |
| **Global Stocks & Pre-IPO** | `stocks` | Direct Market Access (DMA) Level-2 order book depth, position analytics (Beta, VWAP, 52-week range), pre/post-market pricing toggle, DRIP automation. |
| **AI Systematic & Quant Funds** | `ai-funds` | Multi-factor quantitative strategies (Nexus-Quant v6.42), Sharpe/Sortino ratios, risk posture calibrator, algorithmic execution rationale audit, GPU compute yield telemetry. |
| **Tokenized Prime Real Estate** | `real-estate` | Fractional prime property decks (Zurich, Geneva, London), legal SPV contracts, projected vs realized monthly rental distributions, secondary P2P order bulletin board. |
| **Exotic Vehicles & Horology Vault**| `cars` | Tangible physical asset vaulting, Hagerty benchmark valuation index, bonded FreePort logistics telemetry, drive session booking engine. |
| **VIP Concierge & Metal Cards** | `vip-cards` | Obsidian Coated 42g Tungsten visualizer, spending caps slider ($50k–$2M), Biometric WebAuthn CVV reveal with 60s auto-expiry, 24/7 dedicated private banker concierge. |
| **Digital Custody & Sovereign Wallet** | `wallet` | Unified ledger with Available vs Invested split, multi-rail fiat ramp (Bank Wire SEPA/Fedwire/SWIFT, on-chain), idle cash 5.2% auto-sweep, statement export. |

### Governance & Enclave Modules
- **Tiered KYC/AML Compliance** (`compliance`): 3-tier sovereign architecture (Tier 1 $10k/day, Tier 2 $250k/day, Tier 3 Unlimited atomic DvP), Corporate UBO Registry (`Grant Sovereign Holdings AG`), 2-of-3 HSM signer structure, multi-asset fiscal gains dossier (TY 2024 / 2025), Form 8949 CSV export, and 4 global regulatory corridors (CH, US, UK, SG).
- **Security Command Center** (`security`): 100/100 Defense Index, Argon2id + FIDO2 memory-hard KDF, 3-token physical hardware fleet (YubiKey 5C NFC, Ledger Nano, Apple Secure Enclave), active session termination, 1-click Emergency Lockdown, and **mandatory 24–48 hour time-lock quarantine on newly registered withdrawal addresses**.

---

## ⚡ Core Technical Standards & Invariants

1. **Sub-50ms View Swapping**: Instant vertical workspace transitions with zero browser page reloads.
2. **Zero Cumulative Layout Shift (CLS)**: Dynamic workspaces enforce `min-height: 540px` with pre-dimensioned structural skeletons.
3. **Tabular Lining Numerals**: Strict application of `tabular-nums` (`font-mono`) across all financial figures, APYs, and timestamps to eliminate column jitter.
4. **One-Click Privacy Shield**: Global `maskBalances` toggle converting all sensitive financial figures across the DOM into protected tokens (`••••••`).
5. **Inviolable Zero-Trust Time-Lock**: Mandatory 24-to-48 hour cold quarantine timer automatically enforced on every newly registered withdrawal destination before fund transfers can be signed.
6. **Deterministic WebGL Lifecycle**: Three.js WebGL allocation donut with explicit `.dispose()` cleanup on geometry, material, and textures, plus document visibility throttling.
7. **Single-Use HMAC Handoff Ticket**: Secure landing-to-dashboard authentication transition via `/auth/callback?ticket=<token>` exchanged against `POST /api/v1/auth/exchange-ticket`.

---

## 🛠 Technology Stack

- **Runtime & Language**: React 19.2 + TypeScript (Strict mode enabled)
- **Build Engine**: Vite 8.2 + SWC (Optimized chunk splitting, sub-second HMR)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) with custom institutional CSS tokens (`--surface`, `--primary`, `--border-hairline`)
- **UI Primitives**: Radix UI Headless Primitives (`Dialog`, `Slider`, `Tabs`, `DropdownMenu`, `Tooltip`)
- **3D Visualizations**: Three.js 0.186 (Radial Allocation Donut)
- **State Management**: Zustand 5.0 + Immer (Modular reactive stores: `useDashboardStore`, `useAuthStore`, `usePortfolioStore`, `useAlternativeStore`, `useGovernanceStore`)
- **Testing**: Vitest 5.0 + React Testing Library + jsdom (131 tests across 21 test suites)
- **Code Hygiene**: ESLint 10 + TypeScript-ESLint + strict clean rules

---

## 📂 Directory Architecture

```
Frontend/user-dashboard/
├── .ai/                            # AI governance & architectural documentation suite
│   ├── agents.md                   # Persona, execution rules, prompt protocol
│   ├── architecture.md             # System boundaries, state stores, tech stack
│   ├── code-standards.md           # Engineering standards, test organization
│   ├── progress-tracker.md         # 6-sprint progress tracker & milestone status
│   ├── security.md                 # Threat model, zero-trust invariants
│   └── ui-context.md               # Design tokens, color palette, micro-chamfer specs
├── prompts/                        # Executed sprint specifications
│   ├── sprint-4-alternative-asset-modules.md
│   └── sprint-5-vip-compliance-security.md
├── src/
│   ├── components/
│   │   ├── auth/                   # Ticket exchange & session callback
│   │   ├── command-bar/            # Global Command Bar, Net Worth & 3D Donut
│   │   ├── modals/                 # Deposit, Withdraw, Trade, and KYC drawers
│   │   ├── modules/                # Workspace views for each asset vertical
│   │   │   ├── ai-funds/           # Quant strategies & risk calibrator
│   │   │   ├── cars/               # Tangible vehicle & horology vaults
│   │   │   ├── compliance/         # Tiered KYC, UBO registry, tax dossier
│   │   │   ├── crypto/             # Token blotter, DCA scheduler, staking
│   │   │   ├── real-estate/        # Fractional SPVs, rental distributions
│   │   │   ├── security/           # Hardware keys, sessions, whitelist time-lock
│   │   │   ├── stocks/             # DMA Level-2 depth, VWAP, pre/post-market
│   │   │   ├── vip-cards/          # 42g Tungsten card, spending limits, concierge
│   │   │   └── wallet/             # Unified ledger, fiat ramp, cash sweep
│   │   ├── nav/                    # Top header & sidebar navigation rail
│   │   └── ui/                     # Accessible UI components (Dialog, Slider, etc.)
│   ├── lib/
│   │   ├── alternativeAssetData.ts # Data models for AI funds, RE, and cars
│   │   ├── calculations.ts         # Financial math, P&L delta, currency formatters
│   │   ├── governanceAssetData.ts  # KYC tiers, UBO data, tax packs, security keys
│   │   └── portfolioData.ts        # Net worth metrics & liquid asset holdings
│   ├── store/
│   │   ├── useAlternativeStore.ts  # State for alternative asset modules
│   │   ├── useAuthStore.ts         # Identity, session ticket, KYC tier
│   │   ├── useDashboardStore.ts    # Active vertical, theme, privacy masking
│   │   ├── useGovernanceStore.ts   # Card controls, tax year, whitelist time-lock
│   │   └── usePortfolioStore.ts    # Holdings, trades, orders, balance sweep
│   ├── App.tsx                     # Master shell router & layout orchestration
│   ├── index.css                   # Tailwind v4 theme definitions & design tokens
│   └── main.tsx                    # Application entry point
├── Tests/
│   ├── IntegrationTest/            # SSR parity & cross-module integration tests
│   │   ├── alternativeModules.test.tsx
│   │   ├── authHandoff.test.tsx
│   │   ├── commandBar.test.tsx
│   │   ├── governanceModules.test.tsx
│   │   ├── liquidModules.test.tsx
│   │   ├── modalOverlays.test.tsx
│   │   └── shellNavigation.test.tsx
│   └── UnitTest/                   # Deterministic unit test suites (14 files)
├── package.json                    # Dependencies & npm scripts
├── tsconfig.json                   # TypeScript project references
├── vite.config.ts                  # Vite build configuration & server proxy
└── vitest.config.ts                # Vitest test configuration & environment
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher (tested on Node 20 & 24)
- **Package Manager**: `npm` (v10+)

### Installation
```bash
# Clone the repository and navigate to user-dashboard
cd Frontend/user-dashboard

# Install dependencies
npm install
```

### Development Server
```bash
# Start Vite development server with Hot Module Replacement (HMR)
npm run dev
```
The dashboard will be available at `http://localhost:5174/`.

### Quality Verification & Testing
```bash
# Run complete Vitest automated test suite (131 tests across 21 suites)
npm test

# Run strict TypeScript typechecking
npx tsc -b

# Run ESLint validation
npm run lint
```

### Production Build
```bash
# Compile and package production distribution
npm run build

# Preview production build locally
npm run preview
```

---

## 🚢 Production Deployment

### 1. Vercel Deployment
The User Dashboard is deployed to Vercel at `https://wavy-assets-userdashboard-two.vercel.app` using [vercel.json](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/user-dashboard/vercel.json):
- **Vite SPA Catch-All**: Rewrites all routes to `/index.html` for client-side routing.
- **Backend API Reverse Proxy**: Transparently proxies `/api/(.*)` to the production User Dashboard backend at `https://wavyassets-backend-userdashboard.onrender.com/api/$1`.
- **Private Financial Portal Invariant (`robots.txt`)**: Search engines and web crawlers are strictly disallowed via `/robots.txt` (`Disallow: /`) to preserve institutional confidentiality.
- **Hardened Security Headers**: Enforces strict Content-Security-Policy (CSP), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security: max-age=63072000`.

### 2. Docker & Nginx Containerization
The frontend can be built and run standalone using Docker:
```bash
# Build multi-stage hardened Nginx image
docker build -t wavyassets/user-dashboard:1.0.0 .

# Run container with dynamic backend proxy
docker run -d -p 5174:80 \
  -e BACKEND_HOST=wavyassets-backend-user-dashboard \
  -e BACKEND_PORT=4000 \
  --name wavyassets-user-dashboard \
  wavyassets/user-dashboard:1.0.0
```
Or orchestrate via Docker Compose:
```bash
docker compose up -d
```
Container liveness probe is available at `http://localhost:5174/healthz`.

---

## 🔐 Security Architecture

- **Private Terminal Crawler Quarantine**: Automatic `robots.txt` prevents public search indices from logging authenticated screens.
- **Zero Client Secret Storage**: No private keys, admin API credentials, or seed phrases are exposed in client bundles.
- **Argon2id & WebAuthn / FIDO2**: Hardened credential derivation and biometric touch validation for privileged actions (CVV reveal, whitelist addition, limit increase).
- **Time-Lock Quarantine**: All withdrawal destination addresses are cryptographically quarantined with a mandatory 48-hour cold lock timer.
- **PII & Financial Masking**: Full client-side figure masking with `formatMaskedCurrency` protecting screen recordings and shoulder-surfing.
- **Deterministic Cleanup**: All WebGL canvases, RAF timers, and event listeners invoke `.dispose()` to ensure zero memory leaks across long trading sessions.

---

## 📄 License & Governance

Proprietary and confidential. Developed for the **WavyAssets Sovereign Wealth Infrastructure Ecosystem**. All rights reserved.
