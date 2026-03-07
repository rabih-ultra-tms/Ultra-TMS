# Service Hub: Cache (32)

> **Priority:** P3 Future | **Status:** Backend Partial, Frontend Not Built
> **Source of Truth** -- dev_docs_v3 | Last verified: 2026-03-07
> **Original definition:** `dev_docs/02-services/` (cache service)
> **Design specs:** `dev_docs/12-Rabih-design-Process/37-cache/` (5 files)
> **Backend module:** `apps/api/src/modules/cache/`

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | D+ (3/10) |
| **Confidence** | High -- code confirmed via scan |
| **Last Verified** | 2026-03-07 |
| **Backend** | Partial -- 4 controllers, 20 endpoints in `apps/api/src/modules/cache/` |
| **Frontend** | Not Built -- no pages, no components, no hooks |
| **Tests** | Partial -- spec files exist for services (6 spec files) |
| **Scope** | Redis cache management; used internally by all services |
| **Active Sprint** | None -- P3 Future |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Service Definition | Done | Original service def in dev_docs |
| Design Specs | Done | 5 files in `dev_docs/12-Rabih-design-Process/37-cache/` |
| Backend Controllers | Partial | 4 controllers: CacheConfigController, LocksController, CacheManagementController, RateLimitController |
| Backend Services | Partial | 6 services: CacheConfigService, InvalidationService, DistributedLockService, CacheManagementService, RateLimitService, CacheStatsService, CacheWarmerService |
| Sub-modules | Partial | config/, dto/, invalidation/, locking/, management/, rate-limiting/, stats/, warming/ |
| Prisma Models | None | No dedicated models -- all Redis-backed |
| Frontend Pages | Not Built | |
| React Hooks | Not Built | |
| Components | Not Built | |
| Tests | Partial | 6 spec files: cache-config, invalidation, distributed-lock, cache-management, rate-limit.guard, rate-limit.service, cache-stats, cache-warmer |

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

### CacheConfigController (`/api/v1/cache`)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/cache/config` | Partial | List cache configs (tenant-scoped) |
| PUT | `/api/v1/cache/config/:key` | Partial | Update cache config (TTL, tags, enabled) |
| GET | `/api/v1/cache/invalidation-rules` | Partial | List invalidation rules |
| POST | `/api/v1/cache/invalidation-rules` | Partial | Create invalidation rule (trigger + pattern + type) |
| DELETE | `/api/v1/cache/invalidation-rules/:id` | Partial | Delete invalidation rule |

### LocksController (`/api/v1/cache/locks`)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/cache/locks` | Partial | List active distributed locks (tenant-scoped) |
| GET | `/api/v1/cache/locks/history/all` | Partial | Lock history (optional key filter) |
| GET | `/api/v1/cache/locks/:key` | Partial | Lock details by key |
| DELETE | `/api/v1/cache/locks/:key` | Partial | Force release a lock |

### CacheManagementController (`/api/v1/cache`)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/cache/health` | Partial | Redis connection health check |
| GET | `/api/v1/cache/stats` | Partial | Cache stats for tenant (hits, misses, memory) |
| GET | `/api/v1/cache/keys` | Partial | List cache keys (optional pattern filter) |
| DELETE | `/api/v1/cache/keys/:pattern` | Partial | Delete keys by glob pattern |
| POST | `/api/v1/cache/invalidate` | Partial | Invalidate by tags and/or pattern |
| POST | `/api/v1/cache/warm` | Partial | Trigger cache warming (optional key filter) |

### RateLimitController (`/api/v1/cache/rate-limits`)

| Method | Path | Status | Notes |
|--------|------|--------|-------|
| GET | `/api/v1/cache/rate-limits` | Partial | List rate limit configs (tenant-scoped) |
| GET | `/api/v1/cache/rate-limits/:key` | Partial | Get rate limit by key |
| PUT | `/api/v1/cache/rate-limits/:key` | Partial | Update rate limit (requests per min/hour/day, scope, enabled) |
| GET | `/api/v1/cache/rate-limits/usage` | Partial | Current usage for a rate limit key |
| POST | `/api/v1/cache/rate-limits/:key/reset` | Partial | Reset rate limit counter |

