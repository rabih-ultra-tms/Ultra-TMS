# 21 - Cache Service API Implementation

> **Service:** Cache  
> **Priority:** P2 - Medium  
> **Endpoints:** 20  
> **Dependencies:** Auth ✅  
> **Doc Reference:** [32-service-cache.md](../../02-services/32-service-cache.md)

---

## 📋 Overview

Centralized caching layer using Redis for high-performance data access, session management, rate limiting, and distributed locking. Provides consistent caching patterns across all services with automatic invalidation and cache warming strategies.

### Key Capabilities
- Application cache with tenant isolation
- Rate limiting with sliding window
- Distributed locks
- Cache invalidation rules
- Cache statistics and monitoring
- Pub/Sub messaging

---

## ✅ Pre-Implementation Checklist

- [ ] Auth service operational
- [ ] Redis cluster configured
- [ ] Database models exist in `schema.prisma`

---

## 🗄️ Database Models Reference

### CacheConfig Model
```prisma
model CacheConfig {
  id                String            @id @default(cuid())
  
  cacheKey          String            @unique
  cacheType         String            // ENTITY, QUERY, SESSION, CONFIG
  
  ttlSeconds        Int
  isTenantSpecific  Boolean           @default(true)
  
  warmOnStartup     Boolean           @default(false)
  warmQuery         String?           @db.Text
  
  tags              Json              @default("[]")
  
  isEnabled         Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
}
```

### CacheStats Model
```prisma
model CacheStats {
  id                String            @id @default(cuid())
  tenantId          String?
  
  statDate          DateTime          @db.Date
  statHour          Int               // 0-23
  
  cacheType         String
  hits              Int               @default(0)
  misses            Int               @default(0)
  sets              Int               @default(0)
  deletes           Int               @default(0)
  expirations       Int               @default(0)
  
  keysCount         Int?
  memoryBytes       BigInt?
  
  createdAt         DateTime          @default(now())
  
  tenant            Tenant?           @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, statDate, statHour, cacheType])
  @@index([statDate, statHour])
}
```

### RateLimit Model
```prisma
model RateLimit {
  id                String            @id @default(cuid())
  
  limitKey          String            @unique
  description       String?           @db.Text
  
  requestsPerMinute Int?
  requestsPerHour   Int?
  requestsPerDay    Int?
  
  scope             String            // USER, TENANT, IP, GLOBAL
  
  exceededStatusCode Int              @default(429)
  exceededMessage   String?
  
  isEnabled         Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
}
```

### CacheInvalidationRule Model
```prisma
model CacheInvalidationRule {
  id                String            @id @default(cuid())
  
  triggerEvent      String
  cachePattern      String
  invalidationType  String            // DELETE, REFRESH
  
  isEnabled         Boolean           @default(true)
  
  createdAt         DateTime          @default(now())
}
```

### DistributedLock Model (for auditing)
```prisma
model DistributedLock {
  id                String            @id @default(cuid())
  
  lockKey           String
  holderId          String
  
  acquiredAt        DateTime
  expiresAt         DateTime
  releasedAt        DateTime?
  
  purpose           String?           @db.Text
  
  createdAt         DateTime          @default(now())
  
  @@index([lockKey, acquiredAt])
}
```

---

## 🛠️ API Endpoints

### Cache Management (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cache/stats` | Get statistics |
| GET | `/api/v1/cache/keys` | List keys (admin) |
| DELETE | `/api/v1/cache/keys/:pattern` | Delete by pattern |
| POST | `/api/v1/cache/invalidate` | Invalidate by tags |
| POST | `/api/v1/cache/warm` | Trigger warming |
| GET | `/api/v1/cache/health` | Health check |

### Rate Limits (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cache/rate-limits` | List configs |
| GET | `/api/v1/cache/rate-limits/:key` | Get details |
| PUT | `/api/v1/cache/rate-limits/:key` | Update |
| GET | `/api/v1/cache/rate-limits/usage` | Usage stats |
| POST | `/api/v1/cache/rate-limits/:key/reset` | Reset counter |

