# Component Catalog — Ultra TMS

> Last updated: 2026-03-07
> Source: `apps/web/components/` — actual file scan (304 .tsx files across 18 directories)
> Format: COMPONENT-CATALOGER format — 6-point quality score per category

---

## Summary by Category

| Category | Directory | Files | Quality Notes |
|----------|-----------|-------|---------------|
| Domain: TMS Design System | `tms/` | 98 | Core design system — 31 approved components + sub-components |
| Domain: CRM | `crm/` | 25 | Production — CRUD forms, tables, pipeline |
| Domain: Admin | `admin/` | 23 | Production — users, roles, permissions |
| UI Primitives | `ui/` | 37 | shadcn/ui components — do not modify |
| Domain: Accounting | `accounting/` | 18 | Not built — components exist but pages are stubs |
| Domain: Carriers | `carriers/` | 17 | Production mostly — 2 P0 bugs (404 pages) |
| Domain: Load Planner | `load-planner/` | 13 | PROTECTED — 9/10 quality |
| Domain: Shared | `shared/` | 12 | Cross-service utilities |
| Domain: Auth | `auth/` | 10 | Production — login/register/MFA |
| Domain: Commissions | `commissions/` | 10 | Not built — components exist |
| Domain: Load Board | `load-board/` | 10 | Stub — components exist |
| Domain: Sales | `sales/` | 8 | Production — quote forms |
| Domain: Layout | `layout/` | 8 | Production — sidebar, header, shell |
| Domain: Profile | `profile/` | 5 | 0/10 stub — QS-005 |
| Domain: Patterns | `patterns/` | 3 | Shared UX patterns |
| Domain: Tracking | `tracking/` | 3 | Partial — WS missing |
| Domain: Loads | `loads/` | 2 | Minimal — most TMS UI in tms/ |
| Domain: Quotes | `quotes/` | 2 | Minimal — main in load-planner/ |
| **Total** | 18 dirs | **304** | |

---

## Quality Scoring System (6 points)

| Point | Criterion | Check |
|-------|-----------|-------|
| 1 | Fully typed (no `any`) | `grep -n "any" component.tsx` |
| 2 | Handles all states (loading/error/empty) | Check conditional rendering |
| 3 | Accessible (aria-labels, keyboard nav) | Check aria-* props |
| 4 | Uses design tokens (CSS vars, not hex) | No hardcoded colors |
| 5 | Reusable (props, not hardcoded data) | Accepts data via props |
| 6 | Documented (JSDoc or Storybook story) | Check stories/ |

**Score → Grade:** 5-6 = Good, 3-4 = Needs Work, 0-2 = Stub

---

## TMS Design System Components (`tms/` — 98 files)

The 31 core design system components (Rabih V1 APPROVED):

