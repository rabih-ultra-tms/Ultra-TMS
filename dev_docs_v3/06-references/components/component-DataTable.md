# DataTable

**File:** `apps/web/components/tms/tables/data-table.tsx`
**LOC:** 246

## Props Interface

```typescript
interface DataTableProps<TData> {
  /** Fully configured TanStack table instance */
  table: TanStackTable<TData>;
  /** Row density -- controls row height & font size */
  density?: Density; // "compact" | "default" | "spacious"
  /** Additional CSS classes on the scroll container */
  className?: string;
  /** Called when a row body is clicked (not the checkbox) */
  onRowClick?: (row: Row<TData>) => void;
  /** Predicate: returns true if this row is "at risk" (danger highlight) */
  isRowAtRisk?: (row: Row<TData>) => boolean;
  /** Optional render function for group header rows (used with grouping) */
  renderGroupHeader?: (row: Row<TData>) => React.ReactNode;
  /** Optional: returns extra CSS classes for a row */
  getRowClassName?: (row: Row<TData>) => string | undefined;
}
```

## Behavior

**Presentation-only component.** The parent owns `useReactTable()` and passes the fully configured table instance. DataTable only renders.

- **Sticky header**: 36px, uppercase 10px labels, dual-arrow sort indicators (active arrow colored sapphire)
- **Row density**: compact=36px/11px, default=44px/12px, spacious=52px/13px
- **Row selection**: Integrates with TanStack selection. Selected rows get `bg-surface-selected`
- **At-risk highlighting**: Rows where `isRowAtRisk` returns true get `bg-danger-bg` background + 3px left danger border
- **Grouping**: When a row is grouped and `renderGroupHeader` is provided, renders custom group header instead of data row
- **Empty state**: "No results found." centered in table body when no rows
- **Column widths**: Respects `header.getSize()` unless it's the default 150px

## Exported Helpers

- `SelectAllCheckbox<TData>` -- Header checkbox using CustomCheckbox with indeterminate state
- `RowCheckbox<TData>` -- Per-row selection checkbox

## Used By

- `apps/web/components/patterns/list-page.tsx` (ListPage pattern)
- `apps/web/components/tms/dispatch/dispatch-data-table.tsx`
- `apps/web/components/tms/loads/loads-data-table.tsx`
- Any page using the ListPage pattern

## Accessibility

- Sort headers: `cursor-pointer` with click-to-sort
- Checkbox cells: `aria-label="Select all rows"` / `aria-label="Select row"`
- Selected rows: `data-state="selected"` attribute

## Known Issues

None identified. Component is well-structured and matches v5 design spec.
