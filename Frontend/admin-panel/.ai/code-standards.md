# Code Standards & Design Tokens — WavyAssets Frontend Admin Command Deck

**Subsystem**: `Frontend/admin-panel`  
**Mandatory Git Branch**: `frontend-admin-panel`  
**Design Reference**: [`tools/UI/institutional_vault_capital/DESIGN.md`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/admin-panel/tools/UI/institutional_vault_capital/DESIGN.md)  
**Official Branding**: [`Frontend/landing-page/src/components/common/BrandLogo.tsx`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/landing-page/src/components/common/BrandLogo.tsx) & [`Frontend/landing-page/public/favicon.svg`](file:///c:/Users/ANIK/Desktop/WavyAssets/Frontend/landing-page/public/favicon.svg)  

---

## 1. Design Tokens & Visual Hierarchy

The frontend styling strictly conforms to the **Institutional Vault & Capital** design system:

### 1.1 Color Palette
- **Canvas & Surface Architecture**:
  - `bg-canvas`: `#090D14` (Deep structural dark slate)
  - `bg-panel`: `#0F141F` (Primary container & ledger base)
  - `bg-elevated`: `#141B29` (Modals, flyouts, popovers)
  - `state-hover`: `#1D2232` (High-friction hover & active states)
  - `border-subtle`: `#1E293B` (1px hairline divider)
  - `surface-container-lowest`: `#090E19`
- **Signals & Accents**:
  - `gold-accent`: `#D4AF37` (Primary execution calls, VIP badges, apex accents)
  - `status-success`: `#10B981` (Settled ledgers, verified custody, greenlit rails)
  - `status-warning`: `#F59E0B` (Dual-key authorizations, queued consensus, pending review)
  - `status-danger`: `#EF4444` (Emergency circuit breakers, AML holds, account freeze)
  - `telemetry-cyan`: `#06B6D4` (WebSocket live heartbeats, node telemetry, sync states)

### 1.2 Shapes & Micro-Chamfer Standard
- **Micro-Chamfer 4px Standard**: Buttons, input boxes, data panels, modals, dropdown menus, and notification toasts are strictly locked to an absolute `4px` corner radius (`rounded-DEFAULT` / `rounded-[4px]`).
- **Pill Radius Ban**: Consumer pill buttons, circular containers, and oversized radiuses exceeding `8px` are strictly prohibited.
- **Hairlines**: Framing dividers remain strictly `1px` solid `#1E293B`.

### 1.3 Typography Hierarchy
- **Font Family**: Inter across all UI copy, navigation levels, table headers, and functional forms. Font weights are confined to `400` (Regular), `500` (Medium), and `600` (Semi-Bold).
- **Scale**:
  - `headline-xl`: `1.75rem` / `28px`, font-weight `600`, line-height `2.25rem`, letter-spacing `-0.02em`
  - `headline-lg`: `1.375rem` / `22px`, font-weight `600`, line-height `1.75rem`, letter-spacing `-0.015em`
  - `headline-md`: `1.125rem` / `18px`, font-weight `600`, line-height `1.5rem`, letter-spacing `-0.01em`
  - `title-sm`: `0.875rem` / `14px`, font-weight `600`, line-height `1.25rem`, letter-spacing `-0.005em`
  - `body-md`: `0.875rem` / `14px`, font-weight `400`, line-height `1.25rem`, letter-spacing `0em`
  - `body-sm`: `0.75rem` / `12px`, font-weight `400`, line-height `1rem`, letter-spacing `0em`
  - `label-caps`: `0.6875rem` / `11px`, font-weight `600`, line-height `0.875rem`, letter-spacing `0.06em`, uppercase
  - `numeric-metric`: `1.5rem` / `24px`, font-weight `600`, line-height `1.75rem`, letter-spacing `-0.02em`
  - `numeric-table`: `0.8125rem` / `13px`, font-weight `500`, line-height `1.125rem`, letter-spacing `0.01em`
- **Tabular Lining Numerics**: All numeric outputs (currency values, balances, timestamps, hashes, delta metrics) must render using `font-mono tabular-nums` with OpenType flags: `font-feature-settings: 'tnum' on, 'zero' on, 'cv01' on`.

---

## 2. Component Specifications

### 2.1 Buttons
- **Primary Execution**: `#D4AF37` background, `#090D14` bold text, 4px micro-chamfer radius, 32px height (`py-1.5 px-3`), zero shadow. Hover: `#C5A028`.
- **Secondary / Action**: `#141B29` background, 1px `#1E293B` border, `#F1F5F9` text. Hover: `#1D2232`.
- **Destructive Action**: `#141B29` background, 1px `#EF4444` border, `#EF4444` text. Hover: `#EF4444` background with `#FFFFFF` text. Destructive actions strictly trigger an authorization modal requiring a written operational justification.

### 2.2 Status Chips & Badges
- Compact indicators (20px height) utilizing subtle 10% opacity fills framed with 1px matching solid hairlines:
  - *Success*: Faded emerald background, `#10B981` text, 4px radius.
  - *Pending Review*: Faded amber background, `#F59E0B` text, 4px radius.
  - *Emergency Lock / Danger*: Faded red background, `#EF4444` text, 4px radius.
  - *Live Sync / Telemetry*: Faded cyan background, `#06B6D4` text with a 6px status dot.

### 2.3 Data Tables & Ledger Grids
- **Header**: `#0F141F` background, `label-caps` typography, uppercase text in `#64748B`, bottom 1px hairline border (`#1E293B`).
- **Rows**: 36px to 40px height, alternating transparent and `#0C101A` backgrounds, hover state `#1D2232`.
- **Data Alignment**: Text aligns strictly left; currencies, balances, and counts align strictly right using tabular numerals.
- **Minimum Container Height**: Fixed minimum height of `540px` to prevent layout shifts.

### 2.4 Modals & Authorization Dialogs
- Inset structural dialogs at `#141B29`, 1px `#1E293B` perimeter border, 4px micro-chamfer radius.
- Always include an audit differential layout: clear Before / After numeric ledgers rendering in monospace font.
- Mandatory reason textarea before any balance alteration, tier change, or credential revocation can proceed.

---

## 3. Zero Cumulative Layout Shift (CLS = 0.00) & Shimmer Loaders

- Every asynchronous data table and card implements the `.wavy-skeleton` shimmer loader:
  ```css
  @keyframes skeletonShimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .wavy-skeleton {
    background: linear-gradient(90deg, #141B29 25%, #1D2232 50%, #141B29 75%);
    background-size: 200% 100%;
    animation: skeletonShimmer 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }
  ```
- Skeleton rows must precisely match the heights (`min-height: 48px` per row) and column layout of the resolved table.
- Table containers maintain rigid `min-height: 540px`.

---

## 4. Strict Live Data Rule

- Do not use mock arrays or mock objects as initial or fallback state in stores or components.
- Initial state must be empty (`[]` or `null`), with `isLoading` or `isPending` driving the skeleton view.
- Real API errors must surface semantic toast notifications or error card boundaries.

---

## 5. Testing Standards

- Unit tests in `Tests/UnitTest/` test store state transitions, permission evaluation, and Zod schemas.
- Integration tests in `Tests/IntegrationTest/` verify modal openings, form submissions, and table filtering with React Testing Library.
