# Admin Users List

**Route:** `/admin/users`
**File:** `apps/web/app/(dashboard)/admin/users/page.tsx`
**LOC:** 157
**Status:** Complete

## Data Flow

- **Hooks:** `useUsers` (`lib/hooks/admin/use-users`), `useDebounce` (`lib/hooks`), `useCurrentUser` + `useHasRole` (`lib/hooks/use-auth`), `useAdminStore` (`lib/stores/admin-store`)
- **API calls:** `GET /api/v1/admin/users?page&limit&search&status&roleId`
- **Envelope:** `data?.data` -- correct double-unwrap. `data?.pagination` for pagination metadata.

## UI Components

- **Pattern:** ListPage (stats cards + filters + data table)
- **Key components:** PageHeader, Card (x4 stats), UserFilters, UsersTable, LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Add User" button, "Refresh" button, search input (in UserFilters), status/role dropdowns (in UserFilters), table row click, pagination controls. All handlers wired.

## State Management

- **URL params:** None -- filters stored in Zustand `useAdminStore.userFilters` (search, status, roleId)
- **React Query keys:** Via `useUsers` hook with page/limit/search/status/roleId params

## Quality Assessment

- **Score:** 8/10
- **Bugs:**
  - Stats (activeCount, pendingCount, suspendedCount) are calculated from current page only (max 20 items), not from total counts -- misleading numbers
- **Anti-patterns:** None -- uses debounce (300ms), proper role guards, correct envelope unwrapping
- **Missing:** Loading state present. Error state present (with 403 special handling). Empty state present. Access denied state present.
