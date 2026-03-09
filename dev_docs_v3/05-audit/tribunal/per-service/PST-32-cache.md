# PST-32: Cache Service — Per-Service Tribunal Audit

> **Date:** 2026-03-09
> **Auditor:** Claude Opus 4.6
> **Verdict:** MODIFY
> **Health Score:** 7.0/10 (was 3.0/10, delta +4.0)
> **Hub file:** `dev_docs_v3/01-services/p3-future/32-cache.md`
> **Module:** `apps/api/src/modules/cache/`

---

## Executive Summary

The Cache service is a well-structured hybrid Prisma+Redis infrastructure module with 20 endpoints across 4 controllers, 8 services, and 38 real tests. The hub's **biggest factual error across all 32 services** is claiming "No Prisma models — entirely Redis-backed" when 5 Prisma models and 2 enums exist. This cascading error invalidates 2 of 7 known issues that assume Redis-only storage. Security is the main concern: 0/4 RolesGuard, 8/20 endpoints missing tenantId (cross-tenant cache deletion and lock manipulation), and 0/5 soft-delete compliance with 1 hard-delete violation.

---

## Phase 1: Endpoint Count Verification

**Hub claims: 20 endpoints across 4 controllers**
**Actual: 20 endpoints across 4 controllers — 17th consecutive perfect match**

### CacheConfigController (`/cache`) — 5 endpoints ✅

| # | Method | Path | Hub | Actual | Match |
|---|--------|------|-----|--------|-------|
| 1 | GET | `/cache/config` | ✅ | ✅ | ✅ |
| 2 | PUT | `/cache/config/:key` | ✅ | ✅ | ✅ |
| 3 | GET | `/cache/invalidation-rules` | ✅ | ✅ | ✅ |
| 4 | POST | `/cache/invalidation-rules` | ✅ | ✅ | ✅ |
| 5 | DELETE | `/cache/invalidation-rules/:id` | ✅ | ✅ | ✅ |

### LocksController (`/cache/locks`) — 4 endpoints ✅

| # | Method | Path | Hub | Actual | Match |
|---|--------|------|-----|--------|-------|
| 1 | GET | `/cache/locks` | ✅ | ✅ | ✅ |
| 2 | GET | `/cache/locks/history/all` | ✅ | ✅ | ✅ |
| 3 | GET | `/cache/locks/:key` | ✅ | ✅ | ✅ |
| 4 | DELETE | `/cache/locks/:key` | ✅ | ✅ | ✅ |

### CacheManagementController (`/cache`) — 6 endpoints ✅

| # | Method | Path | Hub | Actual | Match |
|---|--------|------|-----|--------|-------|
| 1 | GET | `/cache/health` | ✅ | ✅ | ✅ |
| 2 | GET | `/cache/stats` | ✅ | ✅ | ✅ |
| 3 | GET | `/cache/keys` | ✅ | ✅ | ✅ |
| 4 | DELETE | `/cache/keys/:pattern` | ✅ | ✅ | ✅ |
| 5 | POST | `/cache/invalidate` | ✅ | ✅ | ✅ |
| 6 | POST | `/cache/warm` | ✅ | ✅ | ✅ |

### RateLimitController (`/cache/rate-limits`) — 5 endpoints ✅

| # | Method | Path | Hub | Actual | Match |
|---|--------|------|-----|--------|-------|
| 1 | GET | `/cache/rate-limits` | ✅ | ✅ | ✅ |
| 2 | GET | `/cache/rate-limits/:key` | ✅ | ✅ | ✅ |
| 3 | PUT | `/cache/rate-limits/:key` | ✅ | ✅ | ✅ |
| 4 | GET | `/cache/rate-limits/usage` | ✅ | ✅ | ✅ |
| 5 | POST | `/cache/rate-limits/:key/reset` | ✅ | ✅ | ✅ |

---

## Phase 2: Data Model Verification

### Hub Claim vs Reality

