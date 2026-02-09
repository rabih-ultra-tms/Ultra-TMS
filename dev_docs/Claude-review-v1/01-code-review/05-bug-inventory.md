# Bug Inventory

> Reviewed: 2026-02-07 | Reviewer: Claude Opus 4.6 | Scope: `apps/web/`

## Summary

| Severity | Count |
|----------|-------|
| **Critical** | 4 |
| **High** | 8 |
| **Medium** | 10 |
| **Low** | 7 |
| **Total** | 29 |

---

## Critical Bugs

### BUG-001: Carrier detail/edit links lead to 404

- **File**: `apps/web/app/(dashboard)/carriers/page.tsx`
- **Lines**: 451, 574, 802, 808
- **Description**: The carriers list page generates links to `/carriers/${carrier.id}` (view) and `/carriers/${carrier.id}?edit=true` (edit) via both the table rows and the `CarrierActionsMenu`. However, there is no `carriers/[id]/page.tsx` file in the route tree -- the `carriers/` directory contains only `page.tsx` (the list). Every "View Details" and "Edit Carrier" action results in a Next.js 404 page.
- **Impact**: Users cannot view or edit any carrier record. Core CRUD functionality is broken for the entire Carriers module.
- **Fix**: Create `apps/web/app/(dashboard)/carriers/[id]/page.tsx` with a carrier detail view, and optionally `carriers/[id]/edit/page.tsx` or handle `?edit=true` query param in the detail page.

### BUG-002: Load history detail/edit links lead to 404

- **File**: `apps/web/app/(dashboard)/load-history/page.tsx`
- **Lines**: 985, 991
- **Description**: The `LoadActionsMenu` generates links to `/load-history/${load.id}` and `/load-history/${load.id}?edit=true`. There is no `load-history/[id]/page.tsx` in the route tree.
- **Impact**: Users cannot view or edit any individual load record. The "View Details" and "Edit Load" actions in every row's dropdown menu are broken.
- **Fix**: Create `apps/web/app/(dashboard)/load-history/[id]/page.tsx`.

### BUG-003: Five sidebar navigation links lead to 404

- **File**: `apps/web/lib/config/navigation.ts`
- **Lines**: 91-105, 143-153
- **Description**: The navigation config defines routes for `/invoices`, `/settlements`, `/reports`, `/help`, and `/settings` (bottom nav). None of these routes have corresponding `page.tsx` files. These links are rendered in the sidebar for all users.
- **Impact**: Users clicking any of these 5 sidebar links will see a 404 page. The "Finance" section (Invoices, Settlements, Reports) is entirely non-functional. The "Help & Support" and bottom "Settings" links are also broken.
- **Fix**: Either create placeholder pages for these routes (like the audit-logs pattern: show an EmptyState), or add `disabled: true` to these navigation items so they render as non-clickable.

### BUG-004: `useMemo` used for side effects in Truck Types page

- **File**: `apps/web/app/(dashboard)/truck-types/page.tsx`
- **Lines**: 270-292
- **Description**: `useMemo` is called with `setFormData()` inside it, which is a state-setting side effect. `useMemo` is meant for memoizing computed values, not triggering side effects. React may skip or re-run memoization unpredictably during concurrent rendering, which can cause the form to not populate when editing, or to populate multiple times.
- **Impact**: When clicking "Edit" on a truck type, the form may not populate with the existing data, or it may flash/flicker as React re-computes the memo. In React 19 with concurrent features, this is a correctness bug that can produce stale or missing form data.
- **Fix**: Replace `useMemo` with `useEffect`:
  ```typescript
  useEffect(() => {
    if (editingTruck && editingTruckId) {
      setFormData({ ... });
    }
  }, [editingTruck, editingTruckId]);
  ```

---

## High Severity Bugs

### BUG-005: Console.log leaks JWT payload in production