| Component | Subdirectory | Quality Score | Storybook | Notes |
|-----------|-------------|---------------|-----------|-------|
| `StatusBadge` | `tms/shared/` | 6/6 | Yes | Dot-label badge — gold standard |
| `DataTable` | `tms/shared/` | 5/6 | Yes | Sortable, paginated table |
| `PageHeader` | `tms/layout/` | 5/6 | Yes | Consistent page titles + actions |
| `EmptyState` | `tms/shared/` | 6/6 | Yes | Empty list + CTA button |
| `ErrorState` | `tms/shared/` | 5/6 | Yes | Error display |
| `LoadingSkeleton` | `tms/shared/` | 5/6 | Yes | Skeleton loading placeholder |
| `ConfirmDialog` | `tms/shared/` | 6/6 | Yes | Replaces window.confirm() |
| `FilterBar` | `tms/shared/` | 4/6 | Yes | Search + filter controls |
| `SidebarNav` | `tms/layout/` | 5/6 | Yes | Multi-level navigation |
| `FormField` | `tms/forms/` | 5/6 | Yes | RHF wrapper with label + error |
| `SelectField` | `tms/forms/` | 5/6 | Yes | RHF select with options |
| `DatePickerField` | `tms/forms/` | 4/6 | Yes | Date input with RHF |
| `CurrencyInput` | `tms/forms/` | 5/6 | Yes | Dollar amount input |
| `AddressForm` | `tms/forms/` | 4/6 | Partial | Reusable address block |
| `StopCard` | `tms/tms/` | 5/6 | Yes | Load stop display card |
| `LoadCard` | `tms/tms/` | 4/6 | Yes | Load summary card |
| `OrderStatusBadge` | `tms/tms/` | 6/6 | Yes | Order-specific status badge |
| `CarrierSelect` | `tms/carriers/` | 5/6 | Yes | Carrier dropdown with search |
| `MapView` | `tms/tracking/` | 3/6 | No | Google Maps integration |
| `ActivityTimeline` | `tms/crm/` | 5/6 | Yes | CRM activity feed |
| `QuoteLineItems` | `tms/quotes/` | 4/6 | Yes | Quote line item table |
| `InvoiceTable` | `tms/accounting/` | 3/6 | No | Invoice list — FE not built |
| `CommissionChart` | `tms/commissions/` | 2/6 | No | Stub — FE not built |
| `KpiCard` | `tms/dashboard/` | 4/6 | Yes | Dashboard metric card |
| `ChartPanel` | `tms/dashboard/` | 3/6 | No | Chart container |
| `AlertBanner` | `tms/shared/` | 5/6 | Yes | System alerts/warnings |
| `Breadcrumb` | `tms/layout/` | 5/6 | Yes | Page breadcrumb trail |
| `SearchInput` | `tms/shared/` | 4/6 | Yes | Debounced search input |
| `PaginationBar` | `tms/shared/` | 6/6 | Yes | Page navigation |
| `DocumentUpload` | `tms/shared/` | 3/6 | No | File upload — P1 feature |
| `NotificationBell` | `tms/layout/` | 2/6 | No | Stub — needs WebSocket (QS-001) |

**Additional tms/ files:** Sub-components, variants, and type files (~67 files beyond the 31 core)

---

## CRM Components (`crm/` — 25 files)

| Component | Quality | Status | Notes |
|-----------|---------|--------|-------|
| `CompanyTable` | 5/6 | Production | List with search + filters |
| `CompanyForm` | 5/6 | Production | Create/edit company |
| `ContactTable` | 4/6 | Production | Missing delete button (BUG-009) |
| `ContactForm` | 5/6 | Production | Create/edit contact |
| `LeadTable` | 4/6 | Production | Missing delete button (BUG-010) |
| `LeadForm` | 5/6 | Production | Create/edit lead |
| `PipelineBoard` | 4/6 | Production | Kanban-style pipeline — missing confirm dialog |
| `PipelineCard` | 5/6 | Production | Individual pipeline card |
| `ActivityFeed` | 5/6 | Production | CRM activity timeline |
| `ActivityForm` | 4/6 | Production | Log activity |
| + 15 more | 3-5/6 | Varies | Sub-components and helpers |

---

## Admin Components (`admin/` — 23 files)

| Component | Quality | Status |
|-----------|---------|--------|
| `UserTable` | 5/6 | Production |
| `UserForm` | 5/6 | Production |
| `RoleTable` | 5/6 | Production |
| `PermissionsMatrix` | 4/6 | Production |
| `TenantTable` | 5/6 | Production |
| `AuditLogTable` | 5/6 | Production |
| + 17 more | 3-5/6 | Varies |

---

## UI Primitives (`ui/` — 37 files)

**Source:** shadcn/ui — do NOT modify these files.

Components include: Button, Input, Select, Dialog, Table, Card, Badge, Tabs, Sheet, Dropdown, Tooltip, Popover, Calendar, Toast, Form, Label, Switch, Checkbox, Radio, Textarea, Separator, Skeleton, Avatar, Progress, Alert, Breadcrumb, Command, and more.

**Quality:** All 6/6 by definition (shadcn/ui is production-grade). Add new shadcn components via CLI: `npx shadcn-ui@latest add {component}`.

---