**Hub claims: "No Prisma models — the Cache service is entirely Redis-backed."**
**Reality: 5 Prisma models + 2 Prisma enums. Hub data model accuracy: 0%.**

This is the **worst data model error of all 32 services audited.** The hub's entire Section 8 (Redis Key Patterns) describes a storage architecture that doesn't match reality.

### Actual Prisma Models

| Model | Key Fields | Used By |
|-------|-----------|---------|
| **CacheConfig** | id, tenantId, cacheType (enum), key, ttlSeconds, tags[], deletedAt | CacheConfigService, CacheWarmerService |
| **CacheInvalidationRule** | id, tenantId, triggerEvent, cachePattern, invalidationType, isEnabled, deletedAt | InvalidationService, CacheConfigService |
| **CacheStats** | id, tenantId?, statDate, statHour, cacheType, hits, misses, sets, deletes, expirations, keysCount?, memoryBytes?, deletedAt | CacheStatsService |
| **DistributedLock** | id, tenantId?, lockKey, holderId, acquiredAt, expiresAt, releasedAt?, purpose?, deletedAt | DistributedLockService |
| **RateLimit** | id, tenantId?, scope (enum), identifier, maxRequests, windowSeconds, currentRequests, windowStartsAt, deletedAt | RateLimitService |

### Actual Prisma Enums

| Enum | Values |
|------|--------|
| **CacheType** | ENTITY, QUERY, SESSION, CONFIG |
| **RateLimitScope** | USER, TENANT, IP, GLOBAL |

### Architecture: Hybrid, Not Redis-Only

The service is a **Prisma+Redis hybrid:**
- **Prisma** stores: configuration, invalidation rules, stats (hourly), lock records, rate limit state
- **Redis** used for: actual cache operations (ping, keys, deleteByPattern, setJson), lock release (DEL)

This is actually more robust than pure Redis — configuration and stats survive Redis restarts.

---

## Phase 3: Security Audit

### JwtAuthGuard: 4/4 (100%) ✅

All 4 controllers use `@UseGuards(JwtAuthGuard)` at controller level.

### RolesGuard: 0/4 (0%) — No @Roles at all

| Controller | RolesGuard | @Roles |
|-----------|-----------|--------|
| CacheConfigController | ❌ | ❌ None |
| LocksController | ❌ | ❌ None |
| CacheManagementController | ❌ | ❌ None |
| RateLimitController | ❌ | ❌ None |

**Any authenticated user can flush caches, force-release locks, and reset rate limits.** Hub correctly flags this as P1.

### Tenant Isolation: 8/20 endpoints missing tenantId

| Controller | Endpoint | tenantId? | Risk |
|-----------|---------|-----------|------|
| CacheConfig | GET /config | ✅ | |
| CacheConfig | PUT /config/:key | ✅ | |
| CacheConfig | GET /invalidation-rules | ✅ | |
| CacheConfig | POST /invalidation-rules | ✅ | |
| CacheConfig | DELETE /invalidation-rules/:id | ✅ | |
| Locks | GET / | ✅ | |
| Locks | GET /history/all | ❌ | **P1: Cross-tenant lock history** |
| Locks | GET /:key | ❌ | **P1: Cross-tenant lock details** |
| Locks | DELETE /:key | ❌ | **P0: Can release other tenant's locks** |
| Management | GET /health | N/A | No tenant data |
| Management | GET /stats | ✅ | |
| Management | GET /keys | ❌ | **P0: Shows ALL Redis keys across tenants** |
| Management | DELETE /keys/:pattern | ❌ | **P0: Can delete any tenant's cache** |
| Management | POST /invalidate | ✅ | |
| Management | POST /warm | ✅ | |
| RateLimit | GET / | ✅ | |
| RateLimit | GET /:key | ❌ | **P1: Cross-tenant rate limit read** |
| RateLimit | PUT /:key | ✅ | |
| RateLimit | GET /usage | ❌ | **P1: Cross-tenant usage read** |
| RateLimit | POST /:key/reset | ❌ | **P1: Can reset other tenant's limits** |

