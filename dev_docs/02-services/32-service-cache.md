# 25 - Cache Service

| Field            | Value            |
| ---------------- | ---------------- |
| **Service ID**   | 25               |
| **Service Name** | Cache            |
| **Category**     | Platform         |
| **Module Path**  | `@modules/cache` |
| **Phase**        | A (MVP)          |
| **Weeks**        | 51-52            |
| **Priority**     | P2               |
| **Dependencies** | Auth             |

---

## Purpose

Centralized caching layer using Redis for high-performance data access, session management, rate limiting, and distributed locking. Provides consistent caching patterns across all services with automatic invalidation and cache warming strategies.

---

## Features

- **Application Cache** - Cache frequently accessed data
- **Session Storage** - Distributed session management
- **Rate Limiting** - API rate limit tracking
- **Distributed Locks** - Cross-instance coordination
- **Pub/Sub** - Real-time message broadcasting
- **Cache Invalidation** - Event-driven cache clearing
- **Cache Warming** - Pre-populate critical caches
- **Statistics** - Hit/miss ratios and performance
- **Namespacing** - Tenant-isolated cache keys
- **TTL Management** - Configurable expiration
- **Cache Tags** - Group-based invalidation
- **Fallback** - Graceful degradation on cache miss

---

## Cache Architecture

### Redis Cluster Configuration

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    Redis Cluster                        â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚   Master 1  â”‚   Master 2  â”‚   Master 3  â”‚   Master 4   â”‚
â”‚  (Slots 0-  â”‚ (Slots 4096-â”‚ (Slots 8192-â”‚(Slots 12288- â”‚
â”‚    4095)    â”‚    8191)    â”‚   12287)    â”‚   16383)     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Replica 1  â”‚  Replica 2  â”‚  Replica 3  â”‚  Replica 4   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Key Namespacing

```
{tenant_id}:{service}:{entity}:{id}

Examples:
tenant123:tms:order:abc-123
tenant123:carrier:profile:xyz-456
tenant123:session:user:usr-789
global:config:system
```

---

## Database Schema

```sql
-- Cache Configuration (for metadata, stats)
CREATE TABLE cache_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Cache Identity
    cache_key VARCHAR(200) NOT NULL UNIQUE,
    cache_type VARCHAR(50) NOT NULL,         -- ENTITY, QUERY, SESSION, CONFIG

    -- Configuration
    ttl_seconds INTEGER NOT NULL,
    is_tenant_specific BOOLEAN DEFAULT true,

    -- Warming
    warm_on_startup BOOLEAN DEFAULT false,
    warm_query TEXT,                         -- SQL to populate cache

    -- Tags
    tags JSONB DEFAULT '[]',

    -- Status
    is_enabled BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cache Statistics (for monitoring)
CREATE TABLE cache_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id),   -- NULL for global

    -- Period
    stat_date DATE NOT NULL,
    stat_hour INTEGER NOT NULL,              -- 0-23

    -- Metrics
    cache_type VARCHAR(50) NOT NULL,
    hits INTEGER DEFAULT 0,
    misses INTEGER DEFAULT 0,
    sets INTEGER DEFAULT 0,
    deletes INTEGER DEFAULT 0,
    expirations INTEGER DEFAULT 0,

    -- Size
    keys_count INTEGER,
    memory_bytes BIGINT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(tenant_id, stat_date, stat_hour, cache_type)
);

CREATE INDEX idx_cache_stats_date ON cache_stats(stat_date, stat_hour);

-- Rate Limit Configuration
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Limit Identity
    limit_key VARCHAR(100) NOT NULL UNIQUE,  -- api_requests, login_attempts
    description TEXT,

    -- Limits
    requests_per_minute INTEGER,
    requests_per_hour INTEGER,
    requests_per_day INTEGER,

    -- Scope
    scope VARCHAR(20) NOT NULL,              -- USER, TENANT, IP, GLOBAL

    -- Response
    exceeded_status_code INTEGER DEFAULT 429,
    exceeded_message TEXT,

    -- Status
    is_enabled BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cache Invalidation Rules
CREATE TABLE cache_invalidation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Trigger
    trigger_event VARCHAR(100) NOT NULL,     -- order.updated, carrier.approved

    -- Cache to Invalidate
    cache_pattern VARCHAR(200) NOT NULL,     -- Pattern with wildcards
    invalidation_type VARCHAR(20) NOT NULL,  -- DELETE, REFRESH

    -- Status
    is_enabled BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Distributed Lock Records (for auditing)
CREATE TABLE distributed_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Lock Details
    lock_key VARCHAR(200) NOT NULL,
    holder_id VARCHAR(100) NOT NULL,

    -- Timing
    acquired_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    released_at TIMESTAMPTZ,

    -- Context
    purpose TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dist_locks_key ON distributed_locks(lock_key, acquired_at DESC);
```

