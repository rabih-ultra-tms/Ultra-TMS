'use client';

import * as React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { PaymentHistory } from '@/components/carrier/PaymentHistory';
import { SettlementHistory } from '@/components/carrier/SettlementHistory';
import {
  usePaymentSummary,
  usePaymentHistory,
} from '@/lib/hooks/carrier/use-payments';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PaymentsPage() {
  const {
    data: summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = usePaymentSummary();
  const { isLoading: paymentsLoading, refetch: refetchPayments } =
    usePaymentHistory();

  const handleRefresh = () => {
    refetchSummary();
    refetchPayments();
  };

  const isLoading = summaryLoading || paymentsLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Payments & Settlements"
        description="View payment history and settlement status"
        actions={
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="Total Earnings"
          value={summary?.totalEarnings ?? 0}
          loading={summaryLoading}
          isCurrency
        />
        <SummaryCard
          title="Pending Payments"
          value={summary?.pendingPayments ?? 0}
          loading={summaryLoading}
          isCurrency
          highlight="warning"
        />
        <SummaryCard
          title="Last Payment Date"
          value={summary?.lastPaymentDate ?? 'N/A'}
          loading={summaryLoading}
          isDate
        />
        <SummaryCard
          title="Total Payments"
          value={summary?.totalPayments ?? 0}
          loading={summaryLoading}
        />
      </div>

      {/* Tabs Content */}
      <div className="space-y-6">
        {/* Payment History Section */}
        <PaymentHistory />

        {/* Settlement History Section */}
        <SettlementHistory />
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  loading?: boolean;
  isCurrency?: boolean;
  isDate?: boolean;
  highlight?: 'default' | 'warning' | 'success';
}

function SummaryCard({
  title,
  value,
  loading,
  isCurrency,
  isDate,
  highlight = 'default',
}: SummaryCardProps) {
  const getHighlightClass = () => {
    switch (highlight) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-white border-slate-200';
    }
  };

  const getTitleColor = () => {
    switch (highlight) {
      case 'warning':
        return 'text-yellow-700';
      case 'success':
        return 'text-green-700';
      default:
        return 'text-slate-700';
    }
  };

  let displayValue = value;
  if (typeof value === 'number') {
    if (isCurrency) {
      displayValue = formatCurrency(value);
    } else {
      displayValue = value.toLocaleString();
    }
  } else if (isDate && value !== 'N/A') {
    displayValue = formatDate(value as string);
  }

  return (
    <Card className={`border ${getHighlightClass()}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-sm font-medium ${getTitleColor()}`}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
        ) : (
          <div className="text-2xl font-bold text-slate-900">
            {displayValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
