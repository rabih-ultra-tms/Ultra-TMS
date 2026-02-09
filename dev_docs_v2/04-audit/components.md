# Component Inventory Audit

**Date:** February 8, 2026
**Total Components:** 117
**Production-Ready:** 81 (69%) | **Needs-Work:** 12 (10%) | **Stubs:** 14 (12%)

---

## UI Primitives (shadcn/ui) — 34 components

All installed and working. Standard shadcn quality.

| Component | Issues |
|-----------|--------|
| AddressAutocomplete | Needs error handling for Google API failures |
| SearchableSelect | Good — dropdown with search filtering |
| PageHeader | Good — title + subtitle + action buttons |
| All others (31) | Standard shadcn, no issues |

**Missing shadcn components (should install):**
- DatePicker (date-fns based)
- DataTable (TanStack Table wrapper)
- Combobox (searchable select with create)
- Breadcrumb

---

## Layout — 5 components

| Component | Path | Quality | Issues |
|-----------|------|---------|--------|
| DashboardShell | `layout/dashboard-shell.tsx` | Good | Main app wrapper |
| AppHeader | `layout/app-header.tsx` | Good | Notification dropdown is stub |
| AppSidebar | `layout/app-sidebar.tsx` | Good | **console.log on line 28 exposes user roles** |
| SidebarNav | `layout/sidebar-nav.tsx` | Good | Recursive nav renderer |
| UserNav | `layout/user-nav.tsx` | Good | Theme switcher working |

---

## Auth — 9 components

| Component | Quality | Issues |
|-----------|---------|--------|
| LoginForm | Good | Working, calls real API |
| MFAInput | Good | 6-digit numeric input |
| MFASetupDialog | Good | QR code + setup instructions |
| AdminGuard | Good | Role-based access |
| RegisterForm | **Stub** | Placeholder, no submit handler |
| ForgotPasswordForm | **Stub** | Placeholder |
| ResetPasswordForm | **Stub** | Placeholder |
| AuthLayout | Good | Public page wrapper |
| SocialLoginButtons | **Stub** | Text only, no OAuth |

---

## Admin — 22 components

**Working (14):** UsersTable, UserForm, UserDetailCard, UserStatusBadge, UserFilters, TenantsTable, RolesTable, RoleForm, RolePermissionsEditor, PermissionsMatrix, PermissionGroupCard, AuditLogTable, AuditLogDetail

**Needs-Work (4):** UserRolesSection, TenantForm, AuditLogFilters, CustomerTabs

**Stubs (4):** TenantSettingsForm, TenantUsersSection, RoleUsersSection, GeneralSettingsForm, SecuritySettingsForm, NotificationSettings

---

## CRM — 23 components

**Working (18):** CustomerTable, CustomerForm, CustomerDetailCard, CustomerStatusBadge, CustomerFilters, CustomerColumns, LeadsTable, LeadForm, LeadCard, LeadStageBadge, LeadConvertDialog, ContactsTable, ContactForm, ContactCard, ContactSelect, ActivityTimeline, ActivityItem, AddressForm, PhoneInput

**Needs-Work (3):** LeadsPipeline (limited), CustomerTabs (likely stub), ActivityForm

**Stubs (2):** ActivityTypeIcon (minimal)

---

## Profile — 5 components (ALL STUBS)

| Component | Status |
|-----------|--------|
| ProfileForm | Stub — no submit handler |
| PasswordChangeForm | Stub — placeholder |
| MFASettings | Stub — placeholder |
| AvatarUpload | Stub — placeholder |
| ActiveSessions | Stub — placeholder |

---

## Quotes/Planning — 4 components

| Component | Quality | Notes |
|-----------|---------|-------|
| CustomerForm (quotes) | Good | Address autocomplete integration |
| EmailSignatureDialog | Good | Email signature builder |
| RouteMap | Good | Google Maps route visualization, distance/duration calc |
| UniversalDropzone | Good | File upload with callbacks |

---

## Shared/Utility — 5 components

| Component | Path | Quality |
|-----------|------|---------|
| EmptyState | `shared/empty-state.tsx` | Good — icon + action button |
| ErrorState | `shared/error-state.tsx` | Good — retry button |
| LoadingState | `shared/loading-state.tsx` | Good — spinner + message |
| DataTableSkeleton | `shared/data-table-skeleton.tsx` | Good — configurable rows/cols |
| ConfirmDialog | `shared/confirm-dialog.tsx` | Good — async confirm, destructive variant |

---

## Key Dependencies

| Library | Used By | Components |
|---------|---------|------------|
| shadcn/ui (Radix) | All UI primitives | 34 |
| react-hook-form + zod | All forms | ~15 |
| lucide-react | All icons | ~100 |
| @react-google-maps/api | RouteMap | 1 |
| cmdk | Command palette | 1 (unused) |
| libphonenumber-js | PhoneInput | 1 |

---

## Components Needed But Missing

| Component | Purpose | Priority |
|-----------|---------|----------|
| StatusBadge (unified) | Replace per-module status badges with single configurable component | P1 |
| KPICard | Dashboard metric cards with real data | P1 |
| FilterBar | Reusable search + filter row for list pages | P1 |
| DataGrid | TanStack Table wrapper for all list pages | P1 |
| DateRangePicker | Date range selection for reports/filters | P2 |
| StopList | Pickup/delivery stop display for TMS screens | P2 |
| LoadStatusTimeline | Visual timeline for load status progression | P2 |
| CarrierScorecard | Carrier tier + performance display | P2 |
