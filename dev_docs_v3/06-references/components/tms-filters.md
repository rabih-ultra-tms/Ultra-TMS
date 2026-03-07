# TMS Filters Components

**Location:** `apps/web/components/tms/filters/`
**Component count:** 5 (4 components + 1 barrel)

## Components

### FilterBar
- **File:** `filter-bar.tsx`
- **Props:** Filters config, active filters, onChange
- **Used by:** Dispatch board, loads list, orders list
- **Description:** Horizontal bar of filter controls. Renders filter dropdowns based on configuration. Shows active filter count. Supports clear-all action.

### FilterChip
- **File:** `filter-chip.tsx`
- **Props:** Label, value, onRemove
- **Used by:** FilterBar
- **Description:** Individual filter chip showing an active filter with its value and an X button to remove it. Uses design token colors.

### ColumnVisibility
- **File:** `column-visibility.tsx`
- **Props:** Columns array, visible columns, onChange
- **Used by:** Dispatch toolbar, loads toolbar
- **Description:** Dropdown menu for toggling column visibility in data tables. Renders checkbox list of available columns with toggle support.

### StatusDropdown
- **File:** `status-dropdown.tsx`
- **Props:** Statuses, selected, onChange
- **Used by:** FilterBar, toolbars
- **Description:** Dropdown select for filtering by status. Shows status badges in the dropdown for visual clarity.

### index.ts
- **File:** `index.ts`
- **Description:** Barrel exports for all filter components
