# Admin Edit User

**Route:** `/admin/users/[id]/edit`
**File:** `apps/web/app/(dashboard)/admin/users/[id]/edit/page.tsx`
**LOC:** 69
**Status:** Complete

## Data Flow

- **Hooks:** `useUser(userId)` (`lib/hooks/admin/use-users`), `useUpdateUser` (`lib/hooks/admin/use-users`)
- **API calls:** `GET /api/v1/admin/users/{id}` (pre-populate), `PATCH /api/v1/admin/users/{id}` (update)
- **Envelope:** `data?.data` -- correct double-unwrap

## UI Components

- **Pattern:** FormPage (loads existing data into UserForm edit mode)
- **Key components:** PageHeader, UserForm (`components/admin/users/user-form` mode="edit"), LoadingState, ErrorState
- **Interactive elements:** Form fields pre-populated, "Update User" submit button, "Back" button. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useUser(userId)` and `useUpdateUser` mutation

## Quality Assessment

- **Score:** 6/10
- **Bugs:**
  - `user.roles?.[0]?.id || ""` -- only first role pre-populated in form. Users with multiple roles lose all but the first on save.
  - Not-found state returns `null` instead of EmptyState -- renders blank page silently
- **Anti-patterns:** No permission check (same as new user page)
- **Missing:** Loading state present. Error state present. Not-found state: renders null (bug).
