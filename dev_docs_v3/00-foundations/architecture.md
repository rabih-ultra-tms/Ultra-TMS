# Architecture — Ultra TMS

> **Status:** Locked (do not change without updating decision-log.md)
> **Last Updated:** 2026-03-07

---

## Monorepo Structure

```
Ultra-TMS/
├── apps/
│   ├── web/              Next.js 16 App Router — port 3000
│   │   ├── app/
│   │   │   ├── (auth)/       Public pages (login, register, verify-email)
│   │   │   └── (dashboard)/  Protected pages (all TMS screens)
│   │   ├── components/
│   │   │   ├── ui/           shadcn/ui primitives
│   │   │   └── tms/          31 domain-specific components (approved design system)
│   │   ├── lib/
│   │   │   ├── api/          API client, hooks (52 custom hooks)
│   │   │   └── store/        Zustand stores
│   │   └── stories/          26 Storybook stories
│   ├── api/              NestJS 10 — port 3001, prefix /api/v1
│   │   ├── src/
│   │   │   ├── modules/      42 service modules (39 active + 3 .bak)
│   │   │   ├── common/       Guards, interceptors, decorators, pipes
│   │   │   └── main.ts       Bootstrap (global guards, CORS, validation, Swagger)
│   │   └── prisma/
│   │       ├── schema.prisma 260 models, 114 enums
│   │       ├── migrations/   31 migrations
│   │       └── seed.ts       Seed data
│   └── docs/             Documentation app (Nextra)
├── packages/
│   ├── ui/               Shared React components (@repo/ui)
│   ├── eslint-config/    Shared ESLint config (@repo/eslint-config)
│   └── typescript-config/ Shared TS config (@repo/typescript-config)
├── docker-compose.yml    PostgreSQL 15, Redis 7, ES 8.13, Kibana
├── turbo.json            Turborepo pipeline config
└── pnpm-workspace.yaml   Workspace definition
```

---

## API Data Flow

```
Browser (port 3000)
  → Next.js API proxy (/api/v1/* rewritten to localhost:3001/api/v1/*)
  → NestJS API (port 3001)
    → JwtAuthGuard (validates JWT from HttpOnly cookie)
    → RolesGuard (checks RBAC role)
    → TenantInterceptor (injects tenantId from JWT payload)
    → Controller → Service → Prisma → PostgreSQL
    → Response: { data: T } or { data: T[], pagination: {...} }
```

**IMPORTANT — API Envelope:** All API responses are wrapped. Frontend must unwrap:
```typescript
// Single item
const response = await apiClient.get('/loads/123');
const load = response.data.data; // NOT response.data

// List
const response = await apiClient.get('/loads');
const loads = response.data.data;       // array
const pagination = response.data.pagination;
```

This is the #1 source of frontend bugs. Always unwrap the envelope.

---

## Authentication & Authorization

### Auth Flow
1. User logs in → POST /api/v1/auth/login
2. Backend validates credentials → issues JWT in HttpOnly cookie (NOT localStorage)
3. All subsequent requests include cookie automatically
4. JwtAuthGuard validates JWT on every request (global guard, applied by default)
5. Routes marked `@Public()` skip JWT validation

### RBAC
```typescript
// On controller methods
@Roles(RoleEnum.ADMIN, RoleEnum.DISPATCHER)
@UseGuards(JwtAuthGuard, RolesGuard)

// Public routes (no auth)
@Public()
```

### Roles Hierarchy
| Role | Access |
|---|---|
| SUPER_ADMIN | Cross-tenant, all operations |
| ADMIN | All operations within tenant |
| MANAGER | Read all, write most (no user management) |
| DISPATCHER | TMS core, carriers, loads |
| ACCOUNTING | Financial data, invoices, settlements |
| DRIVER | Own loads only |
| CARRIER_AGENT | Carrier portal only |
| CUSTOMER_REP | Customer portal only |

---

## Multi-Tenant Architecture

**Pattern:** Row-level tenant isolation (not separate schemas/databases)

```typescript
// MANDATORY on all entity queries
await prisma.carrier.findMany({
  where: {
    tenantId: ctx.tenantId,  // From JWT payload
    deletedAt: null           // Soft delete filter
  }
});
```

