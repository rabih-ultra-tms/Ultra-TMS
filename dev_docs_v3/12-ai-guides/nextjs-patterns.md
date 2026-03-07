# Next.js 16 Patterns

> AI Dev Guide | App Router patterns used in Ultra TMS

---

## Project Structure

```
apps/web/
  app/
    (auth)/              # Public pages (login, register, etc.)
      login/page.tsx
      register/page.tsx
    (dashboard)/         # Protected pages (all TMS screens)
      carriers/page.tsx
      carriers/[id]/page.tsx
      operations/orders/page.tsx
      layout.tsx         # Dashboard layout with sidebar
    layout.tsx           # Root layout with providers
  components/
    ui/                  # shadcn/ui base components
    tms/                 # TMS-specific components (31, approved)
    auth/                # Auth components
    admin/               # Admin components
    crm/                 # CRM components
    operations/          # Operations components
  lib/
    api/client.ts        # Axios instance with interceptors
    hooks/               # React Query hooks (51 total)
    utils/               # Utility functions
```

## Route Groups

```
(auth)       -- Public pages, no sidebar, no auth required
(dashboard)  -- Protected pages, sidebar layout, JWT required
```

Route groups use `()` prefix -- they organize code without affecting the URL path.

## Page Pattern

```typescript
// apps/web/app/(dashboard)/carriers/page.tsx
export default function CarriersPage() {
  const { data, isLoading, error } = useCarriers();

  if (isLoading) return <PageSkeleton />;
  if (error) return <ErrorState message={error.message} />;
  if (!data?.length) return <EmptyState title="No carriers" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Carriers" action={<CreateButton />} />
      <CarriersTable data={data} />
    </div>
  );
}
```

## Dynamic Routes

```
/carriers/[id]/page.tsx          -- Carrier detail
/carriers/[id]/edit/page.tsx     -- Carrier edit form
/operations/orders/[id]/page.tsx -- Order detail
```

```typescript
// Access params
export default function CarrierDetailPage({ params }: { params: { id: string } }) {
  const { data: carrier } = useCarrier(params.id);
  // ...
}
```

## Layout Pattern

```typescript
// apps/web/app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

## API Proxy

Configured in `apps/web/next.config.js`:

```javascript
async rewrites() {
  return [
    {
      source: '/api/v1/:path*',
      destination: 'http://localhost:3001/api/v1/:path*',
    },
  ];
}
```

Frontend calls `/api/v1/carriers` and Next.js rewrites to `localhost:3001/api/v1/carriers`.

## State Management

| Type | Tool | Usage |
|------|------|-------|
| Server state | React Query (TanStack Query) | API data fetching, caching, mutations |
| Client state | Zustand | UI state (sidebar open/closed, filters) |
| Form state | React Hook Form + Zod | Form validation and submission |

### React Query Pattern

```typescript
// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['carriers', params],
  queryFn: () => fetchCarriers(params),
});

// Mutation
const mutation = useMutation({
  mutationFn: createCarrier,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['carriers'] });
    toast.success('Carrier created');
  },
});
```

## Path Aliases

```typescript
import { useCarriers } from '@/lib/hooks/operations/use-carriers';
import { Button } from '@/components/ui/button';
import { Badge } from '@repo/ui';  // Shared UI package
```

`@/` resolves to `apps/web/` root.
`@repo/ui` resolves to `packages/ui/`.

## Component Library

- **Base:** shadcn/ui (Radix UI primitives + Tailwind 4)
- **Location:** `apps/web/components/ui/`
- **Icons:** Lucide React
- **Charts:** Recharts (for dashboards)

## Tailwind 4

Ultra TMS uses Tailwind 4 with a 3-layer token architecture:

```
Brand tokens -> Semantic tokens -> Tailwind utility classes
```

Defined in `apps/web/app/globals.css`.

## Key Conventions

1. **No `src/` directory** -- files at `app/`, `components/`, `lib/` directly
2. **Server components by default** -- add `'use client'` only when needed (hooks, state, event handlers)
3. **Loading states required** -- every page must handle loading, error, and empty states
4. **Forms use Zod** -- define schema first, then build form
5. **Toast notifications** -- use `sonner` for success/error toasts
