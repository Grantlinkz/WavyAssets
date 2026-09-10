# Implementation Prompt: UX Enhancements, Auth Modal UX Rewrite, Research Routing, 3D About Section & Footer Cleanup

## Objective
Fulfill the user's 5 specific product enhancements across WavyAssets Institutional Terminal:
1. **View Portfolio Service Action**: Route the "VIEW PORTFOLIO SERVICE >" button in `AssetDiscoveryHub.tsx` to launch the user-friendly Sign In modal.
2. **Senior UX Writer Rewrite of Auth & Mandate Modal**:
   - Rewrite the Sign In and Request Mandate tabs with clear, modern, 8th-grade reading level plain English per Fintech UX Content Strategy.
   - Add a required **Full Name** field to the Request Mandate / Account Creation form with icon, validation, and accessible states.
   - Upgrade step 1 and step 2 labels, placeholders, titles, and success feedback to eliminate intimidating crypto/financial jargon while upholding institutional trust.
3. **Research URL Routing**:
   - Update navigation anchors and routing logic so `/research` or `/#research` routes directly to `/research#/services/vip-cards`, activating the VIP Cards asset vertical.
4. **Interactive 3D About Section**:
   - Construct a responsive, high-impact About Section (`src/components/about/AboutSection.tsx`) with anchor `id="about"`.
   - **Left Side**: Pure 3D WebGL animation (`AboutVaultCanvas3D.tsx`) featuring a kinetic sovereign multi-asset vault core with orbital rings, gold/emerald shader nodes, pointer parallax damping, tab visibility throttling, and clean Three.js memory disposal.
   - **Right Side**: Compelling, editorial UX write-up in `Noto Serif` highlighting WavyAssets' mission, 3 core institutional pillars (Multi-Asset Custody, Bank-Grade Cold Storage, Zero-Latency Global Access), regulatory credentials, and interactive CTAs.
5. **Footer APY Cleanup**:
   - Remove the `19.4% APY` badge next to "Crypto Yields & Cold Storage" in `src/components/footer/InstitutionalFooter.tsx`.
   - Update all corresponding test assertions to verify clean rendering.

---

## Detailed Technical Specifications

### 1. View Portfolio Service Action (`AssetDiscoveryHub.tsx`)
- Import `openAuthModal` from `useTerminalStore`.
- Update the action button (`View Portfolio Service`):
  - Add `data-testid="discovery-view-portfolio-service-btn"`.
  - When clicked, open the authentication modal in Sign In mode (`openAuthModal('institutional', 'login')`).

### 2. Senior UX Writer Auth Modal Overhaul (`UnifiedAuthModal.tsx` & `useTerminalStore.ts`)
- **Store Updates**:
  - Enhance `openAuthModal(initialTier?: TrustMode, initialMode?: 'login' | 'mandate')` to allow setting the initial tab directly.
  - Track `authMode: 'login' | 'mandate'` in `AuthModalState`.
- **Copy & UX Rewrite**:
  - **Badge**: `"WAVYASSETS SECURE ACCESS • BANK-GRADE ENCRYPTION"`
  - **Sign In Tab**:
    - Title: `"Sign In to Your Account"`
    - Subtitle: `"Welcome back. Access your dashboard, track live yields, and manage your portfolio."`
    - Email label: `"Email Address"`, placeholder: `"name@company.com"`
    - Password label: `"Password"`, placeholder: `"Enter your password"`
    - Primary CTA: `"Continue to Verification ->"`
  - **Request Mandate / Open Account Tab**:
    - Title: `"Create Your Account"`
    - Subtitle: `"Join individual and institutional investors managing multi-asset wealth securely."`
    - **NEW Field - Full Name**:
      - Label: `"Full Name"`
      - Input with `User` icon, `required`, `data-testid="auth-fullname-input"`, placeholder `"e.g. Eleanor Vance"`
    - Email label: `"Work or Personal Email"`, placeholder: `"name@company.com"`
    - Password label: `"Create Password"`, placeholder: `"Create a secure password (min. 6 characters)"`
    - Primary CTA: `"Submit & Continue ->"`
  - **Step 2 (Two-Factor Verification)**:
    - Title: `"Enter Verification Code"`
    - Subtitle: `"Enter the 6-digit security code sent to your registered device to verify it's you."`
    - Success title: `"Verification Successful"`
    - Success description: `"Redirecting you to your secure dashboard..."`