### Configuration (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cache/config` | List configs |
| PUT | `/api/v1/cache/config/:key` | Update config |
| GET | `/api/v1/cache/invalidation-rules` | List rules |
| POST | `/api/v1/cache/invalidation-rules` | Create rule |
| DELETE | `/api/v1/cache/invalidation-rules/:id` | Delete rule |

### Locks (4 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/cache/locks` | List active locks |
| GET | `/api/v1/cache/locks/:key` | Get lock details |
| DELETE | `/api/v1/cache/locks/:key` | Force release |
| GET | `/api/v1/cache/locks/history` | Lock history |

---

## 📝 DTO Specifications

### InvalidateCacheDto
```typescript
export class InvalidateCacheDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  pattern?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
```

### UpdateRateLimitDto
```typescript
export class UpdateRateLimitDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  requestsPerMinute?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  requestsPerHour?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  requestsPerDay?: number;

  @IsOptional()
  @IsIn(['USER', 'TENANT', 'IP', 'GLOBAL'])
  scope?: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
```

### CreateInvalidationRuleDto
```typescript
export class CreateInvalidationRuleDto {
  @IsString()
  triggerEvent: string;

  @IsString()
  cachePattern: string;

  @IsIn(['DELETE', 'REFRESH'])
  invalidationType: string;
}
```

### UpdateCacheConfigDto
```typescript
export class UpdateCacheConfigDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(86400)
  ttlSeconds?: number;

  @IsOptional()
  @IsBoolean()
  warmOnStartup?: boolean;

  @IsOptional()
  @IsString()
  warmQuery?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
```

---

## 📋 Business Rules

### Cache Key Namespacing
```typescript
class CacheKeyBuilder {
  private tenantId: string;
  private service: string;
  
  build(entity: string, id: string): string {
    return `${this.tenantId}:${this.service}:${entity}:${id}`;
  }
  
  buildPattern(entity: string): string {
    return `${this.tenantId}:${this.service}:${entity}:*`;
  }
  
  static global(key: string): string {
    return `global:${key}`;
  }
}
```

### Rate Limiting Algorithm
```typescript
class RateLimiter {
  async checkLimit(
    key: string, 
    limit: number, 
    windowSeconds: number
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);
    
    // Sliding window algorithm using Redis sorted sets
    const pipe = this.redis.pipeline();
    pipe.zremrangebyscore(key, 0, windowStart);
    pipe.zadd(key, now, `${now}`);
    pipe.zcard(key);
    pipe.expire(key, windowSeconds);
    
    const results = await pipe.exec();
    const count = results[2][1] as number;
    
    const exceeded = count > limit;
    const remaining = Math.max(0, limit - count);
    
    return {
      exceeded,
      remaining,
      limit,
      resetAt: new Date(now + windowSeconds * 1000),
      retryAfter: exceeded ? windowSeconds : 0
    };
  }
}
```

### Distributed Locking
```typescript
class DistributedLockService {
  async acquireLock(
    key: string, 
    options: LockOptions
  ): Promise<Lock | null> {
    const lockKey = `lock:${key}`;
    const holderId = generateUniqueId();
    
    const acquired = await this.redis.set(
      lockKey, 
      holderId, 
      'PX', 
      options.ttlMs, 
      'NX'
    );
    
    if (!acquired) {
      if (options.retries > 0) {
        await sleep(options.retryDelay);
        return this.acquireLock(key, {
          ...options,
          retries: options.retries - 1
        });
      }
      return null;
    }
    
    return {
      key: lockKey,
      holderId,
      release: () => this.releaseLock(lockKey, holderId),
      extend: (ms: number) => this.extendLock(lockKey, holderId, ms)
    };
  }
  
  private async releaseLock(key: string, holderId: string): Promise<boolean> {
    // Lua script to ensure we only release our own lock
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    return await this.redis.eval(script, 1, key, holderId) === 1;
  }
}
```

