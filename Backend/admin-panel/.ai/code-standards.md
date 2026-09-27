# Code Standards & Engineering Directives — WavyAssets Backend Admin Panel

**Subsystem**: `Backend/admin-panel`  
**Mandatory Git Branch**: `backend-admin-panel`  

---

## 1. TypeScript & Language Invariants

1. **Strict Type-Checking**: Strict null checks enabled, zero `any` usage. All external inputs typed via class-validator DTOs.
2. **Deterministic Imports**: Use explicit relative paths with clean module resolution.
3. **Decimals for Financial Math**: Financial calculations (balances, credits, debits, spending limits) must never use IEEE 754 floating-point numbers directly. Use Prisma `Decimal` or `big.js` to ensure zero precision loss.

---

## 2. Ingress Validation & DTO Standards

- Every controller endpoint receiving a request body must bind a dedicated DTO decorated with `class-validator` rules.
- Global `ValidationPipe` configured with:
  ```typescript
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
  ```
- Reject any unexpected fields with HTTP 400 Bad Request.

---

## 3. Database & Transactional Rules

1. **Atomic `$transaction`**: All multi-step financial or lifecycle mutations (e.g. balance adjustment + ledger transaction + ledger entry, or user suspension + session revocation) must execute within `prisma.$transaction`.
2. **Idempotency Keys**: Financial operations must accept an idempotency `referenceId` to prevent duplicate processing.
3. **Optimistic Locking**: Use updated timestamps or version counters where concurrent admin modifications are possible.

---

## 4. Response Envelopes & Error Hygiene

Every endpoint must output:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
```
All errors must pass through `GlobalExceptionFilter` and be scrubbed of stack traces, database details, or file paths.

---

## 5. Testing Requirements

- Every domain module must contain unit tests in `Tests/UnitTest/<module>.spec.ts` covering success paths, edge cases, and failure modes.
- End-to-end integration tests in `Tests/IntegrationTest/<module>.e2e-spec.ts` must verify authentication, authorization guards, and database state after execution.
