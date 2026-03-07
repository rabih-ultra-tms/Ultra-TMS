# FilterBar

**File:** `apps/web/components/tms/filters/filter-bar.tsx`
**LOC:** 236

## Props Interface

```typescript
interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterDefinition[];
  filterValues?: FilterValues;          // Record<string, string>
  onFilterChange?: (name: string, value: string) => void;
  onClear?: () => void;
  hasActiveFilters?: boolean;
}

interface FilterDefinition {
  name: string;                         // Unique key
  label: string;
  type: "select" | "date-range" | "text";
  options?: FilterOption[];             // For select type
  placeholder?: string;
}
```

## Behavior

Horizontal filter bar for list pages. Composes search + dynamic filters + clear action.

### Search

- Built-in search input (not using `SearchInput` primitive)
- **Debounced at 300ms** via `useDebounce` hook
- Search icon (left), clear button (right when text present)
- Width: 192px fixed

### Dynamic Filters

Renders inputs based on `FilterDefinition.type`:
- **select**: `<select>` with options. Active state: sapphire background + border
- **text**: Text input, 128px width
- **date-range**: Button placeholder (actual DateRangePicker passed via children)

### Active Filter Indicators

- Auto-counts active filters (non-empty values)
- Shows count badge when filters are active
- "Clear all" button (right-aligned) resets all filters

### Pass-Through Children

Accepts `children` for custom filter chips (e.g., `FilterChip` components) that render between the dynamic filters and the clear button.

## Used By

- All list pages via the `ListPage` pattern
- Dispatch board (`dispatch-toolbar.tsx`)
- Load list (`loads-filter-bar.tsx`)
- Order list (`order-filters.tsx`)

## Dependencies

- `@/lib/hooks` (useDebounce)
- `@/components/ui/badge` (active filter count badge)
- Lucide icons (Search, X)

## Accessibility

- Search input: standard HTML input with placeholder
- Filter divider: `role="separator"`
- Active filter count is visual-only (no ARIA)

## Known Issues

The `onSearchChange` fires the debounced value but also syncs from the controlled `searchValue` prop via `useEffect`. This could cause unnecessary re-renders if the parent passes a new `searchValue` that triggers the sync effect.
