# Redis Module API Spec

**Module:** `apps/api/src/modules/redis/`
**Base path:** N/A — no HTTP controllers
**Type:** Infrastructure module only (no REST API)
**Infrastructure:** Redis 7 via Docker (`docker-compose.yml`)

---

## Purpose

`RedisModule` provides `RedisService` — a thin wrapper around the `ioredis` client. Other modules inject `RedisService` directly for caching, pub/sub, and distributed locks.

```typescript
// Usage pattern in other services
constructor(private readonly redis: RedisService) {}

// Cache a value
await this.redis.set(`${tenantId}:carriers:${id}`, JSON.stringify(carrier), 'EX', 300);

// Get cached value
const cached = await this.redis.get(`${tenantId}:carriers:${id}`);

// Pub/Sub for WebSocket events
await this.redis.publish('dispatch-events', JSON.stringify({ loadId, status }));
```

---

## No HTTP endpoints

This module exposes NO REST endpoints. For cache management via HTTP, see `cache.md` (CacheManagementController at `cache/`).

---

## Module structure

```
redis/
  redis.module.ts       — exports RedisService globally
  redis.service.ts      — ioredis wrapper with tenant-aware helpers
  redis.service.spec.ts — unit tests
```

---

## Connection config

```
REDIS_URL=redis://:redis_password@localhost:6379   # Docker default
REDIS_PASSWORD=redis_password                       # Docker default
```

---

## Key usage patterns across the app

| Consumer | Redis key pattern | Purpose |
|----------|-------------------|---------|
| Auth | `sessions:{userId}` | JWT refresh token blacklist |
| Cache | `{tenantId}:{entity}:{id}` | Entity caching |
| Rate limit | `ratelimit:{ip}:{endpoint}` | API rate limiting |
| WebSocket | `ws:dispatch:{tenantId}` | Real-time dispatch events |
| Locks | `lock:{resource}:{id}` | Distributed locks |
| Scheduler | `scheduler:{jobId}` | Job deduplication |

---

## Docker service

```yaml
# docker-compose.yml
redis:
  image: redis:7
  ports: ["6379:6379"]
  command: redis-server --requirepass redis_password
```
