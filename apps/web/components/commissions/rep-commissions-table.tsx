'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import type { CommissionRep } from '@/lib/hooks/commissions/use-reps';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getRepColumns(): ColumnDef<CommissionRep>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-text-primary">
            {row.original.name}
          </span>
          <p className="text-xs text-text-muted">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'planName',
      header: 'Plan',
      cell: ({ row }) =>
        row.original.planName ? (
          <span className="text-sm text-text-primary">
            {row.original.planName}
          </span>
        ) : (
          <span className="text-sm italic text-text-muted">No plan</span>
        ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={row.original.status === 'ACTIVE' ? 'default' : 'secondary'}
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'pendingAmount',
      header: () => <div className="text-right">Pending</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.original.pendingAmount)}
        </div>
      ),
    },
    {
      accessorKey: 'paidMTD',
      header: () => <div className="text-right">Paid MTD</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency(row.original.paidMTD)}
        </div>
      ),
    },
    {
      accessorKey: 'paidYTD',
      header: () => <div className="text-right">Paid YTD</div>,
      cell: ({ row }) => (
        <div className="text-right font-semibold">
          {formatCurrency(row.original.paidYTD)}
        </div>
      ),
    },
    {
      accessorKey: 'loadCount',
      header: () => <div className="text-right">Loads</div>,
      cell: ({ row }) => (
        <div className="text-right text-text-muted">
          {row.original.loadCount}
        </div>
      ),
    },
  ];
}
