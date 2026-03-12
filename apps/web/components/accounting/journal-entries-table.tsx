'use client';

import { ColumnDef } from '@tanstack/react-table';
import { JournalEntryStatusBadge } from '@/components/accounting/journal-entry-status-badge';
import type {
  JournalEntry,
  ReferenceType,
} from '@/lib/hooks/accounting/use-journal-entries';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const REFERENCE_TYPE_LABELS: Record<ReferenceType, string> = {
  INVOICE: 'Invoice',
  SETTLEMENT: 'Settlement',
  PAYMENT: 'Payment',
  MANUAL: 'Manual',
};

export function getJournalEntryColumns(): ColumnDef<JournalEntry>[] {
  return [
    {
      accessorKey: 'entryNumber',
      header: 'Entry #',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium text-text-primary">
          {row.original.entryNumber}
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-text-muted">{formatDate(row.original.date)}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span
          className="max-w-[280px] truncate block text-text-primary"
          title={row.original.description}
        >
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: 'referenceType',
      header: 'Source',
      cell: ({ row }) => (
        <span className="text-text-muted">
          {REFERENCE_TYPE_LABELS[row.original.referenceType]}
        </span>
      ),
    },
    {
      accessorKey: 'totalDebit',
      header: () => <div className="text-right">Debit</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-text-primary">
          {formatCurrency(row.original.totalDebit)}
        </div>
      ),
    },
    {
      accessorKey: 'totalCredit',
      header: () => <div className="text-right">Credit</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium text-text-primary">
          {formatCurrency(row.original.totalCredit)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <JournalEntryStatusBadge status={row.original.status} />
      ),
    },
  ];
}