**Rules:**
1. Every Prisma model has `tenantId: String` field
2. Every query MUST filter by `tenantId` (except super-admin cross-tenant operations)
3. Never expose data from other tenants (even by accident)
4. SUPER_ADMIN role bypasses tenant filtering

**Tenant model:** `Tenant` → has many `Users`, `Carriers`, `Customers`, `Loads`, etc.

---

## Database Architecture

**Migration-first:** Always generate migrations before writing business logic.

**Mandatory fields on every entity:**
```
id           String     @id @default(cuid())
tenantId     String     (tenant isolation)
externalId   String?    (ERP/migration integration)
sourceSystem String?    (data origin tracking)
customFields Json?      (extensibility)
createdAt    DateTime   @default(now())
updatedAt    DateTime   @updatedAt
deletedAt    DateTime?  (soft delete — NEVER hard delete)
```

**Soft delete pattern (MANDATORY):**
```typescript
// Delete = set deletedAt, never remove from DB
await prisma.load.update({
  where: { id, tenantId },
  data: { deletedAt: new Date() }
});

// All queries must exclude soft-deleted records
where: { deletedAt: null }
```

**Known gap:** Order, Quote, Invoice, Settlement, Payment models are missing `deletedAt` — see QS-002.

---

## State Management

| Concern | Tool | When to Use |
|---|---|---|
| Server state (API data) | React Query | Everything fetched from API |
| Client state (UI state) | Zustand | Modals, selections, filters, sidebar state |
| Form state | React Hook Form | All forms (never useState for form fields) |
| Form validation | Zod | Schema validation, type inference |

**React Query patterns:**
```typescript
// Always use useQuery for reads
const { data, isLoading, isError } = useQuery({
  queryKey: ['loads', filters],
  queryFn: () => loadsApi.findAll(filters),
});

// Always use useMutation for writes
const { mutate, isPending } = useMutation({
  mutationFn: loadsApi.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['loads'] }),
});
```

---

## Caching Strategy

**Redis (port 6379)** is configured but not yet used for application-level caching. Current use:
- Session storage (future)
- Job queues (future — BullMQ)

**React Query** handles client-side caching (staleTime, gcTime).

**Planned:** Redis cache layer for frequently-read data (carrier list, rate tables).

---

## Search

**Elasticsearch 8.13 (port 9200)** is configured and running via Docker.

Current status: Infrastructure ready, application-level integration not yet built.

Planned use cases:
- Full-text search across loads, carriers, customers
- Advanced filtering with aggregations
- Load board search with real-time updates

---

## File Upload Pattern

S3-ready pattern (not yet implemented). When building:
```typescript
// Use presigned URLs (never proxy binary through API)
// 1. Frontend requests presigned URL from API
// 2. Frontend uploads directly to S3 using presigned URL
// 3. Frontend notifies API of successful upload
// 4. API stores S3 key in database
```

---

## Data Lifecycle Management

| Event | Action | Where |
|---|---|---|
| Entity created | `createdAt = now()` | Prisma @default(now()) |
| Entity updated | `updatedAt = now()` | Prisma @updatedAt |
| Entity deleted | `deletedAt = now()` | Soft delete (NEVER hard delete) |
| Entity archived | `status = ARCHIVED` | Business logic in service |
| Data retention | 7 years (regulatory) | Future: archival job |
| Tenant offboarding | Cascade soft-delete all tenant data | Future: tenant management |

---

## Key Files Quick Reference

| File | Purpose |
|---|---|
| `apps/api/src/main.ts` | API bootstrap (guards, CORS, validation, Swagger) |
| `apps/api/prisma/schema.prisma` | Database schema (source of truth) |
| `apps/web/next.config.js` | API proxy rewrite rules |
| `apps/web/app/layout.tsx` | Root layout with providers |
| `apps/web/lib/api/client.ts` | API client (axios instance) |
| `apps/web/components/tms/` | 31 approved design system components |
| `apps/web/app/globals.css` | CSS tokens (3-layer: brand→semantic→Tailwind) |
| `docker-compose.yml` | Infrastructure (PostgreSQL, Redis, ES, Kibana) |
| `turbo.json` | Build pipeline |