### Soft-Delete Compliance: 0/5 (0%)

All 5 Prisma models have `deletedAt` columns but **no service filters by `deletedAt: null`.**

### Hard-Delete Violations: 1

- `InvalidationService.deleteRule()` uses `prisma.cacheInvalidationRule.deleteMany()` — hard delete

---

## Phase 4: Test Verification

**Hub claims: "Partial — 6 spec files"**
**Actual: 8 spec files, 38 tests, ~676 LOC**

| Spec File | Tests | LOC |
|----------|-------|-----|
| cache-config.service.spec.ts | 4 | 80 |
| invalidation.service.spec.ts | 6 | 103 |
| distributed-lock.service.spec.ts | 4 | 57 |
| cache-management.service.spec.ts | 6 | 93 |
| rate-limit.guard.spec.ts | 3 | 55 |
| rate-limit.service.spec.ts | 7 | 138 |
| cache-stats.service.spec.ts | 6 | 102 |
| cache-warmer.service.spec.ts | 2 | 48 |
| **Total** | **38** | **~676** |

Hub undercounts by 2 files but is directionally correct ("Partial" — not a false "None" claim).

---

## Phase 5: Architecture & Bug Review

### Confirmed Bugs

| # | Bug | Severity | File | Line |
|---|-----|----------|------|------|
| 1 | **Rate limit route conflict:** `GET /:key` defined before `GET /usage` — `/usage` captured as `key="usage"` | P2 | rate-limit.controller.ts | 28, 42 |
| 2 | **isEnabled DTO field silently ignored:** Accepted by validation but never applied in updateConfig() | P2 | cache-config.service.ts | 20-28 |
| 3 | **InvalidationListener is no-op:** Receives wildcard events but never triggers rule-based invalidation | P2 | invalidation.listener.ts | 14-17 |
| 4 | **CacheWarmerService is shallow:** Writes `{ warmedAt: timestamp }` instead of actual entity data | P2 | cache-warmer.service.ts | 24 |
| 5 | **deleteRule() is hard delete** | P2 | invalidation.service.ts | 52 |
| 6 | **listKeys() exposes all tenants' keys** | P0 | cache-management.controller.ts | 37-39 |
| 7 | **deleteByPattern() can delete any tenant's cache** | P0 | cache-management.controller.ts | 46-48 |
| 8 | **forceRelease() can release other tenant's locks** | P0 | locks.controller.ts | 46-48 |

### Module Exports: Nothing

```typescript
@Module({ ... })
export class CacheModule {}
```

No services exported. Hub Section 15 claims "ALL services consume cache internally" — impossible without exports. Other modules cannot import CacheStatsService, RateLimitGuard, etc.

### Hub Known Issues Assessment

| # | Hub Issue | Accurate? | Notes |
|---|----------|-----------|-------|
| 1 | No RBAC on cache management endpoints | ✅ TRUE | 0/4 RolesGuard confirmed |
| 2 | No frontend | ✅ TRUE | Confirmed |
| 3 | Cache stats not persisted — lost on Redis restart | ❌ **FALSE** | Stats ARE in Prisma (CacheStats model) |
| 4 | Rate limit usage endpoint conflicts with :key | ✅ TRUE | Confirmed — route order bug |
| 5 | No per-tenant cache memory limits | ✅ TRUE | No quotas |
| 6 | Lock history not persisted — in-memory only | ❌ **FALSE** | Locks ARE in Prisma (DistributedLock model) |
| 7 | No alerting when cache hit ratio drops | ✅ TRUE | Not built |

**Known issues accuracy: 5/7 (71%).** 2 wrong due to cascading "No Prisma models" error.

### DTO Inventory

