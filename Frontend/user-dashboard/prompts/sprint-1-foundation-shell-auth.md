# Implementation Plan: Sprint 1 — Foundation, Shell & Auth Handoff

**Sprint:** Sprint 1  
**Epic:** Foundation, Dashboard Navigation Shell & Authentication Handoff Protocol  
**Target Platform:** WavyAssets Sovereign Institutional User Dashboard (`Frontend/user-dashboard`)  
**Reference Files:**
- `tools/IMPLEMENTATION_STRATEGY.md` (Sections 2, 3, 7, 8)
- `tools/GOOGLE_STITCH_UI_UX_PROMPT_STRATEGY.md` (Module 00: Global Master Command Shell)
- `tools/UI/# sovereign_asset_terminal/DESIGN.md` (Color tokens, micro-chamfer 4px geometry, typography)
- `tools/UI/#1 wavyassets_sovereign_terminal_executive_overview/code.html`
- `Frontend/landing-page/public/favicon.svg` (Official sovereign favicon)
- `Frontend/landing-page/src/components/common/BrandLogo.tsx` (Official brand logo component)

---

## 1. Objectives

1. **Scaffold Runtime & Tooling**:
   - Initialize Vite 8 + React 19 + TypeScript (strict) configuration.
   - Configure Tailwind CSS v4 with design tokens mapped from `tools/UI/# sovereign_asset_terminal/DESIGN.md`.
   - Setup Vitest 5 with `@testing-library/react` and `jsdom`.
2. **Official Branding Integration**:
   - Copy official favicon to `public/favicon.svg` and link in `index.html`.
   - Implement `BrandLogo.tsx` adapting the official sinusoidal wave squircle and serif typography from `Frontend/landing-page`.
3. **Session Lifecycle & Auth Handoff Protocol**:
   - Implement `/auth/callback?ticket=<handoffTicket>` listener.
   - Exchange ticket via `POST /api/v1/auth/exchange-ticket` with JWT session initialization and graceful mock fallback for dev/testing.
   - Setup `useAuthStore` with user entity (`tier: 'RETAIL' | 'PRIVATE_WEALTH' | 'INSTITUTIONAL'`).
4. **Responsive Dashboard Navigation Shell**:
   - `SidebarRail`: Collapsible desktop rail (64px collapsed icon view / 220px expanded) with active 2px Sovereign Gold indicators and 7 vertical tabs + Compliance & Security.
   - `TopHeader`: Wordmark, Enclave indicator ("Geneva Alpha"), search trigger (`⌘K`), Theme switch, user tier badge.
   - `MobileHeader`: Compact header with responsive drawer navigation.
5. **Theme Engine & CSS Tokens**:
   - Obsidian Dark (`#101319` / `#08090B`) as default, with Luxury Light (`#F9F9FF`) toggle.
   - Micro-chamfer geometry (`0.25rem` / `4px`) and tabular figures (`font-mono` / `tabular-nums`).
6. **Automated Verification**:
   - Deliver >= 15 passing Vitest tests across unit and integration suites in `Tests/UnitTest/` and `Tests/IntegrationTest/`.

---

## 2. Component & Architecture Layout

```
Frontend/user-dashboard/
├── public/
│   └── favicon.svg                    # Official WavyAssets favicon
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthCallback.tsx       # Single-use HMAC handoff ticket exchange handler
│   │   ├── common/
│   │   │   └── BrandLogo.tsx          # Official BrandLogo with squircle wave emblem
│   │   ├── nav/
│   │   │   ├── SidebarRail.tsx        # 64px / 220px collapsible navigation rail
│   │   │   ├── TopHeader.tsx          # Top bar with enclave, search, theme toggle, tier badge
│   │   │   └── MobileHeader.tsx       # Responsive mobile navigation bar & drawer
│   │   └── ui/
│   │       ├── button.tsx             # 4px micro-chamfer institutional button
│   │       └── skeleton.tsx           # Pre-dimensioned skeleton container
│   ├── lib/
│   │   ├── api.ts                     # API client with ticket exchange & session storage
│   │   ├── formatters.ts              # Tabular currency and percentage formatters
│   │   └── utils.ts                   # clsx + twMerge utility
│   ├── store/
│   │   ├── useAuthStore.ts            # User identity, tier, tokens, handoff status
│   │   └── useDashboardStore.ts       # Active vertical, sidebar collapse, theme, privacy
│   ├── App.tsx                        # Root dashboard shell and route switch
│   ├── main.tsx                       # React 19 root mount
│   └── index.css                      # Tailwind v4 theme tokens & micro-chamfer styles
├── Tests/
│   ├── UnitTest/
│   │   ├── authStore.test.ts          # Auth state machine & ticket exchange unit tests
│   │   ├── dashboardStore.test.ts     # Dashboard store & theme switching unit tests
│   │   └── formatters.test.ts         # Financial numbers & tabular figure unit tests
│   └── IntegrationTest/
│       ├── shellNavigation.test.tsx   # Sidebar collapse, navigation switching & mobile header
│       └── authHandoff.test.tsx       # Ticket exchange workflow & session establishment
```

---

## 3. Acceptance Criteria & SLAs

- [x] Sub-50ms tab transition between verticals without hard reload.
- [x] Minimum 15 passing automated tests across unit and integration suites.
- [x] Strict TypeScript (`tsc -b`) passing with 0 errors.
- [x] Clean, responsive UI in both Obsidian Dark and Luxury Light modes.
- [x] Exact brand parity with landing page favicon and logo.
