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
import { KpiCard } from '@/components/tms/stats/kpi-card';
import { DollarSign, TrendingUp, Calendar, Package } from 'lucide-react';
import type { CommissionRep, RepTransaction } from '@/lib/hooks/commissions/use-reps';

// ===========================
// Helpers
// ===========================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const TRANSACTION_STATUS_COLORS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  APPROVED: 'secondary',
  PAID: 'default',
  VOID: 'destructive',
};

// ===========================
// Rep Summary
// ===========================

interface RepSummaryProps {
  rep: CommissionRep | undefined;
  isLoading: boolean;
}

export function RepSummary({ rep, isLoading }: RepSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={<DollarSign />}
        label="Pending"
        value={formatCurrency(rep?.pendingAmount ?? 0)}
        subtext="Awaiting payout"
      />
      <KpiCard
        icon={<TrendingUp />}
        label="Paid MTD"
        value={formatCurrency(rep?.paidMTD ?? 0)}
        subtext="This month"
      />
      <KpiCard
        icon={<Calendar />}
        label="Paid YTD"
        value={formatCurrency(rep?.paidYTD ?? 0)}
        subtext="This year"
      />
      <KpiCard
        icon={<Package />}
        label="Total Loads"
        value={rep?.loadCount ?? 0}
        subtext="Completed"
      />
    </div>
  );
}

// ===========================
// Transaction History
// ===========================

interface TransactionHistoryProps {
  transactions: RepTransaction[];
  isLoading: boolean;
}

export function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            No commission transactions yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Load #</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-text-muted">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {tx.loadNumber}
                    </TableCell>
                    <TableCell className="text-text-muted">
                      {tx.orderNumber}
                    </TableCell>
                    <TableCell className="text-sm text-text-muted">
                      {tx.planName}
                    </TableCell>
                    <TableCell className="text-right text-text-muted">
                      {tx.rate}%
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={TRANSACTION_STATUS_COLORS[tx.status] ?? 'outline'}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
