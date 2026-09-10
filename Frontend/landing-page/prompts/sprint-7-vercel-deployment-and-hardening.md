# Implementation Prompt — Sprint 7: Vercel Production Deployment, Robots.txt & Security Hardening

## Background & Objectives
Following the completion of Sprints 1–6 (Core Terminal, 7 Modular Asset Panels, 3D Canvas Visualizers, plain English copy, and WCAG AA Hardening), the platform is entering its production launch phase. The user has requested:
1. Proceed with the next sprint configured specifically for **Vercel** production deployment.
2. Implement institutional `robots.txt` and `sitemap.xml` for search crawler indexing and SEO.
3. Investigate and resolve the two console/CSP issues reported:
   - `contentscript.js:14083 MaxListenersExceededWarning`: Browser extension EventEmitter leak.
   - Content Security Policy `eval` blocking: Verify absence of `eval()` / `new Function()` in production build and establish strict, compliant CSP headers.

---

## Reference Documents & Standards
- `GEMINI.md`: Institutional non-negotiables, zero CLS, clean WebGL lifecycle, secure headers, no secret leaks, conventional commit standard.
- `.ai/progress-tracker.md`: Post-Sprint 6 Production deployment roadmap.
- `.agents/skills/vercel-react-best-practices/SKILL.md`: `bundle-dynamic-imports`, `bundle-barrel-imports`, edge caching, clean SPA routing.

---

## Detailed Implementation Plan

### 1. Investigation & Resolution of Reported Issues
- **Issue A (`contentscript.js:14083 MaxListenersExceededWarning`)**:
  - *Diagnosis*: `contentscript.js` is an injected browser extension script (e.g., MetaMask, Coinbase Wallet, Phantom, or Web3 provider extensions). These extensions use Node.js `EventEmitter` to listen for stream/port `'close'` events. When 11 listeners attach without calling `setMaxListeners()`, Node's EventEmitter logs this warning.
  - *Resolution*: Confirm and document that WavyAssets client code does NOT contain `contentscript.js` or Node `EventEmitter`, and all DOM `addEventListener` calls in `src/` have strict unmount cleanup. The warning is external to our application and disappears in Private/Incognito windows or browsers without injected wallet extensions.
- **Issue B (CSP blocks `eval` in JavaScript)**:
  - *Diagnosis*: Verified by searching both `src/` and the production bundle (`dist/assets/index-*.js`). Neither `eval()` nor `new Function()` is used in our application.
  - *Resolution*: Establish an institutional Content Security Policy in `vercel.json` (and `index.html`) that strictly prohibits `unsafe-eval` while permitting essential external origins (Google Fonts `fonts.googleapis.com` / `fonts.gstatic.com`, data/blob image/media schemes, and `unsafe-inline` styles for Framer Motion / Tailwind dynamic inline styles).

### 2. Vercel Configuration (`vercel.json`)
- **SPA Rewrites**: Route `/(.*)` to `/index.html` to support client-side routing, deep linking (`#/services/:assetId`, `/research`), and custom 404 handling.
- **Security Headers**:
  - `Content-Security-Policy`: Institutional strict policy blocking `unsafe-eval` and unauthorized script injections.
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- **Edge Caching & Performance**:
  - `/assets/(.*)` -> `public, max-age=31536000, immutable`
  - `/(.*)` -> `public, max-age=0, must-revalidate`
- **Clean URLs**: `"cleanUrls": true`

### 3. Search Engine Discovery (`public/robots.txt` & `public/sitemap.xml`)
- Create `public/robots.txt` allowing indexing for all major search engines, disallowing private admin/auth paths, and pointing to `https://wavyassets.com/sitemap.xml`.
- Create `public/sitemap.xml` with `<urlset>` covering the landing page and core institutional deep links with `priority` and `changefreq`.

### 4. Vercel Bundle Code-Splitting Optimization (`vite.config.ts`)
- In `vite.config.ts`, configure `build.rollupOptions.output.manualChunks` per `vercel-react-best-practices` to separate heavy third-party dependencies (`three-vendor`, `motion-vendor`, `radix-vendor`, `react-vendor`).
- Reduces monolithic 1.5MB JS chunk down into lean, cacheable vendor chunks.

### 5. Automated Testing & Verification
- Create `Tests/IntegrationTest/sprint7VercelAndDeploymentIntegration.test.tsx` asserting:
  - `robots.txt` presence, syntax, user-agent directives, and sitemap reference.
  - `sitemap.xml` valid XML schema, URLs, and priority.
  - `vercel.json` rewrites, security headers, CSP directives, and cache control rules.
- Run `tsc -b`, `npm run lint`, `npm test`, and `npm run build`.
- Update `.ai/progress-tracker.md`.

---

## Acceptance Criteria
- [ ] `vercel.json` created and valid JSON with SPA rewrites, security headers, and caching.
- [ ] `public/robots.txt` created and verified.
- [ ] `public/sitemap.xml` created and verified.
- [ ] `vite.config.ts` optimized with code-splitting chunks.
- [ ] No `eval()` or `new Function()` in client bundle.
- [ ] All 104+ unit and integration tests passing.
- [ ] `tsc -b` and `eslint` passing cleanly.
- [ ] Minimum of 2 conventional git commits recorded for the sprint.
