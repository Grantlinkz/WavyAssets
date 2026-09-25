# WavyAssets Sovereign Institutional Admin Panel — Product Requirements & Architecture Document

**Author**: Principal Systems Architect  
**Platform**: WavyAssets Sovereign Wealth & Institutional Operating System  
**Version**: 1.0.0-PROD  
**Target Milestone**: Q3 2026 Sovereign Operations Core  

---

## 1. Executive Summary & Product Framing

WavyAssets is an institutional-grade multi-asset sovereign wealth platform operating across 7 asset verticals (Crypto, Equities, AI Funds, Real Estate, VIP Cards, Exotic Cars, Custodial Wallet). To support high-value family offices and sovereign clients ($50k–$50M+ capital), administrative operators (Compliance Officers, Treasury Managers, Desk Operators) require an air-gapped, high-fidelity **Admin Command Deck**.

This document outlines the product requirements, engineering architecture, security invariants, and intentional trade-offs for the **WavyAssets Admin Panel** (`Frontend/admin-panel` and `Backend/admin-panel`).

---

## 2. User Personas & Problem Statement

| Persona | Primary Responsibilities | Core Pain Points |
| :--- | :--- | :--- |
| **Treasury Officer** | Manages inbound/outbound liquidity, wire clears, and crypto sweeps. | Manual wire matching without memo validation; risk of misallocated funds or unapproved withdrawals. |
| **Compliance Officer** | Oversees FINMA AMLA tier limits, verifies identity documents, approves KYC upgrades. | Decentralized document review; lack of one-click audit trails and automated tier synchronization. |
| **Executive Concierge** | Manages VIP Obsidian metal card issuance, spending parameters, and freeze protocols. | Disconnected card governance; lack of real-time card minting and lock/unlock synchronization to client command decks. |
| **Client Desk Lead** | Onboards institutional mandates, reviews landing page contact submissions, manages account lifecycles. | Fragmented lead intake; inability to fund client balances directly or suspend anomalous accounts. |

---

## 3. Product Scope & Functional Requirements

### 3.1 Contact Inquiries & Mandate Intake
- **Unified Inquiries Feed**: Live chronological inbox mirroring all landing page contact submissions (`LeadInquiry`).
- **Decrypted Lead Telemetry**: Displays corporate domain trust scores, work email, full name, company name, telegram handle, asset vertical interest, and target allocation brackets.
- **Workflow State Management**: Status updates (`NEW`, `IN_REVIEW`, `MANDATE_ISSUED`, `ARCHIVED`), internal operator notes, and filtering.

### 3.2 User Management & Ledger Governance
- **Directory**: Comprehensive table of registered sovereign and corporate users with real-time status (`ACTIVE`, `SUSPENDED`), KYC tier (`TIER_1` to `INSTITUTIONAL`), and segregated balances (`AVAILABLE_CASH`, `INVESTED_CAPITAL`).
- **User Lifecycle Controls**:
  - **Create User**: Instant onboarding modal with email, full name, tier, and starting ledger balance.
  - **Suspend / Unsuspend**: Immediate kill-switch preventing compromised or flagged accounts from accessing dashboard endpoints.
  - **Delete User**: Cascading deletion with confirmation guardrails.
  - **Direct Capital Funding**: Instant adjustment of available or invested ledger balances with mandatory audit reference reasons.

### 3.3 KYC Verification & Tier Upgrades
- **KYC Queue**: Dedicated table of accounts requesting upgrade from `TIER_1` ($25k daily cap) through `TIER_3` / `INSTITUTIONAL` (unlimited).
- **Document Inspection**: Preview submitted credentials (passports, corporate registry documents, utility affidavits).
- **Approval Engine**: One-click approval immediately lifting client withdrawal thresholds across the platform.

### 3.4 Treasury Operations (Deposits & Withdrawals)
- **Pending Withdrawals**: List of all client withdrawal requests awaiting settlement. Operators can inspect destination rail (ETH, BTC, Swiss SIC, Fedwire), beneficiary name, and trigger **Approve & Settle** or **Reject & Refund**.
- **Pending Deposits**: Verification queue for incoming wires and Web3 receipts (including "Bank Wire (SIC / Fedwire)" and crypto manual transfers) with one-click **Approve & Credit Balance**.

