# DataTable

**File:** `apps/web/components/tms/tables/data-table.tsx`
**Lines:** 247
**Exports:** `DataTable`, `DataTableProps`, `SelectAllCheckbox`, `RowCheckbox`

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| table | `TanStackTable<TData>` | Yes | - | Fully configured TanStack React Table instance |
| density | `Density` | No | `"default"` | Row density: `compact` (36px), `default` (44px), `spacious` (52px) |
| className | `string` | No | - | Additional CSS classes on the scroll container |
| onRowClick | `(row: Row<TData>) => void` | No | - | Called when a row body is clicked (not checkbox) |
| isRowAtRisk | `(row: Row<TData>) => boolean` | No | - | Returns true for rows needing danger highlight |
| renderGroupHeader | `(row: Row<TData>) => ReactNode` | No | - | Custom renderer for group header rows |
| getRowClassName | `(row: Row<TData>) => string \| undefined` | No | - | Returns extra CSS classes for a row |

## Architecture

This is a **presentation-only** component. The parent owns the `useReactTable()` call and controls columns, data, sorting, selection, and grouping. DataTable only renders the configured table instance.

### Key Design Decisions
- **Sticky header** with `z-10` positioning
- **Sort indicators** using dual ArrowUp/ArrowDown with primary color for active direction
- **At-risk rows** get `danger-bg` background and 3px left border in danger color
- **Selected rows** get `surface-selected` background
- **Empty state** shows "No results found." centered in a 128px tall row
- **Table layout** uses `table-fixed` with `border-collapse`

### Helper Components

- **`SelectAllCheckbox<TData>`** -- Renders a select-all checkbox using `CustomCheckbox` primitive. Supports indeterminate state.
- **`RowCheckbox<TData>`** -- Renders a per-row selection checkbox.

## Usage Example

```tsx
import { DataTable } from "@/components/tms/tables/data-table";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";

const table = useReactTable({
  data: loads,
  columns,
  getCoreRowModel: getCoreRowModel(),
});

<DataTable
  table={table}
  density="compact"
  onRowClick={(row) => router.push(`/loads/${row.original.id}`)}
  isRowAtRisk={(row) => row.original.isOverdue}
/>
```

## Used By

- `components/tms/dispatch/dispatch-board.tsx` -- Dispatch board table view
- `components/patterns/list-page.tsx` -- Generic list page pattern
- `app/(dashboard)/operations/loads/page.tsx` -- Operations loads page

## Related Components

- `density-toggle.tsx` -- 3-way segmented control (compact/default/spacious) that feeds the `density` prop
- `bulk-action-bar.tsx` -- Bulk action toolbar for selected rows
- `group-header.tsx` -- Default group header row renderer
- `table-pagination.tsx` -- Pagination controls

## Implementation Notes

- Uses `@tanstack/react-table` (TanStack Table v8)
- Imports `CustomCheckbox` from `@/components/tms/primitives` for selection
- Density type imported from sibling `density-toggle.tsx`
- All styling uses design token CSS variables (`bg-surface`, `text-text-muted`, etc.)
- Follows dispatch v5 spec: 36px header, 10px uppercase, 600 weight

## Quality Assessment

**Rating: 8/10**
- TypeScript: Generic `<TData>` throughout, full type safety
- Accessibility: Sort headers are clickable, checkbox has aria-labels
- Error handling: Graceful empty state
- Design tokens: Fully tokenized, no hardcoded colors
- Minor: Could benefit from `aria-sort` on sortable columns
