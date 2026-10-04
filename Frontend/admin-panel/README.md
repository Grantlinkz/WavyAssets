# WavyAssets Supreme Institutional Admin Panel Frontend

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0_Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.2-purple?logo=vite)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

> **Institutional Operational Command Terminal**  
> High-density administrative workspace built with Swiss typographic precision, obsidian luxury dark aesthetics, low-latency state caching, and hardened Nginx reverse proxying.

---

## 1. Interface & Feature Modules

- **Command Center & KPI Blotter**: High-level platform telemetry, dynamic capital allocation matrices, daily inflow/outflow charts, and system operational statuses.
- **Client & Onboarding Triage**: Tier 1 to 3 KYC verification review, corporate dossier inspection, and accredited investor approval workflows.
- **Deposit Rails & Cold Custody**: Multi-network address registry (Bitcoin, Ethereum, Solana, Arbitrum), automated sweep threshold configurations, and multi-sig destination validation.
- **VIP Obsidian Card Desk**: Metal card issuance pipeline, manual spending limit overrides, and immediate freeze/unfreeze actions.
- **Emergency Circuit Breaker Deck**: Platform-wide security switches to disable trading DMA, freeze withdrawal rails, or engage emergency read-only maintenance mode.
- **Cryptographic Audit Blotter**: Live immutable timeline of all administrative sessions, API calls, and privilege escalation events.

---

## 2. Service Topology & Port Allocation

| Component | Default Port | Internal Port | Health Probe | Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Frontend Terminal** | `:5175` | `:80` (Nginx) | `GET /healthz` | HTTP / SPA |

---

## 3. Environment Variables

Create `.env` based on `.env.example`:

```env
# API Gateway Endpoint
VITE_API_BASE_URL=http://localhost:4002/api/v1
VITE_BACKEND_ORIGIN=http://localhost:4002

# Sibling Terminal Endpoints
VITE_DASHBOARD_URL=http://localhost:5174
VITE_LANDING_URL=http://localhost:5173
```

---

## 4. Local Native Development

```bash
# 1. Install dependencies
npm ci

# 2. Start Vite development server on port 5175
npm run dev

# 3. Execute Vitest test suite
npm run test

# 4. Compile production build
npm run build
```

---

## 5. Docker Orchestration

### Option A: Standalone Docker Run
```bash
# Build multi-stage production container
docker build -t wavyassets/admin-panel-frontend:1.0.0 .

# Run container via Nginx on port 5175 pointing to backend
docker run -d \
  --name wavyassets-admin-frontend \
  -p 5175:80 \
  -e BACKEND_HOST=host.docker.internal \
  -e BACKEND_PORT=4002 \
  wavyassets/admin-panel-frontend:1.0.0
```

### Option B: Standalone Docker Compose (Production Runtime)
```bash
# Launch administrative frontend
docker compose up -d --build

# Verify container status and liveness probe
docker compose ps

# Check Nginx access and proxy logs
docker compose logs -f admin-panel

# Stop frontend service
docker compose down
```

### Option C: Live Containerized Development (Hot Reload)
```bash
# Mounts ./src and Vite dev server inside container on port 5175
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

---

## 6. Monorepo Integration

When orchestrated from the root or Frontend directory:
- **Root Compose**: `docker compose up -d` (All 6 frontends & backends on `wavyassets-network`)
- **Frontend Stack Compose**: `docker compose -f Frontend/docker-compose.yml up -d` (All 3 frontends on `wavyassets-frontend-network`)
- **Container Name**: `wavyassets-admin-frontend`
- **Dynamic Proxy**: Nginx automatically routes `/api/` requests to `BACKEND_HOST:BACKEND_PORT` (default: `wavyassets-backend-admin-panel:4002`).
