# Service Hub: Health Check (37)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-37 tribunal)
> **Priority:** P-Infra (infrastructure — production-ready)
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-37-health.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | A (9.0/10) — fully production, the simplest service |
| **Confidence** | High — code-verified via PST-37 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Production — `apps/api/src/modules/health/` (1 controller, 68 LOC) |
| **Frontend** | N/A — no UI needed |
| **Tests** | Not needed — trivial endpoints (77 LOC total) |
| **Note** | The ONLY service to receive CONFIRM verdict (no code changes needed). |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Module | Built | `health.module.ts` (9 LOC) |
| Controller | Built | `health.controller.ts` — 3 endpoints (68 LOC) |

---

## 3. API Endpoints

| Method | Path | Status | Auth | Notes |
|--------|------|--------|------|-------|
| GET | `/health` | Production | @Public() | Returns status, timestamp, uptime, version |
| GET | `/ready` | Production | @Public() | Readiness probe — tests DB connectivity via `SELECT 1` |
| GET | `/live` | Production | @Public() | Liveness probe — always returns `alive` |

All 3 endpoints use `@Public()` at class level — unauthenticated by design (correct for health/readiness/liveness probes used by load balancers and orchestrators).

---

## 4. Files

| File | Purpose | LOC |
|------|---------|-----|
| `apps/api/src/modules/health/health.module.ts` | Module definition | 9 |
| `apps/api/src/modules/health/health.controller.ts` | Health check endpoints (3) | 68 |

**Total: 2 files, 77 LOC**

---

## 5. Dependencies

**Depends on:** PrismaService (injected for DB connectivity check in `/ready` endpoint)

**Depended on by:** Load balancers, monitoring systems, Kubernetes probes, deployment health checks

---

## 6. Business Rules

1. **Kubernetes-compliant probes:** `/ready` checks DB connectivity (fails if database unreachable), `/live` always returns OK (process is alive).
2. **No tenant isolation needed:** Endpoints access no tenant data. Only query is `SELECT 1` for connectivity.
3. **No authentication:** `@Public()` at class level — health probes must be unauthenticated for infrastructure tooling.

---

## 7. Data Model

No Prisma models used. No entity queries. Only `SELECT 1` raw query for connectivity check.

---

## 8. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Hardcoded version "1.0.0" in 2 places | Info | Open | Could read from package.json or env var |
| `/live` return type doesn't use HealthStatus interface | Info | Open | Minor inconsistency, no impact |
| Redis field in HealthStatus interface but not checked | Info | Open | Optional extensibility placeholder — good design |

---

## 9. Tasks

No open tasks. All 3 tribunal action items are documentation-only (applied in this hub update).

### Completed (PST-37 tribunal)
| # | Action | Status |
|---|--------|--------|
| 1 | Document all 3 endpoints (was 1) | **Done** |
| 2 | Fix auth claim: @Public(), not auth-required | **Done** |
| 3 | Add PrismaService dependency | **Done** |

---

## 10. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| 1 endpoint documented | 3 endpoints in code | Hub undercounted by 2 |
| "Requires auth" | @Public() at class level | Hub was wrong — code is correct |
| No dependencies | PrismaService injected | Hub omitted DB connectivity dependency |
| Health score 9/10 | Confirmed 9.0/10 by tribunal | Score unchanged — CONFIRM verdict |

---

## 11. Design Links

N/A — infrastructure service, no UI design specs.
