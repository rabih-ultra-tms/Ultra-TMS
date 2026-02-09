# Frontend Assessment

> Reviewed: 2026-02-07 | Reviewer: Claude Opus 4.6 | Scope: `apps/web/`

## Overview

| Metric | Count |
|--------|-------|
| **Page routes** | 49 (`page.tsx` files across `(auth)/` and `(dashboard)/`) |
| **Component files** | ~97 `.tsx` files in `components/` (9 subdirectories) |
| **Custom hooks** | 20 files in `lib/hooks/` (4 admin, 5 CRM, 4 operations, 7 shared) |
| **Zustand stores** | 5 (`auth-store`, `crm-store`, `admin-store`, `ui-store`, `create-store`) |
| **UI components** | 34 shadcn/ui primitives in `components/ui/` |
| **Type files** | 9 (`lib/types/` + `types/`) |
| **Validation schemas** | 2 (`lib/validations/auth.ts`, `lib/validations/crm.ts`) |

---

## Page Assessment Table

### Auth Pages (6 routes)

| Page | Route | Status | Quality | Issues |
|------|-------|--------|---------|--------|
| Login | `/login` | Built | Good | Direct `fetch()` instead of apiClient (intentional for safety); proper form validation with Zod |
| Register | `/register` | Built | Good | Full form validation; proper loading states |
| Forgot Password | `/forgot-password` | Built | Good | Standard pattern |
| Reset Password | `/reset-password` | Built | Good | Standard pattern |
| Verify Email | `/verify-email` | Built | Good | Standard pattern |
| MFA | `/mfa` | Built | Good | OTP verification flow |

### Dashboard Pages (43 routes)

| Page | Route | Status | Quality | Issues |
|------|-------|--------|---------|--------|
| Dashboard | `/dashboard` | Built | **Poor** | Hardcoded zeros, no data fetching, manual logout via `fetch()` bypasses auth hooks, `console.error` |
| Companies List | `/companies` | Built | Good | Uses shared components (PageHeader, EmptyState, etc.), proper loading/error/empty states, **hardcoded "+5" stat** |
| Company Detail | `/companies/[id]` | Built | Good | Tabbed detail view |
| Company Edit | `/companies/[id]/edit` | Built | Good | Edit form |
| Company Contacts | `/companies/[id]/contacts` | Built | Good | Sub-page |
| Company Activities | `/companies/[id]/activities` | Built | Good | Sub-page |
| Company New | `/companies/new` | Built | Good | Creation form |
| Contacts List | `/contacts` | Built | Good | Clean, uses shared components, proper states |
| Contact Detail | `/contacts/[id]` | Built | Good | Detail view |
| Contact Edit | `/contacts/[id]/edit` | Built | Good | Edit form |
| Contact New | `/contacts/new` | Built | Good | Creation form |
| Leads List | `/leads` | Built | Good | Dual view (table/pipeline), search + filters, uses CRM store |
| Lead Detail | `/leads/[id]` | Built | Good | Detail view |
| Lead Activities | `/leads/[id]/activities` | Built | Good | Sub-page |
| Lead Contacts | `/leads/[id]/contacts` | Built | Good | Sub-page |
| Lead New | `/leads/new` | Built | Good | Creation form |
| Activities | `/activities` | Built | Okay | "Log Activity" button is permanently `disabled` -- non-functional |
| Customers | `/customers` | Built | N/A | Redirect to `/companies` (5 lines) |
| Customer Detail | `/customers/[id]` | Built | Good | Detail view |
| Customer Edit | `/customers/[id]/edit` | Built | Good | Edit form |
| Customer Contacts | `/customers/[id]/contacts` | Built | Good | Sub-page |
| Customer Activities | `/customers/[id]/activities` | Built | Good | Sub-page |
| Customer New | `/customers/new` | Built | Good | Creation form |
| **Carriers List** | `/carriers` | Built | **Excellent** | 858 lines, quality bar -- see analysis below |
| Load History | `/load-history` | Built | Good | Follows carrier pattern; inline create form; 4x `any` type usage |
| Quote History | `/quote-history` | Built | Good | Follows carrier pattern; `as any` cast on query params (line 107) |
| Truck Types | `/truck-types` | Built | Good | Advanced filtering, CRUD dialog, category stats; `useMemo` misused as `useEffect` |
| Load Planner Edit | `/load-planner/[id]/edit` | Built | Good | Complex editor with AI integration; 2x `any` casts |
| Profile | `/profile` | Built | Good | Clean composition of ProfileForm + AvatarUpload |
| Security | `/profile/security` | Built | Good | Clean composition of 3 security components |
| Admin Users | `/admin/users` | Built | Good | Proper role guards, shared components |
| Admin User Detail | `/admin/users/[id]` | Built | Good | Detail view |
| Admin User Edit | `/admin/users/[id]/edit` | Built | Good | Edit form |
| Admin User New | `/admin/users/new` | Built | Good | Creation form |
| Admin Roles | `/admin/roles` | Built | Good | Proper role guards |
| Admin Role Detail | `/admin/roles/[id]` | Built | Good | Permissions editor matrix; `console.error` swallowed silently |
| Admin Role New | `/admin/roles/new` | Built | Good | Creation form |
| Admin Permissions | `/admin/permissions` | Built | Good | Read-only matrix view |
| Admin Settings | `/admin/settings` | Built | Okay | Composition only -- actual form behavior depends on sub-components |
| Admin Audit Logs | `/admin/audit-logs` | Built | **Stub** | Just an EmptyState -- no data fetching, no table, no filters |
| Admin Tenants | `/admin/tenants` | Built | Okay | Wraps single tenant in array for table display |
| Admin Tenant Detail | `/admin/tenants/[id]` | Built | Good | Detail view |

