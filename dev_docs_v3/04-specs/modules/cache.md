# Cache Module API Spec

**Module:** `apps/api/src/modules/cache/`
**Base path:** `/api/v1/`
**Controllers:** CacheConfigController, LocksController, CacheManagementController, RateLimitController

## Auth

All controllers use `@UseGuards(JwtAuthGuard)` with `@CurrentTenant()`. No RolesGuard.

---

## CacheConfigController

**Path prefix:** `cache/config`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/cache/config` | JWT only | List cache configurations |
| POST | `/cache/config` | JWT only | Create cache configuration |
| GET | `/cache/config/:id` | JWT only | Get cache config by ID |
| PUT | `/cache/config/:id` | JWT only | Update cache config |
| DELETE | `/cache/config/:id` | JWT only | Delete cache config |
| GET | `/cache/config/invalidation-rules` | JWT only | List invalidation rules |
| POST | `/cache/config/invalidation-rules` | JWT only | Create invalidation rule |
| PUT | `/cache/config/invalidation-rules/:id` | JWT only | Update invalidation rule |
| DELETE | `/cache/config/invalidation-rules/:id` | JWT only | Delete invalidation rule |

---

## LocksController

**Path prefix:** `cache/locks`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/cache/locks` | JWT only | List active locks |
| GET | `/cache/locks/history` | JWT only | List lock history |
| GET | `/cache/locks/:id` | JWT only | Get lock details |
| POST | `/cache/locks/:id/force-release` | JWT only | Force release a lock |

---

## CacheManagementController

**Path prefix:** `cache`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/cache/health` | JWT only | Get cache health status |
| GET | `/cache/stats` | JWT only | Get cache statistics |
| GET | `/cache/keys` | JWT only | List cache keys |
| DELETE | `/cache/keys/:key` | JWT only | Delete cache key |
| POST | `/cache/invalidate` | JWT only | Invalidate cache entries |
| POST | `/cache/warm` | JWT only | Warm cache |

---

## RateLimitController

**Path prefix:** `cache/rate-limits`

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/cache/rate-limits` | JWT only | List rate limit configs |
| GET | `/cache/rate-limits/:id` | JWT only | Get rate limit config |
| PUT | `/cache/rate-limits/:id` | JWT only | Update rate limit config |
| GET | `/cache/rate-limits/:id/usage` | JWT only | Get rate limit usage |
| POST | `/cache/rate-limits/:id/reset` | JWT only | Reset rate limit counter |

---

## Known Issues

- No RolesGuard -- cache management endpoints accessible to all authenticated users (should be admin-only)
