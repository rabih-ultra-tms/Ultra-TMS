"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    VisibilityState,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Load, LoadStatus } from "@/types/loads";
import { LoadStatusBadge } from "./load-status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import {
    ArrowUpDown,
    MoreHorizontal,
    Truck,
    Snowflake,
    Container,
    Eye,
    Edit,
    Trash
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDeleteLoad } from "@/lib/hooks/tms/use-loads";

interface LoadsDataTableProps {
    data: Load[];
    isLoading?: boolean;
    onRowClick?: (load: Load) => void;
    onViewDetails?: (load: Load) => void;
    onEdit?: (load: Load) => void;
    onSelectionChange?: (selectedIds: string[]) => void;
    groupBy?: 'status' | null;
}

export function LoadsDataTable({
    data,
    isLoading: _isLoading,
    onRowClick,
    onViewDetails,
    onEdit,
    onSelectionChange: _onSelectionChange,
    groupBy
}: LoadsDataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

    const { mutate: deleteLoad, isPending: isDeleting } = useDeleteLoad();

    const columns: ColumnDef<Load>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label="Select row"
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40,
        },
        {
            accessorKey: "loadNumber",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                    Load # <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <span className="font-mono font-medium text-blue-600">{row.original.loadNumber}</span>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <LoadStatusBadge status={row.original.status} />,
        },
        {
            id: "route",
            header: "Origin > Destination",
            cell: ({ row }) => (
                <div className="flex items-center gap-1 text-sm">
                    <span className="font-medium">{row.original.originCity}, {row.original.originState}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{row.original.destinationCity}, {row.original.destinationState}</span>
                </div>
            ),
        },
        {
            accessorKey: "pickupDate",
            header: "Pickup",
            cell: ({ row }) => {
                const date = row.original.pickupDate ? new Date(row.original.pickupDate) : null;
                if (!date) return <span className="text-muted-foreground">--</span>;

                // Urgency Logic
                const isPast = date < new Date() && row.original.status === LoadStatus.PENDING;

                return (
                    <span className={cn(isPast ? "text-red-600 font-bold" : "")}>
                        {format(date, "MMM d")}
                    </span>
                );
            },
        },
        {
            accessorKey: "deliveryDate",
            header: "Delivery",
            cell: ({ row }) => {
                const date = row.original.deliveryDate ? new Date(row.original.deliveryDate) : null;
                return date ? format(date, "MMM d") : <span className="text-muted-foreground">--</span>;
            },
        },
        {
            accessorKey: "carrier",
            header: "Carrier",
            cell: ({ row }) => {
                const carrier = row.original.carrier;
                if (!carrier) return <span className="text-red-600 font-bold cursor-pointer hover:underline">Unassigned</span>;
                return <span className="text-blue-600 hover:underline cursor-pointer">{carrier.legalName}</span>;
            },
        },
        {
            accessorKey: "equipmentType",
            header: "Equip",
            cell: ({ row }) => {
                // Mock mapping based on type
                const type = row.original.equipmentType || "Van";
                let Icon = Truck;
                if (type.includes("Reefer")) Icon = Snowflake;
                if (type.includes("Flatbed")) Icon = Container;

                return <Icon className="h-4 w-4 text-muted-foreground" />;
            },
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onViewDetails?.(row.original)}><Eye className="mr-2 h-4 w-4" /> View Details</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit?.(row.original)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteTargetId(row.original.id)}
                            >
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onRowSelectionChange: setRowSelection,
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            rowSelection,
            columnVisibility,
        },
    });

    // Grouping Logic (Manual for now as tanstack grouping is complex with custom UI)
    // If groupBy is set, we render groups manually.
    const renderContent = () => {
        if (!groupBy) {
            return (
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                onClick={() => onRowClick?.(row.original)}
                                className={cn(
                                    "cursor-pointer hover:bg-muted/50",
                                    // Urgency Row Highlighting
                                    !row.original.carrier && row.original.status === LoadStatus.PENDING ? "bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30" : ""
                                )}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            )
        }

        // Grouped Render
        // Group data by status
        const groups: Record<string, Load[]> = {};
        data.forEach(load => {
            const status = load.status || "Other";
            if (!groups[status]) groups[status] = [];
            groups[status].push(load);
        });

        return (
            <TableBody>
                {Object.entries(groups).map(([status, loads]) => (
                    <>
                        <TableRow key={`group-${status}`} className="bg-muted/50 hover:bg-muted/70">
                            <TableCell colSpan={columns.length} className="font-semibold py-2">
                                <div className="flex items-center gap-2">
                                    <LoadStatusBadge status={status as LoadStatus} variant="dot-label" />
                                    <span className="text-muted-foreground text-xs">({loads.length})</span>
                                </div>
                            </TableCell>
                        </TableRow>
                        {loads.map(load => {
                            // Find the row model for this load to maintain selection state if possible
                            // For simplicity in this iteration, we might re-render rows manually or map back to table rows
                            // To keep selection working, we should find the row object from table instance
                            const row = table.getRowModel().rows.find(r => r.original.id === load.id);
                            if (!row) return null;

                            return (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => onRowClick?.(row.original)}
                                    className="cursor-pointer hover:bg-muted/50 pl-4"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            )
                        })}
                    </>
                ))}
            </TableBody>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                {renderContent()}
            </Table>
            {/* Floating Bulk Action Bar (Mockup) */}
            {Object.keys(rowSelection).length > 0 && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-lg shadow-xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
                    <span className="font-semibold">{Object.keys(rowSelection).length} selected</span>
                    <div className="h-4 w-px bg-slate-700 mx-2" />
                    <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800">Assign Carrier</Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800">Update Status</Button>
                    <Button size="sm" variant="ghost" className="text-white hover:bg-slate-800" onClick={() => setRowSelection({})}>Cancel</Button>
                </div>
            )}

            <ConfirmDialog
                open={!!deleteTargetId}
                onCancel={() => setDeleteTargetId(null)}
                title="Delete Load"
                description="This load will be permanently deleted. This action cannot be undone."
                variant="destructive"
                confirmLabel="Delete"
                isLoading={isDeleting}
                onConfirm={() => {
                    if (deleteTargetId) {
                        deleteLoad(deleteTargetId, { onSuccess: () => setDeleteTargetId(null) });
                    }
                }}
            />
        </div>
    );
}
