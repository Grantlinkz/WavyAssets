# Implementation Prompt: Services Modal UX Rewrite, 3D Vector Icons & Sign-In Navigation

## Unit Overview

- **Sprint**: Post-Sprint 5 Terminal UX Refinements & Conversion Optimization
- **Unit**: Services Modal UX Copy Rewrite, 3D Vector Icon Integration, and Sign-In Routing for 7 Asset Verticals
- **Target Files**:
  - `src/components/nav/icons/Asset3DVectorIcons.tsx` [NEW]
  - `src/components/nav/ServicesMegaMenu.tsx` [MODIFY]
  - `src/components/nav/CategoryFilter.tsx` [MODIFY]
  - `Tests/IntegrationTest/megaMenuIntegration.test.tsx` [MODIFY]
  - `.ai/progress-tracker.md` [MODIFY]

---

## 1. Context & User Directives Reference

The user has instructed:
> *"Implement in the /service (service modal) only:*
> *As a senior ux writer and a digital marketing/seo integration expert,, do the following;;*
> *1) rewrite the service modal*
> *2) make all the 7 assets verticals to go to the signin page when clicked*
> *3) include a relevant 3D vector icon to each of the 7 assets verticals (eg for car inventory a car 3D vector icon)"*

---

## 2. Planned Changes & Technical Specifications

### A. Bespoke 3D Vector Icons for All 7 Asset Verticals (`src/components/nav/icons/Asset3DVectorIcons.tsx`)
Create a dedicated component module containing 7 high-fidelity, scalable SVG 3D vector icons engineered with isometric depth, directional lighting, metallic gradient highlights, and soft ambient drop shadows:
1. **Crypto (`Crypto3DVectorIcon`)**:
   - 3D isometric coin with volumetric edge rim, dual-wave emblem, sovereign gold and emerald gradients, and floating depth.
2. **Global Stocks (`Stocks3DVectorIcon`)**:
   - 3D isometric tiered candlestick pedestal columns with ascending green/gold glassmorphic faces and an extruded 3D growth arrow.
3. **AI Funds (`AiFunds3DVectorIcon`)**:
   - 3D isometric AI neural processor / GPU chip die with beveled golden heat-sink fins, glowing cyan circuit channels, and neural nodes.
4. **Real Estate (`RealEstate3DVectorIcon`)**:
   - 3D isometric luxury commercial glass skyscraper with tiered setbacks, floor-to-ceiling glass curtain walls, and a gold crown spire.
5. **Car Inventory (`Cars3DVectorIcon`)**:
   - 3D volumetric aerodynamic hypercar silhouette with sculpted hood curves, tinted windshield canopy, illuminated LED headlights, and extruded alloy wheels with gold calipers.
6. **VIP Cards (`VipCards3DVectorIcon`)**:
   - 3D floating perspective solid titanium metal credit card with beveled chamfered edge, gold EMV contact chip, and holographic wave deboss.
7. **Digital Custody Wallet (`Wallet3DVectorIcon`)**:
   - 3D isometric multi-sig bank vault safe and hardware wallet with heavy volumetric combination dial, reinforced alloy corners, and glowing emerald lock indicator.

### B. Senior UX Writer & Digital Marketing / SEO Rewrite (`ServicesMegaMenu.tsx` & `CategoryFilter.tsx`)
Rewrite the services modal from the perspective of a senior UX writer and digital marketing/SEO integration expert, targeting an 8th-grade reading level, high search intent, and institutional conversion:
- **Header Bar**:
  - Title: *"Explore Wealth Services & Asset Classes"*
  - Subtitle: *"High-Converting Multi-Asset Investments with Instant Access"*
  - Trust Badges: *"✓ 100% Asset-Backed"*, *"✓ SOC-2 & FINMA Regulated"*, *"✓ Instant Withdrawals"*
- **Category Filter Ribbon (`CategoryFilter.tsx`)**:
  - *"All Services"* (`all`)
  - *"Crypto & Digital"* (`liquid-digital`)
  - *"Stocks & Pre-IPO"* (`dma-equities`)
  - *"Real Estate & Vaults"* (`physical-vaults`)
