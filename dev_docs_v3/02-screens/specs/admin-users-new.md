# Admin New User

**Route:** `/admin/users/new`
**File:** `apps/web/app/(dashboard)/admin/users/new/page.tsx`
**LOC:** 38
**Status:** Complete

## Data Flow

- **Hooks:** `useCreateUser` (`lib/hooks/admin/use-users`)
- **API calls:** `POST /api/v1/admin/users` via `createUser.mutateAsync(data)`
- **Envelope:** Mutation sends data, no response unwrapping needed on success (just navigates away)

## UI Components

- **Pattern:** FormPage (thin wrapper around UserForm)
- **Key components:** PageHeader, UserForm (`components/admin/users/user-form`), Button
- **Interactive elements:** Form fields inside UserForm, "Create User" submit button, "Back" button. All wired.

## State Management

- **URL params:** None
- **React Query keys:** Via `useCreateUser` mutation (invalidates user list on success)

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None in page.tsx
- **Anti-patterns:** No permission check on this page -- relies on API returning 403 if unauthorized (users list has role guard, but direct URL navigation bypasses it)
- **Missing:** Loading state delegated to UserForm. Error state delegated to UserForm. Page-level states: only submit pending ("Saving...") shown.
