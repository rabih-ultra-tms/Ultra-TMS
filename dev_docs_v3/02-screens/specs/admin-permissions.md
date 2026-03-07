# Admin Permissions

**Route:** `/admin/permissions`
**File:** `apps/web/app/(dashboard)/admin/permissions/page.tsx`
**LOC:** 32
**Status:** Complete

## Data Flow

- **Hooks:** `usePermissions` (`lib/hooks/admin/use-roles`)
- **API calls:** `GET /api/v1/admin/permissions`
- **Envelope:** `data?.data` -- correct double-unwrap

## UI Components

- **Pattern:** ListPage (read-only matrix view)
- **Key components:** PageHeader, PermissionsMatrix (`components/admin/permissions/permissions-matrix`), LoadingState, ErrorState, EmptyState
- **Interactive elements:** None -- entirely read-only. No buttons, no filters.

## State Management

- **URL params:** None
- **React Query keys:** Via `usePermissions` hook

## Quality Assessment

- **Score:** 6/10
- **Bugs:** None
- **Anti-patterns:** No search or filter on permissions -- acceptable for small permission sets
- **Missing:** Loading state present. Error state present with retry. Empty state present. No pagination (all loaded at once).