## Layout Components (`layout/` — 8 files)

| Component | Quality | Status | Notes |
|-----------|---------|--------|-------|
| `Sidebar` | 5/6 | Production | Navigation sidebar — has 5 fixed 404 links (fixed Feb 2026) |
| `Header` | 5/6 | Production | Top bar with user menu |
| `DashboardShell` | 5/6 | Production | Layout wrapper |
| `MobileNav` | 3/6 | Partial | Mobile responsiveness incomplete |
| + 4 more | 3-5/6 | Varies | |

---

## Shared Components (`shared/` — 12 files)

Cross-service reusable components (not design system primitives):

| Component | Quality | Used By |
|-----------|---------|---------|
| `Skeleton` (page-level) | 5/6 | All pages |
| `ErrorBoundary` | 4/6 | App root |
| `ProtectedRoute` | 5/6 | Dashboard layout |
| `TenantProvider` | 5/6 | App root |
| `QueryProvider` | 5/6 | App root |
| `ThemeProvider` | 5/6 | App root |
| + 6 more | 3-5/6 | Varies |

---

## Load Planner Components (`load-planner/` — 13 files) — PROTECTED

Do NOT modify. These files are part of the 9/10 quality protected screen:
- `CargoExtractor.tsx` — AI cargo extraction UI
- `MapPanel.tsx` — Google Maps integration
- `RouteOptimizer.tsx` — Route optimization display
- `StopList.tsx` — Draggable stop management
- `PriceCalculator.tsx` — Rate calculation panel
- + 8 more

---

## Carrier Components (`carriers/` — 17 files)

| Component | Quality | Status | Issues |
|-----------|---------|--------|--------|
| `CarrierTable` | 5/6 | Production | List works |
| `CarrierForm` | 5/6 | Production | Create/edit |
| `CarrierDetail` | 1/6 | BROKEN | page.tsx missing — P0-003 |
| `LoadHistoryTable` | 3/6 | Partial | Drilldown 404 — P0-004 |
| `ScorecardPanel` | 3/6 | Partial | Returns zeros — QS-004 |
| + 12 more | 2-5/6 | Varies | |

---

## Gap Analysis

### Missing Components (Not Built)

| Component | Service | Priority | Task |
|-----------|---------|----------|------|
| WebSocket notification panel | All | P0 | QS-001 |
| Dispatch Board (real-time) | TMS Core | P0 | QS-001 |
| Live Tracking Map (WebSocket) | TMS Core | P1 | QS-001 |
| Profile Edit Form | Auth | P1 | QS-005 |
| Accounting Dashboard | Accounting | P0 | Build task |
| Invoice Create Form | Accounting | P0 | Build task |
| Settlement Detail | Accounting | P0 | Build task |
| Commission Dashboard | Commission | P1 | Build task |

### Duplicate Components to Consolidate

| Duplicate Set | Action |
|---------------|--------|
| `LoadingSkeleton` in tms/shared + Skeleton in ui/ | Use `ui/Skeleton` — remove tms version |
| Multiple "table" patterns | Standardize on `DataTable` from tms/shared |
| Multiple "form field" wrappers | Standardize on `FormField` from tms/forms |

### Components Needing Promotion to Design System

| Component | Current Location | Promote To |
|-----------|-----------------|------------|
| `AddressForm` | `crm/` | `tms/forms/` — used across CRM, Carriers, Orders |
| `CarrierSelect` | `tms/carriers/` | Promote to `tms/shared/` — used across TMS |
| `StatusBadge` variants | Multiple | Centralize all status badges in `tms/shared/` |

---

## Story Coverage

| Category | Components | Has Story | Coverage |
|----------|-----------|-----------|----------|
| TMS Design System | 31 core | 26 | 84% |
| CRM | 10 key | 5 | 50% |
| Admin | 6 key | 4 | 67% |
| Layout | 4 key | 3 | 75% |
| **Overall** | **51 key** | **38** | **75%** |

Stories location: `apps/web/stories/`
Run Storybook: `pnpm storybook` → port 6006