---

## Component Architecture Analysis

### Good Decomposition Patterns

1. **Shared state components**: `PageHeader`, `EmptyState`, `LoadingState`, `ErrorState` are consistently used across CRM and admin pages. This ensures a uniform UX for all data-fetching screens.

2. **Domain-organized components**: `components/crm/`, `components/admin/`, `components/auth/`, `components/profile/` provide clear separation. Each domain has its own table, form, and filter components.

3. **Layout components**: `DashboardShell` > `AppSidebar` + `AppHeader` form a clean shell. The sidebar supports collapsed mode and mobile-responsive sheet overlay. Navigation is config-driven via `lib/config/navigation.ts`.

4. **Zustand store factory**: `create-store.ts` is a 13-line wrapper that adds devtools to every store. Clean and DRY.

### Anti-Patterns Identified

1. **Monolithic page files** (carriers: 858 lines, load-history: 1013 lines, quote-history: 715 lines, truck-types: 1089 lines): These pages contain inline sub-components (`CarrierActionsMenu`, `LoadActionsMenu`, `QuoteActionsMenu`), inline form state, inline filter state, inline selection state, and the full table/card layout in a single file. Each should be decomposed into:
   - `*-filters.tsx` -- search + filter controls
   - `*-table.tsx` -- desktop table + mobile cards
   - `*-actions-menu.tsx` -- dropdown actions
   - `*-create-dialog.tsx` -- creation form dialog
   - `*-stats.tsx` -- stat cards

2. **Inconsistent page patterns**: CRM pages (`companies`, `contacts`, `leads`) use shared components (`CustomerTable`, `ContactsTable`, `LeadsTable`) and extract filter/table logic into reusable components. Operations pages (`carriers`, `load-history`, `quote-history`) inline everything. This creates a split personality in the codebase.

3. **Dashboard page is hollow**: The main landing page (84 lines) shows hardcoded `0` values and a basic logout button using `fetch()` directly. No data fetching, no charts, no recent activity. This is the first thing users see.

### Carrier Page: Quality Bar Analysis

The carriers page (`apps/web/app/(dashboard)/carriers/page.tsx`, 858 lines) demonstrates:

**Positives (use as template):**
- Complete CRUD: list, create, delete, batch delete, status change
- All 3 UX states handled: loading, error, empty
- Responsive design: mobile cards + desktop table via `lg:hidden` / `hidden lg:block`
- Type-safe status/type color maps with `Record<Status, string>`
- Batch selection with select-all, partial selection indicator
- Proper pagination with page count display
- Insurance expiry detection with color-coded warnings
- Filter bar with clear-all button
- Inline `CarrierActionsMenu` sub-component with typed props

