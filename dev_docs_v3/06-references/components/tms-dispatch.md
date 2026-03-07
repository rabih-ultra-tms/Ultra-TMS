# TMS Dispatch Components

**Location:** `apps/web/components/tms/dispatch/`
**Component count:** 13

## Components

### DispatchBoard
- **File:** `dispatch-board.tsx`
- **Props:** Uses hooks internally for data fetching
- **Used by:** `/operations/dispatch` page
- **Description:** Main dispatch board component. Renders loads in either table (DataTable) or Kanban view. Supports bulk selection, filtering, and load detail drawer.

### DispatchBoardSkeleton
- **File:** `dispatch-board-skeleton.tsx`
- **Description:** Loading skeleton for the dispatch board.

### DispatchBulkToolbar
- **File:** `dispatch-bulk-toolbar.tsx`
- **Props:** Selected rows, bulk actions
- **Description:** Toolbar that appears when rows are selected. Supports bulk assign carrier, bulk status change, bulk export.

### DispatchDataTable
- **File:** `dispatch-data-table.tsx`
- **Props:** Loads data, columns config
- **Description:** Dispatch-specific data table with load columns (status, reference, origin, destination, carrier, pickup date, delivery date).

### DispatchDetailDrawer
- **File:** `dispatch-detail-drawer.tsx`
- **Props:** Load ID, open state
- **Description:** Slide-out drawer showing load details when a row is clicked. Contains tabs for overview, route, carrier, documents, and timeline.

### DispatchKpiStrip
- **File:** `dispatch-kpi-strip.tsx`
- **Description:** Horizontal KPI strip at the top of the dispatch board showing key metrics (total, unassigned, in-transit, delivered, at-risk).

### DispatchStatsBar
- **File:** `dispatch-stats-bar.tsx`
- **Description:** Statistics bar with quick counts by status category.

### DispatchToolbar
- **File:** `dispatch-toolbar.tsx`
- **Props:** View mode, density, filters
- **Description:** Toolbar with view toggle (table/kanban), density control, filter chips, search, and column visibility.

### KanbanBoard
- **File:** `kanban-board.tsx`
- **Props:** Loads grouped by status
- **Description:** Kanban-style board with status columns. Loads appear as draggable cards.

### KanbanLane
- **File:** `kanban-lane.tsx`
- **Props:** Lane status, loads in lane, count
- **Description:** Individual Kanban column/lane for a specific status.

### LoadCard
- **File:** `load-card.tsx`
- **Props:** Load data
- **Description:** Compact card showing load summary (reference, origin, destination, status, carrier) used in Kanban lanes.

### NewLoadDialog
- **File:** `new-load-dialog.tsx`
- **Description:** Quick-create dialog for new loads from the dispatch board.

### NewQuoteDialog
- **File:** `new-quote-dialog.tsx`
- **Description:** Quick-create dialog for new quotes from the dispatch board.

## Architecture

```
DispatchBoard
  +-- DispatchToolbar (top bar)
  |     +-- DensityToggle
  |     +-- FilterBar
  +-- DispatchKpiStrip (metrics)
  +-- DispatchDataTable (table view)
  |     +-- DataTable
  |     +-- DispatchBulkToolbar
  +-- KanbanBoard (kanban view)
  |     +-- KanbanLane (per status)
  |           +-- LoadCard (per load)
  +-- DispatchDetailDrawer (side panel)
```
