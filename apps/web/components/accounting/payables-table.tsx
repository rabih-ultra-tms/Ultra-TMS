"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PayableStatusBadge } from "@/components/accounting/payable-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Zap } from "lucide-react";
import type { Payable } from "@/lib/hooks/accounting/use-payables";

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

interface PayableColumnActions {
  onView: (id: string) => void;
}

export function getPayableColumns(
  actions: PayableColumnActions
): ColumnDef<Payable>[] {
  return [
    {
      accessorKey: "carrierName",
      header: "Carrier",
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {row.original.carrierName}
        </span>
      ),
    },
    {
      accessorKey: "loadNumber",
      header: "Load #",
      cell: ({ row }) => (
        <span className="text-text-primary">{row.original.loadNumber}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <PayableStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-text-primary">
          {formatCurrency(row.original.amount)}
        </div>
      ),
    },
    {
      id: "quickPay",
      header: "Quick Pay",
      cell: ({ row }) => {
        const payable = row.original;
        if (!payable.quickPayEligible) {
          return <span className="text-text-muted">-</span>;
        }
        return (
          <div className="flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-500" />
            <span className="text-sm text-amber-600 font-medium">
              {formatCurrency(payable.quickPayAmount)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "deliveryDate",
      header: "Delivered",
      cell: ({ row }) => (
        <span className="text-text-muted">
          {formatDate(row.original.deliveryDate)}
        </span>
      ),
    },
    {
      accessorKey: "paymentDueDate",
      header: "Payment Due",
      cell: ({ row }) => {
        const due = new Date(row.original.paymentDueDate);
        const isOverdue = due < new Date() && row.original.status !== "PAID";
        return (
          <span
            className={
              isOverdue ? "font-medium text-destructive" : "text-text-muted"
            }
          >
            {formatDate(row.original.paymentDueDate)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const payable = row.original;
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
                  actions.onView(payable.id);
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
