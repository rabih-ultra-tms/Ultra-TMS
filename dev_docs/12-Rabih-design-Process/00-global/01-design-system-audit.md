# Ultra TMS Design System Audit - Comprehensive Gap Analysis

> **Last Updated:** 2026-02-06
> **Scope:** 121 design system components vs. actual codebase inventory
> **Codebase Path:** `apps/web/components/`

---

## Table of Contents

1. [Currently Installed shadcn/ui Components](#1-currently-installed-shadcnui-components)
2. [Currently Built Custom Components](#2-currently-built-custom-components)
3. [Full Gap Analysis Table](#3-full-gap-analysis-table-all-121-design-system-components)
4. [Summary Statistics](#4-summary-statistics)
5. [shadcn Installation Commands](#5-shadcn-installation-commands)
6. [Components to Build - Priority Order](#6-components-to-build---priority-order)

---

## 1. Currently Installed shadcn/ui Components

**Location:** `apps/web/components/ui/`
**Count:** 34 files (32 shadcn primitives + 2 custom UI-level components + 1 test file)

### Standard shadcn/ui Primitives (32)

| # | Component File | shadcn Registry Name |
|---|---------------|---------------------|
| 1 | `alert.tsx` | alert |
| 2 | `alert-dialog.tsx` | alert-dialog |
| 3 | `avatar.tsx` | avatar |
| 4 | `badge.tsx` | badge |
| 5 | `button.tsx` | button |
| 6 | `calendar.tsx` | calendar |
| 7 | `card.tsx` | card |
| 8 | `checkbox.tsx` | checkbox |
| 9 | `collapsible.tsx` | collapsible |
| 10 | `command.tsx` | command |
| 11 | `dialog.tsx` | dialog |
| 12 | `dropdown-menu.tsx` | dropdown-menu |
| 13 | `form.tsx` | form |
| 14 | `input.tsx` | input |
| 15 | `label.tsx` | label |
| 16 | `pagination.tsx` | pagination |
| 17 | `popover.tsx` | popover |
| 18 | `progress.tsx` | progress |
| 19 | `scroll-area.tsx` | scroll-area |
| 20 | `select.tsx` | select |
| 21 | `separator.tsx` | separator |
| 22 | `sheet.tsx` | sheet |
| 23 | `skeleton.tsx` | skeleton |
| 24 | `sonner.tsx` | sonner (toast) |
| 25 | `switch.tsx` | switch |
| 26 | `table.tsx` | table |
| 27 | `tabs.tsx` | tabs |
| 28 | `textarea.tsx` | textarea |
| 29 | `toast.tsx` | toast |
| 30 | `tooltip.tsx` | tooltip |

### Custom UI-Level Components (in `components/ui/`)

| # | Component File | Description |
|---|---------------|-------------|
| 31 | `searchable-select.tsx` | Custom combo-box / searchable dropdown |
| 32 | `address-autocomplete.tsx` | Google Places address autocomplete |
| 33 | `PageHeader.tsx` | Standardized page header with breadcrumb support |

### Not Installed (shadcn components that exist but are NOT in the codebase yet)

accordion, aspect-ratio, breadcrumb, carousel, chart, context-menu, drawer, hover-card, input-otp, menubar, navigation-menu, radio-group, resizable, slider, table-of-contents, toggle, toggle-group

---

## 2. Currently Built Custom Components

### Admin Module (`components/admin/`) -- 22 components

| Subfolder | Component | Purpose |
|-----------|-----------|---------|
| `audit/` | audit-log-detail | Audit entry detail viewer |
| `audit/` | audit-log-filters | Filter controls for audit logs |
| `audit/` | audit-log-table | Audit log data table |
| `permissions/` | permission-group-card | Permission group display card |
| `permissions/` | permissions-matrix | Full RBAC permissions matrix |
| `roles/` | role-form | Role create/edit form |
| `roles/` | role-permissions-editor | Inline permissions editor for roles |
| `roles/` | role-users-section | Users assigned to a role |
| `roles/` | roles-table | Roles list data table |
| `settings/` | general-settings-form | General tenant settings |
| `settings/` | notification-settings | Notification preferences |
| `settings/` | security-settings-form | Security policy settings |
| `tenants/` | tenant-form | Tenant create/edit form |
| `tenants/` | tenant-settings-form | Per-tenant settings |
| `tenants/` | tenant-users-section | Users within a tenant |
| `tenants/` | tenants-table | Tenants list data table |
| `users/` | user-detail-card | User profile detail card |
| `users/` | user-filters | User list filter controls |
| `users/` | user-form | User create/edit form |
| `users/` | user-roles-section | Roles assigned to a user |
| `users/` | user-status-badge | Active/Inactive/Suspended badge |
| `users/` | users-table | Users list data table |

### Auth Module (`components/auth/`) -- 9 components

| Component | Purpose |
|-----------|---------|
| auth-layout | Auth page wrapper (centered card layout) |
| login-form | Email + password login |
| register-form | New user registration |
| forgot-password-form | Password reset request |
| reset-password-form | Password reset confirmation |
| mfa-input | MFA code entry (6-digit) |
| mfa-setup-dialog | QR code MFA enrollment |
| social-login-buttons | OAuth provider buttons |
| admin-guard | Role-based route protection HOC |

### CRM Module (`components/crm/`) -- 23 components

| Subfolder | Component | Purpose |
|-----------|-----------|---------|
| `activities/` | activity-form | Activity create/edit |
| `activities/` | activity-item | Single activity display |
| `activities/` | activity-timeline | Vertical timeline of activities |
| `activities/` | activity-type-icon | Icon per activity type |
| `contacts/` | contact-card | Contact summary card |
| `contacts/` | contact-form | Contact create/edit |
| `contacts/` | contact-select | Searchable contact picker |
| `contacts/` | contacts-table | Contacts data table |
| `customers/` | customer-columns | Column definitions for customer table |
| `customers/` | customer-detail-card | Customer detail view |
| `customers/` | customer-filters | Customer list filters |
| `customers/` | customer-form | Customer create/edit |
| `customers/` | customer-status-badge | Active/Inactive/Prospect badge |
| `customers/` | customer-table | Customers data table |
| `customers/` | customer-tabs | Tabbed customer detail layout |
| `leads/` | lead-card | Lead summary card |
| `leads/` | lead-form | Lead create/edit |
| `leads/` | lead-convert-dialog | Convert lead to customer dialog |
| `leads/` | lead-stage-badge | Pipeline stage badge |
| `leads/` | leads-pipeline | Kanban-style pipeline view |
| `leads/` | leads-table | Leads data table |
| `shared/` | address-form | Reusable address sub-form |
| `shared/` | phone-input | International phone number input |

### Layout Module (`components/layout/`) -- 5 components

| Component | Purpose |
|-----------|---------|
| app-header | Top navigation bar |
| app-sidebar | Collapsible side navigation |
| dashboard-shell | Dashboard page wrapper |
| sidebar-nav | Sidebar navigation items |
| user-nav | User dropdown menu (avatar + actions) |

### Profile Module (`components/profile/`) -- 5 components

| Component | Purpose |
|-----------|---------|
| profile-form | User profile edit form |
| avatar-upload | Avatar image upload with crop |
| password-change-form | Current + new password form |
| mfa-settings | MFA enable/disable toggle |
| active-sessions | Active session list with revoke |

### Load Planner Module (`components/load-planner/`) -- 2 components

| Component | Purpose |
|-----------|---------|
| route-map | Map display for route visualization |
| UniversalDropzone | Drag-and-drop file upload zone |

### Quotes Module (`components/quotes/`) -- 2 components

| Component | Purpose |
|-----------|---------|
| customer-form | Quote-specific customer form variant |
| email-signature-dialog | Email signature editor dialog |

### Shared Module (`components/shared/`) -- 5 components

| Component | Purpose |
|-----------|---------|
| confirm-dialog | Generic yes/no confirmation modal |
| data-table-skeleton | Loading skeleton for data tables |
| empty-state | Empty state illustration + CTA |
| error-state | Error display with retry action |
| loading-state | Full-page / section loading spinner |

**Total Custom Components: 73 files** (excluding test files)

---

## 3. Full Gap Analysis Table -- All 121 Design System Components

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | **Complete** -- Component exists and meets design system spec |
| 🟡 | **Partial** -- Something exists but does not fully match the design system definition |
| ❌ | **Missing** -- Nothing exists; needs to be built or installed |
| ⬜ | **Not Needed Yet** -- Defined in design system but not required until a future wave |

---

### 3.1 Foundation (12 components)

| # | Component | Category | Design System | shadcn Installed | Custom Built | Gap Status | Priority | Wave Needed |
|---|-----------|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | Button | Foundation | Yes | `button.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 2 | IconButton | Foundation | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 3 | ButtonGroup | Foundation | Yes | -- | -- | ❌ Missing | P3 | Wave 2 - TMS Core |
| 4 | Link | Foundation | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 5 | Badge | Foundation | Yes | `badge.tsx` | user-status-badge, lead-stage-badge, customer-status-badge | ✅ Complete | -- | Wave 1 (done) |
| 6 | Tag | Foundation | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 7 | Avatar | Foundation | Yes | `avatar.tsx` | avatar-upload | ✅ Complete | -- | Wave 1 (done) |
| 8 | AvatarGroup | Foundation | Yes | -- | -- | ❌ Missing | P3 | Wave 3 - Carrier |
| 9 | Icon | Foundation | Yes | -- | activity-type-icon (partial) | 🟡 Partial | P2 | Wave 2 - TMS Core |
| 10 | Spinner | Foundation | Yes | -- | loading-state (wraps spinner) | 🟡 Partial | P3 | Wave 1 (done) |
| 11 | Skeleton | Foundation | Yes | `skeleton.tsx` | data-table-skeleton | ✅ Complete | -- | Wave 1 (done) |
| 12 | ProgressBar | Foundation | Yes | `progress.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |

**Foundation Score:** 5 Complete, 2 Partial, 5 Missing

---

### 3.2 Forms (18 components)

| # | Component | Category | Design System | shadcn Installed | Custom Built | Gap Status | Priority | Wave Needed |
|---|-----------|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 13 | Input | Forms | Yes | `input.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 14 | Textarea | Forms | Yes | `textarea.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 15 | Select | Forms | Yes | `select.tsx` | searchable-select, contact-select | ✅ Complete | -- | Wave 1 (done) |
| 16 | MultiSelect | Forms | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 17 | Combobox | Forms | Yes | `command.tsx` + `popover.tsx` | searchable-select | ✅ Complete | -- | Wave 1 (done) |
| 18 | Checkbox | Forms | Yes | `checkbox.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 19 | CheckboxGroup | Forms | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 20 | Radio | Forms | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 21 | RadioGroup | Forms | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 22 | Switch | Forms | Yes | `switch.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 23 | Slider | Forms | Yes | -- | -- | ❌ Missing | P3 | Wave 3 - Carrier |
| 24 | DatePicker | Forms | Yes | `calendar.tsx` + `popover.tsx` | -- | 🟡 Partial | P1 | Wave 2 - TMS Core |
| 25 | DateRangePicker | Forms | Yes | `calendar.tsx` + `popover.tsx` | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 26 | TimePicker | Forms | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 27 | FileUpload | Forms | Yes | -- | UniversalDropzone | ✅ Complete | -- | Wave 1 (done) |
| 28 | PhoneInput | Forms | Yes | -- | phone-input (crm/shared) | ✅ Complete | -- | Wave 1 (done) |
| 29 | CurrencyInput | Forms | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 30 | FormField | Forms | Yes | `form.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |

**Forms Score:** 9 Complete, 1 Partial, 8 Missing

---

### 3.3 Layout (14 components)

| # | Component | Category | Design System | shadcn Installed | Custom Built | Gap Status | Priority | Wave Needed |
|---|-----------|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 31 | Container | Layout | Yes | -- | dashboard-shell (partial) | 🟡 Partial | P3 | Wave 2 - TMS Core |
| 32 | Grid | Layout | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 33 | Stack | Layout | Yes | -- | -- | ❌ Missing | P3 | Wave 2 - TMS Core |
| 34 | Flex | Layout | Yes | -- | -- | ❌ Missing | P3 | Wave 2 - TMS Core |
| 35 | Divider | Layout | Yes | `separator.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 36 | Card | Layout | Yes | `card.tsx` | contact-card, lead-card, etc. | ✅ Complete | -- | Wave 1 (done) |
| 37 | Panel | Layout | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 38 | Accordion | Layout | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 39 | Tabs | Layout | Yes | `tabs.tsx` | customer-tabs | ✅ Complete | -- | Wave 1 (done) |
| 40 | VerticalTabs | Layout | Yes | -- | -- | ❌ Missing | P3 | Wave 3 - Carrier |
| 41 | Sidebar | Layout | Yes | -- | app-sidebar, sidebar-nav | ✅ Complete | -- | Wave 1 (done) |
| 42 | Header | Layout | Yes | -- | app-header, PageHeader | ✅ Complete | -- | Wave 1 (done) |
| 43 | Footer | Layout | Yes | -- | -- | ❌ Missing | P4 | Wave 4 - Portal |
| 44 | PageLayout | Layout | Yes | -- | dashboard-shell | ✅ Complete | -- | Wave 1 (done) |

**Layout Score:** 6 Complete, 1 Partial, 7 Missing

---

### 3.4 Navigation (10 components)

| # | Component | Category | Design System | shadcn Installed | Custom Built | Gap Status | Priority | Wave Needed |
|---|-----------|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 45 | Navbar | Navigation | Yes | -- | app-header + app-sidebar | ✅ Complete | -- | Wave 1 (done) |
| 46 | Breadcrumb | Navigation | Yes | -- | PageHeader (partial) | 🟡 Partial | P1 | Wave 2 - TMS Core |
| 47 | Pagination | Navigation | Yes | `pagination.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 48 | Stepper | Navigation | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 49 | Menu | Navigation | Yes | `dropdown-menu.tsx` | user-nav | ✅ Complete | -- | Wave 1 (done) |
| 50 | DropdownMenu | Navigation | Yes | `dropdown-menu.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 51 | ContextMenu | Navigation | Yes | -- | -- | ❌ Missing | P3 | Wave 3 - Carrier |
| 52 | CommandPalette | Navigation | Yes | `command.tsx` | -- | 🟡 Partial | P2 | Wave 2 - TMS Core |
| 53 | SearchInput | Navigation | Yes | -- | searchable-select (partial) | 🟡 Partial | P2 | Wave 2 - TMS Core |
| 54 | QuickActions | Navigation | Yes | -- | -- | ❌ Missing | P3 | Wave 3 - Carrier |

**Navigation Score:** 4 Complete, 3 Partial, 3 Missing

---

### 3.5 Data Display (16 components)

| # | Component | Category | Design System | shadcn Installed | Custom Built | Gap Status | Priority | Wave Needed |
|---|-----------|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 55 | Table | Data Display | Yes | `table.tsx` | users-table, leads-table, etc. | ✅ Complete | -- | Wave 1 (done) |
| 56 | DataGrid | Data Display | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 57 | TreeView | Data Display | Yes | -- | -- | ❌ Missing | P3 | Wave 4 - Portal |
| 58 | List | Data Display | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 59 | DescriptionList | Data Display | Yes | -- | user-detail-card, customer-detail-card (inline) | 🟡 Partial | P2 | Wave 2 - TMS Core |
| 60 | Timeline | Data Display | Yes | -- | activity-timeline | ✅ Complete | -- | Wave 1 (done) |
| 61 | Calendar | Data Display | Yes | `calendar.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 62 | KPICard | Data Display | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 63 | Statistic | Data Display | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 64 | Chart | Data Display | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 65 | Map | Data Display | Yes | -- | route-map | ✅ Complete | -- | Wave 1 (done) |
| 66 | StatusIndicator | Data Display | Yes | -- | user-status-badge, customer-status-badge, lead-stage-badge | ✅ Complete | -- | Wave 1 (done) |
| 67 | ProgressTracker | Data Display | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 68 | LoadStatusBadge | Data Display | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 69 | CarrierCard | Data Display | Yes | -- | -- | ❌ Missing | P1 | Wave 3 - Carrier |
| 70 | LoadCard | Data Display | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |

**Data Display Score:** 4 Complete, 1 Partial, 11 Missing

---

### 3.6 Feedback (10 components)

| # | Component | Category | Design System | shadcn Installed | Custom Built | Gap Status | Priority | Wave Needed |
|---|-----------|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 71 | Alert | Feedback | Yes | `alert.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 72 | Toast | Feedback | Yes | `toast.tsx` + `sonner.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 73 | Banner | Feedback | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 74 | Modal | Feedback | Yes | `dialog.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 75 | Drawer | Feedback | Yes | `sheet.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 76 | Dialog | Feedback | Yes | `alert-dialog.tsx` + `dialog.tsx` | mfa-setup-dialog, lead-convert-dialog, email-signature-dialog | ✅ Complete | -- | Wave 1 (done) |
| 77 | ConfirmDialog | Feedback | Yes | -- | confirm-dialog | ✅ Complete | -- | Wave 1 (done) |
| 78 | Popover | Feedback | Yes | `popover.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 79 | Tooltip | Feedback | Yes | `tooltip.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 80 | EmptyState | Feedback | Yes | -- | empty-state | ✅ Complete | -- | Wave 1 (done) |

**Feedback Score:** 9 Complete, 0 Partial, 1 Missing

---

### 3.7 Overlays (6 components)

| # | Component | Category | Design System | shadcn Installed | Custom Built | Gap Status | Priority | Wave Needed |
|---|-----------|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 81 | Overlay | Overlays | Yes | `dialog.tsx` (backdrop) | -- | 🟡 Partial | P3 | Wave 2 - TMS Core |
| 82 | Sheet | Overlays | Yes | `sheet.tsx` | -- | ✅ Complete | -- | Wave 1 (done) |
| 83 | Lightbox | Overlays | Yes | -- | -- | ❌ Missing | P3 | Wave 3 - Carrier |
| 84 | ImagePreview | Overlays | Yes | -- | -- | ❌ Missing | P3 | Wave 3 - Carrier |
| 85 | DocumentViewer | Overlays | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |
| 86 | PDFViewer | Overlays | Yes | -- | -- | ❌ Missing | P2 | Wave 2 - TMS Core |

**Overlays Score:** 1 Complete, 1 Partial, 4 Missing

---

### 3.8 Logistics-Specific (21 components)

| # | Component | Category | Design System | shadcn Installed | Custom Built | Gap Status | Priority | Wave Needed |
|---|-----------|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 87 | LoadBoard | Logistics | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 88 | LoadMap | Logistics | Yes | -- | route-map (partial) | 🟡 Partial | P1 | Wave 2 - TMS Core |
| 89 | RouteDisplay | Logistics | Yes | -- | route-map (partial) | 🟡 Partial | P1 | Wave 2 - TMS Core |
| 90 | StopList | Logistics | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 91 | EquipmentSelector | Logistics | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 92 | CarrierSelector | Logistics | Yes | -- | -- | ❌ Missing | P1 | Wave 3 - Carrier |
| 93 | CustomerSelector | Logistics | Yes | -- | contact-select (partial) | 🟡 Partial | P1 | Wave 2 - TMS Core |
| 94 | LaneSearch | Logistics | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 95 | RateCalculator | Logistics | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 96 | QuoteBuilder | Logistics | Yes | -- | customer-form (quotes, partial) | 🟡 Partial | P1 | Wave 2 - TMS Core |
| 97 | InvoicePreview | Logistics | Yes | -- | -- | ❌ Missing | P1 | Wave 3 - Carrier |
| 98 | SettlementView | Logistics | Yes | -- | -- | ❌ Missing | P2 | Wave 3 - Carrier |
| 99 | DocumentChecklist | Logistics | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 100 | ComplianceStatus | Logistics | Yes | -- | -- | ❌ Missing | P2 | Wave 3 - Carrier |
| 101 | CSAScoreCard | Logistics | Yes | -- | -- | ❌ Missing | P2 | Wave 3 - Carrier |
| 102 | DriverSelector | Logistics | Yes | -- | -- | ❌ Missing | P2 | Wave 3 - Carrier |
| 103 | CheckCallLog | Logistics | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |
| 104 | PODCapture | Logistics | Yes | -- | -- | ❌ Missing | P2 | Wave 3 - Carrier |
| 105 | SignaturePad | Logistics | Yes | -- | -- | ❌ Missing | P3 | Wave 4 - Portal |
| 106 | LoadTimeline | Logistics | Yes | -- | activity-timeline (partial pattern) | 🟡 Partial | P1 | Wave 2 - TMS Core |
| 107 | DispatchBoard | Logistics | Yes | -- | -- | ❌ Missing | P1 | Wave 2 - TMS Core |

**Logistics Score:** 0 Complete, 5 Partial, 16 Missing

---

### 3.9 Customization (14 components)

| # | Component | Category | Design System | shadcn Installed | Custom Built | Gap Status | Priority | Wave Needed |
|---|-----------|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| 108 | FieldEditor | Customization | Yes | -- | -- | ⬜ Not Needed Yet | P4 | Wave 5 - Customization |
| 109 | LayoutEditor | Customization | Yes | -- | -- | ⬜ Not Needed Yet | P4 | Wave 5 - Customization |
| 110 | ViewBuilder | Customization | Yes | -- | -- | ⬜ Not Needed Yet | P4 | Wave 5 - Customization |
| 111 | FilterBuilder | Customization | Yes | -- | customer-filters, user-filters, audit-log-filters (pattern exists) | 🟡 Partial | P3 | Wave 3 - Carrier |
| 112 | ColumnChooser | Customization | Yes | -- | customer-columns (pattern exists) | 🟡 Partial | P3 | Wave 3 - Carrier |
| 113 | ThemeSwitcher | Customization | Yes | -- | -- | ⬜ Not Needed Yet | P4 | Wave 5 - Customization |
| 114 | LanguageSelector | Customization | Yes | -- | -- | ⬜ Not Needed Yet | P4 | Wave 5 - Customization |
| 115 | NotificationCenter | Customization | Yes | -- | notification-settings (partial) | 🟡 Partial | P2 | Wave 3 - Carrier |
| 116 | UserPreferences | Customization | Yes | -- | profile-form, general-settings-form (partial) | 🟡 Partial | P3 | Wave 3 - Carrier |
| 117 | WorkspaceManager | Customization | Yes | -- | -- | ⬜ Not Needed Yet | P4 | Wave 5 - Customization |
| 118 | DashboardBuilder | Customization | Yes | -- | -- | ⬜ Not Needed Yet | P4 | Wave 5 - Customization |
| 119 | ReportBuilder | Customization | Yes | -- | -- | ⬜ Not Needed Yet | P4 | Wave 5 - Customization |
| 120 | FormBuilder | Customization | Yes | -- | -- | ⬜ Not Needed Yet | P4 | Wave 5 - Customization |
| 121 | WorkflowBuilder | Customization | Yes | -- | -- | ⬜ Not Needed Yet | P4 | Wave 5 - Customization |

**Customization Score:** 0 Complete, 4 Partial, 0 Missing (10 Not Needed Yet)

---

## 4. Summary Statistics

### Overall Numbers

| Metric | Count |
|--------|-------|
| **Total design system components** | **121** |
| **shadcn primitives installed** | 30 (standard registry components) |
| **Custom UI-level components** | 3 (searchable-select, address-autocomplete, PageHeader) |
| **Custom feature components built** | 73 files (across admin, auth, CRM, layout, profile, load-planner, quotes, shared) |
| **Total installed + built files** | 106 |

### Gap Status Breakdown

| Status | Count | Percentage |
|--------|-------|------------|
| ✅ Complete | 38 | 31.4% |
| 🟡 Partial | 17 | 14.0% |
| ❌ Missing | 56 | 46.3% |
| ⬜ Not Needed Yet | 10 | 8.3% |
| **Total** | **121** | **100%** |

### Effective Coverage

- **Fully covered:** 38 / 121 = 31.4%
- **Some coverage (Complete + Partial):** 55 / 121 = 45.5%
- **Actionable gap (Missing, excluding Not Needed Yet):** 56 / 121 = 46.3%
- **Deferred (Not Needed Yet):** 10 / 121 = 8.3%

### Components Needed by Wave

#### Wave 2 -- TMS Core (NEXT -- Highest Priority)

Must-have components (P1):

1. MultiSelect
2. Radio / RadioGroup (shadcn install)
3. DatePicker (composite from calendar + popover)
4. DateRangePicker
5. CurrencyInput
6. Accordion (shadcn install)
7. Breadcrumb (shadcn install)
8. Stepper
9. DataGrid
10. KPICard
11. Statistic
12. Chart
13. LoadStatusBadge
14. LoadCard
15. LoadBoard
16. LoadMap (extend route-map)
17. RouteDisplay (extend route-map)
18. StopList
19. EquipmentSelector
20. CustomerSelector (extend contact-select)
21. LaneSearch
22. RateCalculator
23. QuoteBuilder (extend quotes/customer-form)
24. DocumentChecklist
25. CheckCallLog
26. LoadTimeline (extend activity-timeline pattern)
27. DispatchBoard

Nice-to-have for Wave 2 (P2):

28. IconButton
29. Link
30. Tag
31. Icon (standardized icon system)
32. CheckboxGroup
33. TimePicker
34. Grid
35. Panel
36. CommandPalette (extend command.tsx)
37. SearchInput
38. List
39. DescriptionList
40. ProgressTracker
41. Banner
42. DocumentViewer
43. PDFViewer

#### Wave 3 -- Carrier Management

44. AvatarGroup
45. Slider (shadcn install)
46. ContextMenu (shadcn install)
47. VerticalTabs
48. QuickActions
49. CarrierCard
50. CarrierSelector
51. InvoicePreview
52. SettlementView
53. ComplianceStatus
54. CSAScoreCard
55. DriverSelector
56. PODCapture
57. FilterBuilder
58. ColumnChooser
59. NotificationCenter
60. UserPreferences
61. Lightbox
62. ImagePreview

#### Wave 4 -- Portal

63. Footer
64. TreeView
65. SignaturePad

#### Wave 5 -- Customization Platform

66. FieldEditor
67. LayoutEditor
68. ViewBuilder
69. ThemeSwitcher
70. LanguageSelector
71. WorkspaceManager
72. DashboardBuilder
73. ReportBuilder
74. FormBuilder
75. WorkflowBuilder

---

## 5. shadcn Installation Commands

### Immediate Install (needed for Wave 2 -- TMS Core)

```bash
cd apps/web

# Radio and RadioGroup
npx shadcn@latest add radio-group

# Accordion
npx shadcn@latest add accordion

# Breadcrumb
npx shadcn@latest add breadcrumb

# Resizable panels (for layout components)
npx shadcn@latest add resizable

# Toggle group (for button groups / icon buttons)
npx shadcn@latest add toggle
npx shadcn@latest add toggle-group

# Chart (recharts wrapper)
npx shadcn@latest add chart

# Drawer (native shadcn drawer, currently using sheet)
npx shadcn@latest add drawer

# Input OTP (for MFA improvement)
npx shadcn@latest add input-otp
```

**One-liner for all Wave 2 installs:**

```bash
cd apps/web && npx shadcn@latest add radio-group accordion breadcrumb resizable toggle toggle-group chart drawer input-otp
```

### Future Installs (Wave 3+)

```bash
cd apps/web

# Context menu (right-click menus for carrier/load board)
npx shadcn@latest add context-menu

# Slider (rate range filters)
npx shadcn@latest add slider

# Navigation menu (portal navigation)
npx shadcn@latest add navigation-menu

# Menubar (portal top menu)
npx shadcn@latest add menubar

# Hover card (carrier/driver previews)
npx shadcn@latest add hover-card

# Aspect ratio (document/image viewers)
npx shadcn@latest add aspect-ratio

# Carousel (image galleries for POD/documents)
npx shadcn@latest add carousel
```

**One-liner for all Wave 3+ installs:**

```bash
cd apps/web && npx shadcn@latest add context-menu slider navigation-menu menubar hover-card aspect-ratio carousel
```

---

## 6. Components to Build -- Priority Order

### Wave 2 -- Simple Components (1-2 days each)

| # | Component | Complexity | Dependencies | Notes |
|---|-----------|:---:|-------------|-------|
| 1 | RadioGroup | Simple | `npx shadcn add radio-group` | Pure shadcn install |
| 2 | Accordion | Simple | `npx shadcn add accordion` | Pure shadcn install |
| 3 | Breadcrumb | Simple | `npx shadcn add breadcrumb` | Pure shadcn install |
| 4 | IconButton | Simple | button.tsx | Variant of existing Button |
| 5 | Link | Simple | Next.js Link | Styled wrapper around next/link |
| 6 | Tag | Simple | badge.tsx | Variant of Badge with dismiss |
| 7 | ButtonGroup | Simple | button.tsx | Flex wrapper for Button children |
| 8 | CheckboxGroup | Simple | checkbox.tsx | Array wrapper for Checkbox |
| 9 | Banner | Simple | alert.tsx | Full-width variant of Alert |
| 10 | List | Simple | -- | Styled ul/ol wrapper |
| 11 | DescriptionList | Simple | -- | Styled dl/dt/dd wrapper |
| 12 | LoadStatusBadge | Simple | badge.tsx | Domain-specific Badge variant |
| 13 | Icon | Simple | lucide-react | Standardized icon wrapper |

### Wave 2 -- Medium Components (2-5 days each)

| # | Component | Complexity | Dependencies | Notes |
|---|-----------|:---:|-------------|-------|
| 14 | MultiSelect | Medium | command.tsx, popover.tsx, badge.tsx | Combobox with multi-selection + tag display |
| 15 | DatePicker | Medium | calendar.tsx, popover.tsx | Composite: popover + calendar + input |
| 16 | DateRangePicker | Medium | calendar.tsx, popover.tsx | Two-calendar range selector |
| 17 | TimePicker | Medium | select.tsx or custom | Hour/minute/period selectors |
| 18 | CurrencyInput | Medium | input.tsx | Masked input with currency formatting |
| 19 | Stepper | Medium | -- | Multi-step wizard navigation |
| 20 | KPICard | Medium | card.tsx | Card with metric, trend, sparkline |
| 21 | Statistic | Medium | -- | Number display with label + delta |
| 22 | SearchInput | Medium | input.tsx, command.tsx | Debounced search with suggestions |
| 23 | CommandPalette | Medium | command.tsx, dialog.tsx | Cmd+K global command palette |
| 24 | ProgressTracker | Medium | -- | Multi-step status tracker (horizontal) |
| 25 | Grid | Medium | -- | Responsive CSS grid wrapper |
| 26 | Panel | Medium | card.tsx, collapsible.tsx | Collapsible content panel |
| 27 | LoadCard | Medium | card.tsx, badge.tsx | Load summary card with status |
| 28 | StopList | Medium | -- | Ordered list of pickup/delivery stops |

### Wave 2 -- Complex Components (5-10+ days each)

| # | Component | Complexity | Dependencies | Notes |
|---|-----------|:---:|-------------|-------|
| 29 | DataGrid | Complex | table.tsx, pagination, sort, filter | Virtual scrolling, column resize, inline edit |
| 30 | Chart | Complex | recharts or chart.tsx (shadcn) | Line, bar, pie, area chart system |
| 31 | LoadBoard | Complex | DataGrid, LoadCard, filters | Filterable load management board |
| 32 | DispatchBoard | Complex | DataGrid, Map, LoadTimeline | Dispatch assignment interface |
| 33 | LoadMap | Complex | route-map, MapboxGL/Google Maps | Multi-stop route with live tracking |
| 34 | RouteDisplay | Complex | route-map | Route details with stops overlay |
| 35 | EquipmentSelector | Complex | command.tsx, popover.tsx | Equipment type + specs search |
| 36 | CustomerSelector | Complex | contact-select pattern | Customer search with details preview |
| 37 | LaneSearch | Complex | command.tsx, map | Origin-destination lane search |
| 38 | RateCalculator | Complex | CurrencyInput, form | Rate quoting with accessorials |
| 39 | QuoteBuilder | Complex | RateCalculator, form, table | Full quote creation workflow |
| 40 | DocumentChecklist | Complex | checkbox, progress | Required docs tracking with upload |
| 41 | CheckCallLog | Complex | timeline, form | Check call entry + history |
| 42 | LoadTimeline | Complex | activity-timeline pattern | Load lifecycle event timeline |
| 43 | DocumentViewer | Complex | -- | In-browser doc/image viewer |
| 44 | PDFViewer | Complex | pdf.js | Embedded PDF rendering |

### Wave 3 -- Carrier Management Components

| # | Component | Complexity | Dependencies | Notes |
|---|-----------|:---:|-------------|-------|
| 45 | CarrierCard | Medium | card.tsx, badge.tsx | Carrier summary with compliance status |
| 46 | CarrierSelector | Medium | command.tsx, popover.tsx | Carrier search with preview |
| 47 | InvoicePreview | Complex | PDFViewer, table.tsx | Invoice rendering and review |
| 48 | SettlementView | Complex | table.tsx, Statistic | Settlement details + line items |
| 49 | ComplianceStatus | Medium | badge.tsx, progress.tsx | Compliance indicator dashboard |
| 50 | CSAScoreCard | Medium | card.tsx, Chart | CSA score display with breakdown |
| 51 | DriverSelector | Medium | command.tsx, popover.tsx | Driver search with availability |
| 52 | PODCapture | Complex | FileUpload, SignaturePad | POD document capture workflow |
| 53 | FilterBuilder | Complex | select, input, button | Dynamic filter criteria builder |
| 54 | ColumnChooser | Medium | checkbox, DnD | Drag-and-drop column visibility |
| 55 | NotificationCenter | Complex | popover, scroll-area | Notification dropdown with mark-read |
| 56 | AvatarGroup | Simple | avatar.tsx | Overlapping avatar stack |
| 57 | VerticalTabs | Simple | tabs.tsx | Vertical orientation tabs |
| 58 | QuickActions | Medium | command.tsx | Contextual quick action menu |
| 59 | Lightbox | Medium | dialog.tsx | Full-screen image viewer |
| 60 | ImagePreview | Medium | dialog.tsx | Thumbnail + zoom image preview |
| 61 | UserPreferences | Medium | form.tsx, switch.tsx | User preference management panel |

### Wave 4 -- Portal Components

| # | Component | Complexity | Dependencies | Notes |
|---|-----------|:---:|-------------|-------|
| 62 | Footer | Simple | -- | Public/portal footer |
| 63 | TreeView | Medium | collapsible.tsx | Hierarchical tree display |
| 64 | SignaturePad | Complex | canvas API | Touch/mouse signature capture |

### Wave 5 -- Customization Platform Components

| # | Component | Complexity | Dependencies | Notes |
|---|-----------|:---:|-------------|-------|
| 65 | FieldEditor | Complex | form.tsx, DnD | Custom field definition editor |
| 66 | LayoutEditor | Complex | DnD, Grid | Drag-and-drop layout builder |
| 67 | ViewBuilder | Complex | DataGrid, FilterBuilder | Custom view/saved-filter builder |
| 68 | ThemeSwitcher | Medium | CSS variables | Light/dark/custom theme toggle |
| 69 | LanguageSelector | Simple | select.tsx, i18n | Language/locale picker |
| 70 | WorkspaceManager | Complex | tabs, DnD | Multi-workspace management |
| 71 | DashboardBuilder | Complex | Grid, DnD, Chart, KPICard | Drag-and-drop dashboard composer |
| 72 | ReportBuilder | Complex | DataGrid, Chart, FilterBuilder | Custom report designer |
| 73 | FormBuilder | Complex | FieldEditor, DnD | Drag-and-drop form designer |
| 74 | WorkflowBuilder | Complex | DnD, canvas/SVG | Visual workflow automation editor |

---

## Appendix: Effort Estimation Summary

| Category | Simple | Medium | Complex | Total |
|----------|:------:|:------:|:-------:|:-----:|
| Wave 2 - TMS Core | 13 | 15 | 16 | 44 |
| Wave 3 - Carrier | 2 | 9 | 6 | 17 |
| Wave 4 - Portal | 1 | 1 | 1 | 3 |
| Wave 5 - Customization | 1 | 1 | 8 | 10 |
| **Total to Build** | **17** | **26** | **31** | **74** |

| Complexity | Est. Days Each | Total Days |
|------------|:--------------:|:----------:|
| Simple (shadcn install or thin wrapper) | 0.5 - 1 | 8.5 - 17 |
| Medium (composite or domain logic) | 2 - 5 | 52 - 130 |
| Complex (multi-dependency, heavy logic) | 5 - 10+ | 155 - 310+ |
| **Grand Total Estimate** | | **215 - 457 dev-days** |

> **Note:** These estimates assume a single developer. With parallel development across 2-3 developers, Wave 2 could be completed in approximately 8-12 weeks. Many "complex" logistics components share patterns (selector, board, card) that enable component reuse once the first of each pattern is built.