### 3.5 Global Deposit Rail Configuration
- **Fiat Wire Rail Settings**: Editable global parameters for incoming bank wires:
  - Beneficiary Name
  - Swiss IBAN (e.g. `CH93 0023 8812 4019 8821 0`)
  - BIC / SWIFT code (e.g. `UBSWCHZH80A`)
  - Clearing Rail (e.g. `Swiss SIC RTGS / Fedwire DvP`)
  - Mandatory Memo / Reference Format (e.g. `WY-9942-TREASURY-03`)
- **Crypto MPC Cold Storage Settings**: Editable global vault deposit addresses mapped across all 4 supported assets (`USDC`, `USDT`, `BTC`, `ETH`) and their corresponding networks (`ERC-20`, `BEP-20`, `Polygon`, `TRC-20`, `Bitcoin Native`, `Arbitrum`, `Optimism`).
- **Live Sync**: Changes saved in admin panel immediately reflect in the client-facing deposit modal (`DepositModal.tsx`).

### 3.6 Obsidian VIP Card Minting & Lifecycle
- **Cardholder Registry**: Catalog of all issued sovereign metal and virtual cards.
- **Card Minting Engine**: Administrator capability to create/mint an Obsidian VIP card for any registered user, defining:
  - Cardholder Name
  - Card Tier (`OBSIDIAN 42g TUNGSTEN`, `BLACK SOVEREIGN`, `SILVER ELITE`)
  - Daily Spending Limit ($50,000 to $500,000+)
  - Card Number Last 4 digits
  - Mode (`PHYSICAL` or `VIRTUAL NFC`)
  - Shipping & Custody Status (`DELIVERED`, `IN_TRANSIT`, `VAULT_VAULTED`)
- **Instant Lock & Unlock**: 1-click toggle to freeze or unfreeze any VIP card, synchronizing in real time with the client's `ObsidianMetalCard` viewport.

---

## 4. What is Deliberately Left Out & Architectural Trade-offs

1. **Fully Automated Straight-Through Processing (STP) for Withdrawals >$100k**:
   - *Rationale*: Regulatory mandates (FINMA AMLA Article 14) and institutional risk models require dual human sign-off for large capital movements. Fully automated execution creates catastrophe risk during private key compromise.
2. **Plaintext Storage of PINs and CVV Codes**:
   - *Rationale*: Compliance with PCI-DSS Level 1. CVVs are ephemeral and never persisted; PINs are encrypted via AES-256-GCM.
3. **Complex Third-Party Redux / GraphQL Layers**:
   - *Rationale*: Lightweight Zustand 5 stores and direct RESTful endpoints provide sub-50ms render latency with zero bundle bloat.

---

## 5. System Architecture & Component Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WavyAssets Monorepo                             │
├────────────────────────────┬────────────────────────────┬──────────────┤
│ Landing Page (:5173/:4000) │ Dashboard Deck (:5174/:4001)│ Admin Panel  │
├────────────────────────────┼────────────────────────────┼──────────────┤
│ • Public Terminal          │ • Sovereign Client Deck    │ • Frontend   │
│ • Contact Lead Intake      │ • Deposit / Withdraw Modal │   (:5175)    │
│ • Auth Gateway             │ • Obsidian VIP Card View   │ • Backend    │
│                            │ • Double-Entry Ledger      │   (:4002)    │
└────────────────────────────┴────────────────────────────┴──────────────┘
                                      │
                                      ▼
                        Shared Relational Persistence
                         (Prisma 6 SQLite / Postgres)
```

---

## 6. Performance Benchmarks & Quality Standards

- **Sub-50ms Interaction SLA**: Table filtering, tab switching, and state toggles execute in $<50$ms.
- **Zero Cumulative Layout Shift**: Rigid skeleton layouts preventing layout jumps during async data hydration.
- **Deterministic Testing**: Vitest test suites covering user lifecycle, deposit rails, card state, and treasury approvals.