---

## Cache Patterns

### Entity Cache

```typescript
// Cache single entity
const order = await cache.get(
  `order:${orderId}`,
  async () => {
    return await orderRepo.findById(orderId);
  },
  { ttl: 300 }
);

// Cache with tags for group invalidation
await cache.set(`order:${orderId}`, order, {
  ttl: 300,
  tags: [`tenant:${tenantId}`, `customer:${customerId}`],
});
```

### Query Cache

```typescript
// Cache query results
const recentOrders = await cache.getQuery(
  `recent_orders:${tenantId}:${status}`,
  async () => {
    return await orderRepo.findRecent(tenantId, status);
  },
  { ttl: 60 }
);
```

### Session Cache

```typescript
// Store session
await cache.setSession(
  sessionId,
  {
    userId,
    tenantId,
    permissions,
    expiresAt,
  },
  { ttl: 86400 }
);

// Get session
const session = await cache.getSession(sessionId);
```

### Rate Limiting

```typescript
// Check rate limit
const result = await cache.checkRateLimit({
  key: `api:${userId}`,
  limit: 100,
  window: 60, // seconds
});

if (result.exceeded) {
  throw new RateLimitExceeded(result.retryAfter);
}
```

### Distributed Lock

```typescript
// Acquire lock
const lock = await cache.acquireLock(`process:order:${orderId}`, {
  ttl: 30000, // 30 seconds
  retries: 3,
  retryDelay: 100,
});

try {
  // Critical section
  await processOrder(orderId);
} finally {
  await lock.release();
}
```

---

## API Endpoints

### Cache Management

| Method | Endpoint                      | Description             |
| ------ | ----------------------------- | ----------------------- |
| GET    | `/api/v1/cache/stats`         | Get cache statistics    |
| GET    | `/api/v1/cache/keys`          | List cache keys (admin) |
| DELETE | `/api/v1/cache/keys/:pattern` | Delete keys by pattern  |
| POST   | `/api/v1/cache/invalidate`    | Invalidate by tags      |
| POST   | `/api/v1/cache/warm`          | Trigger cache warming   |
| GET    | `/api/v1/cache/health`        | Redis health check      |

### Rate Limits

| Method | Endpoint                               | Description             |
| ------ | -------------------------------------- | ----------------------- |
| GET    | `/api/v1/cache/rate-limits`            | List rate limit configs |
| GET    | `/api/v1/cache/rate-limits/:key`       | Get limit details       |
| PUT    | `/api/v1/cache/rate-limits/:key`       | Update limit            |
| GET    | `/api/v1/cache/rate-limits/usage`      | Current usage stats     |
| POST   | `/api/v1/cache/rate-limits/:key/reset` | Reset limit counter     |

### Configuration

| Method | Endpoint                               | Description             |
| ------ | -------------------------------------- | ----------------------- |
| GET    | `/api/v1/cache/config`                 | Get cache configs       |
| PUT    | `/api/v1/cache/config/:key`            | Update config           |
| GET    | `/api/v1/cache/invalidation-rules`     | List invalidation rules |
| POST   | `/api/v1/cache/invalidation-rules`     | Create rule             |
| DELETE | `/api/v1/cache/invalidation-rules/:id` | Delete rule             |

---

## Cached Entities

### High-Priority (Always Cached)

| Entity           | TTL | Invalidation     |
| ---------------- | --- | ---------------- |
| User Session     | 24h | On logout/update |
| User Permissions | 1h  | On role change   |
| Tenant Config    | 5m  | On config update |
| Feature Flags    | 1m  | On flag change   |
| System Config    | 10m | On update        |

### Medium-Priority (Frequently Accessed)

| Entity          | TTL | Invalidation      |
| --------------- | --- | ----------------- |
| Order           | 5m  | On order update   |
| Load            | 2m  | On status change  |
| Carrier Profile | 15m | On profile update |
| Company         | 30m | On company update |
| Rate Table      | 1h  | On rate update    |

### Low-Priority (Query Results)

| Query           | TTL | Invalidation      |
| --------------- | --- | ----------------- |
| Dashboard KPIs  | 5m  | Scheduled refresh |
| Recent Orders   | 1m  | On new order      |
| Available Loads | 30s | On load change    |
| Search Results  | 30s | On data change    |

---

## Events

### Published Events

