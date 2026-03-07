# Superadmin Tenant Services

**Route:** `/superadmin/tenant-services`
**File:** `apps/web/app/(dashboard)/superadmin/tenant-services/page.tsx`
**LOC:** 209
**Status:** Complete

## Data Flow

- **Hooks:** `useTenants` (`lib/hooks/admin/use-tenants`), `useTenantServices` (`lib/hooks/admin/use-tenant-services`), `useToggleTenantService` (same file)
- **API calls:** `GET /api/v1/admin/tenants`, `GET /api/v1/admin/tenants/{id}/services`, `POST /api/v1/admin/tenants/{id}/services/{serviceId}/toggle`
- **Envelope:** `data?.data` via hooks -- correct

## UI Components

- **Pattern:** Custom (tenant selector + service toggle grid)
- **Key components:** Select (tenant picker), Switch (per-service toggle), Skeleton, Card
- **Interactive elements:** Tenant select dropdown, per-service Switch toggles (enable/disable). All wired with loading states.

## State Management

- **URL params:** None
- **React Query keys:** Via `useTenants()`, `useTenantServices(selectedTenantId)`
- **Local state:** `selectedTenantId` (string | null)

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:** None significant
- **Missing:** Role guard via `useHasRole('SUPER_ADMIN')` with redirect (good). Loading state via Skeleton (good). Error state with retry (good). Empty state when no tenant selected (good). Proper tenant-scoped service queries (good). Clean, focused page. No bulk toggle (minor -- acceptable for admin page). Toggle feedback via toast (good).
