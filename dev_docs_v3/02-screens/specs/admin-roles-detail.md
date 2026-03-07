# Admin Role Detail

**Route:** `/admin/roles/[id]`
**File:** `apps/web/app/(dashboard)/admin/roles/[id]/page.tsx`
**LOC:** 251
**Status:** Complete

## Data Flow

- **Hooks:** `useRole(roleId)` + `usePermissions` + `useUpdateRole` + `useDeleteRole` (all from `lib/hooks/admin/use-roles`)
- **API calls:** `GET /api/v1/admin/roles/{id}`, `GET /api/v1/admin/permissions`, `PATCH /api/v1/admin/roles/{id}`, `DELETE /api/v1/admin/roles/{id}`
- **Envelope:** `roleData?.data` and `permissionsData?.data` -- correct double-unwrap

## UI Components

- **Pattern:** DetailPage + FormPage hybrid (inline edit with 12-col grid layout)
- **Key components:** Form (RHF + zod `roleFormSchema`), Card (x2: role overview + permissions), RolePermissionsEditor, AlertDialog (delete confirmation), Input, LoadingState, ErrorState
- **Interactive elements:** displayName input (disabled for system roles), description input, permission checkboxes, "Save Changes" button, "Delete Role" button (disabled for system roles, opens AlertDialog), back arrow button. All wired.

## State Management

- **URL params:** `[id]` from route params
- **React Query keys:** Via `useRole(roleId)` and `usePermissions`
- **Form state:** `useForm<RoleFormData>` with `useEffect` reset when role data loads. `keepDirtyValues: false`.

## Quality Assessment

- **Score:** 6/10
- **Bugs:**
  - `console.error` on update/delete errors without user-facing feedback -- mutations fail silently
  - `role.permissions` can be array of strings OR objects -- handled with type check but fragile
- **Anti-patterns:**
  - `window.location.reload()` used as retry on error state -- should use `refetch()`
  - Mutation errors logged to console only -- no toast or error state shown to user
- **Missing:** Loading state present. Error state present (with heavy retry). System role guard present. No success toast after save.
