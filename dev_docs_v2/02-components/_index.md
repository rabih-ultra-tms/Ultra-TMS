# Component Inventory

**Total:** 117 components | **69% production-ready** | **10% needs-work** | **12% stubs**

See full audit: `dev_docs_v2/04-audit/components.md`

---

## By Category

| Category | Count | Good | Needs-work | Stub | Path |
|----------|-------|------|------------|------|------|
| UI Primitives (shadcn) | 34 | 32 | 2 | 0 | `components/ui/` |
| Layout | 5 | 5 | 0 | 0 | `components/layout/` |
| Auth | 9 | 3 | 3 | 3 | `components/auth/` |
| Admin | 22 | 14 | 4 | 4 | `components/admin/` |
| CRM | 23 | 18 | 3 | 2 | `components/crm/` |
| Profile | 5 | 0 | 0 | 5 | `components/profile/` |
| Quotes/Planning | 4 | 4 | 0 | 0 | `components/quotes/`, `components/load-planner/` |
| Shared/Utility | 5 | 5 | 0 | 0 | `components/shared/` |

---

## TMS Design Components (NEEDS REVISION)

> **Status:** 31 components extracted from V5_final prototype — ON HOLD
> **Reason:** Shareholder feedback (Feb 9, 2026): color scheme rejected, table column separators missing
> **Path:** `components/tms/` (10 directories)
> **Action:** Do not use in production pages until design revision is approved
> **Process:** New color scheme + table border variants being prototyped via superdesign workflow

| Category | Count | Components | Revision Impact |
|----------|-------|------------|-----------------|
| Primitives | 5 | status-badge, status-dot, checkbox, search-input, user-avatar | Color token changes |
| Filters | 4 | filter-chip, filter-bar, status-dropdown, column-visibility | Color token changes |
| Stats | 3 | stat-item, stats-bar, kpi-card | Color token changes |
| Tables | 5 | data-table, density-toggle, group-header, bulk-action-bar, pagination | **Major**: add column borders + color changes |
| Panels | 3 | slide-panel, panel-tabs, quick-actions | Color token changes only (layout approved) |
| Cards | 3 | route-card, info-grid, field-list | Color token changes |
| Timeline | 1 | timeline | Color token changes |
| Finance | 1 | finance-breakdown | Color token changes |
| Documents | 3 | document-list, upload-zone, permit-list | Color token changes |
| Alerts | 1 | alert-banner | Color token changes |
| Layout | 2 | app-sidebar, page-header | Color token changes (layout approved) |

---

## Reusable Components (Use These)

| Component | Path | What It Does |
|-----------|------|-------------|
| PageHeader | `ui/PageHeader.tsx` | Page title + subtitle + action buttons |
| SearchableSelect | `ui/searchable-select.tsx` | Dropdown with search filtering |
| ConfirmDialog | `shared/confirm-dialog.tsx` | Confirmation modal (async, destructive variant) |
| EmptyState | `shared/empty-state.tsx` | No-data placeholder with icon + action |
| ErrorState | `shared/error-state.tsx` | Error display with retry button |
| LoadingState | `shared/loading-state.tsx` | Loading spinner + message |
| DataTableSkeleton | `shared/data-table-skeleton.tsx` | Table loading skeleton |
| AddressForm | `crm/shared/address-form.tsx` | Street/city/state/zip input |
| PhoneInput | `crm/shared/phone-input.tsx` | Phone input with validation |
| Badge | `ui/badge.tsx` | Status/tag badge with variants |

---

## Components Needed (Phase 1 Tasks)

| Component | Task ID | Priority | Purpose |
|-----------|---------|----------|---------|
| Design Tokens | COMP-001 | P0 | CSS variables + Tailwind config for consistent theming |
| StatusBadge (unified) | COMP-002 | P0 | Replace 4 separate status badges with one configurable component |
| KPICard | COMP-003 | P0 | Dashboard metric cards with trend indicators |
| FilterBar | COMP-004 | P1 | Reusable search + filter row for all list pages |
| DataGrid | COMP-005 | P1 | TanStack Table wrapper for consistent tables |
| ConfirmDialog upgrade | COMP-006 | P1 | Replace all window.confirm() with ConfirmDialog |
| Loading Skeleton upgrade | COMP-007 | P1 | Page-level skeleton patterns |
| shadcn installs | COMP-008 | P1 | DatePicker, Combobox, Breadcrumb |

---

## Stub Components (Need Implementation)

| Component | Module | Task Link |
|-----------|--------|-----------|
| RegisterForm | Auth | Phase 0 scope (auth stubs) |
| ForgotPasswordForm | Auth | Phase 0 scope |
| ResetPasswordForm | Auth | Phase 0 scope |
| SocialLoginButtons | Auth | Future (not MVP) |
| ProfileForm | Profile | Future (not MVP) |
| PasswordChangeForm | Profile | Future (not MVP) |
| MFASettings | Profile | Future (not MVP) |
| AvatarUpload | Profile | Future (not MVP) |
| ActiveSessions | Profile | Future (not MVP) |
| GeneralSettingsForm | Admin | Future (not MVP) |
| SecuritySettingsForm | Admin | Future (not MVP) |
| NotificationSettings | Admin | Future (not MVP) |
| TenantSettingsForm | Admin | Future (not MVP) |
| TenantUsersSection | Admin | Future (not MVP) |