- **File**: `apps/web/app/(dashboard)/admin/layout.tsx`
- **Lines**: 40, 49, 50, 75, 76
- **Description**: The admin layout's `decodeRoles()` function logs the full JWT payload to `console.log`, including: `console.log('[decodeRoles] Full JWT Payload:', payload)` (line 40). This exposes user IDs, emails, roles, and token metadata in the browser console for any user who navigates to an admin page.
- **Impact**: Security vulnerability. Any user who opens DevTools can see JWT contents. In shared environments or if screenshots are taken, sensitive information is exposed.
- **Fix**: Remove all `console.log` statements from this file (9 statements total on lines 11, 17, 40, 49, 50, 68, 75, 76, 79). Use a proper logger with environment-based log levels if debug output is needed.

### BUG-006: Console.log in sidebar leaks user roles on every render

- **File**: `apps/web/components/layout/app-sidebar.tsx`
- **Line**: 28
- **Description**: `console.log('[Sidebar] User roles:', normalized)` runs inside a `useMemo` that executes every time `currentUser` changes. This continuously logs user role information to the console.
- **Impact**: User role information (ADMIN, SUPER_ADMIN, etc.) is exposed in browser console on every page load.
- **Fix**: Remove the `console.log` statement.

### BUG-007: `as any` cast suppresses type errors on query params

- **File**: `apps/web/app/(dashboard)/quote-history/page.tsx`
- **Line**: 107
- **Description**: The `useLoadPlannerQuotes` hook call ends with `} as any)`, casting the entire params object to `any`. This means any type mismatch between the page's filter state and the hook's expected parameter types is silently ignored.
- **Impact**: If the API changes its expected parameter names or types, TypeScript will not catch the mismatch. This could lead to silent query failures or incorrect data being fetched.
- **Fix**: Remove `as any` and fix the underlying type mismatch. The hook's params interface should accept the actual filter properties being passed.

### BUG-008: Dashboard shows hardcoded zeros -- no real data

- **File**: `apps/web/app/(dashboard)/dashboard/page.tsx`
- **Lines**: 35, 45, 55, 65
- **Description**: All four dashboard stat cards (Total Loads, Active Carriers, Open Orders, Revenue) display hardcoded `0` and `$0` values. There are no API calls, no hooks, no data fetching of any kind. The page also contains a manual logout button that calls `fetch("/api/v1/auth/logout")` directly instead of using the `useLogout()` hook.
- **Impact**: The dashboard provides zero value to users. It gives the impression the system has no data even when there is data in other modules (carriers, loads, quotes).
- **Fix**: Add API calls to fetch actual dashboard metrics. Replace the manual `fetch()` logout with the `useLogout()` hook from `lib/hooks/use-auth.ts`.

### BUG-009: Hardcoded "+5" stat on companies page

- **File**: `apps/web/app/(dashboard)/companies/page.tsx`
- **Line**: 83
- **Description**: The "This Month" stat card displays a hardcoded `+5` value: `<div className="text-2xl font-bold">+5</div>`. This is not fetched from any API.
- **Impact**: Misleading data shown to users. The stat will always show "+5 this month" regardless of actual company creation rate.
- **Fix**: Either fetch the actual count of companies created this month from the API, or remove the stat card until the API endpoint is available.

### BUG-010: localStorage used despite "NO localStorage" security policy

- **File**: `apps/web/lib/api/client.ts`
- **Lines**: 59, 77, 117, 128, 139-140
- **Description**: The API client uses `localStorage.getItem("accessToken")` and `localStorage.setItem("accessToken")` as fallback token storage. The file's own docblock (line 8) states "NO localStorage usage (XSS-safe)" and `CLAUDE.md` documents the same policy.
- **Impact**: Tokens stored in localStorage are accessible to any JavaScript running on the page, including XSS payloads. This contradicts the stated security model.
- **Fix**: Remove all `localStorage.getItem` and `localStorage.setItem` calls for tokens. Rely solely on HTTP-only cookies (which the backend already sets).

### BUG-011: Delete mutation `isPending` shared across all rows