- **The 7 Asset Verticals**:
  1. **Crypto**: *"High-Yield Crypto Staking & Cold Storage"*, Badge: *"+18.4% APY YIELD"*, Subtitle: *"Multi-Key Security • Offline Cold Storage • Daily Payouts"*, Description: *"Earn industry-leading staking returns on Bitcoin, Ethereum, and Solana with automated downside protection and multi-signature offline cold storage."*, SLA: *"Instant Zero-Fee Settlement"*, CTA: *"Sign In to Invest →"*
  2. **Stocks**: *"Global Stocks & Pre-IPO Tech Shares"*, Badge: *"40+ EXCHANGES"*, Subtitle: *"Direct Market Access • Buy SpaceX & Stripe Before IPO"*, Description: *"Trade top public stocks across New York, London, and Tokyo with low commissions. Access exclusive allocations in unicorn pre-IPO private companies."*, SLA: *"Direct Market Execution"*, CTA: *"Sign In to Trade →"*
  3. **AI Funds**: *"AI Infrastructure Funds & GPU Compute"*, Badge: *"14.8% APY TARGET"*, Subtitle: *"Enterprise Nvidia H100 Clusters • Hands-Free Compounding"*, Description: *"Invest in high-performance computing clusters leased to Fortune 500 AI developers. Generate automated monthly income backed by physical GPU hardware."*, SLA: *"Enterprise Data Centers"*, CTA: *"Sign In to Access Funds →"*
  4. **Real Estate**: *"Fractional Prime Commercial Real Estate"*, Badge: *"6.4% NET RENTAL YIELD"*, Subtitle: *"Quarterly Cash Distributions • Prime Tier-1 City Buildings"*, Description: *"Acquire fractional equity in luxury commercial properties across London, Zurich, and Manhattan. Receive notarized ownership deeds and passive quarterly rent."*, SLA: *"Notarized Title Deeds"*, CTA: *"Sign In to View Properties →"*
  5. **Cars**: *"Exotic Collector Cars & Rare Horology Vault"*, Badge: *"$348M INSURED"*, Subtitle: *"Climate-Controlled Vaults • 100% Lloyd's Insured"*, Description: *"Invest in hypercars, vintage Ferrari collectibles, and Patek Philippe timepieces stored in bonded Swiss vaults with third-party appraisals."*, SLA: *"Swiss Freeport Storage"*, CTA: *"Sign In to Vault →"*
  6. **VIP Cards**: *"VIP Titanium Metal Concierge Cards"*, Badge: *"$5M INSTANT LIMIT"*, Subtitle: *"Zero International Fees • Asset-Backed Liquidity Line"*, Description: *"Spend your investment returns globally with bespoke titanium metal cards. Enjoy 24/7 global concierge service and zero foreign transaction fees."*, SLA: *"Worldwide Mastercard Priority"*, CTA: *"Sign In to Claim Card →"*
  7. **Wallet**: *"Multi-Currency Sovereign Digital Wallet"*, Badge: *"MULTI-KEY MPC PROTECTION"*, Subtitle: *"Multi-Currency Treasury • Send & Receive in Seconds"*, Description: *"Consolidate US Dollars, Euros, British Pounds, and digital assets into a single high-security institutional account with instant zero-loss conversions."*, SLA: *"Bank-Grade MPC Custody"*, CTA: *"Sign In to Open Wallet →"*

### C. Direct Sign-In Routing When Clicking Asset Verticals (`ServicesMegaMenu.tsx`)
- On click of any of the 7 asset cards:
  1. Trigger `setActiveAssetId(vert.id)` to synchronize the store with the selected asset class.
  2. Close the services modal: `setMegaMenuOpen(false)`.
  3. Immediately open the unified authentication modal in Sign-In mode: `openAuthModal('institutional', 'login')`.
- This ensures frictionless transition directly to the sign-in screen when any vertical is selected.

### D. Automated Test Coverage (`Tests/IntegrationTest/megaMenuIntegration.test.tsx`)
- Update integration test suite to assert new copy, 3D vector icons, category tabs, and verify that clicking an asset vertical closes the mega menu and triggers `openAuthModal` in sign-in mode (`login`).

---

## 3. Acceptance Criteria & Verification

1. `npm test` runs with 100% pass rate across all 17 test suites (89+ tests passing).
2. `npx tsc -b` compiles cleanly with zero type errors.
3. `npm run lint` passes with zero errors.
4. Each of the 7 asset verticals in the Services modal renders its corresponding bespoke 3D vector icon.
5. Clicking any of the 7 asset cards closes the Services modal and immediately presents the Sign-In modal.
6. The Services modal copy reflects plain English, high-converting digital marketing and SEO best practices.
