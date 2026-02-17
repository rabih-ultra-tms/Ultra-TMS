"use client";

import { ColumnDef } from "@tanstack/react-table";
import { InvoiceStatusBadge } from "@/components/accounting/invoice-status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Send, FileDown, Ban } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/lib/hooks/accounting/use-invoices";

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

function isOverdue(dueDate: string, status: InvoiceStatus): boolean {
  if (status === "PAID" || status === "VOID") return false;
  return new Date(dueDate) < new Date();
}

interface InvoiceColumnActions {
  onSend: (id: string) => void;
  onVoid: (id: string) => void;
  onDownloadPdf: (id: string) => void;
}

export function getInvoiceColumns(
  actions: InvoiceColumnActions
): ColumnDef<Invoice>[] {
  return [
    {
      accessorKey: "invoiceNumber",
      header: "Invoice #",
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {row.original.invoiceNumber}
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
        <InvoiceStatusBadge status={row.original.status} />
      ),
    },
    {
      accessorKey: "invoiceDate",
      header: "Invoice Date",
      cell: ({ row }) => (
        <span className="text-text-muted">
          {formatDate(row.original.invoiceDate)}
        </span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const overdue = isOverdue(row.original.dueDate, row.original.status);
        return (
          <span className={overdue ? "font-medium text-red-600" : "text-text-muted"}>
            {formatDate(row.original.dueDate)}
            {overdue && row.original.status !== "OVERDUE" && " (overdue)"}
          </span>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Total</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-text-primary">
          {formatCurrency(row.original.totalAmount)}
        </div>
      ),
    },
    {
      accessorKey: "balanceDue",
      header: () => <div className="text-right">Balance Due</div>,
      cell: ({ row }) => {
        const balance = row.original.balanceDue;
        return (
          <div
            className={`text-right font-medium ${
              balance > 0 ? "text-text-primary" : "text-emerald-600"
            }`}
          >
            {formatCurrency(balance)}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const invoice = row.original;
        const canSend = invoice.status === "DRAFT" || invoice.status === "PENDING";
        const canVoid =
          invoice.status !== "VOID" && invoice.status !== "PAID";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canSend && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.onSend(invoice.id);
                  }}
                >
                  <Send className="mr-2 size-4" />
                  Send Invoice
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  actions.onDownloadPdf(invoice.id);
                }}
              >
                <FileDown className="mr-2 size-4" />
                Download PDF
              </DropdownMenuItem>
              {canVoid && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.onVoid(invoice.id);
                    }}
                  >
                    <Ban className="mr-2 size-4" />
                    Void Invoice
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
