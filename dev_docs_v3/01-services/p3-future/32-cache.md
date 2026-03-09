# Service Hub: Cache (32)

> **Priority:** P3 Future | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-09 (PST-32 tribunal)
> **Original definition:** `dev_docs/02-services/` (cache service)
> **Design specs:** `dev_docs/12-Rabih-design-Process/37-cache/` (5 files)
> **Backend module:** `apps/api/src/modules/cache/`
> **Tribunal file:** `dev_docs_v3/05-audit/tribunal/per-service/PST-32-cache.md`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | B- (7.0/10) |
| **Confidence** | High — code-verified via PST-32 tribunal |
| **Last Verified** | 2026-03-09 |
| **Backend** | Partial — 4 controllers, 20 endpoints, 8 services, ~836 LOC in `apps/api/src/modules/cache/` |
| **Frontend** | Not Built — no pages, no components, no hooks |
| **Tests** | Partial — 8 spec files, 38 tests, ~676 LOC |
| **Scope** | Hybrid Prisma+Redis cache management; configuration, stats, locks, and rate limits persisted in Prisma; actual cache ops via Redis |
| **Active Sprint** | None — P3 Future |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Original service def in dev_docs |
| Design Specs | Done | 5 files in `dev_docs/12-Rabih-design-Process/37-cache/` |
| Backend Controllers | Partial | 4 controllers: CacheConfigController, LocksController, CacheManagementController, RateLimitController |
| Backend Services | Partial | 8 services: CacheConfigService, InvalidationService, DistributedLockService, CacheManagementService, RateLimitService, CacheStatsService, CacheWarmerService, InvalidationListener |
| Sub-modules | Partial | config/, dto/, invalidation/, locking/, management/, rate-limiting/, stats/, warming/ |
| Prisma Models | Partial | 5 models (CacheConfig, CacheInvalidationRule, CacheStats, DistributedLock, RateLimit) + 2 enums (CacheType, RateLimitScope) |
| Frontend Pages | Not Built | |
| React Hooks | Not Built | |
| Components | Not Built | |
| Tests | Partial | 8 spec files, 38 tests (~676 LOC): cache-config, invalidation, distributed-lock, cache-management, rate-limit.guard, rate-limit.service, cache-stats, cache-warmer |

---

## 3. Screens

| Screen | Route | Status | Notes |
|--------|-------|--------|-------|
| Cache Dashboard | `/admin/cache` | Not Built | Hit/miss ratios, memory usage, key counts |
| Cache Management | `/admin/cache/management` | Not Built | Browse keys, flush, inspect values |
| Cache Settings | `/admin/cache/settings` | Not Built | TTL configs, invalidation rules |
| Cache Reports | `/admin/cache/reports` | Not Built | Historical stats, performance trends |

---

## 4. API Endpoints

### CacheConfigController (`/api/v1/cache`) — 5 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/cache/config` | Partial | List cache configs (tenant-scoped) |
| PUT | `/api/v1/cache/config/:key` | Partial | Update cache config (TTL, tags, enabled) — note: isEnabled DTO field accepted but silently ignored |
| GET | `/api/v1/cache/invalidation-rules` | Partial | List invalidation rules (tenant-scoped) |
| POST | `/api/v1/cache/invalidation-rules` | Partial | Create invalidation rule (trigger + pattern + type) |
| DELETE | `/api/v1/cache/invalidation-rules/:id` | Partial | Delete invalidation rule — **BUG: hard delete, should soft-delete** |

