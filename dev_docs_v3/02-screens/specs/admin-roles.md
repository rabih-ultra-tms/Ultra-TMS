# Admin Roles List

**Route:** `/admin/roles`
**File:** `apps/web/app/(dashboard)/admin/roles/page.tsx`
**LOC:** 84
**Status:** Complete

## Data Flow

- **Hooks:** `useRoles` (`lib/hooks/admin/use-roles`), `useCurrentUser` + `useHasRole` (`lib/hooks/use-auth`)
- **API calls:** `GET /api/v1/admin/roles`
- **Envelope:** `data?.data` -- correct double-unwrap

## UI Components

- **Pattern:** ListPage (header + table, no stats cards)
- **Key components:** PageHeader, RolesTable (`components/admin/roles/roles-table`), LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Add Role" button, "Refresh" button, table row click. All wired.

## State Management

- **URL params:** None
- **React Query keys:** Via `useRoles` hook

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None
- **Anti-patterns:** No pagination -- all roles fetched at once (acceptable if < 50 roles)
- **Missing:** Loading state present. Error state present (with 403 handling). Empty state present. Access denied state present. No search/filter.
