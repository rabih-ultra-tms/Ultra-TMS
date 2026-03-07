# Admin User Detail

**Route:** `/admin/users/[id]`
**File:** `apps/web/app/(dashboard)/admin/users/[id]/page.tsx`
**LOC:** 60
**Status:** Complete

## Data Flow

- **Hooks:** `useUser(userId)` (`lib/hooks/admin/use-users`)
- **API calls:** `GET /api/v1/admin/users/{id}`
- **Envelope:** `data?.data` -- correct double-unwrap for single-item response

## UI Components

- **Pattern:** DetailPage (header + detail card + roles section)
- **Key components:** PageHeader, UserDetailCard (`components/admin/users/user-detail-card`), UserRolesSection (`components/admin/users/user-roles-section`), LoadingState, ErrorState, EmptyState
- **Interactive elements:** "Edit" button (navigates to edit page), "Back" button (navigates to users list). All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useUser(userId)` hook

## Quality Assessment

- **Score:** 8/10
- **Bugs:** None
- **Anti-patterns:** None -- clean detail page with proper state handling
- **Missing:** Loading state present. Error state present with retry. Empty/not-found state present. No delete action on this page (done from roles detail).