| Event                 | Trigger          | Payload        |
| --------------------- | ---------------- | -------------- |
| `cache.hit`           | Cache hit        | Key, tenant    |
| `cache.miss`          | Cache miss       | Key, tenant    |
| `cache.invalidated`   | Keys invalidated | Pattern, count |
| `cache.warmed`        | Cache warmed     | Keys warmed    |
| `rate_limit.exceeded` | Limit hit        | Key, limit     |

### Subscribed Events

| Event                      | Action                      |
| -------------------------- | --------------------------- |
| `order.updated`            | Invalidate order cache      |
| `load.status_changed`      | Invalidate load cache       |
| `carrier.updated`          | Invalidate carrier cache    |
| `config.updated`           | Invalidate config cache     |
| `user.permissions_changed` | Invalidate permission cache |

---

## Business Rules

### Cache Behavior

1. **Tenant Isolation**: Cache keys prefixed with tenant ID
2. **Graceful Degradation**: Return stale data if Redis unavailable
3. **Write-Through**: Update cache on write operations
4. **Read-Through**: Populate cache on miss
5. **Expiration**: All keys must have TTL (max 24h default)

### Rate Limiting

1. **Sliding Window**: Use sliding window algorithm
2. **Burst Allowance**: 20% burst over limit
3. **Retry-After**: Return retry time in response
4. **Different Scopes**: User < Tenant < IP < Global

### Invalidation

1. **Pattern-Based**: Support wildcard patterns
2. **Tag-Based**: Invalidate by tags
3. **Event-Driven**: Subscribe to entity events
4. **Cascade**: Related entities invalidated together

### Locks

1. **TTL Required**: All locks must have expiration
2. **Automatic Release**: Release on process crash
3. **Retry Logic**: Configurable retry attempts
4. **Fairness**: Optional FIFO ordering

---

## Screens

| Screen             | Description                 |
| ------------------ | --------------------------- |
| Cache Dashboard    | Statistics and health       |
| Cache Explorer     | Browse/search keys (admin)  |
| Rate Limit Config  | Manage rate limits          |
| Invalidation Rules | Configure auto-invalidation |

---

## Configuration

### Environment Variables

```bash
# Redis Connection
REDIS_URL=redis://localhost:6379
REDIS_CLUSTER_ENABLED=false
REDIS_CLUSTER_NODES=

# Cache Settings
CACHE_DEFAULT_TTL_SECONDS=300
CACHE_MAX_TTL_SECONDS=86400
CACHE_KEY_PREFIX=3pl

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_DEFAULT_PER_MINUTE=100

# Distributed Locks
LOCK_DEFAULT_TTL_MS=30000
LOCK_RETRY_ATTEMPTS=3
LOCK_RETRY_DELAY_MS=100

# Session
SESSION_CACHE_TTL_SECONDS=86400

# Pub/Sub
PUBSUB_ENABLED=true
PUBSUB_CHANNEL_PREFIX=3pl

# Statistics
CACHE_STATS_ENABLED=true
CACHE_STATS_INTERVAL_SECONDS=60
```

### TTL Defaults by Type

| Cache Type | Default TTL |
| ---------- | ----------- |
| Session    | 24 hours    |
| Entity     | 5 minutes   |
| Query      | 1 minute    |
| Config     | 10 minutes  |
| Permission | 1 hour      |

---

## Monitoring

### Key Metrics

| Metric          | Description              | Alert Threshold |
| --------------- | ------------------------ | --------------- |
| Hit Ratio       | Hits / (Hits + Misses)   | < 80%           |
| Memory Usage    | Redis memory %           | > 80%           |
| Connection Pool | Active connections       | > 90%           |
| Latency p99     | 99th percentile response | > 10ms          |
| Evictions       | Keys evicted             | > 1000/hour     |

### Health Checks

```typescript
// Redis health check
{
  "status": "healthy",
  "redis": {
    "connected": true,
    "latency_ms": 1.2,
    "memory_used_mb": 256,
    "memory_max_mb": 1024,
    "keys_count": 45000
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] Cache key generation
- [ ] TTL calculation
- [ ] Tag-based invalidation
- [ ] Rate limit algorithm
- [ ] Lock acquisition/release
- [ ] Fallback behavior

### Integration Tests

- [ ] Redis connectivity
- [ ] Cache read/write
- [ ] Pub/Sub messaging
- [ ] Rate limit enforcement
- [ ] Distributed locking
- [ ] Cache warming

### E2E Tests

- [ ] Full cache lifecycle
- [ ] Rate limit scenarios
- [ ] Lock contention
- [ ] Failover handling

---

## Navigation

- **Previous:** [24 - Scheduler](../24-scheduler/README.md)
- **Next:** [26 - Help Desk](../26-help-desk/README.md)
- **Index:** [All Services](../README.md)
