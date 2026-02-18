'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import type { CommissionTransaction } from '@/lib/hooks/commissions/use-transactions';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const statusVariant: Record<
  CommissionTransaction['status'],
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  APPROVED: 'default',
  PAID: 'secondary',
  VOID: 'destructive',
};

export function getTransactionColumns(options: {
  onApprove: (id: string) => void;
  onVoid: (id: string) => void;
  approvingId: string | null;
}): ColumnDef<CommissionTransaction>[] {
  return [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-text-primary">
          {formatDate(row.original.date || row.original.createdAt)}
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
      accessorKey: 'loadNumber',
      header: 'Load #',
      cell: ({ row }) => (
        <span className="text-sm font-mono text-text-secondary">
          {row.original.loadNumber}
        </span>
      ),
    },
    {
      accessorKey: 'orderAmount',
      header: () => <div className="text-right">Order Amt</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm">
          {formatCurrency(row.original.orderAmount)}
        </div>
      ),
    },
    {
      accessorKey: 'marginPercent',
      header: () => <div className="text-right">Margin</div>,
      cell: ({ row }) => (
        <div className="text-right text-sm text-text-secondary">
          {formatPercent(row.original.marginPercent)}
        </div>
      ),
    },
    {
      accessorKey: 'commissionAmount',
      header: () => <div className="text-right">Commission</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.original.commissionAmount)}
        </div>
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
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const tx = row.original;
        if (tx.status !== 'PENDING') return null;

        const isApproving = options.approvingId === tx.id;

        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation();
                options.onApprove(tx.id);
              }}
              disabled={isApproving}
            >
              {isApproving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle className="size-3.5" />
              )}
              <span className="ml-1">Approve</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                options.onVoid(tx.id);
              }}
              disabled={isApproving}
            >
              <XCircle className="size-3.5" />
              <span className="ml-1">Void</span>
            </Button>
          </div>
        );
      },
    },
  ];
}

// ===========================
// Void Dialog (with reason)
// ===========================

interface VoidDialogProps {
  open: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function VoidTransactionDialog({
  open,
  onConfirm,
  onCancel,
  isLoading,
}: VoidDialogProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = async () => {
    await onConfirm(reason);
    setReason('');
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Void Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            This will void the commission transaction. Please provide a reason.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          placeholder="Enter reason for voiding..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="mt-2"
        />
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading || !reason.trim()}
            >
              {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
              Void Transaction
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
