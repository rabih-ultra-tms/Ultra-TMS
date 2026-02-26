'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type {
  RecentInvoice,
  InvoiceStatus,
} from '@/lib/hooks/accounting/use-accounting-dashboard';

interface AccRecentInvoicesProps {
  invoices: RecentInvoice[] | undefined;
  isLoading: boolean;
}

const INVOICE_STATUS_STYLES: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-gray-50 text-gray-700 border-gray-200',
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  SENT: 'bg-blue-50 text-blue-700 border-blue-200',
  VIEWED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  PARTIAL: 'bg-orange-50 text-orange-700 border-orange-200',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200',
  VOID: 'bg-gray-100 text-gray-500 border-gray-300',
};

function formatCurrency(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(isNaN(num) ? 0 : num);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const styles = INVOICE_STATUS_STYLES[status] ?? INVOICE_STATUS_STYLES.DRAFT;
  return (
    <Badge variant="outline" className={cn(styles, 'font-medium')}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}

export function AccRecentInvoices({
  invoices,
  isLoading,
}: AccRecentInvoicesProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <Skeleton className="h-5 w-36" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = invoices ?? [];

  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">
          Recent Invoices
        </h3>
        <Link
          href="/accounting/invoices"
          className="text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          View all
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-text-muted">
          No invoices yet
        </div>
      ) : (
        <div className="divide-y divide-border">
          {items.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/accounting/invoices/${invoice.id}`}
              className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-text-primary">
                  {invoice.invoiceNumber}
                </span>
                <span className="text-xs text-text-muted">
                  {invoice.customerName} &middot; Due{' '}
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-text-primary">
                  {formatCurrency(invoice.amount)}
                </span>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
