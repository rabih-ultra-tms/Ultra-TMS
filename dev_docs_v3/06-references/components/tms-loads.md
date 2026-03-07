# TMS Loads Components

**Location:** `apps/web/components/tms/loads/`
**Component count:** 16

## Components

### CarrierSelector
- **File:** `carrier-selector.tsx`
- **Props:** Selected carrier, onChange, load requirements
- **Used by:** Load form, dispatch assign dialog
- **Description:** Searchable carrier selector with filtering by equipment type, lane history, and carrier rating. Shows carrier details in dropdown.

### ColumnSettingsDrawer
- **File:** `column-settings-drawer.tsx`
- **Props:** Columns config, visible columns, onSave
- **Used by:** Loads list page
- **Description:** Slide-out drawer for configuring which columns are visible in the loads data table and their order.

### KPIStatCards
- **File:** `kpi-stat-cards.tsx`
- **Lines:** 84
- **Props:** `stats: LoadStats`, `isLoading: boolean`
- **Used by:** Operations loads page
- **Description:** 5-card grid showing Total Loads, Unassigned, In Transit, Delivered Today, and Total Revenue. See [stat-card.md](stat-card.md) for deep-dive.

### LoadCarrierTab
- **File:** `load-carrier-tab.tsx`
- **Props:** Load ID, carrier data
- **Used by:** Load detail page
- **Description:** Tab showing assigned carrier details, driver info, truck/trailer, and carrier performance metrics.

### LoadCheckCallsTab
- **File:** `load-check-calls-tab.tsx`
- **Props:** Load ID
- **Used by:** Load detail page
- **Description:** Tab for viewing and recording check calls. Integrates CheckCallTimeline and CheckCallForm.

### LoadDetailHeader
- **File:** `load-detail-header.tsx`
- **Props:** Load data
- **Used by:** Load detail page
- **Description:** Header section of load detail page showing load number, status badge, key dates, and action buttons (edit, assign, track).

### LoadDocumentsTab
- **File:** `load-documents-tab.tsx`
- **Props:** Load ID
- **Used by:** Load detail page
- **Description:** Tab for managing load documents. Integrates DocumentUpload and document list with type filtering.

### LoadDrawer
- **File:** `load-drawer.tsx`
- **Props:** Load ID, open state
- **Used by:** Dispatch board, loads list
- **Description:** Slide-out drawer with quick load summary and tabbed detail view.

### LoadForm
- **File:** `load-form.tsx`
- **Props:** Initial data, onSubmit, mode (create/edit)
- **Used by:** Load create/edit pages
- **Description:** Full load creation/editing form with stops builder, cargo details, rate entry, and carrier assignment.

### LoadRouteTab
- **File:** `load-route-tab.tsx`
- **Props:** Load stops data
- **Used by:** Load detail page
- **Description:** Tab showing load route with stops, addresses, appointment windows, and map visualization.

### LoadStatusBadge
- **File:** `load-status-badge.tsx`
- **Lines:** 143
- **Props:** `status: LoadStatus`, `variant`, `className`
- **Used by:** Load tables, load detail, dispatch cards
- **Description:** Load-specific status badge with icons. See [load-status-badge.md](load-status-badge.md) for deep-dive.

### LoadSummaryCard
- **File:** `load-summary-card.tsx`
- **Props:** Load data
- **Used by:** Load drawer, dispatch detail
- **Description:** Compact card summarizing a load's key information (reference, customer, origin, destination, dates, rate).

### LoadTimelineTab
- **File:** `load-timeline-tab.tsx`
- **Props:** Load ID
- **Used by:** Load detail page
- **Description:** Chronological timeline of all events for a load (created, dispatched, picked up, check calls, delivered, etc.).

### LoadTrackingCard
- **File:** `load-tracking-card.tsx`
- **Props:** Tracking data
- **Used by:** Load detail page
- **Description:** Card showing current tracking information including last known location, ETA, and tracking source.

### LoadsDataTable
- **File:** `loads-data-table.tsx`
- **Props:** Loads data, filters
- **Used by:** Loads list page, dispatch board
- **Description:** Full-featured loads table with sorting, filtering, row selection, status badges, and inline actions.

### LoadsFilterBar
- **File:** `loads-filter-bar.tsx`
- **Props:** Active filters, onChange
- **Used by:** Loads list page
- **Description:** Filter bar specific to loads list with status, date range, customer, carrier, and origin/destination filters.
