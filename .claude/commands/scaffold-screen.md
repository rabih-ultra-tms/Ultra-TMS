Generate a complete Next.js frontend page for the given screen. Screen name and type: $ARGUMENTS

## Instructions

### Step 1: Understand the Screen

1. **Parse the arguments**: Expect format like `carriers list` or `invoice detail` or `shipment form`. Extract the resource name and screen type (list, detail, form, dashboard). If not clear, ask the user.

2. **Check if the page already exists** in `apps/web/app/(dashboard)/`. If it does, ask the user if they want to enhance it or start fresh.

3. **Check the Screen-API Contract Registry** at `dev_docs/09-contracts/76-screen-api-contract-registry.md` for this screen's required API endpoints.

4. **Check for a design spec** in `dev_docs/12-Rabih-design-Process/` to understand: wireframe layout, data fields, component inventory, status states, role matrix.

5. **Check existing API endpoints** in `apps/api/src/modules/` to verify the backend is ready. If not, recommend running `/scaffold-api` first.

6. **Check existing hooks** in `apps/web/lib/hooks/` and types in `apps/web/types/` or `apps/web/lib/types/`.

### Step 2: Generate Based on Screen Type

Follow the gold standard pattern from `apps/web/app/(dashboard)/carriers/page.tsx`.

#### For ALL screen types, include:

- **`'use client'`** directive at top
- **shadcn/ui components** — import from `@/components/ui/`
- **Lucide icons** — import from `lucide-react`
- **4 states**: Loading (skeleton/spinner), Error (with retry), Empty (with helpful message + CTA), Success (with data)
- **Status color maps** as `Record<StatusEnum, string>` constants
- **TypeScript types** — define inline or import from `@/types/`
- **No `any` types** — use proper types everywhere

#### 2a. List Page (`apps/web/app/(dashboard)/{resource}/page.tsx`)

Generate following the carriers page pattern:

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// React Query hooks for data fetching
// shadcn/ui: Table, Button, Input, Select, Card, Badge, DropdownMenu, Dialog
// Lucide icons for actions

// Status/type color maps
const STATUS_COLORS: Record<Status, string> = { ... };

export default function {Resource}sPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // React Query hook
  const { data, isLoading, error } = use{Resource}s({ page, limit: pageSize, search: searchQuery, status: statusFilter });

  // Loading state
  // Error state with retry
  // Empty state with CTA
  // Data table with:
  //   - Search input
  //   - Status filter dropdown
  //   - Create button
  //   - Table with sortable columns
  //   - Row actions (View, Edit, Delete) via DropdownMenu
  //   - Pagination controls
  //   - Bulk selection (optional)
}
```

Key requirements:
- **Stats cards** at top showing key metrics (total, by status, etc.)
- **Search + filters** row with Input and Select components
- **Data table** using shadcn Table (NOT DataTable — use raw Table components)
- **Row actions** via `DropdownMenu` with `MoreHorizontal` icon trigger
- **Create dialog or navigation** — either inline Dialog or `router.push('/{resource}/new')`
- **Pagination** with page number display and prev/next buttons
- **Badge** components for status display with color maps
- **Delete confirmation** via Dialog before actually deleting

#### 2b. Detail Page (`apps/web/app/(dashboard)/{resource}/[id]/page.tsx`)

```typescript
'use client';
import { useParams, useRouter } from 'next/navigation';

export default function {Resource}DetailPage() {
  const { id } = useParams();
  const router = useRouter();
  // Fetch single record
  // Tabbed layout: Overview, [Related entity tabs]
  // Action buttons: Edit, Delete, Status change
  // Back button navigation
}
```

Key requirements:
- **Header** with resource name, status badge, and action buttons
- **Tab navigation** for different sections (Overview, History, Related data)
- **Card-based layout** for info sections
- **Action buttons** for Edit, Delete, and domain-specific actions (e.g., Approve, Suspend)
- **Related data tables** for child entities

#### 2c. Form Page (`apps/web/app/(dashboard)/{resource}/new/page.tsx` or `[id]/edit/page.tsx`)

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({ ... });

export default function {Resource}FormPage() {
  const form = useForm({ resolver: zodResolver(formSchema) });
  // Form fields using shadcn Form components
  // Submit handler with loading state
  // Cancel button
  // Success redirect
}
```

Key requirements:
- **Zod schema** for validation
- **React Hook Form** with zodResolver
- **shadcn Form components**: Form, FormField, FormItem, FormLabel, FormControl, FormMessage
- **Submit loading state** with disabled button
- **Cancel button** that navigates back
- **Toast notification** on success/error
- **Pre-fill** for edit mode (fetch existing data)

#### 2d. Dashboard Page

```typescript
'use client';
// Multiple data fetch hooks
// KPI cards row
// Charts/graphs section
// Recent activity table
// Quick action buttons
```

### Step 3: Generate React Query Hooks (if missing)

If hooks don't exist at `apps/web/lib/hooks/`, create them:

```typescript
// apps/web/lib/hooks/{resource}.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export function use{Resource}s(params: QueryParams) {
  return useQuery({
    queryKey: ['{resource}s', params],
    queryFn: () => apiClient.get('/api/v1/{resource}s', { params }),
  });
}

export function use{Resource}(id: string) {
  return useQuery({
    queryKey: ['{resource}s', id],
    queryFn: () => apiClient.get(`/api/v1/{resource}s/${id}`),
    enabled: !!id,
  });
}

export function useCreate{Resource}() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => apiClient.post('/api/v1/{resource}s', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['{resource}s'] }),
  });
}

export function useUpdate{Resource}() { ... }
export function useDelete{Resource}() { ... }
```

### Step 4: Verify

7. **Run TypeScript check**: `pnpm --filter web exec tsc --noEmit`
8. **Show a summary** of all files created with line counts
9. **Remind the user** to:
   - Verify the backend API endpoints are running
   - Test all 4 states (loading, error, empty, success)
   - Test EVERY interactive element (Golden Rule #1)
   - Update the Screen-API Contract Registry FE status

### Important Conventions (DO NOT SKIP)

- Use `@/components/ui/` for ALL UI components (shadcn/ui)
- Use `@/lib/hooks/` for React Query hooks
- Use `@/lib/api/client` for the API client (SSR-safe, handles JWT refresh)
- Use `lucide-react` for ALL icons
- Status badges use `<Badge className={STATUS_COLORS[status]}>`
- NEVER use `any` type — define proper TypeScript interfaces
- EVERY button must have an onClick handler or be wrapped in Link (Golden Rule #1)
- EVERY dropdown item must have an onClick handler (Golden Rule #1)
- Pages go in `apps/web/app/(dashboard)/{resource}/` directory
- Use `useRouter` from `next/navigation` for client-side navigation
