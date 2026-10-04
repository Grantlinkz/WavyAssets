# WavyAssets Backend Microservices Architecture

[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Multi--Service-2496ED?logo=docker)](https://www.docker.com/)

> **Sovereign Multi-Tier API, WebSockets & Financial Ledger Core**  
> Three dedicated NestJS 11 services providing institutional authentication, high-throughput double-entry ledgering, real-time WebSocket telemetry, and administrative treasury management.

---

## 1. Services Topology & Port Allocation

| Service | Directory | Host Port | Internal Port | Protocol | Primary Responsibilities | Health Probe Endpoint |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **Landing Page Backend** | [`Backend/landing-page/`](./landing-page/) | `:4000` | `:4000` | HTTP / WS | Lead intake, OTP authentication, investor simulator, market ticker | `GET /health/live` |
| **User Dashboard Backend** | [`Backend/user-dashboard/`](./user-dashboard/) | `:4001` | `:4000` | HTTP / WS / SSE | Double-entry ledger, 7 asset verticals, execution orders, WebAuthn | `GET /health` |
| **Admin Panel Backend** | [`Backend/admin-panel/`](./admin-panel/) | `:4002` | `:4002` | HTTP / WS | RBAC, KYC verification, cold-storage deposit rails, emergency lockdown | `GET /api/v1/overview/summary` |

---

## 2. Directory Structure

```
Backend/
├── landing-page/                  # Landing API Gateway & Showcase Telemetry (:4000)
│   ├── prisma/                    # Schema & SQLite storage for leads and simulation
│   ├── src/                       # NestJS controllers, services, guards, websockets
│   ├── Dockerfile                 # Multi-stage production container (node:22-alpine)
│   ├── docker-compose.yml         # Standalone service compose
│   ├── docker-compose.dev.yml     # Live hot-reload development compose
│   ├── docker-entrypoint.sh       # Container initialization & unprivileged execution
│   └── README.md                  # Comprehensive service documentation
├── user-dashboard/                # Transaction Core & Ledger Engine (:4001)
│   ├── prisma/                    # Schema with double-entry ledger & 7 asset models
│   ├── src/                       # 7 asset vertical modules, WebAuthn & 48h Time-Lock
│   ├── Dockerfile                 # Multi-stage production container (node:22-alpine)
│   ├── docker-compose.yml         # Standalone service compose
│   ├── docker-compose.dev.yml     # Live hot-reload development compose
│   └── README.md                  # Comprehensive service documentation
├── admin-panel/                   # Supreme Admin Panel & Treasury Operations (:4002)
│   ├── prisma/                    # Administrative schema, audit logs & RBAC
│   ├── src/                       # Compliance, inquiries, treasury & emergency breakers
│   ├── Dockerfile                 # Multi-stage production container (node:22-alpine)
│   ├── docker-compose.yml         # Standalone service compose
│   ├── docker-compose.dev.yml     # Live hot-reload development compose
│   └── README.md                  # Comprehensive service documentation
├── docker-compose.yml             # Unified compose for all 3 backend services
└── README.md                      # This backend architecture guide
```

---

## 3. Unified Backend Orchestration (Docker)

To launch all three backend microservices simultaneously on the internal `wavyassets-backend-network`:

```bash
# From workspace root or Backend/ directory
docker compose -f Backend/docker-compose.yml up -d --build

# Verify container health across all 3 services
docker compose -f Backend/docker-compose.yml ps

# Follow logs across all backend services
docker compose -f Backend/docker-compose.yml logs -f

# Gracefully shut down all backend services (preserves database volumes)
docker compose -f Backend/docker-compose.yml down
```

### Standalone Sub-Service Docker Commands
Each service can also be run in isolation:

```bash
# Landing Page Backend (:4000)
docker compose -f Backend/landing-page/docker-compose.yml up -d --build

# User Dashboard Backend (:4001)
docker compose -f Backend/user-dashboard/docker-compose.yml up -d --build

# Admin Panel Backend (:4002)
docker compose -f Backend/admin-panel/docker-compose.yml up -d --build
```

### Live Containerized Development (Hot-Reload)
Each backend supports live code mounting for active container development:

```bash
# Landing Backend Dev
docker compose -f Backend/landing-page/docker-compose.yml -f Backend/landing-page/docker-compose.dev.yml up --build

# User Dashboard Backend Dev
docker compose -f Backend/user-dashboard/docker-compose.yml -f Backend/user-dashboard/docker-compose.dev.yml up --build

# Admin Panel Backend Dev
docker compose -f Backend/admin-panel/docker-compose.yml -f Backend/admin-panel/docker-compose.dev.yml up --build
```

---

## 4. Local Native Development Workflow

Run each microservice in separate terminal sessions during local development without Docker:

```bash
# Terminal 1: Landing Page Backend (:4000)
cd Backend/landing-page
npm ci && npx prisma generate && npx prisma db push && npm run start:dev

# Terminal 2: User Dashboard Backend (:4001)
cd Backend/user-dashboard
npm ci && npx prisma generate && npx prisma db push && npm run prisma:seed && npm run start:dev

# Terminal 3: Admin Panel Backend (:4002)
cd Backend/admin-panel
npm ci && npx prisma generate && npx prisma db push && npm run prisma:seed && npm run start:dev
```

---

## 5. Security & Architectural Invariants

1. **Zero-Trust Network Segregation**: In production, backend services run inside isolated Docker networks (`wavyassets-backend-network`) accessible only through the reverse proxy Nginx containers.
2. **Double-Entry Balance Conservation**: The User Dashboard backend strictly enforces the ledger equation $\sum \text{Debits} + \sum \text{Credits} = 0$.
3. **Cryptographic Secret Isolation**: JWT access, refresh secrets, and field encryption keys are partitioned per service to eliminate blast radius across security boundaries.
4. **Append-Only Auditing**: Every administrative operation in the Admin Panel generates an immutable cryptographic audit record.
5. **48-Hour Quarantine Time-Lock**: Any newly whitelisted withdrawal address is placed under an inviolable 48-hour quarantine lock before funds can be released.
6. **Automatic Schema Migration**: All backend Docker containers run `npx prisma db push --skip-generate` automatically on startup to ensure relational schemas are synchronized before HTTP listeners initialize.
