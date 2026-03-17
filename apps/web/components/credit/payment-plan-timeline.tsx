'use client';

import { usePaymentPlan } from '@/lib/hooks/credit';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/lib/utils/format';

interface PaymentPlanTimelineProps {
  planId: string;
}

export function PaymentPlanTimeline({ planId }: PaymentPlanTimelineProps) {
  const { data: paymentPlan, isLoading, error } = usePaymentPlan(planId);

  if (isLoading) {
    return <PaymentTimelineSkeleton />;
  }

  if (error || !paymentPlan) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-sm text-red-700">
          Failed to load payment plan. Please try again.
        </p>
      </div>
    );
  }

  const installments = paymentPlan.installments || [];
  const paidCount = installments.filter((i) => i.status === 'PAID').length;
  const totalInstallments = installments.length;
  const totalAmount = paymentPlan.totalAmount || 0;
  const totalPaid = installments
    .filter((i) => i.status === 'PAID')
    .reduce((sum, i) => sum + (i.amount || 0), 0);

  if (installments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Plan Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
            <p className="text-gray-600">No installments scheduled</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'OVERDUE':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle>Payment Plan Timeline</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Total: {formatCurrency(totalAmount)} | Paid:{' '}
            {formatCurrency(totalPaid)} | {paidCount} of {totalInstallments}{' '}
            installments
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Progress</span>
            <span className="text-gray-600">
              {Math.round((paidCount / totalInstallments) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 transition-all duration-300"
              style={{ width: `${(paidCount / totalInstallments) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Timeline */}
        <div className="space-y-4">
          {installments.map((installment, index) => {
            const isLast = index === installments.length - 1;
            const dueDate = new Date(installment.dueDate || Date.now());
            const now = new Date();
            const isOverdue = installment.status === 'PENDING' && dueDate < now;

            return (
              <div key={installment.id || index} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div
                    className={`absolute left-6 top-12 w-0.5 h-8 ${
                      installment.status === 'PAID'
                        ? 'bg-green-300'
                        : 'bg-gray-300'
                    }`}
                  />
                )}

                {/* Timeline item */}
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                      installment.status === 'PAID'
                        ? 'bg-green-100'
                        : isOverdue
                          ? 'bg-red-100'
                          : 'bg-gray-100'
                    }`}
                  >
                    {getStatusIcon(
                      isOverdue ? 'OVERDUE' : installment.status || 'PENDING'
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          Installment {index + 1}
                        </h4>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Due {formatDateShort(dueDate)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(isOverdue ? 'OVERDUE' : installment.status || 'PENDING')}`}
                      >
                        {isOverdue
                          ? 'OVERDUE'
                          : installment.status || 'PENDING'}
                      </span>
                    </div>

                    <div className="mt-2 flex items-baseline gap-4">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(installment.amount || 0)}
                      </span>
                      {installment.paidDate && (
                        <span className="text-xs text-gray-600">
                          Paid on{' '}
                          {formatDateShort(new Date(installment.paidDate))}
                        </span>
                      )}
                    </div>

                    {installment.notes && (
                      <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                        {installment.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="border-t border-gray-200 pt-4 grid gap-2 md:grid-cols-3">
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs text-green-700 font-medium">Total Paid</p>
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-xs text-orange-700 font-medium">Remaining</p>
            <p className="text-lg font-bold text-orange-900">
              {formatCurrency(totalAmount - totalPaid)}
            </p>
          </div>
          <div className="rounded-lg bg-blue-50 p-3">
            <p className="text-xs text-blue-700 font-medium">Next Due</p>
            <p className="text-lg font-bold text-blue-900">
              {installments.find((i) => i.status !== 'PAID')
                ? formatDateShort(
                    new Date(
                      installments.find((i) => i.status !== 'PAID')?.dueDate ||
                        Date.now()
                    )
                  )
                : 'All Paid'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentTimelineSkeleton() {
  return (
    <div data-testid="payment-timeline-skeleton">
      <Card>
        <CardHeader className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-2 w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