**Negatives (do not replicate):**
- 858 lines in a single file (should be ~200 for the page, rest in components)
- Uses `confirm()` for delete confirmation instead of `ConfirmDialog` component (already exists in `components/shared/`)
- No search debounce (every keystroke triggers a query)
- Links to `/carriers/${id}` but **no carrier detail page exists** (404)
- Links to `/carriers/${id}?edit=true` but **no carrier edit page exists** (404)
- `router` imported but only used for create redirect (could be removed)

---

## State Management

### Zustand Stores (4 domain stores)

| Store | File | State | Quality |
|-------|------|-------|---------|
| `useUIStore` | `lib/stores/ui-store.ts` | sidebar open/collapsed, command menu | Good -- clean, minimal |
| `useCRMStore` | `lib/stores/crm-store.ts` | customer filters, lead filters, view mode, selected customer | Good -- typed filters |
| `useAdminStore` | `lib/stores/admin-store.ts` | user filters, selected user, role dialog | Good -- clean |
| `useAuthStore` | `lib/stores/auth-store.ts` | user, isAuthenticated, isLoading, permission/role helpers | Good -- but **unused** (pages use `useCurrentUser` hook instead) |

**Assessment**: Zustand is used correctly for client-side UI state (filters, view modes, sidebar). Server state is properly delegated to React Query. The `useAuthStore` appears to be dead code -- `useCurrentUser()` from `use-auth.ts` is used everywhere instead.

### React Query Hooks Organization

Hooks are organized by domain:
- `lib/hooks/admin/` -- `use-roles`, `use-users`, `use-tenant`, `use-security-log`
- `lib/hooks/crm/` -- `use-activities`, `use-companies`, `use-contacts`, `use-customers`, `use-leads`
- `lib/hooks/operations/` -- `use-carriers`, `use-load-history`, `use-load-planner-quotes`, `use-truck-types`
- `lib/hooks/` -- `use-auth`, `use-confirm`, `use-debounce`, `use-pagination`

**Positives:**
- Consistent query key patterns (`[domain, 'list', params]`, `[domain, id]`)
- Proper query invalidation on mutations
- `enabled` flags to prevent unnecessary fetches

**Negatives:**
- No global error handler configured on QueryClient
- No retry configuration standardized across hooks
- `useCarriers` hook builds `cleanParams` manually instead of letting the API client strip undefined values (it already does)

---

## API Integration

### Client Architecture

`lib/api/client.ts` (482 lines) implements a robust `ApiClient` class:

**Strengths:**
- Automatic JWT refresh with deduplication (single `refreshPromise`)
- 401 retry logic with automatic re-request
- Bearer token injection from cookies
- Server-side cookie forwarding support
- FormData upload support
- Proper `ApiError` class with status helpers (`isValidationError()`, `isUnauthorized()`, etc.)

**Weaknesses:**
- Despite CLAUDE.md stating "NO localStorage usage (XSS-safe)", the client **does** use localStorage as a fallback for token storage (lines 59, 77, 117, 128) -- this contradicts the documented security model
- `getServerCookies()` throws an error with a misleading message -- it should be removed or implemented properly
- The `upload()` method duplicates request logic instead of calling `this.request()`
- `skipActivityRefresh` and `skipRefresh` are computed identically (duplicate code, lines 294-302 and 345-353)

### Type Safety Assessment

**Score: 7/10**

The project defines types in two locations (`lib/types/` and `types/`) which is slightly confusing but functional. API responses are typed at the hook level using generics: `apiClient.get<{ data: T[] }>()`.

Weaknesses:
- 9 instances of `any` type usage (see Code Quality Metrics below)
- Some hooks return `Partial<Entity>` for mutation inputs, which is overly permissive
- The CRM pages rely on a different pagination shape (`data.pagination`) versus operations pages (`data.total`, `data.totalPages`) -- inconsistent API response types

---

## Loading / Error / Empty State Coverage

