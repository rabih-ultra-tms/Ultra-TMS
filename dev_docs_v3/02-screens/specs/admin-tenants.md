# Admin Tenants

**Route:** `/admin/tenants`
**File:** `apps/web/app/(dashboard)/admin/tenants/page.tsx`
**LOC:** 37
**Status:** Complete

## Data Flow

- **Hooks:** `useTenant` (`lib/hooks/admin/use-tenant`)
- **API calls:** `GET /api/v1/admin/tenant` (returns current tenant only, not all tenants)
- **Envelope:** `data` is the single tenant object (not `data.data` -- verify if hook unwraps internally)

## UI Components

- **Pattern:** ListPage (single-item table -- awkward pattern)
- **Key components:** PageHeader, TenantsTable (`components/admin/tenants/tenants-table`), LoadingState, ErrorState, EmptyState
- **Interactive elements:** Table row click navigates to `/admin/tenants/{id}`. No create/delete actions.

## State Management

- **URL params:** None
- **React Query keys:** Via `useTenant` hook

## Quality Assessment

- **Score:** 5/10
- **Bugs:** None critical
- **Anti-patterns:**
  - Wraps single tenant in array `[data]` to pass to TenantsTable -- should use a TenantDetailCard instead
  - "Tenants" (plural) page title but only shows current tenant -- misleading
- **Missing:** Loading state present. Error state present. Empty state present. No CRUD capabilities (create/delete tenant is super admin only).