### LocksController (`/api/v1/cache/locks`) — 4 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/cache/locks` | Partial | List active distributed locks (tenant-scoped) |
| GET | `/api/v1/cache/locks/history/all` | Partial | Lock history — **missing tenantId (cross-tenant leak)** |
| GET | `/api/v1/cache/locks/:key` | Partial | Lock details by key — **missing tenantId (cross-tenant leak)** |
| DELETE | `/api/v1/cache/locks/:key` | Partial | Force release a lock — **P0: missing tenantId (can release other tenant's locks)** |

### CacheManagementController (`/api/v1/cache`) — 6 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/cache/health` | Partial | Redis connection health check (no tenant data) |
| GET | `/api/v1/cache/stats` | Partial | Cache stats for tenant (hits, misses, memory) — tenant-scoped |
| GET | `/api/v1/cache/keys` | Partial | List cache keys — **P0: shows ALL Redis keys across tenants** |
| DELETE | `/api/v1/cache/keys/:pattern` | Partial | Delete keys by glob pattern — **P0: can delete any tenant's cache** |
| POST | `/api/v1/cache/invalidate` | Partial | Invalidate by tags and/or pattern (tenant-scoped) |
| POST | `/api/v1/cache/warm` | Partial | Trigger cache warming — writes stub `{ warmedAt: timestamp }` not real data |

### RateLimitController (`/api/v1/cache/rate-limits`) — 5 endpoints

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/cache/rate-limits` | Partial | List rate limit configs (tenant-scoped) |
| GET | `/api/v1/cache/rate-limits/:key` | Partial | Get rate limit by key — **missing tenantId (cross-tenant leak)** |
| PUT | `/api/v1/cache/rate-limits/:key` | Partial | Update rate limit (requests per min/hour/day, scope, enabled) — tenant-scoped |
| GET | `/api/v1/cache/rate-limits/usage` | Partial | Current usage — **BUG: route conflict with `:key` param** + **missing tenantId** |
| POST | `/api/v1/cache/rate-limits/:key/reset` | Partial | Reset rate limit counter — **missing tenantId (can reset other tenant's limits)** |

**Total: 20 endpoints across 4 controllers**

**Security summary:** JwtAuthGuard 4/4 (100%). RolesGuard 0/4 (0%) — no @Roles decorators at all. Tenant isolation: 12/20 endpoints scoped, 8/20 missing tenantId.

---

## 5. Components

No frontend components built.

| Component | Path | Status | Notes |
|-----------|------|--------|-------|
| CacheStatsCard | -- | Not Built | Hit/miss ratio gauge, memory usage |
| CacheKeyBrowser | -- | Not Built | Key list with pattern search, value inspect |
| CacheConfigTable | -- | Not Built | TTL settings per cache namespace |
| InvalidationRulesTable | -- | Not Built | Trigger event to cache pattern rules |
| DistributedLocksTable | -- | Not Built | Active locks, force release action |
| RateLimitTable | -- | Not Built | Per-endpoint rate limit configs |
| RateLimitUsageChart | -- | Not Built | Usage vs limit visualization |
| CacheWarmButton | -- | Not Built | Trigger warming with status feedback |

---

## 6. Hooks

No frontend hooks built.

| Hook | Endpoints Used | Notes |
|------|---------------|-------|
| `useCacheStats` | `/cache/stats`, `/cache/health` | Polling-based stats |
| `useCacheKeys` | `/cache/keys` | Pattern-filtered key list |
| `useCacheConfig` | `/cache/config` | TTL and tag configs |
| `useInvalidationRules` | `/cache/invalidation-rules` | CRUD for rules |
| `useDistributedLocks` | `/cache/locks` | Active locks list |
| `useRateLimits` | `/cache/rate-limits` | Rate limit configs and usage |

---

## 7. Business Rules

1. **Cache Invalidation — TTL Strategy:** Every cached entry has a configurable TTL (1 second to 86,400 seconds / 24 hours). TTL is set per cache namespace via `UpdateCacheConfigDto`. When TTL expires, Redis automatically evicts the key. Default TTLs should be conservative (5 minutes for list queries, 15 minutes for reference data, 60 seconds for dashboards).

2. **Cache Invalidation — Event-Based Strategy:** The `InvalidationService` listens for domain events (e.g., `load.updated`, `carrier.created`) via the `InvalidationListener`. **Note:** InvalidationListener is currently a no-op stub — receives wildcard events but never triggers rule-based invalidation. Rules are tenant-scoped and managed via the `/invalidation-rules` CRUD endpoints.

3. **Distributed Locking (Prisma+Redis Hybrid):** The `DistributedLockService` provides mutex locks. Lock records are persisted in Prisma (`DistributedLock` model) with Redis used for actual lock release (DEL). Locks have a configurable TTL to prevent deadlocks if the holder crashes. Use cases: load assignment (prevent double-booking), invoice number generation (sequential guarantee), batch operations (prevent concurrent runs). Force-release is available via admin API for stuck locks.

4. **Rate Limiting (Per Tenant, Per Endpoint):** The `RateLimitService` enforces request limits with state persisted in Prisma (`RateLimit` model). Rate limits are configurable at four scopes: `USER` (per authenticated user), `TENANT` (per tenant aggregate), `IP` (per source IP), `GLOBAL` (system-wide). Each rate limit key can have independent `requestsPerMinute`, `requestsPerHour`, and `requestsPerDay` thresholds. The `RateLimitGuard` is a NestJS guard that can be applied to any controller endpoint via decorator. When a limit is exceeded, the guard returns HTTP 429 with a `Retry-After` header.

5. **Cache Warming (Preload Hot Data):** The `CacheWarmerService` preloads data into Redis on application startup or on-demand via `POST /cache/warm`. **Note:** Current implementation is shallow — writes `{ warmedAt: timestamp }` instead of actual entity data. Warming configuration is stored in Prisma (`CacheConfig` model).

6. **Cache Stats and Monitoring:** The `CacheStatsService` tracks hit/miss ratios, memory consumption, key counts, and eviction rates per tenant namespace. Stats are **persisted in Prisma** (`CacheStats` model with hourly granularity) — they survive Redis restarts. Stats are available via `GET /cache/stats` (tenant-scoped). The `GET /cache/health` endpoint returns Redis connection status (connected, latency, memory usage, connected clients).

7. **Management API (Flush, Inspect, Resize):** Admin users can browse all cache keys via `GET /cache/keys?pattern=*`, inspect individual key values, and bulk-delete keys by glob pattern via `DELETE /cache/keys/:pattern`. This is intended as a SUPER_ADMIN-only operation in production **but currently has no RBAC enforcement**. Pattern-based deletion supports Redis glob syntax (`*`, `?`, `[...]`). There is no "flush all" endpoint by design.

8. **Multi-Tenant Isolation (Incomplete):** All cache keys SHOULD be prefixed with `tenant:{tenantId}:` to prevent cross-tenant data leakage. However, **8/20 endpoints are missing tenantId scoping** — see endpoint notes above. The CacheConfigService and CacheManagementService (invalidate/warm) are tenant-scoped, but listKeys, deleteByPattern, lock history/details/forceRelease, and rate limit get/usage/reset are not.

---

## 8. Data Model

### Prisma Models (5 models + 2 enums)

| Model | Key Fields | Used By |
|-------|-----------|---------|
| **CacheConfig** | id, tenantId, cacheType (CacheType enum), key, ttlSeconds, tags[], deletedAt | CacheConfigService, CacheWarmerService |
| **CacheInvalidationRule** | id, tenantId, triggerEvent, cachePattern, invalidationType, isEnabled, deletedAt | InvalidationService, CacheConfigService |
| **CacheStats** | id, tenantId?, statDate, statHour, cacheType, hits, misses, sets, deletes, expirations, keysCount?, memoryBytes?, deletedAt | CacheStatsService |
| **DistributedLock** | id, tenantId?, lockKey, holderId, acquiredAt, expiresAt, releasedAt?, purpose?, deletedAt | DistributedLockService |
| **RateLimit** | id, tenantId?, scope (RateLimitScope enum), identifier, maxRequests, windowSeconds, currentRequests, windowStartsAt, deletedAt | RateLimitService |

### Prisma Enums

| Enum | Values |
|------|--------|
| **CacheType** | ENTITY, QUERY, SESSION, CONFIG |
| **RateLimitScope** | USER, TENANT, IP, GLOBAL |

### Architecture: Hybrid Prisma+Redis

- **Prisma** stores: configuration, invalidation rules, stats (hourly), lock records, rate limit state
- **Redis** used for: actual cache operations (ping, keys, deleteByPattern, setJson), lock release (DEL)

This is more robust than pure Redis — configuration and stats survive Redis restarts.

### DTOs (4 in `dto/cache.dto.ts`)

```
InvalidateCacheDto {
  tags?:     string[]    -- Tags to match for invalidation
  pattern?:  string      -- Glob pattern for key matching
  tenantId?: string      -- Optional tenant override
}

UpdateRateLimitDto {
  requestsPerMinute?: number (min: 1)
  requestsPerHour?:   number (min: 1)
  requestsPerDay?:    number (min: 1)
  scope?:             'USER' | 'TENANT' | 'IP' | 'GLOBAL'
  isEnabled?:         boolean
}

CreateInvalidationRuleDto {
  triggerEvent:     string              -- e.g., 'load.updated'
  cachePattern:     string              -- e.g., 'tenant:*:cache:loads:*'
  invalidationType: 'DELETE' | 'REFRESH'
}

UpdateCacheConfigDto {
  ttlSeconds?: number (1-86400)
  tags?:       string[]
  isEnabled?:  boolean
}
```

---

## 9. Validation Rules

| Field | Rule | Error Message |
|-------|------|--------------|
| `ttlSeconds` | IsInt, Min(1), Max(86400) | "TTL must be between 1 and 86400 seconds" |
| `requestsPerMinute` | IsInt, Min(1) | "Must be at least 1 request per minute" |
| `requestsPerHour` | IsInt, Min(1) | "Must be at least 1 request per hour" |
| `requestsPerDay` | IsInt, Min(1) | "Must be at least 1 request per day" |
| `scope` | IsIn(['USER', 'TENANT', 'IP', 'GLOBAL']) | "Invalid scope" |
| `triggerEvent` | IsString, required | "Trigger event is required" |
| `cachePattern` | IsString, required | "Cache pattern is required" |
| `invalidationType` | IsIn(['DELETE', 'REFRESH']) | "Must be DELETE or REFRESH" |
| `tags` | IsArray, IsString({ each: true }) | "Tags must be an array of strings" |
| `pattern` (keys) | IsString, optional | Defaults to `*` if not provided |
| `isEnabled` | IsBoolean, optional | "Must be true or false" |

---

## 10. Status States

### Cache Key Lifecycle
```
WARM (preloaded) --> ACTIVE (being read) --> STALE (TTL expired / event invalidated) --> EVICTED (removed from Redis)
ACTIVE --> INVALIDATED (manual or event-based deletion) --> EVICTED
```

### Distributed Lock Lifecycle
```
AVAILABLE --> ACQUIRED (SET NX succeeds) --> HELD (within TTL) --> RELEASED (explicit release)
HELD --> EXPIRED (TTL exceeded, auto-release)
HELD --> FORCE_RELEASED (admin action via DELETE /locks/:key)
```

### Rate Limit State
```
UNDER_LIMIT (counter < threshold) --> AT_LIMIT (counter == threshold) --> EXCEEDED (HTTP 429)
EXCEEDED --> RESET (window expires or manual reset via POST /rate-limits/:key/reset)
```

---

## 11. Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| **P0: 8/20 endpoints missing tenantId — cross-tenant cache deletion, lock manipulation, rate limit reset** | P0 Security | **Open** | listKeys, deleteByPattern, lock history/details/forceRelease, rate limit get/usage/reset |
| No RBAC on cache management endpoints — 0/4 controllers have RolesGuard, any authenticated user can flush | P1 Security | Open | All 4 controllers need @Roles('SUPER_ADMIN') |
| No frontend — admin has no visibility into cache health | P2 UX | Open | |
| Rate limit `usage` endpoint conflicts with `:key` param route — `/usage` captured as `key="usage"` | P2 Bug | Open | `rate-limit.controller.ts` lines 28, 42 |
| isEnabled DTO field silently ignored in updateConfig() | P2 Bug | Open | `cache-config.service.ts` lines 20-28 |
| InvalidationListener is a no-op stub — receives wildcard events but never triggers rule-based invalidation | P2 Bug | Open | `invalidation.listener.ts` lines 14-17 |
| CacheWarmerService is shallow — writes `{ warmedAt: timestamp }` instead of actual entity data | P2 Bug | Open | `cache-warmer.service.ts` line 24 |
| deleteRule() uses hard delete instead of soft delete | P2 Bug | Open | `invalidation.service.ts` line 52 |
| Soft-delete compliance 0/5 — all 5 Prisma models have deletedAt but no service filters by `deletedAt: null` | P2 Data | Open | |
| CacheModule exports nothing — other modules cannot import CacheStatsService, RateLimitGuard, etc. | P2 Architecture | Open | Hub Section 15 claim "ALL services consume cache internally" impossible without exports |
| No cache size limits per tenant (one tenant could consume all memory) | P2 Infra | Open | |
| No alerting when cache hit ratio drops below threshold | P3 Feature | Not Built | |

**Resolved Issues (closed during PST-32 tribunal):**
- ~~Cache stats not persisted — lost on Redis restart~~ — FALSE: Stats ARE in Prisma (`CacheStats` model with hourly granularity)
- ~~Lock history not persisted — in-memory only~~ — FALSE: Locks ARE in Prisma (`DistributedLock` model)

---

## 12. Tasks

### Completed
None — no tasks completed yet.

### Open (from PST-32 tribunal findings)

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CACHE-101 | Add tenantId scoping to listKeys() and deleteByPattern() in CacheManagementController | S (1h) | P0 |
| CACHE-102 | Add RolesGuard + @Roles('SUPER_ADMIN') to all 4 controllers | S (2h) | P1 |
| CACHE-103 | Add tenantId to LocksController history/lockDetails/forceRelease | S (1h) | P1 |
| CACHE-104 | Add tenantId to RateLimitController get/usage/reset | S (1h) | P1 |
| CACHE-105 | Fix rate-limit route conflict — move `usage` before `:key` | XS (15m) | P2 |
| CACHE-106 | Wire isEnabled field in updateConfig() | XS (15m) | P2 |
| CACHE-107 | Add `deletedAt: null` filter to all 5 model queries | S (1h) | P2 |
| CACHE-108 | Change deleteRule() to soft delete (set deletedAt) | XS (30m) | P2 |
| CACHE-109 | Export key services (RateLimitGuard, CacheStatsService, DistributedLockService) from CacheModule | XS (15m) | P2 |
| CACHE-110 | Add per-tenant cache memory limits | M (4h) | P2 |
| CACHE-111 | Implement InvalidationListener rule matching (or remove stub) | M (3h) | P3 |
| CACHE-112 | Implement real CacheWarmerService data preloading | M (4h) | P3 |
| CACHE-113 | Build Cache Dashboard screen (stats, health, key browser) | L (8h) | P3 |
| CACHE-114 | Build Cache Management screen (flush, inspect, invalidation rules) | L (6h) | P3 |
| CACHE-115 | Build Cache Settings screen (TTL configs, rate limits) | M (4h) | P3 |
| CACHE-116 | Write frontend hooks (useCacheStats, useRateLimits, etc.) | M (3h) | P3 |
| CACHE-117 | Add cache hit ratio alerting (threshold-based notifications) | M (3h) | P3 |

---

## 13. Design Links

| Screen | Spec | Path |
|--------|------|------|
| Service Overview | Full spec | `dev_docs/12-Rabih-design-Process/37-cache/00-service-overview.md` |
| Cache Dashboard | Full spec | `dev_docs/12-Rabih-design-Process/37-cache/01-cache-dashboard.md` |
| Cache Management | Full spec | `dev_docs/12-Rabih-design-Process/37-cache/02-cache-management.md` |
| Cache Settings | Full spec | `dev_docs/12-Rabih-design-Process/37-cache/03-cache-settings.md` |
| Cache Reports | Full spec | `dev_docs/12-Rabih-design-Process/37-cache/04-cache-reports.md` |

---

## 14. Delta vs Original Plan

| Original Plan | Actual | Delta |
|--------------|--------|-------|
| Cache management backend | 4 controllers, 20 endpoints, 8 services built | On track |
| Invalidation (TTL + event-based) | TTL works; event-based listener is a no-op stub | Partial |
| Distributed locking | Prisma+Redis hybrid locking with force-release | On track |
| Rate limiting | Per-user/tenant/IP/global scopes built; route conflict on usage | On track (minor bug) |
| Cache warming | Warmer service exists but writes stub data only | Partial |
| Cache stats monitoring | Stats persisted in Prisma (CacheStats model) — survives Redis restarts | On track |
| Frontend dashboard | Not built | Gap |
| Frontend management UI | Not built | Gap |
| RBAC on management endpoints | Missing — 0/4 RolesGuard, any auth user can flush | Gap (security) |
| Per-tenant memory limits | Not implemented | Gap |
| Multi-tenant isolation | 8/20 endpoints missing tenantId | Gap (security) |
| Module exports | Nothing exported — other modules cannot consume cache services | Gap (architecture) |

---

## 15. Dependencies

**Depends on:**
- Redis (actual cache operations — ping, keys, deleteByPattern, setJson, lock release)
- Prisma (configuration, stats, locks, rate limits, invalidation rules — 5 models)
- Auth (JwtAuthGuard on all 4 controllers, `CurrentTenant` and `CurrentUser` decorators)

**Depended on by:**
- **Currently: nothing** — CacheModule exports no services, so no other module can import them
- **Intended consumers (once exports added):** Auth (session storage), TMS Core (load list caching), Dispatch (real-time data caching), all API endpoints (rate limiting via RateLimitGuard), Load Assignment/Invoice Generation/Batch Operations (distributed locks)

**Breaking change risk:** LOW (currently) — since nothing is exported, no downstream breakage possible. Risk increases to MEDIUM once module exports are added and consumers depend on cache services.