- **File**: `apps/web/app/(dashboard)/carriers/page.tsx`
- **Lines**: 316, 484, 668, 850
- **Description**: The `deleteMutation.isPending` flag is passed to every `CarrierActionsMenu` instance and to the batch delete button. Because there's a single `useDeleteCarrier()` hook instance, when any single carrier is being deleted, the `isPending` flag is `true` for ALL carrier rows simultaneously. This means all "Delete Carrier" buttons across all rows show "Deleting..." at the same time.
- **Impact**: Confusing UX -- when deleting one carrier, every row's delete button appears to be processing. Same issue exists in load-history (`deleteLoadMutation.isPending`, line 538) and quote-history (`deleteQuoteMutation.isPending`, line 465).
- **Fix**: Track pending state per carrier ID, or use `mutateAsync` and track loading per row with local state.

### BUG-012: Errors silently swallowed in role detail page

- **File**: `apps/web/app/(dashboard)/admin/roles/[id]/page.tsx`
- **Lines**: 83-85, 92-94
- **Description**: Both `onSubmit` and `handleDelete` catch errors and only call `console.error(error)`. No toast notification, no error message displayed to the user.
- **Impact**: If saving role changes or deleting a role fails, the user sees no feedback. They may assume the action succeeded when it did not.
- **Fix**: Add `toast.error()` calls in the catch blocks, e.g., `toast.error('Failed to update role')`.

---

## Medium Severity Bugs

### BUG-013: No search debounce on carriers page

- **File**: `apps/web/app/(dashboard)/carriers/page.tsx`
- **Lines**: 344-348
- **Description**: The search input's `onChange` handler directly sets `searchQuery` state, which is immediately passed to `useCarriers()`. Every keystroke triggers a new API request.
- **Impact**: Excessive API calls during typing. If the user types "ABC Trucking", 12 API requests fire in rapid succession. Compare with companies page which uses `useDebounce(customerFilters.search, 300)`.
- **Fix**: Add `const debouncedSearch = useDebounce(searchQuery, 300)` and pass `debouncedSearch` to the hook.

### BUG-014: No search debounce on load-history page

- **File**: `apps/web/app/(dashboard)/load-history/page.tsx`
- **Lines**: 402-406
- **Description**: Same issue as BUG-013. Search input directly triggers API calls on every keystroke.
- **Impact**: Excessive API requests during search typing.
- **Fix**: Same as BUG-013 -- add `useDebounce`.

### BUG-015: No search debounce on quote-history page

- **File**: `apps/web/app/(dashboard)/quote-history/page.tsx`
- **Lines**: 341-345
- **Description**: Same issue as BUG-013. No debounce on search input.
- **Impact**: Excessive API requests during search typing.
- **Fix**: Same as BUG-013 -- add `useDebounce`.

### BUG-016: "Log Activity" button permanently disabled with no explanation

- **File**: `apps/web/app/(dashboard)/activities/page.tsx`
- **Line**: 28
- **Description**: `<Button disabled>Log Activity</Button>` renders a permanently disabled button with no `onClick` handler, no tooltip, and no visual indicator explaining why it's disabled. The button sits next to a working "Refresh" button, making it look like a broken UI element.
- **Impact**: Users see a non-functional button with no way to understand why they can't log activities. Violates the project's Golden Rule #1: "Every interactive element MUST work."
- **Fix**: Either implement the activity logging functionality, add a tooltip explaining "Coming soon", or remove the button entirely.

### BUG-017: `confirm()` used instead of `ConfirmDialog` component

- **Files**:
  - `apps/web/app/(dashboard)/carriers/page.tsx` lines 169, 845
  - `apps/web/app/(dashboard)/load-history/page.tsx` lines 235, 999
  - `apps/web/app/(dashboard)/quote-history/page.tsx` lines 190, 701
  - `apps/web/app/(dashboard)/truck-types/page.tsx` line 193
- **Description**: Seven instances of browser `confirm()` are used for delete confirmations. The codebase has a proper `ConfirmDialog` component at `components/shared/confirm-dialog.tsx` that provides a styled, accessible confirmation modal. The admin roles page (`roles/[id]/page.tsx`) correctly uses `AlertDialog` instead.
- **Impact**: Browser `confirm()` dialogs look inconsistent with the rest of the UI, cannot be styled, and block the JavaScript thread. On mobile browsers, they may be suppressed entirely.
- **Fix**: Replace all `confirm()` calls with `ConfirmDialog` or `AlertDialog` from the UI library.

