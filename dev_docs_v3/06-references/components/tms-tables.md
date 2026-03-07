# TMS Tables Components

**Location:** `apps/web/components/tms/tables/`
**Component count:** 6 (5 components + 1 barrel)

## Components

### DataTable
- **File:** `data-table.tsx`
- **Lines:** 247
- **Props:** `table: TanStackTable`, `density`, `onRowClick`, `isRowAtRisk`, `renderGroupHeader`, `getRowClassName`
- **Used by:** Dispatch board, loads list, operations pages
- **Description:** Core presentation component for TanStack React Table instances. See [data-table.md](data-table.md) for full deep-dive.

### DensityToggle
- **File:** `density-toggle.tsx`
- **Lines:** 65
- **Props:** `value: Density`, `onChange: (density: Density) => void`, `className`
- **Used by:** Dispatch toolbar, list page toolbars
- **Description:** 3-way segmented control for table row density (compact 36px / default 44px / spacious 52px). Uses radio group ARIA pattern with Lucide icons (AlignJustify, List, StretchHorizontal).

### BulkActionBar
- **File:** `bulk-action-bar.tsx`
- **Props:** Selected count, available actions, onAction
- **Used by:** Dispatch board, loads list
- **Description:** Toolbar appearing when rows are selected. Shows selection count and available bulk actions (assign, update status, export, delete).

### GroupHeader
- **File:** `group-header.tsx`
- **Props:** Row data, column count, expanded state
- **Used by:** DataTable (via renderGroupHeader prop)
- **Description:** Collapsible group header row for grouped table views. Shows group label, count, and expand/collapse chevron.

### TablePagination
- **File:** `table-pagination.tsx`
- **Props:** Table instance or page/total/onChange
- **Used by:** All paginated tables
- **Description:** Pagination controls showing page info, rows per page selector, and prev/next/first/last page buttons.

### index.ts
- **File:** `index.ts`
- **Description:** Barrel exports for DataTable, DensityToggle, BulkActionBar, GroupHeader, TablePagination
