# Sprint 5 Implementation Prompt: VIP Cards, Compliance & Security Command Center

## 1. Executive Summary & Goals
Sprint 5 implements the sovereign governance, luxury concierge, institutional compliance, and zero-trust security layers of the WavyAssets user dashboard:
1. **VIP & Membership Cards (`vip-cards`)**:
   - 3-tier AUM progression tracker (Tier 1 Silver -> Tier 2 Obsidian Elite at $14.82M / 59.3% progress -> Tier 3 Black Fiduciary at $25M).
   - Obsidian metal card visualizer (Physical 42g Tungsten vs Virtual NFC Apple Pay switch), dynamic EMV chip, World Elite dual-ellipse branding.
   - Live Card Controls: Instant Freeze toggle, spending limit breakdown (Daily Single-Swipe $500,000, Available Today $428,650, 30-Day Billing $142,390).
   - Biometric Credential Gate: Simulated WebAuthn/FIDO2 PIN & CVV reveal modal with 60-second auto-mask timer.
   - Sovereign Concierge Launcher: Private banker hotline, Signal/WhatsApp direct dispatch, charter & private equity allocation requests.
2. **Tiered KYC/AML Compliance & Tax Alpha (`compliance`)**:
   - 3-Tier Sovereign Architecture status (Tier 1 Baseline $10k/day, Tier 2 Qualified HNWI $250k/day, Tier 3 Active Enclave Unlimited / Atomic DvP).
   - Beneficial Ownership (UBO) Registry for Grant Sovereign Holdings AG (CHE-382.910.442), UBO Marcus Aurelius Grant (100%), Trustee Beatrix von Werra, Supervisory Arbiter Dr. Hans-Peter Keller, 2-of-3 HSM Quorum.
   - Verified Credentials Archive (Passport notarization, Tax residency, Certificate of Incumbency, AMLA Art. 9 sanctions screening).
   - Unified Multi-Asset Tax Pack Aggregator: Realized gains, dividends, rental distributions, quant yield, fleet yield; Big 4 export & Form 8949 CSV download.
   - Global Regulatory Gateway Matrix (CH, US, UK, SG corridors).
3. **Security Command Center & Access Vault (`security`)**:
   - Security Posture Scorecard (100/100 Defense Index, Argon2id + FIDO2 auth engine, 48H Cold Lock, 2-of-3 HSM Quorum).
   - Hardware Security Keys Vault (YubiKey 5C NFC, Ledger Nano S Plus, Apple Secure Enclave Touch ID).
   - Authorized Client Sessions blotter with real-time heartbeat and 1-click remote kill / revoke all others.
   - **Mandatory Whitelist Address Guard & Inviolable 24-to-48h Time-Lock Matrix**:
     - Enforces the strict zero-trust invariant: Any newly registered destination (crypto address or bank IBAN) is subjected to an inviolable 24-48 hour lock timer before transfers are permitted.
     - Live countdown timers (e.g. `21h 38m 42s REMAINING`), progress bars, dual-signatory verification, and emergency cancellation/blacklisting.
     - Interactive "Add New Whitelisted Destination" modal initializing a 48-hour lock countdown upon registration.

---

## 2. Reference Documents & Prototypes
- `tools/IMPLEMENTATION_STRATEGY.md` (Sections 5.6, 6, 7, 8, 9)
- `tools/GOOGLE_STITCH_UI_UX_PROMPT_STRATEGY.md` (Modules 06, 08, 09)
- `tools/UI/#7 wavyassets_vip_obsidian_metal_cards_sovereign_concierge/code.html`
- `tools/UI/#9 wavyassets_compliance_kyc_aml_tax_command/code.html`
- `tools/UI/#10 wavyassets_security_command_center_access_vault/code.html`

---

## 3. Planned Architecture & File Changes

### A. Data & Store Foundations
- **`src/lib/governanceAssetData.ts`**:
  - VIP card tiers, limits, cardholder metadata, concierge services.
  - Compliance tiers, corporate UBO profile, verified credentials checklist, multi-asset tax aggregates, regulatory corridors.
  - Security posture indicators, hardware keys, active device sessions, whitelisted addresses with timestamp-based 48h quarantine timers.