### BUG-018: Header search bar is non-functional

- **File**: `apps/web/components/layout/app-header.tsx`
- **Lines**: 57-66
- **Description**: The global search bar in the header renders an `<Input>` inside a `<form>`, but the form has no `onSubmit` handler and the input has no `onChange` handler. The search is purely decorative.
- **Impact**: Users may type in the global search and hit Enter, expecting results. Nothing happens. On mobile, the search icon button (line 70) also does nothing -- it has no `onClick` handler.
- **Fix**: Either connect the search to a command menu / global search functionality, or remove it until implemented.

### BUG-019: Notification bell shows fake "unread" indicator

- **File**: `apps/web/components/layout/app-header.tsx`
- **Lines**: 81, 98
- **Description**: The notification bell button has a permanent red dot (`<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />`), and the dropdown always shows "No new notifications". The red dot is hardcoded and never goes away.
- **Impact**: Users constantly see a notification indicator that never resolves, training them to ignore the notification system entirely (notification fatigue).
- **Fix**: Remove the red dot until real notification functionality is implemented, or conditionally render it based on actual unread count.

### BUG-020: Batch delete doesn't handle partial failures

- **File**: `apps/web/app/(dashboard)/carriers/page.tsx`
- **Lines**: 172-177
- **Description**: `handleBatchDelete` uses `Promise.all(ids.map(id => deleteMutation.mutateAsync(id)))`. If any single delete fails, `Promise.all` rejects and the `.then()` block (which clears selection) is skipped. But some carriers may have already been deleted. The selection state and UI become inconsistent.
- **Impact**: If 3 of 5 selected carriers are deleted and the 4th fails, the user sees an error but the selection still shows all 5 selected, even though 3 are already gone from the database.
- **Fix**: Use `Promise.allSettled()` instead of `Promise.all()`, report partial success/failure, and refetch the list regardless of outcome.

### BUG-021: `useUpdateCarrier` hook accepts optional `id` but page doesn't pass it

- **File**: `apps/web/lib/hooks/operations/use-carriers.ts`
- **Lines**: 75-102
- **Description**: `useUpdateCarrier` is defined as `useUpdateCarrier(id?: string)` and on line 80, `data.id || id` is used to determine the target. In `carriers/page.tsx` line 133, it's called as `useUpdateCarrier()` (no id). The mutation works because `data.id` is passed at call time (line 482, 667), but the `onSuccess` handler (line 90) uses `variables.id || id` where `id` is `undefined`, meaning the single-carrier cache key invalidation on line 91-93 uses `undefined` as the key -- it invalidates `["carriers", undefined]` which matches nothing.
- **Impact**: After changing a carrier's status, the carrier's detail cache (if it existed) would not be invalidated. Currently mitigated because detail pages don't exist (see BUG-001), but will become a bug when they're created.
- **Fix**: Always pass the carrier ID to `useUpdateCarrier`, or restructure the hook to require the ID in the mutation function.

### BUG-022: Truck types error state not handled

- **File**: `apps/web/app/(dashboard)/truck-types/page.tsx`
- **Lines**: 700-833
- **Description**: The truck types page checks for `isLoading` and empty results but never checks the `error` state from `useTruckTypes()`. If the API call fails, the page will show the empty state ("No truck types found") instead of an error message.
- **Impact**: API errors are silently swallowed. Users see "No truck types found" when the real issue might be a network error, authentication failure, or server error.
- **Fix**: Add an error check between the loading and empty states: `} : error ? (<ErrorState ... />) : ...`

---

## Low Severity Bugs

### BUG-023: Dashboard logout bypasses auth hooks

- **File**: `apps/web/app/(dashboard)/dashboard/page.tsx`
- **Lines**: 8-17
- **Description**: The dashboard has a manual logout button that calls `fetch("/api/v1/auth/logout")` directly and redirects via `window.location.href = "/login"`. This bypasses the `useLogout()` hook which properly: clears the QueryClient cache, clears auth tokens from cookies and localStorage, and uses `router.push()` for client-side navigation.
- **Impact**: After logging out from the dashboard, cached data from React Query may persist until the page fully reloads. Auth tokens in cookies/localStorage may not be properly cleared.
- **Fix**: Replace the manual fetch with the `useLogout()` hook from `lib/hooks/use-auth.ts`.

