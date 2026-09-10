# Implementation Prompt: Institutional /contact Experience Inspired by Reference Screenshot & Sign-In System

## Objective
Design and implement the dedicated `/contact` experience for WavyAssets, directly inspired by the user-provided screenshot and the platform's institutional `UnifiedAuthModal` design system:
1. **Two-Column Layout**:
   - **Left Column**: High-impact institutional B2B contact form with condensed bold headline `"FILL OUT FORM AND WE CONTACT YOU"`, an angled `[B2B ONLY]` accent badge, and sleek Obsidian inputs with 4px micro-chamfers.
   - **Right Column**: Atmospheric dark textured sentinel mascot with glowing visor looking toward the form, harmonized with the platform's dark aesthetic and kinetic physics.
2. **Form Architecture**:
   - Inputs:
     - `Full name`
     - `Work email` and `Telegram / Direct Channel` (two-column grid)
     - `Company name`
     - `Website / company URL`
     - Two styled institutional dropdowns: `Target Service` (Crypto Yields, DMA Equities, AI Mesh, Real Estate Deeds, Exotic Cars, Metal Cards, MPC Custody) and `Allocation Range` (€500k - €3M, $3M - $10M, >$10M).
     - High-visibility `SEND` action button in vibrant Sovereign Gold / Emerald with tactile Framer Motion physics.
     - Consent microcopy: `"By sending this inquiry, I agree to the privacy policy and encrypted dispatch protocol."`
3. **Routing & Global Trigger Integration**:
   - Route `/contact` and `/#contact` directly to open the dedicated `ContactModal` and scroll to `#contact`.
   - Update `GlobalHeader.tsx` and `InstitutionalFooter.tsx` Contact links to trigger the Contact modal seamlessly.
   - Add `isContactModalOpen`, `openContactModal`, and `closeContactModal` to `useTerminalStore.ts`.
4. **Testing & Quality Assurance**:
   - Establish unit and integration test coverage in `Tests/IntegrationTest/contactIntegration.test.tsx` verifying all fields, dropdowns, B2B badge, mascot presence, and modal lifecycle.
   - Maintain 100% Vitest test pass rate and clean TypeScript compilation.

---

## Technical Specifications & Components

### 1. Store State (`src/store/useTerminalStore.ts`)
- Add `isContactModalOpen: boolean` (default `false`).
- Add `openContactModal: () => void` and `closeContactModal: () => void`.
- Update `syncFromHash`: if path or hash is `/contact` or `#contact`, trigger `openContactModal()`.

### 2. Contact Component Suite (`src/components/contact/`)
- `ContactModal.tsx`:
  - Radix UI / shadcn Dialog primitive (`Dialog`, `DialogContent`).
  - Close button `X` in top-right.
  - Left side: Header, angled neon `[B2B ONLY]` badge, form inputs with icons (`User`, `Mail`, `Send`, `Building`, `Globe`, `ChevronDown`), validation states, and success dispatch confirmation.
  - Right side: Textured sentinel agent with glowing green visor looking at the form, ambient vignette glow, and subtle breathing animation.
- `ContactSection.tsx`:
  - On-page section mounted in `src/App.tsx` with `id="contact"` and `data-testid="contact-section"`, offering both inline engagement and modal deep-linking.

### 3. Global Navigation Integration
- In `GlobalHeader.tsx`:
  - Contact nav link onClick triggers `openContactModal()`.
- In `InstitutionalFooter.tsx`:
  - Inquiries / Contact trigger opens `openContactModal()`.

---

## Acceptance Criteria
1. Clicking "Contact" anywhere on the platform launches the B2B contact modal cleanly.
2. Direct navigation to `/contact` or `/#contact` resolves to the contact view without layout shift.
3. All inputs (Full Name, Work Email, Telegram, Company Name, Website URL, Service Dropdown, Capital Dropdown, Send CTA) function with error handling and PII-redacted logging.
4. 100% test pass rate across all test suites.
