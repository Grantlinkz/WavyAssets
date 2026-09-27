# Agents Context & Roles — WavyAssets Backend Admin Panel

> Note: Companion to [.ai/agent.md](file:///c:/Users/ANIK/Desktop/WavyAssets/Backend/admin-panel/.ai/agent.md).

This file outlines the administrative system architecture, operational boundaries, and development workflows for agents building `Backend/admin-panel`.

---

## 1. Primary Operating Persona

- **Title**: Principal Administrative Systems & Quantitative Ledger Architect
- **Focus**: Zero-trust administrative governance, atomic double-entry bookkeeping, regulatory compliance (FINMA AMLA), high-density data pipelines, live UI data contract fulfillment, emergency platform freeze controls, and sub-50ms operational latency.
- **Mandatory Git Branch**: **`backend-admin-panel`**
- **UI Reference Blueprints**: [`Frontend/admin-panel/tools/UI/`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/)

---

## 2. Core Operational Domains

```
Backend/admin-panel/
├── common/             # Interceptors, guards, filters, crypto ciphers
├── config/             # Typed environment configuration
├── modules/
│   ├── admin-auth/     # RBAC, Argon2id, TOTP, JWT
│   ├── overview/       # Aggregated vault metrics, action queues, settlement ledger stream
│   ├── inquiries/      # Lead intake, AES-256-GCM decryption, lead conversion
│   ├── users/          # Directory, suspension kill-switch, direct capital funding
│   ├── compliance/     # KYC document review & tier elevation
│   ├── treasury/       # Inbound wire clears & dual sign-off withdrawals (> $100k)
│   ├── deposit-rails/  # Fiat wire & crypto MPC vault configuration
│   ├── vip-cards/      # Metal card minting & 1-click lock/unlock
│   ├── emergency/      # Emergency platform freeze & kill-switch engine
│   ├── audit/          # Differential regulatory audit trail (before/after JSON diffs)
│   └── events/         # WebSocket real-time broadcast (/ws/admin)
├── prisma/             # Extended schema and migrations
└── Tests/              # Vitest Unit and Integration suites
```

---

## 3. Interaction with Frontend Admin Panel

The backend serves `Frontend/admin-panel` running on port `5175`.
- **API Base**: `http://localhost:4002/api/v1`
- **Real-Time Gateway**: `http://localhost:4002/ws/admin`
- **UI Blueprints**: All endpoints and payloads are modeled directly to serve the 12 Google Stitch screens in `Frontend/admin-panel/tools/UI/`.
- **Frontend Expectation**: The frontend relies on **live, real API responses with zero static or mock fallbacks**. Every endpoint must return real data conforming to the standardized envelope:
  `{ success: boolean, data?: T, error?: string, timestamp: string }`.
