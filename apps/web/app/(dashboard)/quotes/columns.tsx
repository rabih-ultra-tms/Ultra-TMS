"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Pencil,
  Copy,
  Send,
  Trash2,
  ArrowRight,
  ExternalLink,
  ArrowRightLeft,
} from "lucide-react";
import Link from "next/link";
import { QuoteStatusBadge } from "@/components/sales/quotes/quote-status-badge";
import type { Quote } from "@/types/quotes";
import { SERVICE_TYPE_LABELS, EQUIPMENT_TYPE_LABELS } from "@/types/quotes";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function MarginDisplay({ percent }: { percent: number | undefined }) {
  if (percent == null) return <span className="text-muted-foreground">--</span>;
  const color =
    percent >= 15
      ? "text-green-600"
      : percent >= 5
        ? "text-amber-600"
        : "text-red-600";
  return <span className={`text-xs font-medium ${color}`}>{percent.toFixed(0)}%</span>;
}

interface ColumnsConfig {
  onClone?: (id: string) => void;
  onSend?: (id: string) => void;
  onDelete?: (id: string) => void;
  onConvert?: (id: string) => void;
}

export function getColumns(config: ColumnsConfig = {}): ColumnDef<Quote>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "quoteNumber",
      header: "Quote #",
      cell: ({ row }) => {
        const quote = row.original;
        return (
          <div className="flex flex-col gap-1">
            <Link
              href={`/quotes/${quote.id}`}
              className="font-mono text-sm text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {quote.quoteNumber}
            </Link>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground">v{quote.version}</span>
              <QuoteStatusBadge status={quote.status} />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: "Customer",
      cell: ({ row }) => {
        const quote = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium truncate max-w-[180px]" title={quote.customerName}>
              {quote.customerName || "—"}
            </span>
            {quote.salesAgentName && (
              <span className="text-xs text-muted-foreground">{quote.salesAgentName}</span>
            )}
          </div>
        );
      },
    },
    {
      id: "lane",
      header: "Lane",
      cell: ({ row }) => {
        const quote = row.original;
        return (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-sm">
              <span>{quote.originCity}, {quote.originState}</span>
              <ArrowRightLeft className="h-3 w-3 text-muted-foreground shrink-0" />
              <span>{quote.destinationCity}, {quote.destinationState}</span>
            </div>
            {quote.distance != null && (
              <span className="text-xs text-muted-foreground">{quote.distance.toLocaleString()} mi</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "serviceType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {SERVICE_TYPE_LABELS[row.original.serviceType] || row.original.serviceType}
        </Badge>
      ),
      size: 70,
    },
    {
      accessorKey: "equipmentType",
      header: "Equip",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {EQUIPMENT_TYPE_LABELS[row.original.equipmentType] || row.original.equipmentType}
        </span>
      ),
      size: 60,
    },
    {
      accessorKey: "totalAmount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => {
        const quote = row.original;
        return (
          <div className="text-right">
            <div className="text-sm font-medium tabular-nums">
              {formatCurrency(quote.totalAmount)}
            </div>
            <MarginDisplay percent={quote.marginPercent} />
          </div>
        );
      },
      size: 100,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.createdAt)}
        </span>
      ),
      size: 80,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const quote = row.original;
        const isDraft = quote.status === "DRAFT";
        const isAccepted = quote.status === "ACCEPTED";
        const isConverted = quote.status === "CONVERTED";

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/quotes/${quote.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>

              {isDraft && (
                <DropdownMenuItem asChild>
                  <Link href={`/quotes/${quote.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => config.onClone?.(quote.id)}>
                <Copy className="mr-2 h-4 w-4" />
                Clone
              </DropdownMenuItem>

              {isDraft && (
                <DropdownMenuItem onClick={() => config.onSend?.(quote.id)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </DropdownMenuItem>
              )}

              {isAccepted && (
                <DropdownMenuItem onClick={() => config.onConvert?.(quote.id)}>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Convert to Order
                </DropdownMenuItem>
              )}

              {isConverted && (
                <DropdownMenuItem asChild>
                  <Link href={`/orders`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Order
                  </Link>
                </DropdownMenuItem>
              )}

              {isDraft && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => config.onDelete?.(quote.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      size: 40,
    },
  ];
}