### BUG-024: `useAuthStore` appears to be dead code

- **File**: `apps/web/lib/stores/auth-store.ts`
- **Lines**: 1-52
- **Description**: The `useAuthStore` defines `user`, `isAuthenticated`, `hasPermission()`, `hasRole()`, etc. However, no component or page imports or uses this store. All auth checks use `useCurrentUser()` and `useHasRole()` from `lib/hooks/use-auth.ts` instead.
- **Impact**: 52 lines of dead code that may confuse developers who expect it to be the auth source of truth. It could lead to someone wiring up a component to the store while auth state is actually managed through React Query.
- **Fix**: Either remove the store or integrate it into the auth flow by syncing it with `useCurrentUser()` query results.

### BUG-025: Duplicate `skipRefresh` logic in API client

- **File**: `apps/web/lib/api/client.ts`
- **Lines**: 294-302, 345-353
- **Description**: The `request()` method computes `skipActivityRefresh` (lines 294-302) and `skipRefresh` (lines 345-353) with identical logic -- the same 8 `endpoint.startsWith()` checks. This is copy-paste duplication.
- **Impact**: Maintenance burden. If a new auth endpoint is added, it needs to be added in both places. If one is updated and the other isn't, auth endpoints could trigger infinite refresh loops.
- **Fix**: Extract the endpoint check into a single helper: `const isAuthEndpoint = (ep: string) => ['/auth/login', '/auth/refresh', ...].some(prefix => ep.startsWith(prefix))`.

### BUG-026: `upload()` method doesn't handle 401 retry

- **File**: `apps/web/lib/api/client.ts`
- **Lines**: 439-471
- **Description**: The `upload()` method implements its own request logic instead of delegating to `this.request()`. It doesn't include the 401 retry logic, the pre-request token refresh, or the proper error construction (missing `errors` and `code` fields in the ApiError).
- **Impact**: File uploads that encounter a 401 will fail permanently instead of refreshing the token and retrying.
- **Fix**: Refactor `upload()` to use `this.request()` with `body: formData`, or at minimum add the 401 retry logic.

### BUG-027: Active count computed from current page only

- **Files**:
  - `apps/web/app/(dashboard)/companies/page.tsx` line 34
  - `apps/web/app/(dashboard)/admin/users/page.tsx` lines 38-40
- **Description**: `const activeCount = customers.filter(c => c.status === "ACTIVE").length` and similar counts are computed from `data?.data` which is the **current page** of results (20 items). The stat card shows this as the total active count, but it only reflects the current page.
- **Impact**: If there are 100 active companies across 5 pages, the stat card shows the count from whichever page is currently displayed (e.g., "15" instead of "100").
- **Fix**: Use `data?.pagination?.total` for total count, or add a dedicated stats endpoint that returns counts by status across all records (like the carriers page does with `useCarrierStats()`).

### BUG-028: `Avg $/Mile` stat shows hardcoded dash

- **File**: `apps/web/app/(dashboard)/load-history/page.tsx`
- **Lines**: 343-352
- **Description**: The "Avg $/Mile" stat card always shows `-` as its value. Even though `stats` data is available, this metric is never computed from `stats.totalRevenueCents` and total miles.
- **Impact**: One of the six stat cards is permanently non-functional, reducing the analytics value of the page.
- **Fix**: Compute `avgPerMile = stats.totalRevenueCents / totalMiles` if the data is available, or add this as a field to the stats API endpoint.

### BUG-029: `SidebarNavUpdate.txt` left in route directory

- **File**: `apps/web/app/(dashboard)/admin/roles/[id]/SidebarNavUpdate.txt`
- **Description**: A text file named `SidebarNavUpdate.txt` is sitting inside a Next.js route directory. While Next.js ignores non-page files, this is likely a leftover note from development.
- **Impact**: No runtime impact, but it clutters the source tree and may confuse developers.
- **Fix**: Remove the file or move its contents to a dev docs location.

