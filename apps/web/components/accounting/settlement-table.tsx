"use client";

import { ColumnDef } from "@tanstack/react-table";
import { SettlementStatusBadge } from "@/components/accounting/settlement-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import type { Settlement } from "@/lib/hooks/accounting/use-settlements";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface SettlementColumnActions {
  onView: (id: string) => void;
}

export function getSettlementColumns(
  actions: SettlementColumnActions
): ColumnDef<Settlement>[] {
  return [
    {
      accessorKey: "settlementNumber",
      header: "Settlement #",
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {row.original.settlementNumber}
        </span>
      ),
    },
    {
      accessorKey: "carrierName",
      header: "Carrier",
      cell: ({ row }) => (
        <span className="text-text-primary">{row.original.carrierName}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <SettlementStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "grossAmount",
      header: () => <div className="text-right">Gross</div>,
      cell: ({ row }) => (
        <div className="text-right text-text-primary">
          {formatCurrency(row.original.grossAmount)}
        </div>
      ),
    },
    {
      accessorKey: "deductions",
      header: () => <div className="text-right">Deductions</div>,
      cell: ({ row }) => (
        <div className="text-right text-text-muted">
          {row.original.deductions > 0
            ? `-${formatCurrency(row.original.deductions)}`
            : "-"}
        </div>
      ),
    },
    {
      accessorKey: "netAmount",
      header: () => <div className="text-right">Net Payout</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-text-primary">
          {formatCurrency(row.original.netAmount)}
        </div>
      ),
    },
    {
      id: "lineItemCount",
      header: "Items",
      cell: ({ row }) => (
        <span className="text-text-muted">
          {row.original.lineItems?.length ?? 0}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-text-muted">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const settlement = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onView(settlement.id);
                }}
              >
                <Eye className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
