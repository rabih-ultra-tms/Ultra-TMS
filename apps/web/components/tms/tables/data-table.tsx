"use client";

import * as React from "react";
import {
  flexRender,
  type Table as TanStackTable,
  type Row,
  type SortDirection,
} from "@tanstack/react-table";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CustomCheckbox } from "@/components/tms/primitives";
import type { Density } from "./density-toggle";

// ---------------------------------------------------------------------------
// DataTable — TanStack Table renderer matching dispatch v5 design
//
// This is a *presentation* component. It receives a fully-configured TanStack
// table instance and renders it. The parent owns the useReactTable() call so
// it controls columns, data, sorting, selection, grouping, etc.
//
// v5 spec reference:
//   Header: 36px, 10px uppercase, 600 weight, sticky
//   Rows:   44px default, 36px compact, 52px spacious
//   At-risk rows: danger-bg background, 3px left border
// ---------------------------------------------------------------------------

// ---- Types ----------------------------------------------------------------

export interface DataTableProps<TData> {
  /** Fully configured TanStack table instance */
  table: TanStackTable<TData>;
  /** Row density — controls row height & font size */
  density?: Density;
  /** Additional CSS classes on the scroll container */
  className?: string;
  /** Called when a row body is clicked (not the checkbox) */
  onRowClick?: (row: Row<TData>) => void;
  /** Predicate: returns true if this row is "at risk" (danger highlight) */
  isRowAtRisk?: (row: Row<TData>) => boolean;
  /** Optional render function for group header rows (used with grouping) */
  renderGroupHeader?: (row: Row<TData>) => React.ReactNode;
}

// ---- Density mapping ------------------------------------------------------

const densityRowClass: Record<Density, string> = {
  compact: "h-9 text-[11px]",    // 36px
  default: "h-11 text-xs",       // 44px
  spacious: "h-[52px] text-[13px]", // 52px
};

// ---- Sort indicator -------------------------------------------------------

function SortIndicator({ direction }: { direction: SortDirection | false }) {
  return (
    <span className="inline-flex flex-col leading-none ml-0.5">
      <ArrowUp
        className={cn(
          "size-3 -mb-[3px]",
          direction === "asc"
            ? "text-primary"
            : "text-border-soft"
        )}
        strokeWidth={2}
      />
      <ArrowDown
        className={cn(
          "size-3",
          direction === "desc"
            ? "text-primary"
            : "text-border-soft"
        )}
        strokeWidth={2}
      />
    </span>
  );
}

// ---- Select-all checkbox helper -------------------------------------------

export function SelectAllCheckbox<TData>({
  table,
}: {
  table: TanStackTable<TData>;
}) {
  const isAllSelected = table.getIsAllPageRowsSelected();
  const isSomeSelected = table.getIsSomePageRowsSelected();

  return (
    <CustomCheckbox
      checked={isAllSelected ? true : isSomeSelected ? "indeterminate" : false}
      indeterminate={isSomeSelected && !isAllSelected}
      onCheckedChange={(checked) =>
        table.toggleAllPageRowsSelected(!!checked)
      }
      aria-label="Select all rows"
    />
  );
}

// ---- Row select checkbox helper -------------------------------------------

export function RowCheckbox<TData>({ row }: { row: Row<TData> }) {
  return (
    <CustomCheckbox
      checked={row.getIsSelected()}
      onCheckedChange={(checked) => row.toggleSelected(!!checked)}
      aria-label="Select row"
    />
  );
}

// ---- Main component -------------------------------------------------------

export function DataTable<TData>({
  table,
  density = "default",
  className,
  onRowClick,
  isRowAtRisk,
  renderGroupHeader,
}: DataTableProps<TData>) {
  return (
    <div
      className={cn(
        "flex-1 overflow-auto bg-background transition-colors duration-200",
        className
      )}
    >
      <table className="w-full border-collapse table-fixed">
        {/* ---- Sticky header ---- */}
        <thead className="sticky top-0 z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort();
                const sorted = header.column.getIsSorted();

                return (
                  <th
                    key={header.id}
                    className={cn(
                      "bg-surface border-b border-border",
                      "px-2 h-9",
                      "text-[10px] font-semibold uppercase tracking-[0.05em]",
                      "text-text-muted text-left whitespace-nowrap select-none",
                      "transition-colors duration-200",
                      canSort && "cursor-pointer hover:text-text-secondary"
                    )}
                    style={{
                      width:
                        header.getSize() !== 150
                          ? header.getSize()
                          : undefined,
                    }}
                    onClick={
                      canSort
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-0.5">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {canSort && <SortIndicator direction={sorted} />}
                    </div>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>

        {/* ---- Body ---- */}
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                className="h-32 text-center text-text-muted text-sm"
              >
                No results found.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => {
              // If this is a grouping row and we have a renderer, use it
              if (row.getIsGrouped() && renderGroupHeader) {
                return (
                  <React.Fragment key={row.id}>
                    {renderGroupHeader(row)}
                  </React.Fragment>
                );
              }

              const atRisk = isRowAtRisk?.(row) ?? false;
              const selected = row.getIsSelected();

              return (
                <tr
                  key={row.id}
                  className={cn(
                    "cursor-pointer transition-colors duration-100",
                    // Row cell styles
                    "[&>td]:px-2 [&>td]:border-b [&>td]:border-border [&>td]:align-middle",
                    "[&>td]:transition-colors [&>td]:duration-200",
                    densityRowClass[density],
                    // Hover
                    "hover:[&>td]:bg-surface-hover",
                    // Selected
                    selected && "[&>td]:bg-surface-selected",
                    // At-risk
                    atRisk && "[&>td]:bg-danger-bg",
                    atRisk &&
                      "[&>td:first-child]:border-l-[3px] [&>td:first-child]:border-l-danger",
                    atRisk && "hover:[&>td]:bg-surface-hover"
                  )}
                  onClick={() => onRowClick?.(row)}
                  data-state={selected ? "selected" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
