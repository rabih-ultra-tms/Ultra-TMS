import type { Meta, StoryObj } from "@storybook/react";
import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import {
  DataTable,
  SelectAllCheckbox,
  RowCheckbox,
  GroupHeader,
  BulkActionBar,
  TablePagination,
  DensityToggle,
  type Density,
} from "@/components/tms/tables";
import { StatusBadge } from "@/components/tms/primitives";
import {
  LOAD_STATUSES,
  type LoadStatus,
  type StatusColorToken,
} from "@/lib/design-tokens";
import {
  Truck,
  UserCheck,
  AlertTriangle,
  Download,
  Trash2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data — 25 loads from dispatch v5
// ---------------------------------------------------------------------------

interface Load {
  id: string;
  status: LoadStatus;
  customer: string;
  origin: string;
  dest: string;
  miles: number;
  carrier: string;
  driver: string;
  equipment: string;
  pickupDate: string;
  delivDate: string;
  rate: number;
  carrierPay: number;
  margin: number;
  updated: string;
  live: boolean;
  priority: "urgent" | "high" | "normal" | "low";
}

const loads: Load[] = [
  { id: "LD-7842", status: "transit", origin: "Chicago, IL", dest: "Dallas, TX", miles: 921, carrier: "Swift Transport", driver: "Mike Reynolds", customer: "Acme Distribution", equipment: "Dry Van", pickupDate: "Feb 6", delivDate: "Feb 8", rate: 3450, carrierPay: 2822, margin: 18.2, updated: "5m ago", live: true, priority: "high" },
  { id: "LD-7838", status: "transit", origin: "Atlanta, GA", dest: "Miami, FL", miles: 662, carrier: "J.B. Hunt", driver: "Carlos Mendez", customer: "Global Foods Inc", equipment: "Reefer", pickupDate: "Feb 6", delivDate: "Feb 7", rate: 2880, carrierPay: 2261, margin: 21.5, updated: "2m ago", live: true, priority: "normal" },
  { id: "LD-7835", status: "transit", origin: "Los Angeles, CA", dest: "Phoenix, AZ", miles: 373, carrier: "Werner Logistics", driver: "James Park", customer: "Desert Supply Co", equipment: "Flatbed", pickupDate: "Feb 7", delivDate: "Feb 7", rate: 1750, carrierPay: 1503, margin: 14.1, updated: "8m ago", live: true, priority: "normal" },
  { id: "LD-7831", status: "transit", origin: "Nashville, TN", dest: "Memphis, TN", miles: 213, carrier: "Schneider National", driver: "Tom Bradley", customer: "Music City Goods", equipment: "Dry Van", pickupDate: "Feb 7", delivDate: "Feb 7", rate: 1120, carrierPay: 932, margin: 16.8, updated: "22m ago", live: false, priority: "low" },
  { id: "LD-7826", status: "transit", origin: "Denver, CO", dest: "Kansas City, MO", miles: 605, carrier: "XPO Logistics", driver: "Sarah Kim", customer: "Mountain Fresh", equipment: "Reefer", pickupDate: "Feb 6", delivDate: "Feb 8", rate: 2650, carrierPay: 2322, margin: 12.4, updated: "1m ago", live: true, priority: "high" },
  { id: "LD-7819", status: "transit", origin: "Seattle, WA", dest: "Portland, OR", miles: 174, carrier: "Heartland Express", driver: "Derek Liu", customer: "Pacific Rim Trading", equipment: "Dry Van", pickupDate: "Feb 8", delivDate: "Feb 8", rate: 890, carrierPay: 691, margin: 22.3, updated: "12m ago", live: true, priority: "normal" },
  { id: "LD-7814", status: "transit", origin: "Houston, TX", dest: "New Orleans, LA", miles: 350, carrier: "KLLM Transport", driver: "Andre Williams", customer: "Gulf Coast Materials", equipment: "Reefer", pickupDate: "Feb 7", delivDate: "Feb 8", rate: 1680, carrierPay: 1450, margin: 13.7, updated: "35m ago", live: false, priority: "normal" },
  { id: "LD-7809", status: "transit", origin: "Detroit, MI", dest: "Columbus, OH", miles: 263, carrier: "Old Dominion", driver: "Robert Chen", customer: "Auto Parts Direct", equipment: "Flatbed", pickupDate: "Feb 8", delivDate: "Feb 8", rate: 1340, carrierPay: 1077, margin: 19.6, updated: "7m ago", live: true, priority: "normal" },
  { id: "LD-7851", status: "unassigned", origin: "San Francisco, CA", dest: "Reno, NV", miles: 218, carrier: "", driver: "", customer: "Bay Area Electronics", equipment: "Dry Van", pickupDate: "Feb 9", delivDate: "Feb 9", rate: 1250, carrierPay: 0, margin: 0, updated: "1h ago", live: false, priority: "high" },
  { id: "LD-7849", status: "unassigned", origin: "Philadelphia, PA", dest: "Boston, MA", miles: 306, carrier: "", driver: "", customer: "Eastern Pharma", equipment: "Reefer", pickupDate: "Feb 9", delivDate: "Feb 9", rate: 1780, carrierPay: 0, margin: 0, updated: "2h ago", live: false, priority: "urgent" },
  { id: "LD-7847", status: "unassigned", origin: "Minneapolis, MN", dest: "Milwaukee, WI", miles: 337, carrier: "", driver: "", customer: "Heartland Grain Co", equipment: "Dry Van", pickupDate: "Feb 10", delivDate: "Feb 10", rate: 1560, carrierPay: 0, margin: 0, updated: "3h ago", live: false, priority: "normal" },
  { id: "LD-7845", status: "unassigned", origin: "Charlotte, NC", dest: "Jacksonville, FL", miles: 394, carrier: "", driver: "", customer: "Southern Textiles", equipment: "Flatbed", pickupDate: "Feb 10", delivDate: "Feb 11", rate: 2100, carrierPay: 0, margin: 0, updated: "4h ago", live: false, priority: "normal" },
  { id: "LD-7853", status: "tendered", origin: "Indianapolis, IN", dest: "St. Louis, MO", miles: 242, carrier: "Ryder System", driver: "Pending", customer: "Midwest Auto Group", equipment: "Dry Van", pickupDate: "Feb 9", delivDate: "Feb 9", rate: 1380, carrierPay: 1226, margin: 11.2, updated: "45m ago", live: false, priority: "normal" },
  { id: "LD-7850", status: "tendered", origin: "Salt Lake City, UT", dest: "Boise, ID", miles: 340, carrier: "Covenant Transport", driver: "Pending", customer: "Rocky Mountain Steel", equipment: "Reefer", pickupDate: "Feb 10", delivDate: "Feb 10", rate: 1920, carrierPay: 1603, margin: 16.5, updated: "1h ago", live: false, priority: "high" },
  { id: "LD-7848", status: "tendered", origin: "Tampa, FL", dest: "Savannah, GA", miles: 408, carrier: "USX Intermodal", driver: "Pending", customer: "Sunshine Citrus", equipment: "Dry Van", pickupDate: "Feb 9", delivDate: "Feb 10", rate: 1850, carrierPay: 1500, margin: 18.9, updated: "2h ago", live: false, priority: "normal" },
  { id: "LD-7854", status: "dispatched", origin: "Newark, NJ", dest: "Pittsburgh, PA", miles: 370, carrier: "FedEx Freight", driver: "Lisa Tran", customer: "Northeast Chemicals", equipment: "Dry Van", pickupDate: "Feb 9", delivDate: "Feb 9", rate: 1690, carrierPay: 1463, margin: 13.4, updated: "30m ago", live: false, priority: "normal" },
  { id: "LD-7852", status: "dispatched", origin: "Oklahoma City, OK", dest: "Tulsa, OK", miles: 107, carrier: "ABF Freight", driver: "Tony Garcia", customer: "Plains Energy", equipment: "Flatbed", pickupDate: "Feb 9", delivDate: "Feb 9", rate: 680, carrierPay: 516, margin: 24.1, updated: "55m ago", live: false, priority: "low" },
  { id: "LD-7846", status: "dispatched", origin: "El Paso, TX", dest: "San Antonio, TX", miles: 551, carrier: "Saia Inc.", driver: "Maria Santos", customer: "Border Trade LLC", equipment: "Reefer", pickupDate: "Feb 9", delivDate: "Feb 9", rate: 2340, carrierPay: 1937, margin: 17.2, updated: "1h ago", live: false, priority: "high" },
  { id: "LD-7843", status: "dispatched", origin: "Richmond, VA", dest: "Raleigh, NC", miles: 169, carrier: "Estes Express", driver: "Kevin Moore", customer: "Colonial Furniture", equipment: "Dry Van", pickupDate: "Feb 9", delivDate: "Feb 9", rate: 920, carrierPay: 812, margin: 11.8, updated: "2h ago", live: false, priority: "normal" },
  { id: "LD-7801", status: "delivered", origin: "New York, NY", dest: "Washington, DC", miles: 225, carrier: "Werner Logistics", driver: "Paul Walker", customer: "Capital Office Supply", equipment: "Dry Van", pickupDate: "Feb 5", delivDate: "Feb 5", rate: 1450, carrierPay: 1156, margin: 20.3, updated: "2d ago", live: false, priority: "normal" },
  { id: "LD-7798", status: "delivered", origin: "Cincinnati, OH", dest: "Louisville, KY", miles: 100, carrier: "Schneider National", driver: "Amy Davis", customer: "Derby Bourbon Co", equipment: "Dry Van", pickupDate: "Feb 5", delivDate: "Feb 5", rate: 620, carrierPay: 500, margin: 19.4, updated: "2d ago", live: false, priority: "normal" },
  { id: "LD-7795", status: "delivered", origin: "Las Vegas, NV", dest: "Tucson, AZ", miles: 420, carrier: "J.B. Hunt", driver: "Nick Patel", customer: "Silver State Mining", equipment: "Flatbed", pickupDate: "Feb 4", delivDate: "Feb 4", rate: 2010, carrierPay: 1714, margin: 14.7, updated: "3d ago", live: false, priority: "normal" },
  { id: "LD-7790", status: "delivered", origin: "Baltimore, MD", dest: "Hartford, CT", miles: 298, carrier: "XPO Logistics", driver: "Dan Fischer", customer: "Atlantic Seafood", equipment: "Reefer", pickupDate: "Feb 4", delivDate: "Feb 4", rate: 1580, carrierPay: 1326, margin: 16.1, updated: "3d ago", live: false, priority: "normal" },
  { id: "LD-7822", status: "atrisk", origin: "Cleveland, OH", dest: "Buffalo, NY", miles: 189, carrier: "Crete Carrier", driver: "Joe Mitchell", customer: "Great Lakes Steel", equipment: "Reefer", pickupDate: "Feb 7", delivDate: "Feb 7", rate: 1150, carrierPay: 1060, margin: 7.8, updated: "3m ago", live: true, priority: "urgent" },
  { id: "LD-7817", status: "atrisk", origin: "Omaha, NE", dest: "Des Moines, IA", miles: 150, carrier: "PAM Transport", driver: "Steve Novak", customer: "Cornbelt Ag Supply", equipment: "Dry Van", pickupDate: "Feb 7", delivDate: "Feb 7", rate: 780, carrierPay: 730, margin: 6.4, updated: "9m ago", live: true, priority: "urgent" },
];

// ---------------------------------------------------------------------------
// Helper: format currency
// ---------------------------------------------------------------------------
function formatCurrency(n: number) {
  return "$" + n.toLocaleString("en-US");
}

function getMarginColor(m: number) {
  if (m >= 16) return "text-success";
  if (m >= 10) return "text-warning";
  if (m > 0) return "text-danger";
  return "text-text-muted";
}

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------
function getColumns(): ColumnDef<Load>[] {
  return [
    {
      id: "select",
      size: 40,
      enableSorting: false,
      header: ({ table }) => <SelectAllCheckbox table={table} />,
      cell: ({ row }) => <RowCheckbox row={row} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 100,
      cell: ({ row }) => {
        const status = row.original.status;
        const cfg = LOAD_STATUSES[status];
        return (
          <StatusBadge status={cfg.color as StatusColorToken} size="sm" withDot>
            {cfg.label}
          </StatusBadge>
        );
      },
    },
    {
      accessorKey: "id",
      header: "Load ID",
      size: 100,
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-primary cursor-pointer hover:underline">
          {row.original.id}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      size: 120,
      cell: ({ row }) => (
        <span className="text-xs font-medium text-text-primary truncate block max-w-full">
          {row.original.customer}
        </span>
      ),
    },
    {
      id: "route",
      header: "Route",
      size: 180,
      enableSorting: false,
      cell: ({ row }) => (
        <div>
          <div className="text-xs font-medium text-text-primary whitespace-nowrap truncate">
            {row.original.origin} → {row.original.dest}
          </div>
          <div className="text-[10px] text-text-muted mt-px">
            {row.original.miles} mi
          </div>
        </div>
      ),
    },
    {
      accessorKey: "carrier",
      header: "Carrier",
      size: 140,
      cell: ({ row }) => {
        if (!row.original.carrier) {
          return (
            <span className="text-[11px] font-medium text-warning italic">
              Unassigned
            </span>
          );
        }
        return (
          <div>
            <div className="text-xs font-medium text-text-primary whitespace-nowrap truncate">
              {row.original.carrier}
            </div>
            {row.original.driver && row.original.driver !== "Pending" && (
              <div className="text-[10px] text-text-secondary mt-px">
                {row.original.driver}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "equipment",
      header: "Equip",
      size: 80,
      cell: ({ row }) => (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[4px] bg-surface-filter border border-border text-text-secondary inline-block">
          {row.original.equipment}
        </span>
      ),
    },
    {
      accessorKey: "pickupDate",
      header: "Pickup",
      size: 95,
      cell: ({ row }) => (
        <div className="text-xs font-medium text-text-primary">
          {row.original.pickupDate}
        </div>
      ),
    },
    {
      accessorKey: "delivDate",
      header: "Delivery",
      size: 95,
      cell: ({ row }) => (
        <div className="text-xs font-medium text-text-primary">
          {row.original.delivDate}
        </div>
      ),
    },
    {
      accessorKey: "rate",
      header: "Rate",
      size: 75,
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-text-primary">
          {formatCurrency(row.original.rate)}
        </span>
      ),
    },
    {
      id: "rpm",
      header: "RPM",
      size: 60,
      cell: ({ row }) => (
        <span className="text-[11px] font-medium text-text-secondary">
          ${row.original.miles > 0 ? (row.original.rate / row.original.miles).toFixed(2) : "0.00"}
        </span>
      ),
    },
    {
      accessorKey: "margin",
      header: "Margin",
      size: 65,
      cell: ({ row }) => (
        <span className={`text-[11px] font-semibold ${getMarginColor(row.original.margin)}`}>
          {row.original.margin > 0 ? `${row.original.margin}%` : "—"}
        </span>
      ),
    },
    {
      accessorKey: "updated",
      header: "Updated",
      size: 80,
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.live && (
            <span className="size-1.5 rounded-full bg-success animate-pulse shrink-0" />
          )}
          <span className="text-[11px] text-text-muted">
            {row.original.updated}
          </span>
        </div>
      ),
    },
  ];
}

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Tables/DataTable",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

// ---------------------------------------------------------------------------
// Story: Full Dispatch Board
// ---------------------------------------------------------------------------

export const DispatchBoard: StoryObj = {
  render: function Render() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [density, setDensity] = useState<Density>("default");
    const [expandedGroups, setExpandedGroups] = useState<
      Record<string, boolean>
    >({
      transit: true,
      unassigned: true,
      tendered: true,
      dispatched: true,
      delivered: true,
      atrisk: true,
    });

    const columns = useMemo(() => getColumns(), []);

    // Group loads by status
    const groupedData = useMemo(() => {
      const statusOrder: LoadStatus[] = [
        "transit",
        "unassigned",
        "tendered",
        "dispatched",
        "delivered",
        "atrisk",
      ];
      const groups: { status: LoadStatus; items: Load[] }[] = [];
      for (const status of statusOrder) {
        const items = loads.filter((l) => l.status === status);
        if (items.length > 0) {
          groups.push({ status, items });
        }
      }
      return groups;
    }, []);

    // Flatten visible loads (respecting collapsed groups)
    const visibleLoads = useMemo(() => {
      const result: Load[] = [];
      for (const group of groupedData) {
        if (expandedGroups[group.status]) {
          result.push(...group.items);
        }
      }
      return result;
    }, [groupedData, expandedGroups]);

    const table = useReactTable({
      data: visibleLoads,
      columns,
      state: { sorting, rowSelection },
      onSortingChange: setSorting,
      onRowSelectionChange: setRowSelection,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getRowId: (row) => row.id,
      enableRowSelection: true,
    });

    const selectedCount = Object.keys(rowSelection).filter(
      (k) => rowSelection[k]
    ).length;

    const toggleGroup = (status: string) => {
      setExpandedGroups((prev) => ({
        ...prev,
        [status]: !prev[status],
      }));
    };

    // Build rows with group headers interleaved
    const colCount = table.getAllColumns().length;

    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 h-11 border-b border-border bg-surface shrink-0">
          <span className="text-sm font-semibold text-text-primary">
            Dispatch Board
          </span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-text-muted uppercase tracking-wider">
              Density
            </span>
            <DensityToggle value={density} onChange={setDensity} />
          </div>
        </div>

        {/* Bulk action bar */}
        <BulkActionBar
          selectedCount={selectedCount}
          actions={[
            {
              key: "assign",
              label: "Assign Carrier",
              icon: <Truck className="size-3.5" />,
              onClick: () => alert("Assign carrier"),
            },
            {
              key: "dispatch",
              label: "Dispatch",
              icon: <UserCheck className="size-3.5" />,
              onClick: () => alert("Dispatch"),
            },
            {
              key: "flag",
              label: "Flag At Risk",
              icon: <AlertTriangle className="size-3.5" />,
              onClick: () => alert("Flag at risk"),
            },
            {
              key: "export",
              label: "Export",
              icon: <Download className="size-3.5" />,
              onClick: () => alert("Export"),
            },
            {
              key: "delete",
              label: "Delete",
              icon: <Trash2 className="size-3.5" />,
              onClick: () => alert("Delete"),
            },
          ]}
          onClose={() => setRowSelection({})}
        />

        {/* Table with grouped headers */}
        <div className="flex-1 overflow-auto bg-background">
          <table className="w-full border-collapse table-fixed">
            {/* Sticky header */}
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        className={`bg-surface border-b border-border px-2 h-9 text-[10px] font-semibold uppercase tracking-[0.05em] text-text-muted text-left whitespace-nowrap select-none transition-colors duration-200 ${canSort ? "cursor-pointer hover:text-text-secondary" : ""}`}
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
                        </div>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {groupedData.map((group) => {
                const cfg = LOAD_STATUSES[group.status];
                const isExpanded = expandedGroups[group.status];
                const groupRows = table
                  .getRowModel()
                  .rows.filter(
                    (r) => r.original.status === group.status
                  );

                return (
                  <React.Fragment key={group.status}>
                    {/* Group header */}
                    <GroupHeader
                      status={cfg.color as StatusColorToken}
                      label={cfg.label}
                      count={group.items.length}
                      isExpanded={isExpanded ?? false}
                      onToggle={() => toggleGroup(group.status)}
                      colSpan={colCount}
                    />

                    {/* Group rows */}
                    {isExpanded &&
                      groupRows.map((row) => {
                        const atRisk = row.original.status === "atrisk";
                        const selected = row.getIsSelected();

                        const densityClass =
                          density === "compact"
                            ? "h-9 text-[11px]"
                            : density === "spacious"
                              ? "h-[52px] text-[13px]"
                              : "h-11 text-xs";

                        return (
                          <tr
                            key={row.id}
                            className={`cursor-pointer transition-colors duration-100 [&>td]:px-2 [&>td]:border-b [&>td]:border-border [&>td]:align-middle [&>td]:transition-colors [&>td]:duration-200 ${densityClass} hover:[&>td]:bg-surface-hover ${selected ? "[&>td]:bg-surface-selected" : ""} ${atRisk ? "[&>td]:bg-danger-bg [&>td:first-child]:border-l-[3px] [&>td:first-child]:border-l-danger hover:[&>td]:bg-surface-hover" : ""}`}
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
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Story: Flat Table (no grouping, with pagination)
// ---------------------------------------------------------------------------

export const FlatWithPagination: StoryObj = {
  render: function Render() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [density, setDensity] = useState<Density>("default");
    const [pagination, setPagination] = useState({
      pageIndex: 0,
      pageSize: 10,
    });

    const columns = useMemo(() => getColumns(), []);

    const table = useReactTable({
      data: loads,
      columns,
      state: { sorting, rowSelection, pagination },
      onSortingChange: setSorting,
      onRowSelectionChange: setRowSelection,
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getRowId: (row) => row.id,
      enableRowSelection: true,
    });

    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 h-11 border-b border-border bg-surface shrink-0">
          <span className="text-sm font-semibold text-text-primary">
            Loads — Flat View
          </span>
          <DensityToggle value={density} onChange={setDensity} />
        </div>

        {/* Table */}
        <DataTable
          table={table}
          density={density}
          isRowAtRisk={(row) => row.original.status === "atrisk"}
        />

        {/* Pagination */}
        <TablePagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={table.getPageCount()}
          totalRows={loads.length}
          pageSize={table.getState().pagination.pageSize}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          onPageChange={(page) => table.setPageIndex(page)}
          entityLabel="loads"
        />
      </div>
    );
  },
};

// ---------------------------------------------------------------------------
// Story: Individual Components
// ---------------------------------------------------------------------------

export const GroupHeaderStates: StoryObj = {
  name: "GroupHeader States",
  render: function Render() {
    const [expanded, setExpanded] = useState({
      transit: true,
      unassigned: false,
      atrisk: true,
    });

    return (
      <div className="w-[800px] border border-border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <tbody>
            <GroupHeader
              status="transit"
              label="In Transit"
              count={8}
              isExpanded={expanded.transit}
              onToggle={() =>
                setExpanded((p) => ({ ...p, transit: !p.transit }))
              }
              colSpan={1}
            />
            {expanded.transit && (
              <tr>
                <td className="px-4 py-3 text-xs text-text-secondary">
                  8 rows would appear here...
                </td>
              </tr>
            )}

            <GroupHeader
              status="unassigned"
              label="Unassigned"
              count={4}
              isExpanded={expanded.unassigned}
              onToggle={() =>
                setExpanded((p) => ({
                  ...p,
                  unassigned: !p.unassigned,
                }))
              }
              colSpan={1}
            />
            {expanded.unassigned && (
              <tr>
                <td className="px-4 py-3 text-xs text-text-secondary">
                  4 rows would appear here...
                </td>
              </tr>
            )}

            <GroupHeader
              status="atrisk"
              label="At Risk"
              count={2}
              isExpanded={expanded.atrisk}
              onToggle={() =>
                setExpanded((p) => ({ ...p, atrisk: !p.atrisk }))
              }
              colSpan={1}
            />
            {expanded.atrisk && (
              <tr>
                <td className="px-4 py-3 text-xs text-text-secondary">
                  2 rows would appear here...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  },
};

export const BulkActionBarStory: StoryObj = {
  name: "BulkActionBar",
  render: () => (
    <div className="w-[800px] flex flex-col gap-4">
      <p className="text-xs text-text-muted">3 items selected:</p>
      <BulkActionBar
        selectedCount={3}
        actions={[
          {
            key: "assign",
            label: "Assign Carrier",
            icon: <Truck className="size-3.5" />,
            onClick: () => {},
          },
          {
            key: "dispatch",
            label: "Dispatch",
            icon: <UserCheck className="size-3.5" />,
            onClick: () => {},
          },
          {
            key: "export",
            label: "Export",
            icon: <Download className="size-3.5" />,
            onClick: () => {},
          },
        ]}
        onClose={() => {}}
      />

      <p className="text-xs text-text-muted mt-4">
        0 items selected (hidden):
      </p>
      <BulkActionBar
        selectedCount={0}
        actions={[]}
        onClose={() => {}}
      />
    </div>
  ),
};

export const PaginationStory: StoryObj = {
  name: "TablePagination",
  render: function Render() {
    const [page, setPage] = useState(0);
    const totalPages = 5;

    return (
      <div className="w-[800px] flex flex-col gap-4">
        <TablePagination
          pageIndex={page}
          pageCount={totalPages}
          totalRows={47}
          pageSize={10}
          canPreviousPage={page > 0}
          canNextPage={page < totalPages - 1}
          onPageChange={setPage}
          entityLabel="loads"
        />

        <p className="text-xs text-text-muted">
          Many pages (ellipsis):
        </p>
        <TablePagination
          pageIndex={4}
          pageCount={12}
          totalRows={120}
          pageSize={10}
          canPreviousPage={true}
          canNextPage={true}
          onPageChange={() => {}}
          entityLabel="loads"
        />
      </div>
    );
  },
};
