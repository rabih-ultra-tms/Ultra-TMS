# Performance & Caching

> Source: `dev_docs/10-features/85-performance-caching-standards.md`
> Last updated: 2026-03-07

---

## Overview

Ultra TMS targets **p95 API response time < 500ms** and **initial bundle size < 200KB**. Redis caching, Prisma query optimization, and Next.js code splitting are the primary tools.

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response (p95) | < 500ms | Server timing headers |
| Time to First Byte | < 200ms | Lighthouse |
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3.5s | Lighthouse |
| Initial Bundle Size | < 200KB | Bundle analyzer |

---

## Database Performance

### Preventing N+1 Queries

```typescript
// BAD — N+1 pattern
const loads = await prisma.load.findMany();
for (const load of loads) {
  load.carrier = await prisma.carrier.findUnique({ where: { id: load.carrierId } });
}

// GOOD — Single query with include
const loads = await prisma.load.findMany({ include: { carrier: true } });

// BEST — Select only needed fields
const loads = await prisma.load.findMany({
  select: {
    id: true, loadNumber: true, status: true,
    carrier: { select: { id: true, name: true, mcNumber: true } },
  },
});
```

### Essential Indexes

Every query pattern needs an index. Multi-tenant queries always start with `tenantId`:

```prisma
@@index([tenantId, status])
@@index([tenantId, createdAt])
@@index([tenantId, deletedAt])
```

### Pagination (Required for Lists)

```typescript
async findAll(query: PaginatedQueryDto, tenantId: string) {
  const { page = 1, limit = 20 } = query;
  const [data, total] = await Promise.all([
    prisma.load.findMany({
      where: { tenantId, deletedAt: null },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.load.count({ where: { tenantId, deletedAt: null } }),
  ]);
  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
```

---

## Redis Caching

### Cache Strategy

| Data Type | TTL | Strategy |
|-----------|-----|----------|
| Dashboard KPIs | 60s | Cache-aside with background refresh |
| Carrier list (dropdown) | 5 min | Cache-aside, invalidate on mutation |
| User profile | 10 min | Cache-aside |
| FMCSA lookup results | 24 hours | Cache-aside (external API is slow) |
| Rate calculations | 30 min | Cache-aside |

### Cache Service Pattern

```typescript
@Injectable()
export class CacheService {
  constructor(@Inject('REDIS') private redis: Redis) {}

  async getOrSet<T>(key: string, ttl: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.redis.get(key);
    if (cached) return JSON.parse(cached);

    const value = await factory();
    await this.redis.setex(key, ttl, JSON.stringify(value));
    return value;
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length) await this.redis.del(...keys);
  }
}
```

---

## Frontend Performance

### Code Splitting

```typescript
// Lazy load heavy components
const DispatchBoard = dynamic(() => import('@/components/dispatch/DispatchBoard'), {
  loading: () => <PageSkeleton />,
  ssr: false,
});

const MapView = dynamic(() => import('@/components/tracking/MapView'), {
  loading: () => <MapSkeleton />,
  ssr: false,
});
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';
<Image src={carrier.logo} width={48} height={48} alt={carrier.name} />
```

### Debounced Search

```typescript
// All search inputs MUST debounce (anti-pattern #3 from audit)
const debouncedSearch = useDebouncedCallback((value: string) => {
  setFilters({ search: value, page: '1' });
}, 300);
```

### React Query Prefetching

```typescript
// Prefetch detail page on hover
const prefetchCarrier = (id: string) => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.carriers.detail(id),
    queryFn: () => apiClient.get(`/carriers/${id}`).then(r => r.data.data),
    staleTime: 60_000,
  });
};
```

---

## Bundle Monitoring

Run `pnpm --filter web build` and check `.next/analyze/` for bundle analysis. Key rules:
- No single page bundle > 100KB
- Shared vendor chunk for React, Radix, Tailwind
- Dynamic imports for charts, maps, rich text editors