### 3. Research Hash & Path Routing (`GlobalHeader.tsx`, `useTerminalStore.ts`, `App.tsx`)
- In `src/components/nav/GlobalHeader.tsx`:
  - Update `navLinks`: `{ label: 'Research', href: '/research#/services/vip-cards' }`.
- In `src/store/useTerminalStore.ts`:
  - Update `parseAssetHash` and `syncFromHash` to detect if the location contains `/research` or `#/services/vip-cards` or `#research`, resolving to `'vip-cards'`.
- In `src/App.tsx`:
  - Add route listener handling `/research` and `/#research` pathnames, smoothly rewriting/deep-linking to `/research#/services/vip-cards` and setting `activeAssetId = 'vip-cards'`.

### 4. Dedicated 3D About Section (`src/components/about/AboutSection.tsx` & `AboutVaultCanvas3D.tsx`)
- **Structure**:
  - Main container `<section id="about" data-testid="about-section" className="w-full py-16 scroll-mt-20">`
  - Two-column responsive grid (`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center`):
- **Left Column (5 columns)**:
  - `<AboutVaultCanvas3D />`:
    - Decoupled Three.js WebGL canvas with `@react-three/fiber`.
    - Central multi-faceted golden vault dodecahedron with wireframe lattice and glowing emerald internal energy core.
    - Double interlocking orbital rings rotating with gentle harmonic velocities.
    - Pointer parallax with smooth lerp damping (`pointerRef`).
    - Tab-blur loop throttling (`document.hidden`) and `useReducedMotion()` compliance.
    - Strict WebGL resource cleanup on unmount.
- **Right Column (7 columns)**:
  - Header Tag: `ABOUT WAVYASSETS • INSTITUTIONAL SOVEREIGNTY`
  - Editorial H2 in `Noto Serif`: `"Built for Uncompromising Multi-Asset Freedom and Absolute Security"`
  - High-impact storytelling paragraphs explaining WavyAssets' fiduciary mission.
  - 3 Core Pillar Cards:
    1. **Unified Multi-Asset Depository**: Single-pane custody across liquid crypto, global equities, AI compute, real estate, luxury exotics, and cash.
    2. **Fiduciary Security & Cold Storage**: Multi-signature MPC access, FIPS 140-3 validation, and continuous audited proof of reserves.
    3. **Global Liquidity & Metal Settlement**: Instant credit lines against asset reserves, zero-FX markup, and worldwide card clearing.
  - Regulatory Footprint Badges: SEC Registered RIA (#801-128491), FINMA Regulated VQF, SOC-2 Type II.
  - Interactive CTAs: "Explore Services" and "Open an Account".

### 5. Remove 19.4% APY in Footer (`InstitutionalFooter.tsx`)
- Remove the `19.4% APY` badge span from line 67 in `src/components/footer/InstitutionalFooter.tsx`.
- Update test cases in `Tests/IntegrationTest/trustAndComplianceIntegration.test.tsx` and `Tests/IntegrationTest/brandAndThemeIntegration.test.tsx`.

---

## Pre-Commit Verification & Acceptance Criteria
1. `npm test`: 100% test pass rate across all unit and integration test suites.
2. `npm run lint`: Zero ESLint warnings or errors.
3. `tsc -b`: Zero TypeScript compilation errors.
4. Smooth WebGL rendering with zero CLS, sub-50ms panel swaps, and zero layout flicker.
5. All UX copy conforms strictly to Fintech Plain English guidelines (no forbidden buzzwords).
