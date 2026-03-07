# Admin New Role

**Route:** `/admin/roles/new`
**File:** `apps/web/app/(dashboard)/admin/roles/new/page.tsx`
**LOC:** 82
**Status:** Complete

## Data Flow

- **Hooks:** `useCreateRole` (`lib/hooks/admin/use-roles`), `usePermissions` (`lib/hooks/admin/use-roles`)
- **API calls:** `GET /api/v1/admin/permissions` (load permission options), `POST /api/v1/admin/roles` with `{ ...roleFormData, permissionIds }`
- **Envelope:** `permissionsQuery.data?.data` -- correct double-unwrap for permissions list

## UI Components

- **Pattern:** FormPage (role form + permissions editor)
- **Key components:** PageHeader, RoleForm (`components/admin/roles/role-form`), RolePermissionsEditor (`components/admin/roles/role-permissions-editor`), LoadingState, toast (sonner)
- **Interactive elements:** name/displayName/description inputs (in RoleForm), permission checkboxes (in RolePermissionsEditor), submit button, "Back" button. All wired.

## State Management

- **URL params:** None
- **React Query keys:** Via `usePermissions` query and `useCreateRole` mutation
- **Local state:** `permissionIds` (string[]) and `permissionError` (string) managed separately from RHF form

## Quality Assessment

- **Score:** 7/10
- **Bugs:** None critical
- **Anti-patterns:** Permission IDs managed in local state separate from RoleForm's RHF state -- slight coupling issue, but works correctly with client-side validation (toast + inline error)
- **Missing:** Loading state present (for permissions). Error state: toast on validation failure. Success navigates to /admin/roles.
