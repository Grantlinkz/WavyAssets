# WavyAssets — Sovereign Multi-Asset Institutional Platform

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-0.185-black?logo=three.js)](https://threejs.org/)
[![Vitest](https://img.shields.io/badge/Tests-113%20Passing-brightgreen?logo=vitest)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel_Ready-black?logo=vercel)](https://vercel.com)

> **WavyAssets Institutional Terminal**  
> High-discretion sovereign digital wealth management, institutional custody, and multi-asset orchestration across 7 asset verticals.

---

## 1. Platform Overview

**WavyAssets** is an institutional-grade financial operating environment engineered for sovereign individuals, family offices, and high-net-worth institutional allocators. The platform unites Swiss typographic discipline, physical vault security paradigms, and low-latency financial terminal ergonomics to orchestrate capital across physical, digital, and systematic asset classes.

### The 7 Core Asset Verticals
1. **Crypto Investment & Yield Aggregation** (`crypto`): Institutional Bitcoin and Ethereum staking strategies with automated downside protection and multi-signature offline cold storage.
2. **Global Stocks & Pre-IPO Allocations** (`stocks`): Secondary private equity opportunities (SpaceX, Stripe, OpenAI) and direct market equity trading across 42 global exchanges.
3. **AI Systematic & Quantitative Funds** (`ai-funds`): Autonomous algorithmic trading and yield harvesting powered by dedicated GPU compute clusters with 100% automated execution.
4. **Tokenized Prime Real Estate** (`real-estate`): Direct fractional access to prime commercial office towers, industrial logistics centers, and multi-family residential holdings.
5. **VIP Concierge & Collateral Metal Cards** (`vip-cards`): Custom-minted obsidian metal charge cards backed by sovereign multi-currency digital balances with 0% foreign transaction fees.
6. **Exotic Vehicles & Horology Vault** (`cars`): Physical vault custody and fractional investment in provenance-verified rare supercars, classic automobiles, and horology pieces.
7. **Digital Custody & Multi-Sig MPC Wallet** (`wallet`): Institutional multi-party computation (MPC) cold storage with Merkle-tree cryptographic proof of reserves.

---

## 2. Repository Structure

```
WavyAssets/ (Git Root)
├── Backend/
│   ├── landing-page/                 # High-availability NestJS API Gateway & WebSocket Broadcaster
│   │   ├── prisma/                   # SQLite schema definitions & local persistent storage
│   │   ├── src/
│   │   │   ├── modules/              # Auth (OTP/JWT), Leads, Simulation, Telemetry, Health
│   │   │   ├── common/               # Filters, interceptors (PII redaction), security guards
│   │   │   └── config/               # Environment validation & configuration loader
│   │   ├── Tests/                    # 72 automated Vitest unit & integration tests
│   │   ├── Dockerfile                # Hardened multi-stage unprivileged Alpine production container
│   │   ├── docker-compose.yml        # Production Docker Compose orchestration with volume persistence
│   │   ├── docker-compose.dev.yml    # Development Docker Compose override for live hot-reloading
│   │   └── docker-entrypoint.sh      # Container entrypoint with SQLite schema auto-initialization
│   └── user-dashboard/               # Institutional User Dashboard backend service (WIP)
├── Frontend/
│   ├── landing-page/                 # Sovereign Institutional Terminal Frontend
│   │   ├── public/                   # Static assets, robots.txt, sitemap.xml, favicon
│   │   ├── src/
│   │   │   ├── assets/               # Videos, testimonial portraits, media
│   │   │   ├── components/           # UI, 3D canvases, navigation, simulator, modals
│   │   │   ├── lib/                  # Formatters, mathematical calculator, API gateway client
│   │   │   ├── store/                # Zustand global terminal state store
│   │   │   ├── App.tsx               # Root command deck & view orchestration
│   │   │   └── index.css             # Tailwind v4 custom properties & theme engine
│   │   ├── Tests/                    # 113 automated unit & integration tests
│   │   ├── Dockerfile                # Multi-stage Vite build + Nginx Alpine static web server
│   │   ├── nginx.conf.template       # Nginx SPA fallback routing, reverse proxy & security headers
│   │   ├── docker-compose.yml        # Production Docker Compose orchestration
│   │   ├── docker-compose.dev.yml    # Development Docker Compose override for live hot-reloading
│   │   ├── vercel.json               # Vercel deployment & defensive security headers
│   │   └── vite.config.ts            # Vite 8 config with vendor chunk splitting & /api proxy
│   └── user-dashboard/               # Sovereign client dashboard & portfolio management (WIP)
├── docker-compose.yml                # Unified monorepo orchestration (Frontend :5173 + Backend :4000)
└── README.md                         # Monorepo architecture & platform orchestration guide
```

---

## 3. Technology Stack

### Frontend Terminal (`Frontend/landing-page`)
- **Framework & Runtime**: React 19 + Vite 8 + TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`) + `tw-animate-css`
- **Design Tokens**: Obsidian Dark (`#08090B`) & Luxury Light (`#F9F9FF`), 4px micro-chamfers (0 pills >8px)
- **Component Primitives**: shadcn/ui on top of Radix UI (`dialog`, `slider`, `navigation-menu`, `skeleton`, `input-otp`, `button`)
- **3D & WebGL**: Three.js (`0.185`) + React Three Fiber (`9.7`) + Drei (`10.7`)
- **Physics & Motion**: Framer Motion (`13.2`) with `useReducedMotion()` fallbacks
- **State Management**: Zustand (`5.0`) with localStorage sync and hash routing engine
- **Typography**: `Noto Serif` (editorial headers & UX narrative), `Inter` & `JetBrains Mono` with `tabular-nums`
- **Testing Engine**: Vitest 5.0 + React Testing Library + jsdom (113 passing tests across 20 suites)

### Institutional Backend Gateway (`Backend/landing-page`)
- **Framework & Runtime**: NestJS 11 + Express + TypeScript 5.7 (SWC compilation) on Node.js 22 LTS
- **Database & ORM**: SQLite Relational Engine + Prisma ORM 6.4
- **Security & Shielding**: Helmet defensive headers, Argon2id hashing, AES-256-GCM field encryption, HMAC-SHA256 blind indexing
- **Traffic Control**: Dual-tier `@nestjs/throttler` (120 req/min general, 5 req/min auth & leads)
- **Real-Time Streaming**: WebSockets (`@nestjs/websockets` + Socket.IO) on `/ws/ticker`
- **Documentation**: Interactive OpenAPI 3 / Swagger at `/api/docs`
- **Containerization**: Multi-stage hardened Alpine Docker image with non-root `node` user and Docker Compose orchestration

---

## 4. Engineering Invariants & Quality Standards

1. **Sub-50ms View Swaps**: Dynamic asset sub-views switch in under 50ms via client-side hash routing (`#/services/:assetId`).
2. **Zero Cumulative Layout Shift (CLS)**: Pre-dimensioned skeleton loaders (`min-height: 540px`) eliminate layout shifts during asset transitions.
3. **Deterministic WebGL Lifecycle**: Explicit GPU resource deallocation (`geometry.dispose()`, `material.dispose()`) and render-loop throttling on `document.hidden` and off-screen viewport culling.
4. **Information Density without Sensory Fatigue**: Strict 4px/8px micro-chamfer boundaries; no generic consumer pill shapes.
5. **Security & Redacted Logging**: Zero PII, credential, or token leakage in logs; client error boundaries prevent stack exposure.
6. **Strict Content Security Policy**: Prohibits `unsafe-eval` and unauthorized script injection.
7. **Production Sandbox Guard**: Dev static OTPs and console email dispatch are strictly blocked when `NODE_ENV=production` (`HTTP 403`).

---

## 5. Development & Full-Stack Workflow

### Option A: Unified Monorepo Docker Compose (One-Command Full-Stack)

Launch both the **Backend Gateway** (:4000) and **Frontend Terminal** (:5173) simultaneously on a shared Docker bridge network with healthcheck gating:

```bash
# From repository root
docker compose up -d --build

# Verify container health across both services
docker compose ps

# Access applications:
# - Frontend Terminal:    http://localhost:5173
# - Backend API Gateway:  http://localhost:4000
# - Swagger API Docs:     http://localhost:4000/api/docs
# - Backend Liveness:     http://localhost:4000/health/live
# - Frontend Liveness:    http://localhost:5173/healthz

# Tail unified logs
docker compose logs -f

# Graceful shutdown
docker compose down
```

### Option B: Paired Local Run (Vite Dev Server + Containerized Backend)

```bash
# 1. Launch Backend API Gateway with persistent SQLite storage
cd Backend/landing-page
docker compose up -d --build

# 2. In another terminal, launch Frontend Terminal (proxies /api and /ws to :4000)
cd Frontend/landing-page
npm install
npm run dev
```

### Option C: Local Native Node Development

```bash
# Backend Landing Page
cd Backend/landing-page
npm install
npx prisma generate
npx prisma db push
npm run start:dev

# Frontend Landing Page
cd Frontend/landing-page
npm install
npm run dev
```

### Running Automated Test Suites (185 Total Tests)

```bash
# Run Frontend tests (113 passing tests)
cd Frontend/landing-page
npm test

# Run Backend tests (72 passing tests)
cd Backend/landing-page
npm test
```

---

## 6. Production Deployment

### Frontend (`Frontend/landing-page`)
* **Option 1: Docker / Self-Hosted Nginx**:
  ```bash
  cd Frontend/landing-page
  docker compose up -d --build
  ```
* **Option 2: Vercel Zero-Config Deployment**:
  The frontend includes complete production automation in [`Frontend/landing-page/vercel.json`](Frontend/landing-page/vercel.json):
  1. Import repository in [vercel.com](https://vercel.com).
  2. Set **Root Directory** to `Frontend/landing-page`.
  3. Framework Preset: `Vite`.
  4. Deploy with automatic SPA rewrites, strict CSP headers, and 1-year immutable CDN caching.

### Backend (`Backend/landing-page`) -> Docker / Cloud Container Runtime
The backend runs as a multi-stage, hardened Docker container with persistent SQLite storage:
```bash
cd Backend/landing-page
docker compose up -d --build
docker compose ps
curl -f http://localhost:4000/health/ready
```

---

## 7. Security, Compliance & License

- **Security Audits**: Architecture aligns with SOC-2 Type II controls and MPC zero-knowledge proof of reserves.
- **Strict Data Sanitization**: All institutional mandating and auth OTP interactions execute within isolated memory boundaries.
- **Proprietary**: © WavyAssets Sovereign Institutional Terminal. All rights reserved.