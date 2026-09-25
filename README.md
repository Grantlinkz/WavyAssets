# WavyAssets — Sovereign Multi-Asset Institutional Platform

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma)](https://www.prisma.io/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186-black?logo=three.js)](https://threejs.org/)
[![Vitest](https://img.shields.io/badge/Tests-558%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Container-2496ED?logo=docker)](https://www.docker.com/)

> **WavyAssets Sovereign Wealth Management & Institutional Operating System**  
> High-discretion digital wealth management, institutional custody, double-entry financial ledgering, and multi-asset orchestration across 7 asset verticals.

---

## 1. Platform Overview

**WavyAssets** is an institutional-grade financial operating environment engineered for sovereign individuals, family offices, and high-net-worth institutional allocators. The platform unites Swiss typographic discipline, physical vault security paradigms, and low-latency financial terminal ergonomics to orchestrate capital across physical, digital, and quantitative asset classes.

### The 7 Core Asset Verticals
1. **Crypto Investment & Yield Aggregation** (`crypto`): Institutional Bitcoin and Ethereum staking strategies with automated downside protection, recurring DCA buys, and multi-signature offline cold storage.
2. **Global Stocks & Pre-IPO Allocations** (`stocks`): Secondary private equity opportunities (SpaceX, Stripe, OpenAI), Direct Market Access (DMA) Level-2 order book depth, and DRIP dividend automation.
3. **AI Systematic & Quantitative Funds** (`ai-funds`): Autonomous algorithmic trading and yield harvesting powered by dedicated H100 GPU compute clusters with immutable execution rationale audit logs and emergency circuit breakers.
4. **Tokenized Prime Real Estate** (`real-estate`): Direct fractional access to prime commercial office towers and logistics assets (Zurich, Geneva, London), automated monthly rental yield distributions, and atomic secondary OTC settlement.
5. **VIP Concierge & Collateral Metal Cards** (`vip-cards`): Custom-minted 42g obsidian tungsten metal cards backed by sovereign multi-currency balances, daily spend limits, and biometric WebAuthn ephemeral 60s CVV reveals.
6. **Exotic Vehicles & Horology Vault** (`cars`): Physical vault custody (Geneva FreePort & Zurich Vaults), real-time environmental telemetry, Hagerty benchmark comps, and track-day drive bookings.
7. **Digital Custody & Sovereign Wallet** (`wallet`): Double-entry ledger architecture enforcing mathematical conservation ($\sum \text{Debits} + \sum \text{Credits} = 0$), Available vs. Invested capital segregation, and 5.2% idle cash auto-sweep pots.

---

## 2. Monorepo Repository Structure

```
WavyAssets/ (Git Root)
├── Backend/
│   ├── landing-page/                 # High-availability NestJS API Gateway & WebSocket Broadcaster (:4000)
│   │   ├── prisma/                   # SQLite schema definitions & persistent storage
│   │   ├── src/                      # Auth (OTP/JWT), Leads, Simulation, Telemetry, Health
│   │   ├── Tests/                    # 72 automated Vitest unit & integration tests
│   │   ├── Dockerfile                # Multi-stage unprivileged Alpine production container
│   │   └── dist-runner.js            # Production runtime entrypoint
│   └── user-dashboard/               # High-concurrency transactional core & double-entry ledger (:4001)
│       ├── prisma/                   # SQLite/Postgres schema (340 LOC), ledger accounts & seed script
│       ├── src/                      # 7 asset vertical modules, WebSockets, WebAuthn & 48h Time-Lock
│       ├── Tests/                    # 224 automated Vitest unit, integration, and load tests
│       └── Dockerfile                # Hardened multi-stage unprivileged Alpine container
├── Frontend/
│   ├── landing-page/                 # Sovereign Institutional Showcase Terminal (:5173)
│   │   ├── src/                      # Three.js WebGL canvas, Kinetic typography, simulator, auth modal
│   │   ├── Tests/                    # 124 automated unit & integration tests
│   │   ├── Dockerfile                # Multi-stage Vite build + Nginx Alpine static web server
│   │   ├── nginx.conf.template       # Nginx SPA fallback routing, reverse proxy & security headers
│   │   └── vercel.json               # Vercel deployment configuration & defensive CSP headers
│   └── user-dashboard/               # Authenticated Sovereign Command Deck (:5174)
│       ├── src/                      # 7 asset module command views, universal command bar, AuthCallback
│       ├── Tests/                    # 139 automated unit & integration tests
│       ├── Dockerfile                # Multi-stage Vite build + Nginx Alpine web server
│       └── nginx.conf.template       # Production reverse proxy to backend dashboard (:4001)
├── docker-compose.yml                # Unified monorepo orchestration (All 4 services on shared bridge network)
├── render.yaml                       # Cloud infrastructure deployment blueprint
└── README.md                         # Monorepo architecture & operating guide
```

---

## 3. Technology Stack & Service Architecture

| Domain / Service | Framework & Runtime | Key Capabilities & Protocols | Dev Port |
| :--- | :--- | :--- | :---: |
| **Frontend Terminal** (`Frontend/landing-page`) | React 19 + Vite 8 + TypeScript Strict | Three.js WebGL particle mesh & gyroscope, Framer Motion, shadcn/ui, portfolio simulator, OTP authentication modal. | `:5173` |
| **Backend Gateway** (`Backend/landing-page`) | NestJS 11 + Express + SWC (Node 22) | Argon2id, AES-256-GCM field encryption, HMAC blind indexing, Resend email OTP, Telegram Enclave fallback, Swagger (`/api/docs`), `/ws/ticker`. | `:4000` |
| **Frontend Dashboard** (`Frontend/user-dashboard`) | React 19 + Vite 8 + TypeScript Strict | Sub-50ms workspace view switching, zero CLS, balance privacy masking, universal command bar (`Cmd+K`), Zustand 5, WebGL allocation donut. | `:5174` |
| **Backend Dashboard** (`Backend/user-dashboard`) | NestJS 11 + Express + SWC (Node 22) | Double-entry financial ledgering, 48-hour withdrawal whitelist quarantine, WebAuthn/FIDO2, RFC 7807 error handling, `/ws/portfolio`. | `:4001` |

---

## 4. Cross-Domain Authentication & Seamless Handoff Lifecycle

The platform implements an air-gapped cryptographic handoff protocol to transition users seamlessly from public landing pages into the authenticated dashboard:

```
[ Frontend: Landing Page ] (:5173)
       │
       ▼ User signs in or registers via UnifiedAuthModal
[ Backend: Landing Gateway ] (:4000)
       │ • Validates OTP and creates session
       │ • Issues single-use HMAC-SHA256 handoff ticket (60s TTL)
       ▼
[ Redirect to User Dashboard ] ──► http://localhost:5174/auth/callback?ticket=<token>
       │
       ▼ Frontend Dashboard detects route and passes ticket to useAuthStore
[ Backend: Dashboard Core ] (:4001)
       │ • Validates & burns single-use ticket in atomic Prisma transaction
       │ • Issues fresh Access JWT + HttpOnly refresh cookie
       ▼
[ Authenticated Command Deck Mounts ] (Zero reload, clean URL state, immediate asset access)
```

---

## 5. Engineering Invariants & Quality Standards

1. **Sub-50ms View Swapping**: Client-side reactive vertical switching executes in $<50$ms with zero full-page browser reloads.
2. **Zero Cumulative Layout Shift (CLS)**: Pre-dimensioned structural skeletons (`min-height: 540px`) eliminate layout shifts.
3. **Double-Entry Balance Conservation**: Mathematical invariant ($\sum \text{Debits} + \sum \text{Credits} = 0$) enforced on every monetary movement.
4. **48-Hour Quarantine Time-Lock**: Mandatory 48-hour cooling-off period on all newly added crypto or fiat withdrawal destinations with 2-of-2 hardware signatures.
5. **One-Click Privacy Shield**: Instant UI toggle to mask all confidential net worth figures (`••••••`) in public settings.
6. **Deterministic WebGL Lifecycle**: Explicit GPU buffer disposal (`geometry.dispose()`, `material.dispose()`) prevents WebGL memory leaks.
7. **Production Sandbox Guard**: Dev static OTPs and local debug logs are strictly blocked in production (`HTTP 403`).

---

## 6. Development Workflows

### Option A: Unified Monorepo Docker Compose (All 4 Services)

Launch the entire institutional cluster (2 Frontends + 2 Backends) with automated container healthchecks:

```bash
# From repository root
docker compose up -d --build

# Verify container health across all 4 services
docker compose ps

# Access services:
# - Frontend Landing Page:    http://localhost:5173
# - Backend Landing Gateway:  http://localhost:4000
# - Backend Swagger Docs:     http://localhost:4000/api/docs
# - Frontend User Dashboard:  http://localhost:5174
# - Backend User Dashboard:   http://localhost:4001
# - Backend Liveness Check:   http://localhost:4000/health/live

# Tail unified logs
docker compose logs -f

# Graceful shutdown
docker compose down
```

### Option B: Local Native Node Development

Run the full dual-stack ecosystem locally with Vite hot-reloading:

```bash
# 1. Backend Landing Gateway (:4000)
cd Backend/landing-page
npm install
npx prisma db push
npm run start:dev

# 2. Backend User Dashboard (:4001)
cd Backend/user-dashboard
npm install
npx prisma db push
npm run start:dev

# 3. Frontend Landing Page (:5173)
cd Frontend/landing-page
npm install
npm run dev

# 4. Frontend User Dashboard (:5174)
cd Frontend/user-dashboard
npm install
npm run dev
```

---

## 7. Production Cloud Deployments (Render & Vercel)

The WavyAssets platform is engineered for zero-downtime, distributed cloud deployments across Vercel (Frontends) and Render (Backends):

```
                                      [ Production Architecture ]
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 ▼                                                                     ▼
    [ Vercel Edge Network ]                                                [ Render Cloud Services ]
    • Landing Page (https://wavy-assets.vercel.app)                         • Landing Gateway (https://wavyassets-backend.onrender.com)
    • User Dashboard (https://wavy-assets-userdashboard-two.vercel.app)     • Dashboard Core (https://wavyassets-backend-userdashboard.onrender.com)
                 │                                                                     │
                 │                               Reverse Proxy (/api, /ws)             │
                 └────────────────────────────────────────────────────────────────────►│
                                                                                       ▼
                                                                           [ Prisma Postgres Cloud ]
                                                                           pooled.db.prisma.io:5432
```

### 1. Frontend Vercel Deployments
- **Landing Page Frontend** ([Frontend/landing-page/vercel.json](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/landing-page/vercel.json)):
  - Production URL: `https://wavy-assets.vercel.app`
  - Public `robots.txt` indexing allowed for organic discovery, with private paths (`/api/`, `/auth/`, `/private/`) quarantined.
  - Transparent API reverse proxy: `/api/(.*) -> https://wavyassets-backend.onrender.com/api/$1`.
- **User Dashboard Frontend** ([Frontend/user-dashboard/vercel.json](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/user-dashboard/vercel.json)):
  - Production URL: `https://wavy-assets-userdashboard-two.vercel.app`
  - Private `robots.txt` (`Disallow: /`) strictly forbids search bots and crawlers from indexing authenticated portfolio data.
  - Transparent API reverse proxy: `/api/(.*) -> https://wavyassets-backend-userdashboard.onrender.com/api/$1`.
  - Strict Content-Security-Policy with WebSocket connection permissions (`wss://*.onrender.com`).

### 2. Backend Render Deployments
- **Unified Render Blueprint** ([render.yaml](file:///c:/Users/ANIK/Desktop/WavyAssets/render.yaml)):
  - **Landing Page Backend (`wavyassets-backend`)**: Port `4000`, `/health/live` probe, builds with `npm install --include=dev && npm run build:render`.
  - **User Dashboard Core (`wavyassets-backend-userdashboard`)**: Port `4001`, `/health/live` probe (with root route `HEAD /` and `GET /` support), builds with `npm install --include=dev && npm run build:render`.
  - **Automated Database Synchronization**: Both services run `prisma db push --skip-generate` during the build step, ensuring PostgreSQL tables and relations on `pooled.db.prisma.io` are updated automatically on deployment.

---

## 8. Automated Test Suites (558 Total Tests)

All four projects include comprehensive automated unit, integration, and end-to-end test suites powered by **Vitest**:

```bash
# 1. Frontend Landing Page (124 tests passing)
cd Frontend/landing-page
npm test

# 2. Backend Landing Gateway (72 tests passing)
cd Backend/landing-page
npm test

# 3. Frontend User Dashboard (139 tests passing)
cd Frontend/user-dashboard
npm test

# 4. Backend User Dashboard (224 tests passing)
cd Backend/user-dashboard
npm test
```

---

## 8. Security, Compliance & License

- **FINMA & SOC-2 Alignment**: Designed to comply with Swiss FINMA AMLA guidelines, corporate UBO transparency registries, and institutional KYC tier hierarchies.
- **Hardware Enclave Signatures**: Native WebAuthn/FIDO2 hardware key authentication (YubiKey 5C NFC, Apple Touch ID / Secure Enclave).
- **Proprietary**: © WavyAssets Sovereign Institutional Terminal. All rights reserved.