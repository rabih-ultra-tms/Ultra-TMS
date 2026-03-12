'use client';

import * as React from 'react';
import { DetailPage, DetailTab } from '@/components/patterns/detail-page';
import { PayableStatusBadge } from '@/components/accounting/payable-status-badge';
import { usePayable } from '@/lib/hooks/accounting/use-payables';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard, Truck } from 'lucide-react';

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

export default function PayableDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { data: payable, isLoading, error, refetch } = usePayable(params.id);

  const tabs: DetailTab[] = [
    {
      value: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      content: payable ? <PayableOverviewTab payable={payable} /> : null,
    },
    {
      value: 'carrier-info',
      label: 'Carrier Info',
      icon: Truck,
      content: payable ? <PayableCarrierInfoTab payable={payable} /> : null,
    },
  ];

  return (
    <DetailPage
      title={payable?.loadNumber || 'Payable Details'}
      subtitle={payable?.carrierName && `Carrier: ${payable.carrierName}`}
      tags={payable && <PayableStatusBadge status={payable.status} size="md" />}
      backLink="/accounting/payables"
      backLabel="Back to Payables"
      breadcrumb={
        <span>Accounting / Payables / {payable?.loadNumber || '...'}</span>
      }
      tabs={tabs}
      isLoading={isLoading}
      error={error as Error}
      onRetry={refetch}
    />
  );
}

// ===========================
// Overview Tab
// ===========================

function PayableOverviewTab({
  payable,
}: {
  payable: NonNullable<ReturnType<typeof usePayable>['data']>;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Payable Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Load #" value={payable.loadNumber} />
          <InfoRow
            label="Status"
            value={<PayableStatusBadge status={payable.status} />}
          />
          <InfoRow
            label="Delivery Date"
            value={formatDate(payable.deliveryDate)}
          />
          <InfoRow
            label="Payment Due Date"
            value={formatDate(payable.paymentDueDate)}
          />
          <InfoRow label="Payment Terms" value={payable.paymentTerms} />
          {payable.settlementId && (
            <InfoRow label="Settlement ID" value={payable.settlementId} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow
            label="Amount"
            value={
              <span className="text-base font-bold">
                {formatCurrency(payable.amount)}
              </span>
            }
          />
          {payable.quickPayEligible && (
            <>
              <Separator />
              <InfoRow
                label="Quick Pay Eligible"
                value={
                  <span className="font-medium text-emerald-600">Yes</span>
                }
              />
              <InfoRow
                label="Quick Pay Discount"
                value={
                  <span className="text-amber-600">
                    {payable.quickPayDiscount}%
                  </span>
                }
              />
              <InfoRow
                label="Quick Pay Amount"
                value={
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(payable.quickPayAmount)}
                  </span>
                }
              />
            </>
          )}
          {payable.paidDate && (
            <>
              <Separator />
              <InfoRow label="Paid Date" value={formatDate(payable.paidDate)} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ===========================
// Carrier Info Tab
// ===========================

function PayableCarrierInfoTab({
  payable,
}: {
  payable: NonNullable<ReturnType<typeof usePayable>['data']>;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Carrier Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Carrier Name" value={payable.carrierName} />
          <InfoRow label="Carrier ID" value={payable.carrierId} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Load Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="Load #" value={payable.loadNumber} />
          <InfoRow label="Load ID" value={payable.loadId} />
        </CardContent>
      </Card>
    </div>
  );
}

// ===========================
// Shared helpers
// ===========================

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  );
}
