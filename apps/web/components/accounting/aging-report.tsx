'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { AgingBucket, AgingCustomerRow } from '@/lib/hooks/accounting/use-aging';

// ===========================
// Helpers
// ===========================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const BUCKET_COLORS = [
  'bg-green-500',   // 0-30 (current)
  'bg-yellow-500',  // 31-60
  'bg-orange-500',  // 61-90
  'bg-red-500',     // 90+
] as const;

const BUCKET_LABELS = ['0-30 days', '31-60 days', '61-90 days', '90+ days'] as const;

// ===========================
// Bar Chart
// ===========================

interface AgingBarChartProps {
  buckets: AgingBucket[];
  isLoading?: boolean;
}

function AgingBarChart({ buckets, isLoading }: AgingBarChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aging Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-6 h-48">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <Skeleton className="w-full h-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxAmount = Math.max(...buckets.map((b) => b.totalAmount), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Aging Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-6 h-48">
          {buckets.map((bucket, i) => {
            const heightPct = Math.max((bucket.totalAmount / maxAmount) * 100, 4);
            return (
              <div
                key={bucket.label}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-xs font-medium text-text-primary">
                  {formatCurrency(bucket.totalAmount)}
                </span>
                <div className="w-full flex items-end" style={{ height: '140px' }}>
                  <div
                    className={`w-full rounded-t-md transition-all ${BUCKET_COLORS[i] ?? 'bg-gray-400'}`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted">
                  {BUCKET_LABELS[i] ?? bucket.label}
                </span>
                <span className="text-xs text-text-muted">
                  {bucket.invoiceCount} invoice{bucket.invoiceCount !== 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ===========================
// Detail Table
// ===========================

interface AgingDetailTableProps {
  customers: AgingCustomerRow[];
  isLoading?: boolean;
}

function AgingDetailTable({ customers, isLoading }: AgingDetailTableProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Customer Aging Detail</CardTitle>
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

  const handleCustomerClick = (customerId: string) => {
    router.push(`/accounting/invoices?customerId=${customerId}&status=OVERDUE`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Customer Aging Detail</CardTitle>
      </CardHeader>
      <CardContent>
        {customers.length === 0 ? (
          <p className="text-sm text-text-muted py-8 text-center">
            No outstanding receivables found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">0-30 days</TableHead>
                  <TableHead className="text-right">31-60 days</TableHead>
                  <TableHead className="text-right">61-90 days</TableHead>
                  <TableHead className="text-right">90+ days</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Invoices</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow
                    key={customer.customerId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleCustomerClick(customer.customerId)}
                  >
                    <TableCell className="font-medium text-blue-600 hover:underline">
                      {customer.customerName}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.current > 0 ? formatCurrency(customer.current) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.days31to60 > 0 ? formatCurrency(customer.days31to60) : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {customer.days61to90 > 0 ? formatCurrency(customer.days61to90) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {customer.days90plus > 0 ? formatCurrency(customer.days90plus) : '—'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(customer.totalOutstanding)}
                    </TableCell>
                    <TableCell className="text-right text-text-muted">
                      {customer.invoiceCount}
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

// ===========================
// Main Export
// ===========================

interface AgingReportProps {
  buckets?: AgingBucket[];
  customers?: AgingCustomerRow[];
  totalOutstanding?: number;
  isLoading?: boolean;
}

export function AgingReport({
  buckets = [],
  customers = [],
  totalOutstanding = 0,
  isLoading,
}: AgingReportProps) {
  return (
    <div className="space-y-6">
      {/* Summary stat */}
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-text-muted">Total Outstanding:</span>
        <span className="text-2xl font-bold text-text-primary">
          {isLoading ? <Skeleton className="h-8 w-32 inline-block" /> : formatCurrency(totalOutstanding)}
        </span>
      </div>

      {/* Bar chart */}
      <AgingBarChart buckets={buckets} isLoading={isLoading} />

      {/* Detail table */}
      <AgingDetailTable customers={customers} isLoading={isLoading} />
    </div>
  );
}