| Page | Loading | Error | Empty | Notes |
|------|---------|-------|-------|-------|
| Dashboard | None | None | None | All hardcoded -- no data fetching at all |
| Companies | LoadingState | ErrorState | EmptyState | Full coverage |
| Contacts | LoadingState | ErrorState | EmptyState | Full coverage |
| Leads | LoadingState | ErrorState | EmptyState | Full coverage (both views) |
| Activities | LoadingState | ErrorState | EmptyState | Full coverage |
| Carriers | Inline text | Inline text | Icon + CTA | Functional but not using shared components |
| Load History | Inline text | Inline text | Icon + CTA | Same pattern as carriers |
| Quote History | Inline text | Inline text | Icon + CTA | Same pattern as carriers |
| Truck Types | Loader2 spinner | N/A | Icon + CTA | No error state handler |
| Admin Users | LoadingState | ErrorState | EmptyState | Full coverage + access denied state |
| Admin Roles | LoadingState | ErrorState | EmptyState | Full coverage + access denied state |
| Admin Permissions | LoadingState | ErrorState | EmptyState | Full coverage |
| Admin Audit Logs | N/A | N/A | EmptyState only | Stub page -- no data fetching |
| Admin Settings | N/A | N/A | N/A | Delegates to sub-components |
| Admin Tenants | LoadingState | ErrorState | EmptyState | Full coverage |
| Profile | N/A | N/A | N/A | Delegates to sub-components |
| Profile Security | N/A | N/A | N/A | Delegates to sub-components |
| Truck Types | Loader2 | N/A | Truck icon | Missing error state |

---

## Code Quality Metrics

### `any` Type Usage (9 instances)

| File | Line | Context | Severity |
|------|------|---------|----------|
| `jest.config.ts` | 44 | `config as any` | Low -- config file |
| `components/admin/roles/role-permissions-editor.tsx` | 256 | `(el as any).indeterminate` | Medium -- DOM property access |
| `app/(dashboard)/quote-history/page.tsx` | 107 | `} as any)` on query params | **High** -- masks type errors in API call |
| `app/(dashboard)/load-history/page.tsx` | 196 | `(error: any)` in onError | Medium -- should use `Error` or `ApiError` |
| `app/(dashboard)/load-history/page.tsx` | 247 | `(error: any)` in catch | Medium |
| `app/(dashboard)/load-history/page.tsx` | 533 | `(error: any)` in onError | Medium |
| `app/(dashboard)/load-history/page.tsx` | 674 | `(error: any)` in onError | Medium |
| `app/(dashboard)/load-planner/[id]/edit/page.tsx` | 207 | `(result.items as any[])` | Medium -- unvalidated AI response |
| `app/(dashboard)/load-planner/[id]/edit/page.tsx` | 378 | `(updated[index]! as any)[field]` | **High** -- bypasses type safety on dynamic field access |

### `console.log` Statements (16 instances -- all should be removed for production)

| File | Lines | Context |
|------|-------|---------|
| `middleware.ts` | 83, 97, 103 | RBAC middleware debug logging |
| `components/layout/app-sidebar.tsx` | 28 | User roles debug |
| `components/auth/admin-guard.tsx` | 30, 42 | Admin guard debug |
| `app/(dashboard)/admin/layout.tsx` | 11, 17, 40, 49, 50, 68, 75, 76, 79 | JWT decoding debug (9 statements!) |

### `console.error` Statements (17 instances)

Most are appropriate error logging, but some are used to silently swallow errors:

| File | Lines | Issue |
|------|-------|-------|
| `app/(dashboard)/admin/roles/[id]/page.tsx` | 84, 93 | `catch (error) { console.error(error); }` -- errors silently swallowed, no user feedback |
| `app/(dashboard)/dashboard/page.tsx` | 16 | Logout error swallowed |
| `app/(dashboard)/load-planner/[id]/edit/page.tsx` | 473, 485 | Error logged but not shown to user |

### Disabled/Non-Functional Buttons (1 instance)

| File | Line | Element |
|------|------|---------|
| `app/(dashboard)/activities/page.tsx` | 28 | `<Button disabled>Log Activity</Button>` -- permanently disabled, no handler, no tooltip explaining why |