---

## Code Smell Patterns

### `any` Type Locations (9 instances)

| # | File | Line | Code |
|---|------|------|------|
| 1 | `jest.config.ts` | 44 | `config as any` |
| 2 | `components/admin/roles/role-permissions-editor.tsx` | 256 | `(el as any).indeterminate` |
| 3 | `app/(dashboard)/quote-history/page.tsx` | 107 | `} as any)` |
| 4 | `app/(dashboard)/load-history/page.tsx` | 196 | `(error: any)` |
| 5 | `app/(dashboard)/load-history/page.tsx` | 247 | `(error: any)` |
| 6 | `app/(dashboard)/load-history/page.tsx` | 533 | `(error: any)` |
| 7 | `app/(dashboard)/load-history/page.tsx` | 674 | `(error: any)` |
| 8 | `app/(dashboard)/load-planner/[id]/edit/page.tsx` | 207 | `(result.items as any[])` |
| 9 | `app/(dashboard)/load-planner/[id]/edit/page.tsx` | 378 | `(updated[index]! as any)[field]` |

### Empty Handlers (0 in app code, 4 in test setup)

No empty handlers (`() => {}`) found in application code. The 4 instances in `test/setup.ts` are expected mocks for `window.matchMedia`.

### Dead Code

| File | Description |
|------|-------------|
| `lib/stores/auth-store.ts` | Entire store unused -- all auth goes through `useCurrentUser()` hook |
| `components/auth/login-form.tsx` | Login form component exists but login page uses inline form with direct `fetch()` |
| `components/auth/social-login-buttons.tsx` | Social login buttons exist but are not used in any auth page |
| `lib/api.ts` | Re-exports from `lib/api/client.ts` -- redundant barrel file when `lib/api-client.ts` also exists |

### Console.log Statements (16 total -- all in production code)

| File | Count | Lines |
|------|-------|-------|
| `middleware.ts` | 3 | 83, 97, 103 |
| `components/layout/app-sidebar.tsx` | 1 | 28 |
| `components/auth/admin-guard.tsx` | 2 | 30, 42 |
| `app/(dashboard)/admin/layout.tsx` | 10 | 11, 17, 40, 49, 50, 68, 75, 76, 79, 20 (error) |

### Console.error Statements (17 total)

Most are appropriate (`catch` blocks in API routes, component error handlers). The problematic ones:

| File | Line | Issue |
|------|------|-------|
| `app/(dashboard)/admin/roles/[id]/page.tsx` | 84 | Error swallowed -- no user notification |
| `app/(dashboard)/admin/roles/[id]/page.tsx` | 93 | Error swallowed -- no user notification |
| `app/(dashboard)/dashboard/page.tsx` | 16 | Logout error swallowed |

---

## Recommendations

### Immediate Actions (before next release)

1. **Create `carriers/[id]/page.tsx`** and **`load-history/[id]/page.tsx`** -- these are the highest-impact bugs since they break core CRUD for two modules.

2. **Remove all 16 `console.log` statements** from production code, especially the JWT payload logging in `admin/layout.tsx`.

3. **Disable or create placeholder pages** for the 5 broken sidebar links (invoices, settlements, reports, help, settings).

4. **Fix the `useMemo` side effect** in truck-types page (change to `useEffect`).

### Short-Term Actions (next sprint)

5. Add `useDebounce` to carriers, load-history, and quote-history search inputs.

6. Replace all 7 `confirm()` calls with `ConfirmDialog` or `AlertDialog`.

7. Add error handling (toast notifications) to role detail page's catch blocks.

8. Fix the hardcoded "+5" stat and dashboard zeros.

9. Replace `Promise.all` with `Promise.allSettled` in batch delete operations.

### Cleanup Actions (backlog)

10. Remove localStorage token fallback from API client.
11. Remove or integrate `useAuthStore`.
12. Consolidate `lib/types/` and `types/` directories.
13. Implement or remove the global search bar.
14. Remove the permanent notification red dot.
15. Remove `SidebarNavUpdate.txt` from the route directory.
