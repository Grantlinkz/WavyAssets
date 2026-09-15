# Sprint 6 Implementation Prompt: Performance Optimization, Hardening & Enterprise Deployment

## 1. Executive Summary & Goals
Sprint 6 represents the final capstone phase of the **WavyAssets Sovereign Institutional User Dashboard** (`Frontend/user-dashboard`), focusing on production hardening, low-latency performance enforcement, deterministic WebGL resource governance, and enterprise container deployment:

1. **Sub-50ms Tab Transition & Zero Cumulative Layout Shift (CLS < 0.01)**:
   - Enforce mandatory pre-dimensioned skeleton containers (`min-h-[540px]`, zero layout jumps) across all vertical module mounts (`crypto`, `stocks`, `ai-funds`, `real-estate`, `cars`, `vip-cards`, `compliance`, `security`, `wallet`).
   - Audit view switching latency in integration tests to guarantee sub-50ms reactive transitions.
   - Tabular figures (`tabular-nums font-mono`) enforced on all numerical metric feeds to eliminate reflow jitter.

2. **WebGL Render Loop Throttling & Off-Screen IntersectionObserver Culling**:
   - Upgrade `src/components/3d/AllocationDonut3D.tsx` with an `IntersectionObserver` to halt rendering when the canvas is off-screen or out of viewport view.
   - Retain and harden existing `document.hidden` visibility change listener to freeze WebGL loops when switching browser tabs.
   - Preserve deterministic `.dispose()` memory hygiene on geometries, materials, and WebGL renderers to prevent GPU memory leaks.

3. **Multi-Stage Docker Containerization & Reverse Proxy Architecture**:
   - `Dockerfile`: Multi-stage Alpine container (`node:22-alpine` builder with `npm ci` and `npm run build` -> `nginx:alpine` unprivileged/hardened runner with curl healthcheck).
   - `nginx.conf.template`: Institutional Nginx configuration with gzip compression, defensive security headers (`X-Frame-Options DENY`, `X-Content-Type-Options nosniff`, `Referrer-Policy`, `Permissions-Policy`), `/healthz` probe, SPA routing fallback (`/index.html`), and API/WebSocket reverse proxy to backend gateway on `:4000`.
   - `docker-compose.yml`: Dedicated service configuration exposing port `5174:80` with resource constraints, health probes, and log rotation.
   - Root `docker-compose.yml`: Register `dashboard` service to provide 1-command monorepo orchestration (`backend:4000`, `frontend:5173`, `dashboard:5174`).

4. **Automated Verification & Quality Invariants**:
   - Comprehensive unit and integration test coverage for Sprint 6 additions:
     - `Tests/UnitTest/performanceHardening.test.ts`: Validates WebGL throttling logic, IntersectionObserver lifecycle, and layout shift guard assertions.
     - `Tests/IntegrationTest/performanceBenchmarks.test.tsx`: Validates sub-50ms view switching benchmarks, zero CLS container sizing, and complete vertical transitions.
   - Target: >135 total passing tests across 23 test suites.

---

## 2. Reference Documents & Prototypes
- `tools/IMPLEMENTATION_STRATEGY.md` (Sections 1, 2, 7, 8, 9 — Sprint 6 specification)
- `tools/GOOGLE_STITCH_UI_UX_PROMPT_STRATEGY.md` (Design tokens, performance invariants)
- `Frontend/landing-page/Dockerfile` and `Frontend/landing-page/nginx.conf.template` (Institutional deployment pattern parity)
- `docker-compose.yml` (Monorepo service topology)

---

## 3. Planned File Modifications & Additions

### A. WebGL & Performance Optimization
- **`src/components/3d/AllocationDonut3D.tsx`**:
  - Integrate `IntersectionObserver` hook/listener to toggle rendering flag when canvas enters or leaves viewport.
  - Combine with `document.hidden` state: only invoke `renderer.render(scene, camera)` when `isVisible && !document.hidden`.
  - Maintain WebGL fallback for headless/test environments and verify strict `.dispose()` cleanup.

- **Module Container Sizing & Layout Stability**:
  - Ensure all modules enforce stable `min-h-[540px]` root containers with skeleton layout preservation to eliminate layout shifts (CLS < 0.01).

### B. Enterprise Docker & Nginx Deployment Configuration
- **`Frontend/user-dashboard/Dockerfile`** [NEW]:
  - Multi-stage build (`node:22-alpine` builder -> `nginx:alpine` runner).
  - Health check at `/healthz`.
  - Exposes port 80 (mapped to 5174 by compose).
- **`Frontend/user-dashboard/nginx.conf.template`** [NEW]:
  - Static caching (1y immutable for hashed assets, `no-store` for `index.html`).
  - Defensive security headers.
  - Proxy passes for `/api/`, `/health/`, and `/ws/` to backend.
  - `/healthz` endpoint returning HTTP 200 `healthy\n`.
- **`Frontend/user-dashboard/docker-compose.yml`** [NEW]:
  - Standalone compose spec running dashboard container on port 5174.
- **`docker-compose.yml` (Monorepo Root)** [MODIFY]:
  - Add `dashboard` service targeting `./Frontend/user-dashboard` with port `5174:80`.

### C. Test Suites & Benchmarks
- **`Tests/UnitTest/performanceHardening.test.ts`** [NEW]:
  - Unit tests for WebGL lifecycle, visibility throttling, IntersectionObserver attachment/detachment, and CLS layout invariants.
- **`Tests/IntegrationTest/performanceBenchmarks.test.tsx`** [NEW]:
  - Integration tests benchmarking sub-50ms tab transition latency across all 9 vertical modules (`crypto`, `stocks`, `ai-funds`, `real-estate`, `cars`, `vip-cards`, `compliance`, `security`, `wallet`).
- **`.ai/progress-tracker.md`** [MODIFY]:
  - Mark Sprint 6 completed and document final verification results.

---

## 4. Acceptance Criteria
1. All 9 vertical modules transition smoothly with verified execution timing well under 50ms in integration tests.
2. WebGL donut component attaches `IntersectionObserver` and halts `requestAnimationFrame` render passes when hidden or off-screen.
3. Multi-stage `Dockerfile`, `nginx.conf.template`, and `docker-compose.yml` are created and syntactically validated.
4. Vitest automated test suite expands from 131 to >135 passing tests with zero test regressions.
5. Strict TypeScript (`tsc -b`) and linter pass cleanly.
