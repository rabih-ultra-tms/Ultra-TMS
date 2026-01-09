# 80 - Performance & Caching Standards

**Optimization patterns for the 3PL Platform targeting p95 < 500ms**

---

## âš ï¸ CLAUDE CODE: Performance Requirements

1. **Target: p95 response time < 500ms** - SLA requirement
2. **Watch for N+1 queries** - Use Prisma includes/selects
3. **Cache expensive operations** - Redis for frequently accessed data
4. **Lazy load non-critical data** - Don't block initial render
5. **Monitor bundle size** - Target < 200KB initial JS

---

## Performance Targets

| Metric                   | Target  | Measurement     |
| ------------------------ | ------- | --------------- |
| API Response (p95)       | < 500ms | Server timing   |
| Time to First Byte       | < 200ms | Lighthouse      |
| First Contentful Paint   | < 1.5s  | Lighthouse      |
| Largest Contentful Paint | < 2.5s  | Lighthouse      |
| Time to Interactive      | < 3.5s  | Lighthouse      |
| Initial Bundle Size      | < 200KB | Bundle analyzer |

---

## Database Performance

### Preventing N+1 Queries

```typescript
// âŒ BAD - N+1 query pattern
async function getLoadsWithCarriers() {
  const loads = await prisma.load.findMany();

  // This makes N additional queries!
  for (const load of loads) {
    load.carrier = await prisma.carrier.findUnique({
      where: { id: load.carrierId },
    });
  }

  return loads;
}

// âœ… GOOD - Single query with include
async function getLoadsWithCarriers() {
  return prisma.load.findMany({
    include: {
      carrier: true,
    },
  });
}

// âœ… BETTER - Select only needed fields
async function getLoadsWithCarriers() {
  return prisma.load.findMany({
    select: {
      id: true,
      loadNumber: true,
      status: true,
      carrier: {
        select: {
          id: true,
          name: true,
          mcNumber: true,
        },
      },
    },
  });
}
```

### Database Indexes

```prisma
// schema.prisma - Essential indexes

model Load {
  id          String     @id @default(cuid())
  loadNumber  String
  status      LoadStatus
  pickupDate  DateTime
  carrierId   String?
  customerId  String
  tenantId    String
  createdAt   DateTime   @default(now())

  // Indexes for common queries
  @@index([tenantId, status])           // Filter by status
  @@index([tenantId, pickupDate])       // Date range queries
  @@index([tenantId, carrierId])        // Carrier's loads
  @@index([tenantId, customerId])       // Customer's loads
  @@index([tenantId, loadNumber])       // Search by load number
  @@index([tenantId, createdAt])        // Recent loads
}

model Carrier {
  id          String   @id @default(cuid())
  name        String
  mcNumber    String
  status      CarrierStatus
  tenantId    String

  @@index([tenantId, status])
  @@index([tenantId, mcNumber])
  @@index([tenantId, name])
  @@unique([tenantId, mcNumber])        // Prevent duplicates
}
```

### Query Optimization

```typescript
// Use cursor-based pagination for large datasets
async function getLoads(cursor?: string, limit = 20) {
  return prisma.load.findMany({
    take: limit + 1, // Get one extra to check if more exist
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0, // Skip cursor itself
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      loadNumber: true,
      status: true,
      // ... only needed fields
    },
  });
}

// Count queries separately (or cache)
async function getLoadCount(tenantId: string, status?: LoadStatus) {
  const cacheKey = `load-count:${tenantId}:${status || 'all'}`;

  const cached = await redis.get(cacheKey);
  if (cached) return parseInt(cached);

  const count = await prisma.load.count({
    where: { tenantId, status, deletedAt: null },
  });

  await redis.setex(cacheKey, 60, count.toString()); // Cache 1 minute
  return count;
}
```

---

## Redis Caching

### Cache Module Setup

```typescript
// apps/api/src/cache/cache.module.ts
import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        ttl: 300, // 5 minutes default
      }),
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
```

### Cache Service

```typescript
// apps/api/src/cache/cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  // Get with type safety
  async get<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key);
  }

  // Set with TTL
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cache.set(key, value, ttl);
  }

  // Delete specific key
  async del(key: string): Promise<void> {
    await this.cache.del(key);
  }

  // Delete by pattern (for invalidation)
  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.cache.store.keys(pattern);
    await Promise.all(keys.map((key) => this.cache.del(key)));
  }

  // Get or set pattern
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}
```

