"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// TablePagination — Page controls matching dispatch v5 design
//
// v5 spec:
//   Height: 44px, surface bg, top border
//   Left: "Showing X-Y of Z loads" (12px muted)
//   Right: page buttons (28×28, 12px, 4px radius) + ellipsis + prev/next
//   Active page: sapphire bg, white text
//   Disabled: 40% opacity
// ---------------------------------------------------------------------------

export interface TablePaginationProps {
  /** Current page index (0-based) */
  pageIndex: number;
  /** Total number of pages */
  pageCount: number;
  /** Total number of rows across all pages */
  totalRows: number;
  /** Number of rows per page */
  pageSize: number;
  /** Can go to previous page */
  canPreviousPage: boolean;
  /** Can go to next page */
  canNextPage: boolean;
  /** Go to specific page */
  onPageChange: (pageIndex: number) => void;
  /** Entity label for display (default: "results") */
  entityLabel?: string;
  /** Additional class names */
  className?: string;
}

/** Build the page number array with ellipsis */
function getPageNumbers(
  currentPage: number,
  totalPages: number
): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const pages: (number | "ellipsis")[] = [];

  // Always show first page
  pages.push(0);

  if (currentPage > 2) {
    pages.push("ellipsis");
  }

  // Pages around current
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(totalPages - 2, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 3) {
    pages.push("ellipsis");
  }

  // Always show last page
  pages.push(totalPages - 1);

  return pages;
}

export function TablePagination({
  pageIndex,
  pageCount,
  totalRows,
  pageSize,
  canPreviousPage,
  canNextPage,
  onPageChange,
  entityLabel = "results",
  className,
}: TablePaginationProps) {
  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);
  const pageNumbers = getPageNumbers(pageIndex, pageCount);

  return (
    <div
      className={cn(
        "h-11 flex items-center justify-between px-5 shrink-0",
        "border-t border-border bg-surface",
        className
      )}
    >
      {/* Info text */}
      <span className="text-xs text-text-muted">
        Showing {startRow}–{endRow} of {totalRows} {entityLabel}
      </span>

      {/* Page controls */}
      <div className="flex items-center gap-0.5">
        {/* Previous */}
        <PageButton
          disabled={!canPreviousPage}
          onClick={() => onPageChange(pageIndex - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </PageButton>

        {/* Page numbers */}
        {pageNumbers.map((page, i) =>
          page === "ellipsis" ? (
            <span
              key={`e-${i}`}
              className="w-7 text-center text-xs text-text-muted"
            >
              ...
            </span>
          ) : (
            <PageButton
              key={page}
              active={page === pageIndex}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page + 1}`}
            >
              {page + 1}
            </PageButton>
          )
        )}

        {/* Next */}
        <PageButton
          disabled={!canNextPage}
          onClick={() => onPageChange(pageIndex + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </PageButton>
      </div>
    </div>
  );
}

// ---- Page button ----------------------------------------------------------

interface PageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function PageButton({
  active,
  disabled,
  className,
  children,
  ...props
}: PageButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "size-7 rounded-[4px] border",
        "text-xs font-medium",
        "inline-flex items-center justify-center",
        "cursor-pointer transition-all duration-150",
        active
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-surface border-border text-text-secondary hover:border-primary hover:text-primary",
        disabled && "opacity-40 cursor-default pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
