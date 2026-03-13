'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePortalAuthStore } from '@/lib/store/portal-auth.store';
import { usePortalInvoices } from '@/lib/hooks/portal/use-portal-documents';
import { InvoiceList } from '@/components/portal/InvoiceList';
import { DollarSign } from 'lucide-react';

// Mock hook for aging summary - will be replaced with actual API hook
function useInvoiceAgingSummary() {
  return {
    data: {
      outstanding: 0,
      paid: 0,
      overdue: 0,
    },
    isLoading: false,
  };
}

export default function InvoicesPage() {
  const router = useRouter();
  const { isAuthenticated } = usePortalAuthStore();
  const { data: invoices = [], isLoading } = usePortalInvoices();
  const { data: agingSummary, isLoading: agingSummaryLoading } =
    useInvoiceAgingSummary();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/portal/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  // Calculate aging summary from invoices
  const calculateAgingSummary = () => {
    return invoices.reduce(
      (acc, invoice) => {
        const statusLower = invoice.status.toLowerCase();
        const amount = invoice.amount || 0;

        if (statusLower.includes('paid')) {
          acc.paid += amount;
        } else if (statusLower.includes('overdue')) {
          acc.overdue += amount;
        } else {
          acc.outstanding += amount;
        }

        return acc;
      },
      { outstanding: 0, paid: 0, overdue: 0 }
    );
  };

  const summary = invoices.length > 0 ? calculateAgingSummary() : agingSummary;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Invoices
        </h1>
        <p className="mt-2 text-slate-600">View and manage your invoices</p>
      </div>

      {/* Aging Summary Cards */}
      {agingSummaryLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Outstanding Card */}
          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  Outstanding
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  ${summary?.outstanding?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </Card>

          {/* Paid Card */}
          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summary?.paid?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Overdue Card */}
          <Card className="p-6 border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-red-600">
                  ${summary?.overdue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Invoices List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <InvoiceList invoices={invoices} />
      )}
    </div>
  );
}
