# WavyAssets Supreme Institutional Admin Panel Backend

[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma)](https://www.prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

> **Institutional Command Deck & Operational Core**  
> High-security administrative gateway providing multi-asset management, real-time institutional telemetry, cryptographic audit ledgering, cold-storage deposit rails, and emergency circuit breakers.

---

## 1. Architecture Overview

The **Admin Panel Backend** is a dedicated NestJS 11 microservice operating on internal port `:4002` (prefix `/api/v1`). It powers the administrative operations of the WavyAssets platform, providing sovereign controls for compliance officers, treasury managers, and system administrators.

### Core Modules
- **Admin Auth & RBAC (`admin-auth`)**: Multi-factor authentication (TOTP, WebAuthn), session rotation, and granular role enforcement (`SUPER_ADMIN`, `COMPLIANCE_OFFICER`, `TREASURY_OPERATOR`, `AUDITOR`).
- **Institutional Overview (`overview`)**: Aggregated metrics across capital under custody, daily trade volume, active clients, and real-time yield distribution.
- **Client & Inquiry Management (`inquiries`, `users`)**: KYC tier verification (Tier 1-3), accredited investor documentation, and onboarding triage.
- **Treasury & Liquidity Operations (`treasury`, `deposit-rails`)**: Multi-chain institutional deposit rail configuration, cold vault sweeps, and balance reconciliation.
- **VIP Obsidian Card Vault (`vip-cards`)**: Physical metal card lifecycle management, spending limit approvals, and instant freeze overrides.
- **Emergency Lockdown System (`emergency`)**: Circuit breakers capable of pausing withdrawals, freezing DMA execution, or engaging global read-only mode during anomalies.
- **Cryptographic Audit Blotter (`audit`)**: Append-only audit records tracking every operator action with IP, timestamp, and signed payload digests.

---

## 2. Service Topology & Port Allocation

| Component | Default Port | Internal Port | Health Probe | Protocol |
| :--- | :--- | :--- | :--- | :--- |
| **Admin Backend Service** | `:4002` | `:4002` | `GET /api/v1/overview/summary` | HTTP / REST |

---

## 3. Environment Variables

Configure environment variables in `.env` based on `.env.example`:

| Variable | Description | Default / Example | Required |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment mode | `development` / `production` | Yes |
| `PORT` | Listening HTTP port | `4002` | Yes |
| `DATABASE_URL` | SQLite file path or PostgreSQL URI | `file:./dev.db` | Yes |
| `JWT_SECRET` | Primary JWT signing secret | `<cryptographic-secret>` | Yes |
| `JWT_ACCESS_SECRET` | Access token signing secret | `<cryptographic-secret>` | Yes |
| `JWT_ACCESS_EXPIRATION` | Access token lifespan | `15m` | No |
| `JWT_REFRESH_SECRET` | Secret for token refreshing | `<cryptographic-secret>` | Yes |
| `JWT_REFRESH_EXPIRATION`| Refresh token lifespan | `7d` | No |
| `FIELD_ENCRYPTION_KEY` | AES-256 key for PII / sensitive data at rest | `64-hex-chars` | Yes |
| `CIPHER_KEY_HEX` | Alternative 64-char key for symmetric encryption | `64-hex-chars` | No |
| `FRONTEND_ORIGINS` | Permitted CORS origins (comma-separated) | `http://localhost:5175,http://localhost:5174` | Yes |
| `EMAIL_PROVIDER` | Transactional alert gateway (`resend` / `console`) | `resend` | No |
| `RESEND_API_KEY` | API key for transactional emails via Resend | `re_...` | No |
| `EMAIL_FROM` | Outgoing email sender header | `WavyAssets Security <security@...>` | No |

---

## 4. Local Native Development

```bash
# 1. Install dependencies
npm ci

# 2. Synchronize Prisma database schema
npx prisma generate
npx prisma db push

# 3. Seed administrative credentials & demo data
npm run prisma:seed

# 4. Start development server with live watch mode (:4002)
npm run start:dev

# 5. Run test suites
npm run test
```

---

## 5. Docker Orchestration

### Option A: Standalone Docker Run
```bash
# Build multi-stage hardened image
docker build -t wavyassets/admin-panel-backend:1.0.0 .

# Run container with volume persistence for SQLite
docker run -d \
  --name wavyassets-backend-admin-panel \
  -p 4002:4002 \
  -v admin_backend_data:/app/prisma \
  --env-file .env \
  wavyassets/admin-panel-backend:1.0.0
```

### Option B: Standalone Docker Compose (Production Runtime)
```bash
# Launch service in background
docker compose up -d --build

# Monitor health probe and container status
docker compose ps

# Inspect live container logs
docker compose logs -f backend-admin-panel

# Stop service and preserve volumes
docker compose down
```

### Option C: Live Containerized Development (Hot Reload)
```bash
# Mounts ./src and runs NestJS watch mode inside the container
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

---

## 6. Monorepo Integration

When orchestrated from the root or Backend directory:
- **Root Compose**: `docker compose up -d` (All 6 frontends & backends on `wavyassets-network`)
- **Backend Stack Compose**: `docker compose -f Backend/docker-compose.yml up -d` (All 3 backends on `wavyassets-backend-network`)
- **Container Name**: `wavyassets-backend-admin-panel`
- **Internal Reverse Proxy Link**: Accessible to `Frontend/admin-panel` via `http://wavyassets-backend-admin-panel:4002`
