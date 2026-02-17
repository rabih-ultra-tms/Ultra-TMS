"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PaymentStatusBadge } from "@/components/accounting/payment-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Ban } from "lucide-react";
import type { Payment } from "@/lib/hooks/accounting/use-payments";

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

const METHOD_LABELS: Record<string, string> = {
  CHECK: "Check",
  ACH: "ACH",
  WIRE: "Wire",
  CREDIT_CARD: "Credit Card",
};

interface PaymentColumnActions {
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function getPaymentColumns(
  actions: PaymentColumnActions
): ColumnDef<Payment>[] {
  return [
    {
      accessorKey: "paymentNumber",
      header: "Payment #",
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {row.original.paymentNumber}
        </span>
      ),
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => (
        <span className="text-text-primary">{row.original.customerName}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <PaymentStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => (
        <span className="text-text-muted">
          {METHOD_LABELS[row.original.method] || row.original.method}
        </span>
      ),
    },
    {
      accessorKey: "paymentDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-text-muted">
          {formatDate(row.original.paymentDate)}
        </span>
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
      accessorKey: "appliedAmount",
      header: () => <div className="text-right">Applied</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-emerald-600">
          {formatCurrency(row.original.appliedAmount)}
        </div>
      ),
    },
    {
      accessorKey: "unappliedAmount",
      header: () => <div className="text-right">Unapplied</div>,
      cell: ({ row }) => {
        const unapplied = row.original.unappliedAmount;
        return (
          <div
            className={`text-right font-medium ${
              unapplied > 0 ? "text-amber-600" : "text-text-muted"
            }`}
          >
            {formatCurrency(unapplied)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const payment = row.original;
        const canDelete =
          payment.status !== "VOIDED" && payment.status !== "APPLIED";

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
                  actions.onView(payment.id);
                }}
              >
                <Eye className="mr-2 size-4" />
                View Details
              </DropdownMenuItem>
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.onDelete(payment.id);
                    }}
                  >
                    <Ban className="mr-2 size-4" />
                    Delete Payment
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