4 DTOs in `dto/cache.dto.ts`:
- InvalidateCacheDto (tags?, pattern?, tenantId?)
- UpdateRateLimitDto (requestsPerMinute?, requestsPerHour?, requestsPerDay?, scope?, isEnabled?)
- CreateInvalidationRuleDto (triggerEvent, cachePattern, invalidationType)
- UpdateCacheConfigDto (ttlSeconds?, tags?, isEnabled?)

### EventEmitter Events

| Event | Emitter | Context |
|-------|---------|---------|
| `cache.invalidated` | CacheManagementService | On pattern delete |
| `cache.invalidated` | InvalidationService | On pattern or tag invalidation |
| `*.created` / `*.updated` / `*.deleted` | InvalidationListener (receiver) | Wildcard — but no-op |

### LOC Summary

| Category | Files | LOC |
|----------|-------|-----|
| Source | 15 | ~836 |
| Spec | 8 | ~676 |
| **Total** | **23** | **~1,512** |

No .bak directory. Frontend "Not Built" confirmed 100% accurate.

---

## Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Endpoint accuracy | 10/10 | 20=20, 17th consecutive perfect match |
| Path accuracy | 10/10 | ~100% |
| Data model accuracy | 0/10 | Hub claims "No Prisma models" — 5 exist + 2 enums |
| Security (JwtAuthGuard) | 10/10 | 4/4 controllers |
| Security (RolesGuard) | 0/10 | 0/4, no @Roles at all |
| Tenant isolation | 4/10 | 12/20 endpoints tenant-scoped, 8 leak |
| Soft-delete compliance | 0/10 | 0/5 models filtered + 1 hard delete |
| Test coverage | 7/10 | 38 tests / 8 spec files, good service coverage |
| Code quality | 7/10 | Clean separation, but stubs and dead code |
| Architecture | 6/10 | Hybrid design good, but no exports, stubs |
| Hub accuracy | 3/10 | Data model 0%, known issues 71%, tests undercount |

**Overall: 7.0/10 (was 3.0/10, delta +4.0)**

---

## Action Items

| # | Action | Priority | Effort |
|---|--------|----------|--------|
| 1 | Add RolesGuard + @Roles('SUPER_ADMIN') to all 4 controllers | P1 | S (2h) |
| 2 | Add tenantId to LocksController history/lockDetails/forceRelease | P1 | S (1h) |
| 3 | Add tenantId scoping to listKeys() and deleteByPattern() | P0 | S (1h) |
| 4 | Add tenantId to RateLimitController get/usage/reset | P1 | S (1h) |
| 5 | Add `deletedAt: null` filter to all 5 model queries | P2 | S (1h) |
| 6 | Change deleteRule() to soft delete (set deletedAt) | P2 | XS (30m) |
| 7 | Fix rate limit route conflict: move `usage` before `:key` | P2 | XS (15m) |
| 8 | Wire isEnabled field in updateConfig() | P2 | XS (15m) |
| 9 | Implement InvalidationListener rule matching (or remove stub) | P3 | M (3h) |
| 10 | Implement real CacheWarmerService data preloading | P3 | M (4h) |
| 11 | Export key services (RateLimitGuard, CacheStatsService, DistributedLockService) from module | P2 | XS (15m) |
| 12 | Update hub Section 8 — document 5 Prisma models + 2 enums | P1 | S (1h) |
| 13 | Fix hub known issues 3 and 6 (stats and locks ARE Prisma-persisted) | P2 | XS (15m) |

---

## Cross-Cutting Findings

1. **Worst data model error of all 32 services** — 0% accuracy (previous worst: Config at ~33%). The "No Prisma models" claim cascades into 2 wrong known issues.
2. **17th consecutive endpoint count perfect match** (since PST-15 Contracts — every service has been 100%).
3. **BATCH 5 COMPLETE** (10/10 services done). All P3 Future services audited.
4. Hub test claim "Partial" is approximately correct — second non-false test claim after Config.
