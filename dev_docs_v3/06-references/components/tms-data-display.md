# TMS Data Display Components

Components for displaying data in tables, cards, grids, and lists.

---

## DataTable

**File:** `apps/web/components/tms/tables/data-table.tsx`
**LOC:** 246

### Props

```typescript
interface DataTableProps<TData> {
  table: TanStackTable<TData>;      // Fully configured TanStack table instance
  density?: Density;                 // "compact" | "default" | "spacious"
  className?: string;
  onRowClick?: (row: Row<TData>) => void;
  isRowAtRisk?: (row: Row<TData>) => boolean;  // Danger highlight predicate
  renderGroupHeader?: (row: Row<TData>) => React.ReactNode;
  getRowClassName?: (row: Row<TData>) => string | undefined;
}
```

### Behavior

This is a **presentation-only** component. The parent owns the `useReactTable()` call and passes the configured table instance. DataTable renders:
- Sticky header row (36px, uppercase 10px labels, sort indicators)
- Body rows with density-controlled heights (36/44/52px)
- At-risk row highlighting (danger background + 3px left border)
- Selected row highlighting
- Empty state ("No results found.")
- Group header rows via `renderGroupHeader`

### Design Tokens

- Header: `bg-surface`, 10px uppercase, `text-text-muted`, `font-semibold`
- Rows: `hover:bg-surface-hover`, selected: `bg-surface-selected`
- At-risk: `bg-danger-bg`, 3px left `border-l-danger`
- Sort icons: `text-primary` when active, `text-border-soft` when inactive
- Density: compact=36px/11px, default=44px/12px, spacious=52px/13px

### Exported Helpers

- `SelectAllCheckbox<TData>` - Header checkbox for select-all
- `RowCheckbox<TData>` - Per-row selection checkbox

---

## KpiCard

**File:** `apps/web/components/tms/stats/kpi-card.tsx`
**LOC:** 109

### Props

```typescript
interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;    // e.g. "+12%"
  subtext?: string;
  loading?: boolean;      // Shows skeleton state
}
```

### Design Tokens

- Container: `p-4 rounded-lg border border-border bg-surface`
- Label: 11px uppercase, `text-text-muted`, `tracking-wider`
- Value: 24px bold, `text-text-primary`
- Trend up: `text-success` + TrendingUp icon
- Trend down: `text-danger` + TrendingDown icon
- Trend neutral: `text-text-muted` + Minus icon
- Loading: renders Skeleton components

---

## StatItem

**File:** `apps/web/components/tms/stats/stat-item.tsx`
**LOC:** 65

### Props

```typescript
interface StatItemProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: "up" | "down";
  trendLabel?: string;
}
```

Compact horizontal stat for the StatsBar. Shows label (10px uppercase), value (13px bold), and optional trend arrow. Items are separated by right borders.

---

## StatsBar

**File:** `apps/web/components/tms/stats/stats-bar.tsx`
**LOC:** 28

Container component: 40px height, `bg-surface`, `border-b`, horizontal flex. Wraps `StatItem` children.

---

## InfoGrid

**File:** `apps/web/components/tms/cards/info-grid.tsx`
**LOC:** 70

### Props

```typescript
interface InfoGridProps {
  cells: InfoCell[];           // { key, label, value, subText? }
  columns?: 1 | 2 | 3;        // Grid columns (default 2)
  className?: string;
}
```

Grid of labeled data cells. Each cell: background card, 9px uppercase label, 13px semibold value, optional 10px subtext.

---

## FieldList

**File:** `apps/web/components/tms/cards/field-list.tsx`
**LOC:** 51

### Props

```typescript
interface FieldListProps {
  fields: FieldItem[];    // { key, label, value }
  className?: string;
}
```

Vertical list of label/value rows separated by bottom borders. Label left (11px muted), value right (11px medium).

---

## RouteCard

**File:** `apps/web/components/tms/cards/route-card.tsx`
**LOC:** 103

### Props

```typescript
interface RouteCardProps {
  origin: RoutePoint;       // { city, dateTime?, isLate? }
  destination: RoutePoint;
  summary?: string;         // e.g. "1,200 miles - ~22h drive - $2.50/mi"
  className?: string;
}
```

Visual route display with origin dot (sapphire), connector line, destination dot (success), and summary text. Late dates render in `text-danger`.

---

## GroupHeader

**File:** `apps/web/components/tms/tables/group-header.tsx`
**LOC:** 88

### Props

```typescript
interface GroupHeaderProps {
  status: StatusColorToken;
  label: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  colSpan: number;
  className?: string;
}
```

Collapsible status-group row for DataTable. Shows colored StatusDot, uppercase label, count pill, and rotating chevron.

---

## TablePagination

**File:** `apps/web/components/tms/tables/table-pagination.tsx`
**LOC:** 181

### Props

```typescript
interface TablePaginationProps {
  pageIndex: number;         // 0-based
  pageCount: number;
  totalRows: number;
  pageSize: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageChange: (pageIndex: number) => void;
  entityLabel?: string;      // Default: "results"
  className?: string;
}
```

Shows "Showing X-Y of Z results" on left, page buttons on right with ellipsis for large page counts. Active page: sapphire background, white text.

---

## DensityToggle

**File:** `apps/web/components/tms/tables/density-toggle.tsx`
**LOC:** 64

### Props

```typescript
interface DensityToggleProps {
  value: Density;             // "compact" | "default" | "spacious"
  onChange: (density: Density) => void;
  className?: string;
}
```

3-way segmented control with icons. Active state: `bg-primary-light text-primary`. Uses `role="radiogroup"` for accessibility.

---

## BulkActionBar

**File:** `apps/web/components/tms/tables/bulk-action-bar.tsx`
**LOC:** 99

### Props

```typescript
interface BulkActionBarProps {
  selectedCount: number;
  actions: BulkAction[];    // { key, label, icon?, onClick }
  onClose: () => void;
  className?: string;
}
```

Slides in when rows are selected. Shows "{n} selected" + action buttons + close. Background: `bg-primary-light`. Returns null when `selectedCount === 0`.
