"use client";

import * as React from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    ColumnDef,
    SortingState,
    OnChangeFn,
    RowSelectionState,
    VisibilityState,
} from "@tanstack/react-table";
import { PageHeader } from "@/components/tms/layout/page-header";
import { DataTable } from "@/components/tms/tables/data-table";
import { TablePagination } from "@/components/tms/tables/table-pagination";
import { ListPageSkeleton } from "@/components/shared/list-page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// ListPage — Standardized layout for all list screens
//
// Composes:
// - PageHeader
// - FilterBar (passed as children/prop)
// - DataTable (TanStack Table wrapper)
// - TablePagination
// - Loading/Error/Empty states
// ---------------------------------------------------------------------------

interface ListPageProps<TData> {
    // --- Header ---
    title: string;
    description?: string;
    /** Right-side actions (e.g. "Add User" button) */
    headerActions?: React.ReactNode;

    // --- Filters ---
    /** Filter component(s) to render above the table */
    filters?: React.ReactNode;

    /** Stats component(s) to render above filters/table */
    stats?: React.ReactNode;

    /** Content to render between header and table (e.g. Stats Cards) */
    topContent?: React.ReactNode;

    // --- Data ---
    data: TData[];
    columns: ColumnDef<TData>[];
    total: number;
    page: number;
    pageSize?: number;
    pageCount?: number;
    onPageChange: (page: number) => void;

    // --- State ---
    isLoading?: boolean;
    error?: Error | null;
    onRetry?: () => void;

    // --- Interaction ---
    onRowClick?: (row: TData) => void;

    // --- Sorting (Server-side) ---
    sorting?: SortingState;
    onSortingChange?: OnChangeFn<SortingState>;

    // --- Selection ---
    rowSelection?: RowSelectionState;
    onRowSelectionChange?: OnChangeFn<RowSelectionState>;

    // --- Selection Actions ---
    /** Render prop for bulk actions bar when rows are selected */
    renderBulkActions?: (selectedRows: TData[]) => React.ReactNode;

    /** Custom entity label for pagination (e.g. "carriers", "loads") */
    entityLabel?: string;

    className?: string;
}

export function ListPage<TData>({
    title,
    description,
    headerActions,
    filters,
    stats,
    topContent,
    data,
    columns,
    total,
    page,
    pageSize = 25,
    pageCount,
    onPageChange,
    isLoading,
    error,
    onRetry,
    onRowClick,
    sorting,
    onSortingChange,
    rowSelection = {},
    onRowSelectionChange,
    renderBulkActions,
    entityLabel = "items",
    className,
}: ListPageProps<TData>) {
    // If pageCount not provided, calculate it
    const totalPages = pageCount ?? Math.ceil(total / pageSize);

    // Initialize TanStack Table
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            rowSelection,
            pagination: {
                pageIndex: page - 1, // TanStack is 0-indexed
                pageSize,
            },
        },
        pageCount: totalPages,
        manualPagination: true,
        manualSorting: true,
        enableRowSelection: true,
        onSortingChange,
        onRowSelectionChange,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row: any) => row.id, // Assume 'id' field exists, or make configurable
    });

    // Derived state
    const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
    const showBulkActions = Object.keys(rowSelection).length > 0 && renderBulkActions;

    // --- Render: Loading ---
    if (isLoading) {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <PageHeader title={title} actions={headerActions} />
                <div className="p-6">
                    <Card>
                        <ListPageSkeleton rows={10} columns={columns.length} />
                    </Card>
                </div>
            </div>
        );
    }

    // --- Render: Error ---
    if (error) {
        return (
            <div className={cn("flex flex-col h-full", className)}>
                <PageHeader title={title} actions={headerActions} />
                <div className="p-6">
                    <ErrorState
                        title="Error loading data"
                        message={error.message}
                        retry={onRetry}
                    />
                </div>
            </div>
        );
    }

    // --- Render: Empty (No data AND no filters - checking total only isn't enough if filtered)
    // Assuming 'total' is total filtered results. 
    // If total is 0, we check if it's because of filters or because it's truly empty.
    // For now, if 0 rows, use EmptyState only if we assume no filters. 
    // But typically the parent should handle "Empty Collection" vs "No Results Found".
    // Let's rely on standard EmptyState but user can pass custom content for it?
    // For now, standard behavior: if data is empty, show empty state inside the card.

    return (
        <div className={cn("flex flex-col h-full", className)}>
            <PageHeader
                title={title}
                // Description could be tooltip or subtext in header? PageHeader doesn't support desc directly yet.
                actions={headerActions}
            />

            <div className="p-6 space-y-4">
                {topContent}

                {/* Bulk Actions (Optional Overlay) */}
                {showBulkActions && (
                    <div className="sticky top-4 z-20">
                        {renderBulkActions(selectedRows)}
                    </div>
                )}

                {stats}

                <Card className="flex flex-col overflow-hidden">
                    {filters && (
                        <div className="border-b border-border">
                            {filters}
                        </div>
                    )}

                    {data.length === 0 ? (
                        <div className="p-12 flex justify-center">
                            <EmptyState
                                title={`No ${entityLabel} found`}
                                description="Try adjusting your filters or search query."
                                action={onRetry ? <Button onClick={onRetry}>Refresh</Button> : undefined}
                            />
                        </div>
                    ) : (
                        <>
                            <DataTable
                                table={table}
                                onRowClick={onRowClick ? (row) => onRowClick(row.original) : undefined}
                            />
                            <TablePagination
                                pageIndex={page - 1} // 0-based
                                pageCount={totalPages}
                                totalRows={total}
                                pageSize={pageSize}
                                canPreviousPage={page > 1}
                                canNextPage={page < totalPages}
                                onPageChange={(p) => onPageChange(p + 1)} // Convert back to 1-based
                                entityLabel={entityLabel}
                            />
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
