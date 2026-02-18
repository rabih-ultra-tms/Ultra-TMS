'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Calendar, Hash, CreditCard } from 'lucide-react';
import type { CommissionPayout } from '@/lib/hooks/commissions/use-payouts';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

// ===========================
// Summary Card
// ===========================

interface PayoutSummaryProps {
  payout: CommissionPayout | undefined;
  isLoading: boolean;
}

export function PayoutSummary({ payout, isLoading }: PayoutSummaryProps) {
  const stats = [
    {
      label: 'Total Amount',
      value: payout ? formatCurrency(payout.totalAmount) : '—',
      icon: DollarSign,
    },
    {
      label: 'Transactions',
      value: payout?.transactionCount?.toString() ?? '—',
      icon: Hash,
    },
    {
      label: 'Payment Method',
      value: payout?.paymentMethod ?? 'Not set',
      icon: CreditCard,
    },
    {
      label: 'Period',
      value: payout
        ? `${formatDate(payout.periodStart)} – ${formatDate(payout.periodEnd)}`
        : '—',
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-surface-filter">
              <stat.icon className="size-5 text-text-secondary" />
            </div>
            <div>
              <p className="text-xs text-text-muted">{stat.label}</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-5 w-20" />
              ) : (
                <p className="text-sm font-semibold text-text-primary">
                  {stat.value}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ===========================
// Included Transactions Table
// ===========================

interface PayoutTransactionsProps {
  payout: CommissionPayout | undefined;
  isLoading: boolean;
}

export function PayoutTransactions({
  payout,
  isLoading,
}: PayoutTransactionsProps) {
  const transactions = payout?.transactions ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Included Transactions</CardTitle>
        {payout && (
          <Badge variant={statusVariant[payout.status]}>{payout.status}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No transaction details available.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Load #</TableHead>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-sm">
                    {tx.loadNumber}
                  </TableCell>
                  <TableCell className="text-sm text-text-secondary">
                    {tx.orderNumber}
                  </TableCell>
                  <TableCell className="text-sm text-text-muted">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(tx.commissionAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
