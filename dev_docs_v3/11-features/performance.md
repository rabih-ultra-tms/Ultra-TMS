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

---

## Web Vitals Budget

> These targets apply to all routes. Measured with Lighthouse in "Applied Slow 4G" throttling mode.

| Metric | Good | Acceptable | Poor | Tool |
|--------|------|-----------|------|------|
| FCP (First Contentful Paint) | < 1.0s | < 1.5s | > 1.5s | Lighthouse |
| LCP (Largest Contentful Paint) | < 1.5s | < 2.5s | > 2.5s | Lighthouse |
| CLS (Cumulative Layout Shift) | < 0.05 | < 0.1 | > 0.1 | Lighthouse |
| INP (Interaction to Next Paint) | < 100ms | < 200ms | > 200ms | Chrome DevTools |
| TBT (Total Blocking Time) | < 150ms | < 300ms | > 300ms | Lighthouse |
| TTFB (Time to First Byte) | < 200ms | < 500ms | > 500ms | Lighthouse |

### Bundle Size Budget

| Metric | Target | Maximum | Enforcement |
|--------|--------|---------|-------------|
| Initial JS (gzipped) | < 120KB | 150KB | `next build` output |
| Per-route JS (gzipped) | < 50KB | 80KB | `next build` output |
| CSS per route (gzipped) | < 30KB | 50KB | `next build` output |
| Total first-load (JS + CSS) | < 200KB | 300KB | `next build` output |
| Largest single chunk | < 80KB | 120KB | `next build` output |

### Per-Route Exceptions

Some routes legitimately need more resources. These have relaxed budgets:

| Route | LCP Budget | JS Budget | Reason |
|-------|-----------|-----------|--------|
| `/operations/dispatch` | < 2.5s | < 150KB | Real-time dispatch board with WebSocket + map rendering |
| `/load-planner/[id]/edit` | < 2.0s | < 200KB | 1,825 LOC, Google Maps API, AI cargo extraction |
| `/operations/tracking` | < 2.5s | < 150KB | Live map with GPS marker updates |
| `/accounting/dashboard` | < 2.0s | < 100KB | Complex aggregation charts and KPI widgets |
| `/carriers` | < 1.5s | < 80KB | Large data table with debounced search |

### Optimization Techniques (Ordered by Impact)

| # | Technique | Impact | Effort | Applied? |
|---|----------|--------|--------|----------|
| 1 | Dynamic imports for heavy components (maps, charts, editors) | High | S | Partial |
| 2 | Next.js Image optimization (WebP/AVIF, lazy loading) | High | S | Not yet |
| 3 | Route-level code splitting (Next.js App Router does this automatically) | High | None | Yes |
| 4 | React Query prefetching for anticipated navigation | Medium | M | Not yet |
| 5 | Font subsetting (Inter -- only Latin glyphs) | Medium | S | Not yet |
| 6 | Tree-shaking unused Lucide icons (import specific, not barrel) | Medium | S | Partial |
| 7 | Virtualized lists for large datasets (carriers, loads) | Medium | M | Not yet |
| 8 | Service Worker for offline shell (PWA) | Low | L | Not planned |

### Monitoring (Future)

- Lighthouse CI in GitHub Actions: fail PR if any budget exceeded
- Web Vitals reporting via `next/web-vitals` callback
- Bundle analyzer: `ANALYZE=true pnpm --filter web build`

### See Also

- quality-gates.md: /verify step includes responsive check
- PERF-003: React Query cache strategy (backlog)
- PERF-007: Redis caching (backlog)
