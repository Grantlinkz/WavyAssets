# Implementation Prompt: Unified Finance 3D Corporate Infographic

## Task Overview
Replace the 3D visual container in the About section with a high-tech, corporate 3D animated infographic illustrating the concept of a unified financial platform under the title **"WAVYASSETS: THE FUTURE OF UNIFIED FINANCE."**

Per the user's explicit specification, this design sticks strictly to the prompt requirements and does not imitate any generic 3D abstract shapes:
1. **Title & Top Subheader**:
   - Title: **"WAVYASSETS: THE FUTURE OF UNIFIED FINANCE"**
   - Subheader: `"WAVYASSETS UNIFIES: GLOBAL WEALTH MANAGEMENT | DIGITAL ASSET CUSTODY | INSTITUTIONAL YIELD GENERATION"`
2. **Left Side (Pioneering Multi-Asset Freedom)**:
   - Glowing globe wrapped in orbital rings.
   - Asset icons: traditional fiat currencies (`$`, `€`, `¥`, `£`), gold bars & coins, and major cryptocurrencies (Bitcoin `₿`, Ethereum `Ξ`).
   - Labeled: `"PIONEERING MULTI-ASSET FREEDOM"`.
3. **Centerpiece (Cold-Storage Security)**:
   - Metallic glowing shield featuring a stylized cyan ocean wave wrapping around a heavy padlock.
   - Labeled: `"COLD-STORAGE SECURITY"`.
4. **Right Side (Target Client Segments)**:
   - Three glowing pipeline connections branching out from the central shield to:
     - **Family Offices**: Stylized family reviewing a digital tablet.
     - **Institutions**: Sleek, modern skyscrapers.
     - **Smart Individual Investors**: Focused investor interacting with floating holographic charts and data interfaces.
5. **Far Right (Eliminates the Chaos)**:
   - Vertical section labeled `"ELIMINATES THE CHAOS"`.
   - Floating icons of traditional fragmented finance tools (charts, bank facade, locked safe, pie charts).
6. **Bottom Footer**:
   - Pill-shaped glowing banner: `"TOTAL CONTROL, MATHEMATICAL TRANSPARENCY, AND PEACE OF MIND."`
7. **Visual Style**:
   - Modern vector-illustration style with 3D metallic accents, using the platform's color palette (Sovereign Gold `#D4AF37`, Cyan Wave `#00E5FF`, Emerald `#00C288`, Obsidian `#08090B`) without a background (transparent canvas).

---

## Technical Blueprint & Architecture

### 1. New Component: `src/components/about/UnifiedFinanceInfographic3D.tsx`
- Replaces `AboutVaultCanvas3D.tsx` in the About section container.
- Embeds a Three.js WebGL canvas configured with:
  - `alpha: true` (transparent background)
  - Interactive mouse parallax and hover depth.
  - Three.js 3D meshes:
    - **Centerpiece**: 3D beveled metallic shield with sovereign gold bevel, cybernetic cyan wave torus/ribbon curl, and embossed padlock mesh with glowing core.
    - **Left Globe**: 3D wireframe lat/long sphere with cyan atmospheric glow and dual orbital rings carrying 3D gold bullion, fiat, and crypto tokens.
    - **Right Energy Pipelines**: Three curved 3D glowing spline tubes with moving photon energy pulses feeding into client nodes.
- Integrated high-tech SVG & Canvas vector overlays for the 3 client groups (Family Offices, Institutions, Smart Investors) and the "Eliminates the Chaos" fragmented finance vault.
- Responsive layout handling: auto-scales seamlessly across wide desktop viewports (`lg` and `xl`) down to tablet/mobile viewports.

### 2. Update `src/components/about/AboutSection.tsx`
- Mount `<UnifiedFinanceInfographic3D />` in place of `AboutVaultCanvas3D`.
- Configure the container layout to give the 3D infographic optimal breathing room (`w-full min-h-[520px]`) while harmonizing with the narrative copy and CTAs.

### 3. WebGL Lifecycle & Performance Guardrails
- Explicit geometry and material disposal on unmount (`dispose()`).
- Render loop throttling on `document.hidden` and offscreen culling via `IntersectionObserver`.
- Strict adherence to `prefers-reduced-motion`.
- React 19 hook purity compliance.

### 4. Verification & Testing
- Add integration tests in `Tests/IntegrationTest/aboutAndResearchIntegration.test.tsx` verifying:
  - Title: `"WAVYASSETS: THE FUTURE OF UNIFIED FINANCE"`
  - Subheader: `"WAVYASSETS UNIFIES: GLOBAL WEALTH MANAGEMENT | DIGITAL ASSET CUSTODY | INSTITUTIONAL YIELD GENERATION"`
  - Centerpiece: `"COLD-STORAGE SECURITY"`
  - Left side: `"PIONEERING MULTI-ASSET FREEDOM"` and asset icons (`$`, `€`, `¥`, `£`, gold, `₿`, `Ξ`)
  - Target segments: `"Family Offices"`, `"Institutions"`, `"Smart Individual Investors"`
  - Far right: `"ELIMINATES THE CHAOS"` with fragmented tools
  - Bottom banner: `"TOTAL CONTROL, MATHEMATICAL TRANSPARENCY, AND PEACE OF MIND."`
- Run `tsc -b`, `npm run lint`, and full test suite (`npm test`).
- Update `.ai/progress-tracker.md` and commit with conventional commits.
