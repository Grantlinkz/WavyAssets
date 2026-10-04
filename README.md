# WavyAssets — Sovereign Multi-Asset Institutional Platform

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2+-purple?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Tests-630%2B_Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-6_Container_Cluster-2496ED?logo=docker)](https://www.docker.com/)

> **WavyAssets Sovereign Wealth Management & Institutional Operating System**  
> High-discretion digital wealth management, institutional custody, double-entry financial ledgering, supreme administrative command, and multi-asset orchestration across 7 sovereign asset verticals.

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

### Institutional 24/7 Live Concierge (Smartsupp)
Integrated across the User Dashboard via [`src/lib/smartsupp.ts`](./Frontend/user-dashboard/src/lib/smartsupp.ts) and [`SmartsuppChat.tsx`](./Frontend/user-dashboard/src/components/chat/SmartsuppChat.tsx), providing authenticated clients with instant live chat support, automatic identity synchronization, and 4 quick-action launch triggers (floating button, top header, sidebar rail, and mobile drawer).

---

## 2. Monorepo Repository Structure

```
WavyAssets/ (Git Root)
├── Backend/                                  # All Backend Microservices & APIs
│   ├── landing-page/                         # High-availability NestJS API Gateway & WebSocket Broadcaster (:4000)
│   │   ├── prisma/                           # SQLite schema definitions & persistent storage
│   │   ├── src/                              # Auth (OTP/JWT), Leads, Simulation, Telemetry, Health
│   │   ├── Dockerfile                        # Multi-stage unprivileged Alpine production container
│   │   ├── docker-compose.yml                # Standalone service compose
│   │   ├── docker-compose.dev.yml            # Live hot-reload development compose
│   │   └── README.md                         # Service documentation
│   ├── user-dashboard/                       # High-concurrency transactional core & double-entry ledger (:4001)
│   │   ├── prisma/                           # SQLite/Postgres schema (340 LOC), ledger accounts & seed script
│   │   ├── src/                              # 7 asset vertical modules, WebSockets, WebAuthn & 48h Time-Lock
│   │   ├── Dockerfile                        # Hardened multi-stage unprivileged Alpine container
│   │   ├── docker-compose.yml                # Standalone service compose
│   │   ├── docker-compose.dev.yml            # Live hot-reload development compose
│   │   └── README.md                         # Service documentation
│   ├── admin-panel/                          # Supreme Admin Panel & Treasury Operations Core (:4002)
│   │   ├── prisma/                           # Schema for RBAC, compliance dossiers, cold rails, audit logs
│   │   ├── src/                              # Compliance, inquiry triage, emergency circuit breakers
│   │   ├── Dockerfile                        # Hardened multi-stage unprivileged Alpine container
│   │   ├── docker-compose.yml                # Standalone service compose
│   │   ├── docker-compose.dev.yml            # Live hot-reload development compose
│   │   └── README.md                         # Service documentation
│   ├── docker-compose.yml                    # Unified compose orchestrating all 3 backend services
│   └── README.md                             # Backend architecture & inter-service guide
├── Frontend/                                 # All Frontend Web Terminals
│   ├── landing-page/                         # Sovereign Institutional Showcase Terminal (:5173)
│   │   ├── src/                              # Three.js WebGL canvas, Kinetic typography, simulator, auth modal
│   │   ├── Dockerfile                        # Multi-stage Vite build + Nginx Alpine static web server
│   │   ├── nginx.conf.template               # Nginx SPA fallback routing, reverse proxy & security headers
│   │   ├── docker-compose.yml                # Standalone service compose
│   │   ├── docker-compose.dev.yml            # Live hot-reload development compose
│   │   └── README.md                         # Terminal documentation
│   ├── user-dashboard/                       # Authenticated Sovereign Command Deck (:5174)
│   │   ├── src/                              # 7 asset module command views, Smartsupp live concierge, universal bar
│   │   ├── Dockerfile                        # Multi-stage Vite build + Nginx Alpine web server
│   │   ├── nginx.conf.template               # Production reverse proxy to backend dashboard (:4001)
│   │   ├── docker-compose.yml                # Standalone service compose
│   │   ├── docker-compose.dev.yml            # Live hot-reload development compose
│   │   └── README.md                         # Terminal documentation
│   ├── admin-panel/                          # Supreme Operational Command Terminal (:5175)
│   │   ├── src/                              # Administrative KPI blotter, KYC verification, emergency deck
│   │   ├── Dockerfile                        # Multi-stage Vite build + Nginx Alpine web server
│   │   ├── nginx.conf.template               # Production reverse proxy to backend admin (:4002)
│   │   ├── docker-compose.yml                # Standalone service compose
│   │   ├── docker-compose.dev.yml            # Live hot-reload development compose
│   │   └── README.md                         # Terminal documentation
│   ├── docker-compose.yml                    # Unified compose orchestrating all 3 frontend terminals
│   └── README.md                             # Frontend architecture & design system guide
├── docker-compose.yml                        # Unified Monorepo Compose (All 6 services on shared network)
├── render.yaml                               # Cloud infrastructure deployment blueprint
└── README.md                                 # Master platform architecture & operating guide
```

---

## 3. Technology Stack & Service Architecture

| Domain / Service | Framework & Runtime | Host Port | Internal Port | Health Probe | Key Capabilities & Protocols |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Frontend: Landing** | React 19 + Vite 8 + Tailwind CSS v4 | `:5173` | `:80` | `GET /healthz` | Three.js WebGL particle mesh, portfolio simulator, OTP authentication modal. |
| **Backend: Landing** | NestJS 11 + Express + SWC (Node 22) | `:4000` | `:4000` | `GET /health/live` | Argon2id, AES-256-GCM field encryption, Resend OTP, `/ws/ticker`, Swagger `/api/docs`. |
| **Frontend: Dashboard** | React 19 + Vite 8 + Tailwind CSS v4 | `:5174` | `:80` | `GET /healthz` | 7 asset verticals, sub-50ms swapping, Smartsupp 24/7 concierge, WebGL allocation donut. |
| **Backend: Dashboard** | NestJS 11 + Express + SWC (Node 22) | `:4001` | `:4000` | `GET /health` | Double-entry ledger, 48h withdrawal quarantine, WebAuthn/FIDO2, `/ws/portfolio`. |
| **Frontend: Admin Panel** | React 19 + Vite 8 + Tailwind CSS v4 | `:5175` | `:80` | `GET /healthz` | Administrative KPI blotters, KYC approval triage, cold rail setup, emergency deck. |
| **Backend: Admin Panel** | NestJS 11 + Express + SWC (Node 22) | `:4002` | `:4002` | `GET /api/v1/overview/summary` | Granular RBAC, audit blotter, emergency lockdown, TOTP 2FA, `/api/v1/overview`. |

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
7. **24/7 Smartsupp Live Concierge**: Seamless client desk support with automatic user identity binding and zero layout distortion.
8. **Emergency Lockdown Protocol**: Instant 1-click circuit breaker to freeze DMA execution and engage read-only mode during anomalies.

---

## 6. Docker Orchestration Workflows

### Option A: Complete 6-Service Monorepo Stack
Launch the entire institutional cluster (3 Frontends + 3 Backends) with automated container healthchecks and dependency management:

```bash
# Build and launch all 6 containers simultaneously
docker compose up -d --build

# Verify container health across all 6 services
docker compose ps

# Service Entrypoints:
# - Frontend Landing Page:    http://localhost:5173
# - Backend Landing Gateway:  http://localhost:4000 (Swagger: /api/docs)
# - Frontend User Dashboard:  http://localhost:5174
# - Backend User Dashboard:   http://localhost:4001
# - Frontend Admin Panel:     http://localhost:5175
# - Backend Admin Panel:      http://localhost:4002

# Follow aggregated logs
docker compose logs -f

# Graceful cluster shutdown (preserves data volumes)
docker compose down
```

### Option B: Backend Microservices Stack
```bash
# Launch only the 3 backend microservices
docker compose -f Backend/docker-compose.yml up -d --build
docker compose -f Backend/docker-compose.yml ps
docker compose -f Backend/docker-compose.yml down
```

### Option C: Frontend Terminals Stack
```bash
# Launch only the 3 frontend web terminals
docker compose -f Frontend/docker-compose.yml up -d --build
docker compose -f Frontend/docker-compose.yml ps
docker compose -f Frontend/docker-compose.yml down
```

### Option D: Sub-Component Standalone Orchestration
Every service includes an independent standalone `docker-compose.yml`:

```bash
# Backend sub-services:
docker compose -f Backend/landing-page/docker-compose.yml up -d --build
docker compose -f Backend/user-dashboard/docker-compose.yml up -d --build
docker compose -f Backend/admin-panel/docker-compose.yml up -d --build

# Frontend sub-services:
docker compose -f Frontend/landing-page/docker-compose.yml up -d --build
docker compose -f Frontend/user-dashboard/docker-compose.yml up -d --build
docker compose -f Frontend/admin-panel/docker-compose.yml up -d --build
```

### Option E: Live Containerized Development (Hot Reload)
Run any service in containerized dev mode with volume-mounted source code:

```bash
# Backend live development:
docker compose -f Backend/landing-page/docker-compose.yml -f Backend/landing-page/docker-compose.dev.yml up --build
docker compose -f Backend/user-dashboard/docker-compose.yml -f Backend/user-dashboard/docker-compose.dev.yml up --build
docker compose -f Backend/admin-panel/docker-compose.yml -f Backend/admin-panel/docker-compose.dev.yml up --build

# Frontend live development:
docker compose -f Frontend/landing-page/docker-compose.yml -f Frontend/landing-page/docker-compose.dev.yml up --build
docker compose -f Frontend/user-dashboard/docker-compose.yml -f Frontend/user-dashboard/docker-compose.dev.yml up --build
docker compose -f Frontend/admin-panel/docker-compose.yml -f Frontend/admin-panel/docker-compose.dev.yml up --build
```

---

## 7. Local Development Workflows (Native Node)

Run each service in separate terminal sessions during local development without Docker:

```bash
# 1. Backend Landing Gateway (:4000)
cd Backend/landing-page && npm ci && npx prisma generate && npx prisma db push && npm run start:dev

# 2. Backend User Dashboard (:4001)
cd Backend/user-dashboard && npm ci && npx prisma generate && npx prisma db push && npm run prisma:seed && npm run start:dev

# 3. Backend Admin Panel (:4002)
cd Backend/admin-panel && npm ci && npx prisma generate && npx prisma db push && npm run prisma:seed && npm run start:dev

# 4. Frontend Landing Page (:5173)
cd Frontend/landing-page && npm ci && npm run dev

# 5. Frontend User Dashboard (:5174)
cd Frontend/user-dashboard && npm ci && npm run dev

# 6. Frontend Admin Panel (:5175)
cd Frontend/admin-panel && npm ci && npm run dev
```

---

## 8. Automated Test Verification (630+ Tests Passing)

All projects maintain comprehensive automated test suites powered by **Vitest**:

```bash
# Frontend User Dashboard (204 tests passing)
cd Frontend/user-dashboard && npm test

# Frontend Landing Page (124 tests passing)
cd Frontend/landing-page && npm test

# Frontend Admin Panel (tests passing)
cd Frontend/admin-panel && npm test

# Backend User Dashboard (224 tests passing)
cd Backend/user-dashboard && npm test

# Backend Landing Gateway (72 tests passing)
cd Backend/landing-page && npm test

# Backend Admin Panel (tests passing)
cd Backend/admin-panel && npm test
```

---

## 9. Security, Compliance & License

- **FINMA AMLA & SOC-2 Alignment**: Designed to comply with Swiss FINMA AMLA guidelines, corporate UBO transparency registries, and institutional KYC tier hierarchies.
- **Hardware Enclave Signatures**: Native WebAuthn/FIDO2 hardware key authentication (YubiKey 5C NFC, Apple Touch ID / Secure Enclave).
- **Proprietary**: © WavyAssets Sovereign Institutional Terminal. All rights reserved.