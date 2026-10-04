# WavyAssets Frontend Terminals Architecture

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_v6-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2+-purple?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-009639?logo=nginx)](https://nginx.org/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Terminal-2496ED?logo=docker)](https://www.docker.com/)

> **Swiss Typographic Elegance, High-Performance WebGL & Hardened SPA Ergonomics**  
> Three dedicated frontend applications delivering high-conversion public showcases, sovereign multi-asset wealth management decks, and supreme administrative operations.

---

## 1. Frontend Applications & Port Topology

| Terminal | Directory | Host Port | Internal Port | Target Audience | Key Capabilities | Health Probe |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **Landing Page** | [`Frontend/landing-page/`](./landing-page/) | `:5173` | `:80` (Nginx) | Public Allocators & HNWIs | Three.js WebGL canvas, portfolio yield calculator, lead intake, OTP modal | `GET /healthz` |
| **User Dashboard** | [`Frontend/user-dashboard/`](./user-dashboard/) | `:5174` | `:80` (Nginx) | Authenticated Investors | 7 asset verticals, sub-50ms swapping, Smartsupp 24/7 concierge, time-locks | `GET /healthz` |
| **Admin Panel** | [`Frontend/admin-panel/`](./admin-panel/) | `:5175` | `:80` (Nginx) | Compliance & Treasury Staff | RBAC administration, KYC approval triage, deposit rail setup, emergency lockdown | `GET /healthz` |

---

## 2. Directory Structure

```
Frontend/
├── landing-page/                  # Sovereign Institutional Showcase (:5173)
│   ├── src/                       # Three.js WebGL canvas, Kinetic typography, simulator
│   ├── Dockerfile                 # Multi-stage Vite build + Nginx Alpine runner
│   ├── nginx.conf.template        # Nginx SPA fallback routing & reverse proxy
│   ├── docker-compose.yml         # Standalone service compose
│   ├── docker-compose.dev.yml     # Live hot-reload development compose
│   └── README.md                  # Comprehensive terminal documentation
├── user-dashboard/                # Sovereign Command Deck (:5174)
│   ├── src/                       # 7 asset module command views, Smartsupp live concierge
│   ├── Dockerfile                 # Multi-stage Vite build + Nginx Alpine runner
│   ├── nginx.conf.template        # Production reverse proxy to backend dashboard (:4000)
│   ├── docker-compose.yml         # Standalone service compose
│   ├── docker-compose.dev.yml     # Live hot-reload development compose
│   └── README.md                  # Comprehensive terminal documentation
├── admin-panel/                   # Supreme Operational Command Terminal (:5175)
│   ├── src/                       # Treasury ops, KYC approvals, emergency circuit breakers
│   ├── Dockerfile                 # Multi-stage Vite build + Nginx Alpine runner
│   ├── nginx.conf.template        # Production reverse proxy to backend admin (:4002)
│   ├── docker-compose.yml         # Standalone service compose
│   ├── docker-compose.dev.yml     # Live hot-reload development compose
│   └── README.md                  # Comprehensive terminal documentation
├── docker-compose.yml             # Unified compose for all 3 frontend terminals
└── README.md                      # This frontend architecture guide
```

---

## 3. Unified Frontend Orchestration (Docker)

To launch all three frontend terminals simultaneously:

```bash
# From workspace root or Frontend/ directory
docker compose -f Frontend/docker-compose.yml up -d --build

# Verify all containers are running and healthy
docker compose -f Frontend/docker-compose.yml ps

# Follow Nginx proxy logs across all terminals
docker compose -f Frontend/docker-compose.yml logs -f

# Shut down all frontend terminals
docker compose -f Frontend/docker-compose.yml down
```

### Standalone Sub-Terminal Docker Commands
Each frontend application can be run independently:

```bash
# Landing Page Showcase (:5173)
docker compose -f Frontend/landing-page/docker-compose.yml up -d --build

# User Dashboard Command Deck (:5174)
docker compose -f Frontend/user-dashboard/docker-compose.yml up -d --build

# Admin Panel Terminal (:5175)
docker compose -f Frontend/admin-panel/docker-compose.yml up -d --build
```

### Live Containerized Development (Hot Reload)
Each terminal supports mounting local source files for hot module replacement (HMR) inside Docker:

```bash
# Landing Frontend Dev (:5173)
docker compose -f Frontend/landing-page/docker-compose.yml -f Frontend/landing-page/docker-compose.dev.yml up --build

# User Dashboard Dev (:5174)
docker compose -f Frontend/user-dashboard/docker-compose.yml -f Frontend/user-dashboard/docker-compose.dev.yml up --build

# Admin Panel Dev (:5175)
docker compose -f Frontend/admin-panel/docker-compose.yml -f Frontend/admin-panel/docker-compose.dev.yml up --build
```

---

## 4. Local Native Development Workflow

Run each frontend in separate terminal sessions during local development without Docker:

```bash
# Terminal 1: Landing Page Terminal (:5173)
cd Frontend/landing-page
npm ci && npm run dev

# Terminal 2: User Dashboard Command Deck (:5174)
cd Frontend/user-dashboard
npm ci && npm run dev

# Terminal 3: Admin Panel Terminal (:5175)
cd Frontend/admin-panel
npm ci && npm run dev
```

---

## 5. Architectural Standards

1. **SPA Routing & Nginx Fallback**: All frontend containers serve pre-compiled Vite production bundles via Nginx Alpine with `try_files $uri $uri/ /index.html` preventing 404 errors on deep-link refreshes.
2. **Defensive Security Headers**: Nginx templates inject `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.
3. **Dynamic Reverse Proxying**: Built-in `nginx.conf.template` uses `envsubst` to dynamically proxy `/api/`, `/health`, `/ws/`, and `/socket.io/` to respective backend services using `BACKEND_HOST` and `BACKEND_PORT`.
4. **Live Concierge Desk (Smartsupp)**: The User Dashboard features seamless integration with Smartsupp (`VITE_SMARTSUPP_KEY`), synchronizing investor identity across 4 access points (floating launcher, top header, sidebar rail, and mobile drawer).
5. **Sub-50ms Reactivity**: Tab and module transitions run with zero cumulative layout shift (CLS) using pre-dimensioned structural skeletons (`min-height: 540px`).
6. **One-Click Privacy Shield**: Global UI balance masking mode instantly obscuring all portfolio valuations in public environments.