### Cache Keys Convention

```typescript
// lib/cache-keys.ts

export const cacheKeys = {
  // User/Auth
  user: (userId: string) => `user:${userId}`,
  userPermissions: (userId: string) => `user:${userId}:permissions`,

  // Tenant config
  tenantSettings: (tenantId: string) => `tenant:${tenantId}:settings`,
  tenantFeatures: (tenantId: string) => `tenant:${tenantId}:features`,

  // Entity counts
  carrierCount: (tenantId: string) => `count:${tenantId}:carriers`,
  loadCount: (tenantId: string, status?: string) =>
    `count:${tenantId}:loads:${status || 'all'}`,

  // Dashboard data
  dashboardOps: (tenantId: string) => `dashboard:${tenantId}:ops`,
  dashboardSales: (tenantId: string) => `dashboard:${tenantId}:sales`,

  // Lookup tables (long TTL)
  equipmentTypes: () => 'lookup:equipment-types',
  loadStatuses: () => 'lookup:load-statuses',
  states: () => 'lookup:states',

  // Rate tables
  rateTable: (tableId: string) => `rate-table:${tableId}`,
};

// TTL constants (seconds)
export const cacheTTL = {
  short: 60, // 1 minute - counts, dashboard
  medium: 300, // 5 minutes - user data, settings
  long: 3600, // 1 hour - lookup tables
  veryLong: 86400, // 24 hours - rarely changing data
};
```

### Cache Usage in Services

```typescript
// apps/api/src/modules/carrier/carrier.service.ts

@Injectable()
export class CarrierService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService
  ) {}

  async findOne(id: string, tenantId: string): Promise<Carrier> {
    const cacheKey = `carrier:${tenantId}:${id}`;

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const carrier = await this.prisma.carrier.findFirst({
          where: { id, tenantId, deletedAt: null },
          include: { contacts: true, insurance: true },
        });

        if (!carrier) {
          throw new NotFoundException('Carrier not found');
        }

        return carrier;
      },
      cacheTTL.medium
    );
  }

  async update(id: string, data: UpdateCarrierDto, tenantId: string) {
    const carrier = await this.prisma.carrier.update({
      where: { id },
      data,
    });

    // Invalidate cache
    await this.cache.del(`carrier:${tenantId}:${id}`);
    await this.cache.delByPattern(`count:${tenantId}:carriers*`);

    return carrier;
  }
}
```

### Cache Invalidation Patterns

```typescript
// When to invalidate

// 1. After CREATE - invalidate list/counts
await this.cache.delByPattern(`count:${tenantId}:carriers*`);

// 2. After UPDATE - invalidate specific item
await this.cache.del(`carrier:${tenantId}:${id}`);

// 3. After DELETE - invalidate item + list/counts
await this.cache.del(`carrier:${tenantId}:${id}`);
await this.cache.delByPattern(`count:${tenantId}:carriers*`);

// 4. After status change - invalidate related counts
await this.cache.del(`count:${tenantId}:loads:${previousStatus}`);
await this.cache.del(`count:${tenantId}:loads:${newStatus}`);
await this.cache.del(`count:${tenantId}:loads:all`);
```

---

## Frontend Performance

### Code Splitting

```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

// Charts (heavy library)
const RevenueChart = dynamic(() => import('@/components/charts/revenue-chart'), {
  loading: () => <Skeleton className="h-[300px]" />,
  ssr: false,
});

// Map (heavy library)
const TrackingMap = dynamic(() => import('@/components/tracking-map'), {
  loading: () => <Skeleton className="h-[500px]" />,
  ssr: false,
});

// PDF viewer
const DocumentViewer = dynamic(() => import('@/components/document-viewer'), {
  loading: () => <Skeleton className="h-[600px]" />,
  ssr: false,
});
```

### Route-Based Code Splitting

```typescript
// Next.js App Router does this automatically
// Each page is a separate chunk

// For shared components in layouts
// app/(dispatch)/layout.tsx
import { DispatchSidebar } from '@/components/dispatch-sidebar';

// This layout code only loads for /dispatch/* routes
```

### Image Optimization