**Total: 20 endpoints across 4 controllers**

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

1. **Cache Invalidation -- TTL Strategy:** Every cached entry has a configurable TTL (1 second to 86,400 seconds / 24 hours). TTL is set per cache namespace via `UpdateCacheConfigDto`. When TTL expires, Redis automatically evicts the key. Default TTLs should be conservative (5 minutes for list queries, 15 minutes for reference data, 60 seconds for dashboards).

2. **Cache Invalidation -- Event-Based Strategy:** The `InvalidationService` listens for domain events (e.g., `load.updated`, `carrier.created`) via the `InvalidationListener`. When a matching event fires, all cache keys matching the rule's `cachePattern` are invalidated. Invalidation type is either `DELETE` (remove immediately) or `REFRESH` (re-fetch and replace). Rules are tenant-scoped and managed via the `/invalidation-rules` CRUD endpoints.

3. **Distributed Locking (Redis-Based):** The `DistributedLockService` provides mutex locks using Redis SET with NX and PX options (atomic acquire). Locks have a configurable TTL to prevent deadlocks if the holder crashes. Lock keys are namespaced by tenant. Use cases: load assignment (prevent double-booking), invoice number generation (sequential guarantee), batch operations (prevent concurrent runs). Force-release is available via admin API for stuck locks.

4. **Rate Limiting (Per Tenant, Per Endpoint):** The `RateLimitService` enforces request limits using Redis sliding window counters. Rate limits are configurable at four scopes: `USER` (per authenticated user), `TENANT` (per tenant aggregate), `IP` (per source IP), `GLOBAL` (system-wide). Each rate limit key can have independent `requestsPerMinute`, `requestsPerHour`, and `requestsPerDay` thresholds. The `RateLimitGuard` is a NestJS guard that can be applied to any controller endpoint via decorator. When a limit is exceeded, the guard returns HTTP 429 with a `Retry-After` header.

5. **Cache Warming (Preload Hot Data):** The `CacheWarmerService` preloads frequently accessed data into Redis on application startup or on-demand via `POST /cache/warm`. Warming can target a specific key or warm all registered namespaces. Typical warming targets: truck types, system enums, tenant settings, active user sessions. Warming runs asynchronously and reports completion status. Cold-start performance improves by 60-80% when warming is properly configured.

6. **Cache Stats and Monitoring:** The `CacheStatsService` tracks hit/miss ratios, memory consumption, key counts, and eviction rates per tenant namespace. Stats are available via `GET /cache/stats` (tenant-scoped) and are intended for the Cache Dashboard screen. The `GET /cache/health` endpoint returns Redis connection status (connected, latency, memory usage, connected clients). Stats should be polled every 30 seconds on the dashboard, not via WebSocket (low priority data).

7. **Management API (Flush, Inspect, Resize):** Admin users can browse all cache keys via `GET /cache/keys?pattern=*`, inspect individual key values, and bulk-delete keys by glob pattern via `DELETE /cache/keys/:pattern`. This is a SUPER_ADMIN-only operation in production. Pattern-based deletion supports Redis glob syntax (`*`, `?`, `[...]`). There is no "flush all" endpoint by design -- deletion must be pattern-scoped to prevent accidental full cache wipe.

8. **Multi-Tenant Isolation:** All cache keys MUST be prefixed with `tenant:{tenantId}:` to prevent cross-tenant data leakage. The `CacheConfigService`, `CacheManagementService`, and `RateLimitService` all accept `tenantId` from the JWT context. A tenant's cache operations can never affect another tenant's cached data.

---

## 8. Data Model

No Prisma models -- the Cache service is entirely Redis-backed.

