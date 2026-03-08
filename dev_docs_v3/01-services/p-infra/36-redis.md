# Service Hub: Redis Infrastructure (36)

> **Source of Truth** — dev_docs_v3 era | Last verified: 2026-03-07
> **Priority:** P3 Future (infrastructure — used by Cache, Scheduler, and WebSocket services)

---

## 1. Status Box

| Field | Value |
|-------|-------|
| **Health Score** | C (5/10) — infrastructure service, works internally |
| **Last Verified** | 2026-03-07 |
| **Backend** | Built — `apps/api/src/modules/redis/` (1 service, 0 controllers) |
| **Frontend** | N/A — no UI, infrastructure only |
| **Tests** | Has `redis.service.spec.ts` |
| **Note** | Low-level Redis wrapper. Cache module (32) provides the management API. |

---

## 2. Implementation Status

| Layer | Status | Notes |
|-------|--------|-------|
| Module | Built | `redis.module.ts` — NestJS module |
| Service | Built | `redis.service.ts` — Redis client wrapper |
| Tests | Partial | `redis.service.spec.ts` exists |
| Controllers | None | No REST endpoints — used internally |

---

## 3. Files

| File | Purpose |
|------|---------|
| `apps/api/src/modules/redis/redis.module.ts` | Module definition |
| `apps/api/src/modules/redis/redis.service.ts` | Redis client (get, set, del, pub/sub, locks) |
| `apps/api/src/modules/redis/redis.service.spec.ts` | Unit tests |

---

## 4. Business Rules

1. **Connection:** Uses `REDIS_URL` env var. Default: `redis://:redis_password@localhost:6379`.
2. **Operations:** Basic key-value (get/set/del), pub/sub for real-time events, distributed locking.
3. **Used For:** Session caching, rate limiting, distributed locks, real-time event broadcasting (WebSocket adapter).
4. **No Direct Access:** This module is injected into Cache, Scheduler, and WebSocket modules.

---

## 5. Dependencies

**Depends on:** Redis 7 (docker-compose.yml)

**Depended on by:** Cache service (32), Scheduler (24), WebSocket gateways (QS-001), Config (config caching)
