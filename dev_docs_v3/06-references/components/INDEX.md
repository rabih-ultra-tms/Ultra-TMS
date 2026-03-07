# Component Documentation Index

**Total: 50 documentation files** covering 304 components across 18 directories.

## Directory Overview Files (18)

| File | Directory | Components | LOC |
|------|-----------|------------|-----|
| [accounting.md](accounting.md) | `components/accounting/` | 18 | 2,851 |
| [admin.md](admin.md) | `components/admin/` | 22 + 1 test | 1,496 |
| [auth.md](auth.md) | `components/auth/` | 9 + 1 test | 658 |
| [carriers.md](carriers.md) | `components/carriers/` | 17 | 3,669 |
| [commissions.md](commissions.md) | `components/commissions/` | 10 | 1,762 |
| [crm.md](crm.md) | `components/crm/` | 23 + 2 tests | 2,243 |
| [layout.md](layout.md) | `components/layout/` | 5 + 3 tests | 799 |
| [load-board.md](load-board.md) | `components/load-board/` | 10 | 1,744 |
| [load-planner.md](load-planner.md) | `components/load-planner/` | 13 | 5,934 |
| [loads.md](loads.md) | `components/loads/` | 2 | 367 |
| [patterns.md](patterns.md) | `components/patterns/` | 3 | 714 |
| [profile.md](profile.md) | `components/profile/` | 5 | 119 |
| [quotes.md](quotes.md) | `components/quotes/` | 2 | 707 |
| [sales.md](sales.md) | `components/sales/` | 8 | 2,762 |
| [shared.md](shared.md) | `components/shared/` | 12 + 1 test | 1,151 |
| [tms.md](tms.md) | `components/tms/` (all subdirs) | ~100 | 19,874 |
| [tracking.md](tracking.md) | `components/tracking/` | 3 | 605 |
| [ui.md](ui.md) | `components/ui/` | 35 + 1 test | 2,667 |

## TMS Design System Deep-Dive Files (6)

| File | Category | Components Covered |
|------|----------|-------------------|
| [tms-primitives.md](tms-primitives.md) | Atomic building blocks | StatusBadge, StatusDot, CustomCheckbox, SearchInput, UserAvatar |
| [tms-data-display.md](tms-data-display.md) | Tables, cards, stats | DataTable, KpiCard, StatItem, StatsBar, InfoGrid, FieldList, RouteCard, GroupHeader, TablePagination, DensityToggle, BulkActionBar |
| [tms-forms.md](tms-forms.md) | Input & filtering | LoadForm, OrderForm, FilterBar, FilterChip, StatusDropdown, CarrierSelector, CheckCallForm, UploadZone |
| [tms-navigation.md](tms-navigation.md) | Navigation & panels | AppSidebar (v5), PageHeader, SlidePanel, PanelTabs, QuickActions, DashboardShell |
| [tms-feedback.md](tms-feedback.md) | Feedback & state | ConfirmDialog, AlertBanner, ErrorState, EmptyState, LoadingState, Skeletons, Toast |
| [tms-layout.md](tms-layout.md) | Page structure | DashboardShell, PageHeader, StatsBar, InfoGrid, FieldList, RouteCard, SlidePanel, FinancialSummaryCard, MetadataCard, Timeline, TimelineFeed, DispatchDetailDrawer |

## Individual Component Files (26)

### Data Display (5)

| File | Component | LOC |
|------|-----------|-----|
| [component-DataTable.md](component-DataTable.md) | DataTable | 246 |
| [component-LoadStatusBadge.md](component-LoadStatusBadge.md) | LoadStatusBadge | 143 |
| [component-StatusBadge.md](component-StatusBadge.md) | StatusBadge (Primitives + Unified) | 97 + 209 |
| [component-LoadCard.md](component-LoadCard.md) | LoadCard (Dispatch Kanban) | 407 |
| [component-LoadSummaryCard.md](component-LoadSummaryCard.md) | LoadSummaryCard | 116 |