### Redis Key Patterns
```
tenant:{tenantId}:cache:{namespace}:{key}    -- Cached data
tenant:{tenantId}:lock:{resource}:{id}       -- Distributed locks
tenant:{tenantId}:ratelimit:{scope}:{key}    -- Rate limit counters
tenant:{tenantId}:stats:{namespace}          -- Cache statistics
cache:config:{tenantId}:{namespace}          -- Cache configuration
cache:rules:{tenantId}:{ruleId}              -- Invalidation rules
```

### DTOs

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

| Issue | Severity | File | Status |
|-------|----------|------|--------|
| No RBAC on cache management endpoints (any authenticated user can flush) | P1 Security | All 4 controllers | Open |
| No frontend -- admin has no visibility into cache health | P2 UX | -- | Open |
| Cache stats not persisted -- lost on Redis restart | P2 Data | `stats/cache-stats.service.ts` | Open |
| Rate limit `usage` endpoint conflicts with `:key` param route | P2 Bug | `rate-limiting/rate-limit.controller.ts` | Open |
| No cache size limits per tenant (one tenant could consume all memory) | P2 Infra | `management/cache-management.service.ts` | Open |
| Lock history not persisted -- in-memory only | P3 Data | `locking/distributed-lock.service.ts` | Open |
| No alerting when cache hit ratio drops below threshold | P3 Feature | -- | Not Built |

---

## 12. Tasks

### Backlog

| Task ID | Title | Effort | Priority |
|---------|-------|--------|----------|
| CACHE-101 | Add RBAC guards (SUPER_ADMIN only) to all cache management endpoints | S (2h) | P1 |
| CACHE-102 | Build Cache Dashboard screen (stats, health, key browser) | L (8h) | P3 |
| CACHE-103 | Build Cache Management screen (flush, inspect, invalidation rules) | L (6h) | P3 |
| CACHE-104 | Build Cache Settings screen (TTL configs, rate limits) | M (4h) | P3 |
| CACHE-105 | Fix rate-limit route conflict (`usage` vs `:key`) | S (1h) | P2 |
| CACHE-106 | Add per-tenant cache memory limits | M (4h) | P2 |
| CACHE-107 | Write frontend hooks (useCacheStats, useRateLimits, etc.) | M (3h) | P3 |
| CACHE-108 | Persist cache stats to time-series storage for historical trends | M (4h) | P3 |
| CACHE-109 | Add cache hit ratio alerting (threshold-based notifications) | M (3h) | P3 |

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
| Cache management backend | 4 controllers, 20 endpoints built | On track |
| Invalidation (TTL + event-based) | Both strategies implemented | On track |
| Distributed locking | Redis-based locking with force-release | On track |
| Rate limiting | Per-user/tenant/IP/global scopes built | On track |
| Cache warming | Warmer service with on-demand trigger | On track |
| Cache stats monitoring | Stats service exists, no persistence | Partial |
| Frontend dashboard | Not built | Gap |
| Frontend management UI | Not built | Gap |
| RBAC on management endpoints | Missing -- any auth user can flush | Gap (security) |
| Per-tenant memory limits | Not implemented | Gap |

---

## 15. Dependencies

**Depends on:**
- Redis (all cache operations, locks, rate limit counters, stats)
- Auth (JwtAuthGuard on all endpoints, `CurrentTenant` and `CurrentUser` decorators)

**Depended on by:**
- ALL services -- cache is consumed internally by every module that caches query results
- Auth (session storage, refresh token blacklist, lockout counters use Redis)
- TMS Core (load list caching, carrier lookup caching)
- Dispatch (real-time data caching for board views)
- Rate limiting is applied globally to protect all API endpoints
- Distributed locks used by Load Assignment, Invoice Generation, Batch Operations

**Breaking change risk:** MEDIUM -- cache is an infrastructure service. Changes to key patterns or TTL defaults affect all services. Rate limit changes affect API availability for all tenants.
