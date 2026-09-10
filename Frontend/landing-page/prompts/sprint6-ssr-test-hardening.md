# Sprint 6 Implementation Prompt: SSR Test Hardening, Hash-Routing Resolution & Git Commit

## 1. Context & Objectives
During the test execution across all 19 test suites, 99 tests passed while 5 tests encountered server-side rendering (SSR) test expectation mismatches and regex prefix issues:
1. `parseAssetHash` in `src/store/useTerminalStore.ts` failed when presented with `/research#/services/vip-cards` and `/research` due to an anchor check `^#\/`.
2. In React 19 SSR (`renderToString`), Zustand v5's `useSyncExternalStore` uses `api.getInitialState()` as the server snapshot, meaning `useTerminalStore((state) => state.is404)` inside `<App />` evaluated to the initial state (`false`) rather than dynamically mutated test state (`useTerminalStore.setState({ is404: true })`).
3. In `Tests/IntegrationTest/sprint6HardeningAnd404Integration.test.tsx`, `renderToString` encodes apostrophes `'` as `&#x27;`, causing `expect(html).toContain("We Can't Find That Page")` to fail.

## 2. Reference Specifications & Standards
- `tools/Landing Page Implementation Plan.pdf`: Sub-50ms hash-routing specifications and zero CLS state invariants.
- `GEMINI.md`: Non-negotiable engineering invariants, security guidelines, and conventional commit standards.
- `.agents/skills/vercel-react-best-practices/SKILL.md`: SSR rendering best practices and React 19 compatibility.

## 3. Detailed Planned Changes

### A. `src/store/useTerminalStore.ts`
- Upgrade `parseAssetHash` to:
  ```ts
  export function parseAssetHash(hash?: string): AssetVerticalId {
    const safeHash = hash || '';
    if (safeHash === '#research' || safeHash === '/research' || safeHash.startsWith('/research')) {
      const researchMatch = safeHash.match(/#\/services\/([a-z0-9-]+)/i);
      if (researchMatch && researchMatch[1]) {
        const candidate = researchMatch[1].toLowerCase() as AssetVerticalId;
        if (VALID_ASSET_VERTICALS.includes(candidate)) {
          return candidate;
        }
      }
      return 'vip-cards';
    }
    const match = safeHash.match(/(?:^|#\/)services\/([a-z0-9-]+)/i);
    if (match && match[1]) {
      const candidate = match[1].toLowerCase() as AssetVerticalId;
      if (VALID_ASSET_VERTICALS.includes(candidate)) {
        return candidate;
      }
    }
    return 'crypto';
  }
  ```

### B. `src/App.tsx`
- Ensure `<App />` accepts an optional `is404?: boolean` prop and evaluates:
  ```tsx
  export interface AppProps {
    is404?: boolean;
  }

  export const App: React.FC<AppProps> = ({ is404: is404Prop }) => {
    const storeIs404 = useTerminalStore((state) => state.is404);
    const is404 =
      is404Prop !== undefined
        ? is404Prop
        : storeIs404 || useTerminalStore.getState().is404;
  ```

### C. `Tests/IntegrationTest/sprint6HardeningAnd404Integration.test.tsx`
- Align line 65 with React SSR HTML entity encoding:
  ```tsx
  expect(html).toMatch(/We Can(&#x27;|')t Find That Page/);
  ```

### D. Documentation & Verification
- Update `.ai/progress-tracker.md` to reflect 100% test pass rate (104/104 tests across 19 suites).
- Execute `npm test`, `npm run lint`, and `tsc -b`.
- Commit with conventional commits (at least 2 commits per GEMINI.md).

## 4. Acceptance Criteria
- [ ] All 19 test suites pass (104/104 tests).
- [ ] TypeScript strict check passes without errors (`tsc -b`).
- [ ] ESLint passes with zero warnings or errors (`npm run lint`).
- [ ] At least 2 conventional git commits created with proper prefixes.
