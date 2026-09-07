# Implementation Prompt: Navbar Sliding Dot Indicator & Seamless Looping Wave Background

## Unit Overview
- **Sprint**: Post-Sprint 5 Terminal UX Refinement
- **Unit**: Header Navbar Sliding Dot Physics & Default Seamless Looping Sine-Wave Background
- **Target Files**:
  - `src/components/nav/GlobalHeader.tsx` [MODIFY]
  - `src/components/canvas/WavyBackground.tsx` [NEW]
  - `src/App.tsx` [MODIFY]
  - `src/index.css` [MODIFY]
  - `Tests/IntegrationTest/navbarAndWaveBackgroundIntegration.test.tsx` [NEW]
  - `.ai/progress-tracker.md` [MODIFY]

---

## 1. Context & User Specifications Reference
- **User Requirements**:
  1. **Navbar Navigation**:
     - Nav items: Retain current institutional color styling (`text-on-surface-variant`, `hover:text-on-surface`, `text-primary` for active state).
     - Sliding Dot Indicator: A single small circular dot positioned beneath the menu items.
     - Animation: When hovering over any link, smoothly animate the dot's horizontal position (`transform: translateX()`) so it slides and centers directly underneath the hovered link. When not hovering, fade out the dot or return it to the active link. Use smooth cubic-bezier easing.
  2. **Seamless Looping Wave Background**:
     - Visuals & Colors: Alternating, smooth diagonal sine-wave stripes alternating between **Licorice (`#1B1212`)** and **Jet Black (`#343434`)**.
     - Motion: Infinitely translate the wave pattern along the horizontal axis (`translateX`) with a linear timing function. Ensure the wave paths tile seamlessly for an uninterrupted, smooth loop.
     - Default background: Set as the default background of the application.

---

## 2. Planned Changes & Technical Specifications

### A. Navbar Sliding Dot Indicator (`src/components/nav/GlobalHeader.tsx`)
- Wrap desktop nav items in a relative container with mouse enter/leave listeners.
- Add ref or coordinate tracking for each item (Services mega-menu button + 4 links: About, Client Voices, Contact, Research).
- Render a dot indicator (`w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(212,175,55,0.8)]`) positioned underneath the navigation links.
- Animate `x` using Framer Motion with cubic-bezier transition:
  `transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.35 }}`.
- Fade in `opacity: 1` when hovered; fade out `opacity: 0` (or return to active link) when mouse leaves the nav.

### B. Default Seamless Looping Sine-Wave Background (`src/components/canvas/WavyBackground.tsx`)
- Render a fixed full-screen SVG/Canvas background with z-index behind the command deck.
- Generate alternating diagonal sine-wave stripes using mathematically continuous sine equations:
  - Colors: `#1B1212` (Licorice) and `#343434` (Jet Black).
  - Geometry: Angled diagonal sine-wave channels designed to repeat with modular periodicity $W$.
  - Two duplicated repeating horizontal segments moving seamlessly: `0% { transform: translate3d(0, 0, 0); }` to `100% { transform: translate3d(-50%, 0, 0); }`.
  - Linear timing function (`animation: wave-slide-infinite 25s linear infinite`).
  - Perfect tiling with zero jump or stutter at loop transition.
  - Respect `prefers-reduced-motion` and throttle on `document.hidden`.

### C. Application Mounting (`src/App.tsx`)
- Mount `<WavyBackground />` as the default ambient background in `src/App.tsx`.

### D. CSS Animation Keyframes (`src/index.css`)
- Define `@keyframes wave-slide-horizontal` from `0% { transform: translate3d(0, 0, 0); }` to `100% { transform: translate3d(-50%, 0, 0); }`.
- Add `.animate-wave-seamless` utility.

### E. Automated Integration Test Suite (`Tests/IntegrationTest/navbarAndWaveBackgroundIntegration.test.tsx`)
- Verify sliding dot indicator mounts with cubic-bezier configuration and data attributes.
- Verify hovering moves the indicator and unhovering triggers fade-out/reset.
- Verify `WavyBackground` mounts with Licorice (`#1B1212`) and Jet Black (`#343434`) color elements and infinite linear translation.

---

## 3. Acceptance Criteria
- [ ] Navbar links retain existing institutional design styling.
- [ ] Circular dot indicator slides horizontally directly underneath hovered link and centers with smooth cubic-bezier easing.
- [ ] Dot indicator fades out or docks to active link when mouse leaves the nav rail.
- [ ] Background displays alternating diagonal sine-wave stripes in `#1B1212` and `#343434`.
- [ ] Wave pattern translates horizontally infinitely with a linear timing function without any visual seam or jump.
- [ ] Set as default background in `App.tsx`.
- [ ] 100% test pass rate across all Vitest suites.
- [ ] At least two git commits using conventional commit prefixes.
