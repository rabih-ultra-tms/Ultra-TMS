# QS-007: CORS Env Variable

**Priority:** P1
**Effort:** S (30 minutes)
**Status:** planned
**Assigned:** Codex

---

## Context Header (Read These First)

1. `apps/api/src/main.ts` — Current CORS config (hardcoded origins)
2. `apps/api/.env.example` — Environment variable definitions (add CORS_ALLOWED_ORIGINS here)

---

## Objective

Replace hardcoded CORS origins with an environment variable. This is a production deployment blocker — as-is, deploying to any non-localhost domain requires code changes.

---

## Current Code

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'http://localhost:3002'],  // ← hardcoded
  credentials: true,
});
```

---

## Target Code

```typescript
// apps/api/src/main.ts
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',') ?? [
  'http://localhost:3000',
  'http://localhost:3002',
];

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
});
```

---

## File Plan

| File | Change |
|------|--------|
| `apps/api/src/main.ts` | Replace hardcoded origins with env var |
| `apps/api/.env.example` | Add `CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3002` |

---

## Acceptance Criteria

1. `apps/api/src/main.ts` has no hardcoded origin URLs
2. CORS origins read from `process.env.CORS_ALLOWED_ORIGINS` (comma-separated)
3. Falls back to localhost:3000,3002 when env var is not set (dev default)
4. `apps/api/.env.example` documents the variable with example value
5. `pnpm check-types` passes with 0 errors
6. API still responds correctly to requests from localhost:3000 after the change

---

## Dependencies

- **Blocks:** Production deployment
- **Blocked by:** None
- **Effort:** 30 minutes — do this first before any other task