- **`src/store/useGovernanceStore.ts`**:
  - VIP card state: `isCardFrozen`, `cardMode` ('physical' | 'virtual'), `isCvvRevealed`, `revealCountdown`, toggle freeze, biometric reveal trigger.
  - Compliance state: active tax year ('2024' | '2025'), document upload simulation.
  - Security state: active sessions list, terminate session action, revoke all others, whitelisted addresses list, add whitelisted address (with automatic 48-hour lock timer), cancel/blacklist address.

### B. VIP Cards Module (`src/components/modules/vip-cards/`)
- `ObsidianMetalCard.tsx`: 3D-styled 42g Tungsten / Virtual NFC card visualizer with EMV chip and dual ellipse.
- `CardSpendingLimits.tsx`: Daily single-swipe, available today, 30-day billing metrics and liquidity buffer.
- `BiometricRevealModal.tsx`: WebAuthn simulation modal with biometric fingerprint sensor challenge and PIN/CVV unmasking.
- `SovereignConciergeModal.tsx`: WhatsApp/Signal VIP banker dispatch dialog.
- `VipCardsModule.tsx`: Unified container assembling tier progression bar, card showcase, spending limits, privileges, concierge launcher.

### C. Compliance Module (`src/components/modules/compliance/`)
- `KycTierChecklist.tsx`: 3-tier status banner (Baseline, Qualified HNWI, Active Enclave Tier 3).
- `BeneficialOwnershipRegistry.tsx`: Grant Sovereign Holdings AG UBO details, authorized 2-of-3 HSM key signers.
- `TaxPackAggregator.tsx`: Multi-asset fiscal dossier, vertical breakdown, Big 4 and CSV export buttons.
- `RegulatoryGatewayMatrix.tsx`: Cross-border clearing corridors (CH, US, UK, SG).
- `ComplianceModule.tsx`: Master module layout matching Prototype #9.

### D. Security Module (`src/components/modules/security/`)
- `SecurityScorecard.tsx`: 4-column metric deck (100/100 Defense Index, Argon2id, Whitelist Guard, HSM Quorum).
- `HardwareKeyManager.tsx`: FIDO2 / WebAuthn token registry with test challenge.
- `ActiveSessionsBlotter.tsx`: Authenticated device sessions with remote termination.
- `WhitelistAddressManager.tsx`: Mandatory 24-48h time-lock matrix, countdown timers, and "Add Destination" modal.
- `SecurityModule.tsx`: Master security command center container matching Prototype #10.

### E. App Integration (`src/App.tsx`)
- Wire `'vip-cards'`, `'compliance'`, and `'security'` views into the main view switcher.

---

## 4. Acceptance Criteria & Pre-Commit Verification
1. **VIP Cards**:
   - Card displays 42g Solid Obsidian finish, toggle between Physical Metal and Virtual NFC works.
   - Instant Freeze button toggles card status between `ACTIVE // ARMED` and `FROZEN // LOCKED`.
   - Biometric gate modal simulates WebAuthn challenge and reveals PIN & CVV with auto-expiry.
2. **Compliance**:
   - Displays Tier 3 Sovereign Accreditation with 2-of-3 HSM quorum signers.
   - 4-item verified credentials archive with 100% clean checkmarks.
   - Tax dossier renders multi-vertical breakdown ($384k crypto gains, $62k dividends, $205k rental, $266k staking, $34k tangible fleet) and triggers download notifications.
3. **Security Command Center**:
   - Displays 100/100 defense posture and 2-of-3 HSM quorum.
   - Remote terminate session works and updates active session count.
   - **Inviolable Whitelist Lock Invariant**: Newly created addresses are created with a 48h lock timer; quarantined rows show real-time remaining countdown and cannot initiate transfer until matured.
4. **Zero Layout Shift & Accessibility**:
   - Tabular figures (`tabular-nums`) for all numbers, hashes, and timers.
   - Sub-50ms tab switching and clean component unmounting.
   - Full support for `maskBalances` privacy mode.
5. **Quality Standards**:
   - `tsc -b` passes with 0 errors.
   - `npm run lint` passes with 0 errors.
   - Vitest unit & integration tests pass (all new modules tested).
   - At least 2 conventional commits created (`feat:`, `tests:`).