### Layout (5)

| File | Component | LOC |
|------|-----------|-----|
| [component-PageHeader.md](component-PageHeader.md) | PageHeader | 69 |
| [component-Sidebar.md](component-Sidebar.md) | AppSidebar (v5 + current) | 134 + 141 |
| [component-DashboardShell.md](component-DashboardShell.md) | DashboardShell | 33 |
| [component-Breadcrumbs.md](component-Breadcrumbs.md) | Breadcrumb (7 sub-components) | 115 |
| [component-SlidePanel.md](component-SlidePanel.md) | SlidePanel | 179 |

### Forms (4)

| File | Component | LOC |
|------|-----------|-----|
| [component-LoadForm.md](component-LoadForm.md) | LoadForm | 1,021 |
| [component-CarrierForm.md](component-CarrierForm.md) | CarrierForm | 640 |
| [component-QuoteForm.md](component-QuoteForm.md) | QuoteFormV2 | 729 |
| [component-OrderForm.md](component-OrderForm.md) | OrderForm (5-step wizard) | 623 + 2,096 sub-components |

### Feedback (3)

| File | Component | LOC |
|------|-----------|-----|
| [component-ConfirmDialog.md](component-ConfirmDialog.md) | ConfirmDialog | 110 |
| [component-Toast.md](component-Toast.md) | Toast / Sonner | 5 + 93 |
| [component-AlertBanner.md](component-AlertBanner.md) | AlertBanner | 79 |

### Dashboard (3)

| File | Component | LOC |
|------|-----------|-----|
| [component-KpiCard.md](component-KpiCard.md) | KpiCard | 109 |
| [component-ActivityFeed.md](component-ActivityFeed.md) | OpsActivityFeed | 132 |
| [component-Timeline.md](component-Timeline.md) | Timeline | 114 |

### Specialized (6)

| File | Component | LOC |
|------|-----------|-----|
| [component-DocumentUpload.md](component-DocumentUpload.md) | DocumentUpload | 307 |
| [component-UploadZone.md](component-UploadZone.md) | UploadZone | 106 |
| [component-RateCon.md](component-RateCon.md) | RateConPreview | 86 |
| [component-TrackingMap.md](component-TrackingMap.md) | TrackingMap | 761 |
| [component-DispatchDetailDrawer.md](component-DispatchDetailDrawer.md) | DispatchDetailDrawer | 1,535 |
| [component-KanbanBoard.md](component-KanbanBoard.md) | KanbanBoard | 364 |
| [component-FilterBar.md](component-FilterBar.md) | FilterBar | 236 |
| [component-CarrierOverviewCard.md](component-CarrierOverviewCard.md) | CarrierOverviewCard | 169 |
| [component-LoadDetailHeader.md](component-LoadDetailHeader.md) | LoadDetailHeader | 194 |
| [component-FinancialSummaryCard.md](component-FinancialSummaryCard.md) | FinancialSummaryCard | 66 |
| [component-MetadataCard.md](component-MetadataCard.md) | MetadataCard | 74 |
| [component-CheckCallForm.md](component-CheckCallForm.md) | CheckCallForm | 224 |

## Components NOT Found (Skipped)

The following components from the original task list do not exist in the codebase:
- **SignaturePad** -- Not implemented
- **DocumentViewer** -- Not implemented (RateConPreview is the closest equivalent)
- **ErrorBoundary** -- Not implemented as a component (React's built-in error boundaries used instead)
- **LoadingSpinner** -- `LoadingState` exists instead (14 LOC, uses Loader2 icon)
- **NavigationMenu** -- Not implemented as a separate component (sidebar handles navigation)
- **QuoteCard** -- Not implemented (quotes displayed in tables, not cards)
- **CarrierCard** -- Not implemented (CarrierOverviewCard serves this purpose)
- **MetricWidget** -- Not implemented (KpiCard serves this purpose)
- **FileUpload** -- Named `DocumentUpload` instead (307 LOC)
