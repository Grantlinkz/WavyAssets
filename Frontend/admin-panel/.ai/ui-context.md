# UI Context & Live Data Interoperability — WavyAssets Frontend Admin Command Deck

**Subsystem**: `Frontend/admin-panel`  
**Backend Peer**: `Backend/admin-panel` (Port `4002`)  
**Client Dashboard Peer**: `Frontend/user-dashboard` (Port `5174`)  
**Landing Page Peer**: `Frontend/landing-page` (Port `5173`)  
**Mandatory Git Branch**: `frontend-admin-panel`  

---

## 1. Zero Static / Mock Data Directive

> [!CRITICAL]
> **Strict Invariant**:
> Both `Frontend/admin-panel` and `Backend/admin-panel` are implemented simultaneously using Antigravity IDE Duplicate Workspaces.
> 
> **Do not write mock data, static arrays, or fake fallback responses into components or stores.**
> 
> - Every table connects to `http://localhost:4002/api/v1` via TanStack Query hooks.
> - While data is loading, render the rigidly dimensioned `SkeletonTable` (`min-height: 540px`).
> - If the backend endpoint returns an error, display the error in an error banner or toast.

---

## 2. Official Institutional Brand Identity

The admin console UI strictly integrates the official WavyAssets brand assets sourced from `Frontend/landing-page`:

- **Official Brand Logo Component**:
  - Source: [`Frontend/landing-page/src/components/common/BrandLogo.tsx`](../../landing-page/src/components/common/BrandLogo.tsx)
  - Visual Elements:
    - Vault Squircle Frame (`rx="6"`, `stroke-primary/80`)
    - Ambient Radial Glow (`#D4AF37`, 12% opacity)
    - Primary Sinusoidal Wave in Global Gold (`#D4AF37`, `strokeWidth="2.2"`)
    - Secondary Harmonic Wave in Emerald Accent (`#00C288`, `strokeWidth="1.6"`)
    - Apex Vault Spark (`#D4AF37`, radius `1.6`)
    - Typography: `WAVY` (font-sans font-bold tracking-[0.12em] fill-on-surface), `ASSETS` (fill="#D4AF37" font-sans font-medium tracking-[0.12em])
    - Institutional Proof Indicator: `SECURED` badge in `#00C288` font-mono font-semibold tracking-wider with animated pulsing green dot (`<circle r="1.5" fill="#00C288" className="animate-pulse" />`).
- **Official Favicon**:
  - Source: [`Frontend/landing-page/public/favicon.svg`](../../landing-page/public/favicon.svg)
  - Obsidian Vault Squircle (`#08090B`, rx=14, stroke `#D4AF37`), dual wave in Global Gold (`#D4AF37`) and Emerald Accent (`#00C288`), and apex spark at (32, 17).

---

## 3. Stitch UI Blueprints & Screen Specifications

All viewports, modals, and table components must strictly reproduce the layouts and styling defined in `tools/UI/`:

| Module / Viewport | Blueprint Directory | Key UI Elements & Layout Requirements |
| :--- | :--- | :--- |
| **Design System Tokens** | `tools/UI/institutional_vault_capital/DESIGN.md` | Master design system: color palette, typography scales, elevation tiers, 4px micro-chamfer radius, compact buttons, and table styling. |
| **Executive Overview** | `tools/UI/wavyassets_admin_panel_overview/` | Top Bar with `BrandLogo`, search (`[Cmd + K]`), `Live Sync: 18ms` badge (`#06B6D4`), Emergency Stop button (`#EF4444`), operator badge; urgent ticker banner; 4-metric grid; real-time settlement ledger table. |
| **Institutional Telemetry** | `tools/UI/wavyassets_admin_panel_institutional_overview/` | Multi-asset allocation breakdown across all 7 asset classes, node telemetry, cold store vs hot liquidity status, shard health indicators. |
| **Mandate Inquiries** | `tools/UI/wavyassets_admin_panel_investor_inquiries/` | Chronological `LeadInquiry` table, corporate domain trust scores, AES-256-GCM decrypted work emails/telegrams, workflow status badges, and slide-over `LeadDetailDrawer` with 1-click client conversion. |
| **User & Ledger Directory** | `tools/UI/wavyassets_admin_panel_user_directory_governance/` | Segregated balances (`AVAILABLE_CASH` vs `INVESTED_CAPITAL`), tier badges, `CreateUserModal`, `SuspendUserModal` (kill-switch), and `DirectFundingModal` with mandatory audit justifications. |
| **KYC & AML Review** | `tools/UI/wavyassets_admin_panel_compliance_aml_review/` | Verification queue, split-screen document viewer (passports, corporate registry), FINMA AML checklist, and 1-click tier elevation engine (`TIER_1` to `INSTITUTIONAL`). |
| **Treasury Settlements** | `tools/UI/wavyassets_admin_panel_treasury_settlements/` | Inbound deposit matching with wire receipts and 1-click balance credit; outbound withdrawals with FINMA AMLA Article 14 dual-sign-off card (First Officer approval + Second Officer sign-off for $> \$100\text{k}$). |
| **Deposit Rails Command** | `tools/UI/wavyassets_admin_panel_global_deposit_coordinates/` | Dynamic form for Swiss IBAN, BIC/SWIFT, Clearing rail, Bank Name/Address, Memo format; crypto MPC vault matrix with QR codes; real-time sync with client `DepositModal.tsx`. |
| **VIP Obsidian Cards** | `tools/UI/wavyassets_admin_panel_vip_obsidian_metal_cards/` | Issued cards catalog, 3D card minting modal with real-time interactive preview, spend limit slider ($10k - $500k), and instant 1-click lock/unlock toggle syncing in $<50$ms. |
| **Immutable Audit Trail** | `tools/UI/wavyassets_admin_panel_audit_log_activity_history/` | Filterable event log with operator ID, action type, target entity, timestamp, and side-by-side JSON before/after state diff inspector (`DiffModal`). |
| **Emergency Platform Freeze**| `tools/UI/wavyassets_admin_panel_emergency_platform_freeze/` | System-wide kill-switch modal halting all deposits, withdrawals, trading, and VIP cards; dual-key confirmation and mandatory operational justification. |
| **Table Skeleton Loaders** | `tools/UI/wavyassets_admin_panel_table_skeleton_loaders/` | `.wavy-skeleton` shimmer animation (`linear-gradient(90deg, #141B29 25%, #1D2232 50%, #141B29 75%)`), 540px min-height container, zero CLS (CLS = 0.00). |

---

## 4. Real-Time Synchronization with Client Views

- **Deposit Rails Live Sync**:
  When an admin saves changes in `/deposit-rails`, the backend emits a WebSocket event. The client `DepositModal.tsx` in `user-dashboard` listens to this event and updates its active bank wire IBAN and crypto vault addresses live.
- **Obsidian VIP Card Freeze Live Sync**:
  When an admin clicks the 1-click lock/unlock toggle in `/vip-cards`, the backend broadcasts `vip_card:frozen_state_changed`. The client `ObsidianMetalCard.tsx` immediately reflects the frozen state in $<50$ms.
- **Emergency Platform Freeze Live Sync**:
  When an admin activates the emergency kill-switch, the backend broadcasts `platform:emergency_freeze`. All client viewports immediately display the sovereign lockdown banner and disable transaction forms.

---

## 5. Standard Response Envelope Unwrapping

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: string;
}
```
The central API client (`src/api/client.ts`) unwraps `response.data.data` so components and hooks directly receive typed payloads.