### Cache Warming
```typescript
class CacheWarmer {
  async warmCache(configKey?: string): Promise<WarmResult> {
    const configs = await this.getWarmableConfigs(configKey);
    const results: WarmResult = { warmed: 0, failed: 0, errors: [] };
    
    for (const config of configs) {
      try {
        if (config.warmQuery) {
          const data = await this.prisma.$queryRawUnsafe(config.warmQuery);
          await this.cache.set(config.cacheKey, data, {
            ttl: config.ttlSeconds,
            tags: config.tags
          });
          results.warmed++;
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ key: config.cacheKey, error: error.message });
      }
    }
    
    return results;
  }
}
```

---

## 📡 Events to Publish

| Event | Trigger | Payload |
|-------|---------|---------|
| `cache.invalidated` | Keys deleted | `{ pattern, count }` |
| `cache.warmed` | Cache warmed | `{ keys }` |
| `rate_limit.exceeded` | Limit hit | `{ key, limit }` |
| `lock.acquired` | Lock acquired | `{ key, holderId }` |
| `lock.released` | Lock released | `{ key }` |

---

## 🔔 Events to Subscribe

| Event | Source | Action |
|-------|--------|--------|
| `order.updated` | TMS Core | Invalidate order cache |
| `carrier.updated` | Carrier | Invalidate carrier cache |
| `config.updated` | Config | Invalidate config cache |
| `user.permissions_changed` | Auth | Invalidate permission cache |
| `*.created`, `*.updated`, `*.deleted` | All | Apply invalidation rules |

---

## 🧪 Integration Test Requirements

```typescript
describe('Cache Service API', () => {
  describe('Cache Management', () => {
    it('should get cache statistics');
    it('should list cache keys');
    it('should delete keys by pattern');
    it('should invalidate by tags');
    it('should warm cache');
  });

  describe('Rate Limiting', () => {
    it('should track request count');
    it('should block when limit exceeded');
    it('should reset counter');
    it('should allow burst');
  });

  describe('Distributed Locking', () => {
    it('should acquire lock');
    it('should prevent concurrent locks');
    it('should release lock');
    it('should expire lock');
  });

  describe('Invalidation Rules', () => {
    it('should trigger on event');
    it('should delete matching keys');
    it('should refresh on REFRESH type');
  });
});
```

---

## 📁 Module Structure

```
apps/api/src/modules/cache/
├── cache.module.ts
├── management/
│   ├── cache-management.controller.ts
│   └── cache-management.service.ts
├── rate-limiting/
│   ├── rate-limit.controller.ts
│   ├── rate-limit.service.ts
│   └── rate-limit.guard.ts
├── locking/
│   ├── locks.controller.ts
│   └── distributed-lock.service.ts
├── config/
│   ├── cache-config.controller.ts
│   └── cache-config.service.ts
├── invalidation/
│   ├── invalidation-rules.controller.ts
│   ├── invalidation.service.ts
│   └── invalidation.listener.ts
├── warming/
│   └── cache-warmer.service.ts
├── stats/
│   └── cache-stats.service.ts
└── redis/
    ├── redis.module.ts
    └── redis.service.ts
```

---

## ✅ Completion Checklist

- [ ] All 20 endpoints implemented
- [ ] Redis integration working
- [ ] Cache get/set/delete operations
- [ ] Rate limiting with sliding window
- [ ] Distributed locking
- [ ] Cache invalidation rules
- [ ] Cache warming
- [ ] Statistics tracking
- [ ] All integration tests passing
- [ ] Tenant isolation verified

---

## 📊 Progress Tracker Update

### Update Service Row
```html
<tr>
    <td>34</td>
    <td>Cache</td>
    <td><span class="status"><span class="status-dot complete"></span> Complete</span></td>
    <td>20/20</td>
    <td>4/4</td>
    <td>100%</td>
    <td>Management, Rate Limits, Locks, Config</td>
</tr>
```

---

## 🔜 Next Step

➡️ **[22-hr-api.md](./22-hr-api.md)** - Implement HR Service API
