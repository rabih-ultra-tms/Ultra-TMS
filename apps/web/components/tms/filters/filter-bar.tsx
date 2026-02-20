"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/lib/hooks";
import { Badge } from "@/components/ui/badge";

// ---------------------------------------------------------------------------
// Filter Bar — Search + dynamic filter row for list pages
//
// Accepts a search placeholder, an array of filter definitions, and
// callbacks. Search is debounced at 300ms. Supports select, date-range,
// and text filter types. Shows active filter count badge and "Clear all".
// ---------------------------------------------------------------------------

export type FilterType = "select" | "date-range" | "text";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterDefinition {
  /** Unique filter name (used as key in onFilterChange) */
  name: string;
  /** Display label */
  label: string;
  /** Filter input type */
  type: FilterType;
  /** Options for select filters */
  options?: FilterOption[];
  /** Placeholder for text/select filters */
  placeholder?: string;
}

export interface FilterValues {
  [key: string]: string;
}

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Current search value (controlled) */
  searchValue?: string;
  /** Called with debounced search value */
  onSearchChange?: (value: string) => void;
  /** Filter definitions */
  filters?: FilterDefinition[];
  /** Current filter values */
  filterValues?: FilterValues;
  /** Called when a filter value changes */
  onFilterChange?: (name: string, value: string) => void;
  /** Called when "Clear all" is clicked */
  onClear?: () => void;
  /** Whether any filters are active (auto-calculated if filterValues provided) */
  hasActiveFilters?: boolean;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClear,
  hasActiveFilters: hasActiveFiltersProp,
  className,
  children,
  ...props
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = React.useState(searchValue);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Sync controlled search value
  React.useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Fire debounced search callback
  React.useEffect(() => {
    onSearchChange?.(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Count active filters
  const activeFilterCount = Object.values(filterValues).filter(
    (v) => v !== "" && v !== undefined
  ).length;
  const hasActiveFilters =
    hasActiveFiltersProp ?? (activeFilterCount > 0 || localSearch.length > 0);

  return (
    <div
      className={cn(
        "flex items-center h-11 px-5 gap-1.5",
        "border-b border-border bg-surface-filter",
        "overflow-x-auto no-scrollbar shrink-0",
        "transition-colors duration-200",
        className
      )}
      {...props}
    >
      {/* Search input */}
      <div className="relative flex items-center shrink-0">
        <Search className="absolute left-2 size-3.5 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className={cn(
            "h-7 w-48 pl-7 pr-7 rounded-md border text-[11px]",
            "bg-surface border-border text-text-primary",
            "placeholder:text-text-muted",
            "focus:outline-none focus:border-primary-border focus:ring-1 focus:ring-primary-border",
            "transition-colors duration-150"
          )}
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => setLocalSearch("")}
            className="absolute right-1.5 p-0.5 text-text-muted hover:text-text-primary"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Dynamic filters */}
      {filters.map((filter) => {
        if (filter.type === "select" && filter.options) {
          return (
            <select
              key={filter.name}
              value={filterValues[filter.name] ?? ""}
              onChange={(e) => onFilterChange?.(filter.name, e.target.value)}
              className={cn(
                "h-7 px-2 rounded-md border text-[11px] font-medium",
                "bg-surface border-border text-text-secondary",
                "cursor-pointer transition-colors duration-150",
                "focus:outline-none focus:border-primary-border",
                filterValues[filter.name] &&
                  "bg-primary-light border-primary-border text-primary"
              )}
            >
              <option value="">{filter.placeholder ?? filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          );
        }

        if (filter.type === "text") {
          return (
            <input
              key={filter.name}
              type="text"
              value={filterValues[filter.name] ?? ""}
              onChange={(e) => onFilterChange?.(filter.name, e.target.value)}
              placeholder={filter.placeholder ?? filter.label}
              className={cn(
                "h-7 w-32 px-2 rounded-md border text-[11px]",
                "bg-surface border-border text-text-primary",
                "placeholder:text-text-muted",
                "focus:outline-none focus:border-primary-border",
                "transition-colors duration-150"
              )}
            />
          );
        }

        // date-range renders a placeholder since actual DateRangePicker
        // is a separate component. Consumers pass children for complex filters.
        if (filter.type === "date-range") {
          return (
            <button
              key={filter.name}
              type="button"
              className={cn(
                "h-7 px-2.5 rounded-md border text-[11px] font-medium",
                "bg-surface border-border text-text-secondary",
                "cursor-pointer transition-colors duration-150",
                "hover:border-primary-border hover:text-text-primary",
                filterValues[filter.name] &&
                  "bg-primary-light border-primary-border text-primary"
              )}
            >
              {filterValues[filter.name] || filter.placeholder || filter.label}
            </button>
          );
        }

        return null;
      })}

      {/* Pass-through children for custom filter chips */}
      {children}

      {/* Active filter count + Clear all */}
      {hasActiveFilters && (
        <>
          <FilterDivider />
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-semibold shrink-0">
              {activeFilterCount}
            </Badge>
          )}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="ml-auto shrink-0 text-[11px] text-text-muted hover:text-danger transition-colors duration-150 px-1"
            >
              Clear all
            </button>
          )}
        </>
      )}
    </div>
  );
}

/** Vertical divider between chip groups */
export function FilterDivider({ className }: { className?: string }) {
  return (
    <div
      className={cn("w-px h-5 bg-border-soft shrink-0", className)}
      role="separator"
    />
  );
}
