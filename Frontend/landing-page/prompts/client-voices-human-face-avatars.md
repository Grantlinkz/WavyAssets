# Implementation Prompt: Client Voices Human Face Avatars

## Objective
Replace the letter placeholder initials ("SZ", "HW", "EB" as well as "AK", "VL", "MT") in `src/components/trust/ClientVoices.tsx` and `src/components/trust/trustData.ts` with authentic, high-resolution professional executive headshots generated for each investor.

---

## Technical Specifications & Architecture

### 1. Asset Mapping
The generated photorealistic executive portraits in `src/assets/testimonials/`:
- **SZ (Sheikh Tariq Al-Zahrani)**: `src/assets/testimonials/tariq-alzahrani.jpg`
- **HW (Dr. Hendrik Weber)**: `src/assets/testimonials/hendrik-weber.jpg`
- **EB (Eleanor de Broglie)**: `src/assets/testimonials/eleanor-de-broglie.jpg`
- **AK (Alexander Koenig)**: `src/assets/testimonials/alexander-koenig.jpg`
- **VL (Victoria Laurent)**: `src/assets/testimonials/victoria-laurent.jpg`
- **MT (Marcus Thorne)**: `src/assets/testimonials/marcus-thorne.jpg`

### 2. Component & Data Updates
1. `src/components/trust/trustData.ts`:
   - Import avatar images.
   - Extend `TestimonialItem` interface with `avatarUrl?: string`.
   - Populate `avatarUrl` for all items across `institutional` and `private-wealth` modes.
2. `src/components/trust/ClientVoices.tsx`:
   - In `SpecularCard`, render `<img>` with `src={item.avatarUrl}` with `w-10 h-10 rounded-sm object-cover border border-primary/30 shadow-xs`.
   - Provide graceful fallback to `{item.initials}` if image is unavailable.

---

## Files to Modify
1. `src/components/trust/trustData.ts`
2. `src/components/trust/ClientVoices.tsx`
3. `Tests/IntegrationTest/trustAndComplianceIntegration.test.tsx`
4. `.ai/progress-tracker.md`

---

## Acceptance Criteria
- [ ] Placeholders "SZ", "HW", "EB" (and private wealth counterparts) are replaced with realistic human executive portraits.
- [ ] Images are styled with institutional micro-chamfer (`rounded-sm`), subtle border (`border-primary/30`), and `object-cover`.
- [ ] SSR compatibility and zero layout shift verified.
- [ ] 100% test pass rate across all 15 Vitest suites.
- [ ] Minimum two conventional git commits logged.