### Hardcoded Values

| File | Line | Value | Issue |
|------|------|-------|-------|
| `app/(dashboard)/companies/page.tsx` | 83 | `+5` | "This Month" stat card shows hardcoded "+5" instead of fetched data |
| `app/(dashboard)/dashboard/page.tsx` | 35-66 | `0`, `$0` | All dashboard stats are hardcoded zeros |

---

## Navigation Issues

### Broken Links (routes in sidebar that have no corresponding page)

| Nav Item | Route | Issue |
|----------|-------|-------|
| Invoices | `/invoices` | **No page exists** -- will 404 |
| Settlements | `/settlements` | **No page exists** -- will 404 |
| Reports | `/reports` | **No page exists** -- will 404 |
| Help & Support | `/help` | **No page exists** -- will 404 |
| Settings (bottom) | `/settings` | **No page exists** (different from `/admin/settings`) -- will 404 |

### Broken Detail Links (links generated in pages that lead to non-existent routes)

| Source Page | Generated Link | Issue |
|-------------|---------------|-------|
| Carriers list | `/carriers/${id}` | **No `carriers/[id]/page.tsx` exists** -- will 404 |
| Carriers list | `/carriers/${id}?edit=true` | Same -- no detail page |
| Load History | `/load-history/${id}` | **No `load-history/[id]/page.tsx` exists** -- will 404 |
| Load History | `/load-history/${id}?edit=true` | Same -- no detail page |

---

## Recommendations

### Critical (P0)

1. **Create missing detail pages**: `carriers/[id]/page.tsx` and `load-history/[id]/page.tsx`. Every "View Details" and "Edit" link in these tables leads to a 404.

2. **Remove or hide broken nav links**: `/invoices`, `/settlements`, `/reports`, `/help`, `/settings` in the sidebar navigation link to non-existent pages. Either create placeholder pages or add `disabled: true` to the navigation config.

3. **Replace hardcoded dashboard**: The dashboard page should fetch actual data (total loads, active carriers, open orders, revenue) from the API instead of showing static zeros.

### High (P1)

4. **Remove all `console.log` statements**: 16 debug statements will leak JWT payload contents and role information into browser console in production. The 9 statements in `admin/layout.tsx` are especially concerning.

5. **Eliminate `any` type casts**: Replace the `as any` casts with proper types, especially the dangerous ones in `quote-history/page.tsx` line 107 and `load-planner/[id]/edit/page.tsx` line 378.

6. **Fix the `+5` hardcoded stat**: The "This Month" stat on the companies page shows a hardcoded "+5" instead of fetched data.

7. **Fix `useMemo` misuse in truck-types**: `useMemo` on line 270 is used with `setFormData()` inside it (a side effect). This should be `useEffect`.

### Medium (P2)

8. **Decompose monolithic pages**: The carriers (858), load-history (1013), quote-history (715), and truck-types (1089) pages should be split into reusable components following the CRM pattern.

9. **Standardize loading/error states**: Operations pages use inline text for loading/error while CRM pages use shared `LoadingState`/`ErrorState` components. Migrate all pages to shared components.

10. **Add search debounce to carriers page**: Every keystroke triggers an API call. Companies and leads pages already use `useDebounce` -- carriers should too.

11. **Replace `confirm()` with `ConfirmDialog`**: Carriers, load-history, and quote-history pages use browser `confirm()` for delete confirmation. The codebase already has a `ConfirmDialog` component in `components/shared/`.

12. **Remove `useAuthStore` or integrate it**: The auth store is defined but never used -- pages use `useCurrentUser()` hook directly. Either wire the store into the auth flow or remove it.

### Low (P3)

13. **Remove localStorage token fallback**: The API client falls back to localStorage for tokens despite CLAUDE.md claiming "NO localStorage usage (XSS-safe)".

14. **Consolidate type locations**: Types are split between `lib/types/` and `types/` at the app root. Merge into a single location.

15. **Standardize API response shape**: CRM hooks expect `{ data, pagination }` while operations hooks expect `{ data, total, totalPages }`. Align to one format.

16. **Enable the "Log Activity" button**: Either implement the handler or remove the button from the Activities page.