```typescript
// Always use Next.js Image component
import Image from 'next/image';

// âœ… GOOD - Optimized with blur placeholder
<Image
  src={carrier.logoUrl}
  alt={`${carrier.name} logo`}
  width={100}
  height={100}
  placeholder="blur"
  blurDataURL="/placeholder.png"
  priority={false}  // Only true for above-the-fold
/>

// For dynamic images from S3
<Image
  src={document.thumbnailUrl}
  alt={document.filename}
  width={200}
  height={150}
  unoptimized  // If using external CDN
/>
```

### List Virtualization

```typescript
// For long lists, use virtualization
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedLoadList({ loads }: { loads: Load[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: loads.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72, // Estimated row height
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <LoadRow load={loads[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Debouncing & Throttling

```typescript
// hooks/use-debounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage in search
function CarrierSearch() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data } = useCarriers({ search: debouncedSearch });

  return (
    <Input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search carriers..."
    />
  );
}
```

### Memoization

```typescript
// Memoize expensive computations
const sortedLoads = useMemo(
  () => loads.sort((a, b) =>
    new Date(b.pickupDate).getTime() - new Date(a.pickupDate).getTime()
  ),
  [loads]
);

// Memoize callbacks passed to children
const handleRowClick = useCallback(
  (load: Load) => router.push(`/loads/${load.id}`),
  [router]
);

// Memoize components that receive stable props
const MemoizedLoadRow = memo(function LoadRow({ load, onClick }: Props) {
  return (
    <tr onClick={() => onClick(load)}>
      <td>{load.loadNumber}</td>
      <td>{load.status}</td>
    </tr>
  );
});
```

---

## API Response Optimization

### Pagination

```typescript
// Standard pagination response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Controller
@Get()
async findAll(
  @Query() query: ListQueryDto,
  @CurrentUser() user: CurrentUserData,
): Promise<PaginatedResponse<Carrier>> {
  const { page = 1, limit = 20 } = query;

  const [data, total] = await Promise.all([
    this.carrierService.findMany(query, user.tenantId),
    this.carrierService.count(query, user.tenantId),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### Field Selection

```typescript
// Allow clients to request specific fields
@Get()
async findAll(
  @Query('fields') fields?: string,  // e.g., "id,name,status"
) {
  const select = fields
    ? fields.split(',').reduce((acc, field) => ({ ...acc, [field]: true }), {})
    : undefined;

  return this.prisma.carrier.findMany({ select });
}
```

### Compression

```typescript
// main.ts - Enable compression
import compression from 'compression';

app.use(
  compression({
    threshold: 1024, // Only compress responses > 1KB
    level: 6, // Balance between speed and compression
  })
);
```

---

## Monitoring & Profiling

### Request Timing Middleware

```typescript
// middleware/timing.middleware.ts
@Injectable()
export class TimingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();

    res.on('finish', () => {
      const duration = Number(process.hrtime.bigint() - start) / 1_000_000;

      // Log slow requests
      if (duration > 500) {
        console.warn(
          `Slow request: ${req.method} ${req.url} - ${duration.toFixed(2)}ms`
        );
      }

      // Add timing header
      res.setHeader('X-Response-Time', `${duration.toFixed(2)}ms`);
    });

    next();
  }
}
```

### Database Query Logging

```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });

    if (process.env.NODE_ENV === 'development') {
      this.$on('query', (e) => {
        if (e.duration > 100) {
          console.warn(`Slow query (${e.duration}ms): ${e.query}`);
        }
      });
    }
  }
}
```

---

## Performance Checklist

### Backend

- [ ] All list endpoints paginated
- [ ] N+1 queries eliminated (use includes)
- [ ] Expensive queries cached
- [ ] Database indexes for common queries
- [ ] Response compression enabled
- [ ] Select only needed fields

### Frontend

- [ ] Bundle size < 200KB initial
- [ ] Heavy components lazy loaded
- [ ] Images optimized with Next/Image
- [ ] Long lists virtualized
- [ ] Search inputs debounced
- [ ] Expensive computations memoized

### Monitoring

- [ ] Response times logged
- [ ] Slow queries logged
- [ ] Cache hit rates monitored
- [ ] Bundle size tracked in CI

---

## Cross-References

- **Database Standards (doc 63)**: Schema optimization
- **API Standards (doc 62)**: Response format
- **State Management (doc 79)**: React Query caching
- **Testing Strategy (doc 68)**: Performance tests

---

## Navigation

- **Previous:** [State Management Standards](./79-state-management-standards.md)
- **Next:** [Background Jobs & Queue Standards](./81-background-jobs-standards.md)
