# Implementation Prompt — Sprint 6: End-to-End Monorepo Integration, Hardening & Enterprise Deployment

**Target Sprint:** Sprint 6 (Final Milestone)  
**Architecture Reference:** [`tools/IMPLEMENTATION_STRATEGY.md`](tools/IMPLEMENTATION_STRATEGY.md) (Sections 7, 8, 9, 10)  
**System Governance:** [`GEMINI.md`](GEMINI.md)  
**UI Contract Reference:** [`.ai/ui-context.md`](.ai/ui-context.md)  

---

## 1. Objectives & Deliverables

1. **Production Health & Telemetry Controller (`src/modules/health/`)**:
   - Create `HealthController` and `HealthModule`:
     - `GET /health`: Comprehensive container liveness & database connectivity verification (`PrismaService.isHealthy()`).
     - Returns RFC 7807 compliant standardized JSON payload with status, timestamp, uptime, and database ping latency.
   - Wire `HealthModule` into `app.module.ts`.

2. **Frontend-to-Backend Direct Wiring (`Frontend/user-dashboard`)**:
   - Update `Frontend/user-dashboard/vite.config.ts`:
     - Correct proxy target to `http://localhost:4001` for `/api`, `/health`, `/ws`, and `/socket.io`.
   - Expand `Frontend/user-dashboard/src/lib/api.ts` with comprehensive typed institutional API clients:
     - `fetchCommandBarData()`: Fetches consolidated net worth, 1D/1W/1M/1Y/ALL returns, 3D asset allocation, and KYC tier limits (`GET /api/v1/dashboard/command-bar`).
     - `fetchActionRails()`: Fetches eligibility and transaction boundaries (`GET /api/v1/dashboard/action-rails`).
     - `fetchLiquidAssets()`: Fetches crypto holdings, stock positions, and double-entry wallet balances.
     - `fetchAlternativeAssets()`: Fetches AI systematic funds, real estate SPVs, and exotic car vault inventories.
     - `fetchGovernanceData()`: Fetches VIP cards, KYC compliance status, active sessions, and 48-hour time-lock whitelist destinations.
     - Robust error handling conforming to RFC 7807 and automatic fallback to cached mock data if the backend is unreachable.

3. **Multi-Service Docker Compose & Networking Architecture**:
   - Update root `docker-compose.yml`:
     - Add `backend-user-dashboard` service building `./Backend/user-dashboard/Dockerfile`, exposing port `4001:4000`, connected to `wavyassets-network`, with healthcheck `curl -f http://localhost:4000/health || exit 1`.
     - Configure `dashboard` frontend service with `BACKEND_HOST=wavyassets-backend-user-dashboard` and `BACKEND_PORT=4000`.
   - Update `Backend/user-dashboard/docker-compose.yml` with health check and environment alignment.

4. **Automated Load Testing Engine (`Tests/LoadTest/`)**:
   - Create `Tests/LoadTest/institutionalLoadTest.ts` simulating 1,000 concurrent institutional sessions:
     - Benchmarks `GET /api/v1/dashboard/command-bar` latency (verifying sub-30ms target).
     - Benchmarks double-entry wallet balance aggregation and high-concurrency order placement.
     - Computes throughput (RPS), p50, p95, and p99 latency percentiles, error rate (0% invariant).
   - Add `"test:load": "vitest run Tests/LoadTest/institutionalLoadTest.ts"` to `package.json`.

5. **Static Security Analysis & OWASP Hardening**:
   - Verify zero high or critical vulnerabilities via static package audit.
   - Validate strict rate limiting via `@nestjs/throttler` in `app.module.ts` on high-risk vectors (auth exchange, withdrawals, file uploads).
   - Verify strict DTO whitelist and sanitization on all endpoints.
   - Confirm zero stack trace leakage and zero plaintext secret storage across all modules.

6. **Comprehensive Automated Test Suite & Regression Verification**:
   - Add integration tests for `HealthController` (`Tests/IntegrationTest/health/health.e2e.test.ts`).
   - Add cross-domain session persistence tests (`Tests/IntegrationTest/cross-domain/crossDomainIntegration.e2e.test.ts`).
   - Run complete test suite verifying all 207+ existing tests plus new tests pass (target: >215 tests).
   - Run `npx tsc --noEmit` and `npm run lint`.

---

## 2. Invariants & Acceptance Criteria

- Sub-30ms Target SLA: Multi-asset command bar aggregation must resolve in sub-30ms under typical loads.
- Ledger Balance Equation: $\sum \text{Debits} + \sum \text{Credits} = 0$ remains strictly conserved under concurrent operations.
- 48-Hour Quarantine: Whitelist destinations strictly enforce quarantine countdown and 2-of-2 hardware signatures.
- Zero Plaintext Secrets & Zero Diagnostic Leakage: Zero PII or credentials logged; zero database or stack trace leakage in client error envelopes.
- 100% Test Success: All existing (207) and newly authored unit, integration, and load tests must pass.
