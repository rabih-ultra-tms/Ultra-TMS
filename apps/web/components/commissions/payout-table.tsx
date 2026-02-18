'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { CommissionPayout } from '@/lib/hooks/commissions/use-payouts';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const statusVariant: Record<
  CommissionPayout['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  PROCESSING: 'secondary',
  PAID: 'default',
  FAILED: 'destructive',
};

export function getPayoutColumns(): ColumnDef<CommissionPayout>[] {
  return [
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-text-primary">
          {formatDate(row.original.createdAt)}
        </span>
      ),
    },
    {
      accessorKey: 'repName',
      header: 'Rep',
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">
          {row.original.repName}
        </span>
      ),
    },
    {
      accessorKey: 'transactionCount',
      header: () => <div className="text-right">Transactions</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm text-text-secondary">
          {row.original.transactionCount}
        </div>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.original.totalAmount)}
        </div>
      ),
    },
    {
      accessorKey: 'paymentMethod',
      header: 'Method',
      cell: ({ row }) =>
        row.original.paymentMethod ? (
          <span className="text-sm text-text-primary">
            {row.original.paymentMethod}
          </span>
        ) : (
          <span className="text-sm italic text-text-muted">Not set</span>
        ),
    },
    {
      id: 'period',
      header: 'Period',
      cell: ({ row }) => (
        <span className="text-xs text-text-muted">
          {formatDate(row.original.periodStart)} –{' '}
          {formatDate(row.original.periodEnd)}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
  ];
}
