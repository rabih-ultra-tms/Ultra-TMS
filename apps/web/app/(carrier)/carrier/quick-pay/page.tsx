'use client';

import * as React from 'react';
import { RefreshCw, AlertCircle, Clock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/PageHeader';
import { QuickPayForm } from '@/components/carrier/QuickPayForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  useSettlementHistory,
  type Settlement,
} from '@/lib/hooks/carrier/use-payments';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function QuickPayPage() {
  const {
    data: settlements = [],
    isLoading,
    refetch,
  } = useSettlementHistory({
    limit: 50,
  });
  const [selectedSettlement, setSelectedSettlement] =
    React.useState<Settlement | null>(null);
  const [showForm, setShowForm] = React.useState(false);

  const handleRefresh = () => {
    refetch();
  };

  const handleSelectSettlement = (settlement: Settlement) => {
    setSelectedSettlement(settlement);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setSelectedSettlement(null);
    refetch();
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedSettlement(null);
  };

  // Filter to only unsettled or recent settlements that are eligible for quick pay
  const eligibleSettlements = settlements.filter((s) => {
    // Only show settlements with a balance due or that can be quick-paid
    return s.status !== 'PAID' || s.balanceDue > 0;
  });

  const pendingQuickPaySettlements = settlements.filter(
    (s) => s.status === 'QUICK_PAY_PENDING'
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Quick Pay Request"
        description="Request an immediate payment advance against your settlements"
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

      {/* Info Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard
          title="What is Quick Pay?"
          description="Request an advance against your pending settlement. Funds are available within 24 hours of approval."
        />
        <InfoCard
          title="Fee Structure"
          description="2% of the settlement amount (minimum $100 fee). Deducted from the advance amount you receive."
        />
        <InfoCard
          title="Processing Time"
          description="Requests approved within 2-4 business hours. Funds transferred within 24 hours of approval."
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Section */}
        <div className="lg:col-span-2">
          {showForm && selectedSettlement ? (
            <QuickPayForm
              settlement={selectedSettlement}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Request Quick Pay Advance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">
                  Select a settlement below to request a quick pay advance.
                </p>
                {eligibleSettlements.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">
                      No eligible settlements available
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Quick Pay is available for unpaid settlements
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {eligibleSettlements.map((settlement) => (
                      <button
                        key={settlement.id}
                        onClick={() => handleSelectSettlement(settlement)}
                        className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-slate-900">
                            {settlement.settlementNumber}
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(settlement.grossAmount)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          {formatDate(settlement.settlementDate)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pending Quick Pay Alert */}
        <div>
          {pendingQuickPaySettlements.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-900 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Quick Pay
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingQuickPaySettlements.map((settlement) => (
                    <div
                      key={settlement.id}
                      className="bg-white rounded-lg p-3 border border-yellow-100"
                    >
                      <div className="font-semibold text-yellow-900 mb-1">
                        {settlement.settlementNumber}
                      </div>
                      <p className="text-sm text-yellow-800 mb-2">
                        {formatCurrency(settlement.grossAmount)} requested
                      </p>
                      <p className="text-xs text-yellow-700">Under review</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* All Settlements */}
      <Card>
        <CardHeader>
          <CardTitle>All Settlements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-600">Loading settlements...</p>
            </div>
          ) : settlements.length === 0 ? (
            <div className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No settlements yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Your settlements will appear here as loads are completed
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold">
                      Settlement #
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Date
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Amount
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Deductions
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Net
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-slate-700 font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settlements.map((settlement) => (
                    <TableRow
                      key={settlement.id}
                      className="hover:bg-slate-50 border-b border-slate-200 last:border-0"
                    >
                      <TableCell className="font-mono font-semibold text-slate-900">
                        {settlement.settlementNumber}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {formatDate(settlement.settlementDate)}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {formatCurrency(settlement.grossAmount)}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {formatCurrency(settlement.deductionsTotal)}
                      </TableCell>
                      <TableCell className="text-slate-700 font-semibold">
                        {formatCurrency(settlement.netAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`border-0 ${getSettlementStatusColor(settlement.status)}`}
                        >
                          {settlement.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {settlement.status !== 'PAID' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectSettlement(settlement)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Zap className="w-4 h-4 mr-1" />
                            Quick Pay
                          </Button>
                        )}
                        {settlement.status === 'PAID' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled
                            className="text-slate-400"
                          >
                            -
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terms Section */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Quick Pay Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Fee Structure</h4>
            <p>
              Quick Pay advances are subject to a 2% fee with a minimum fee of
              $100. For example, a $2,000 settlement would result in a $100 fee
              (2% minimum), and a $10,000 settlement would result in a $200 fee
              (2% of amount).
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Processing Timeline
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Submission: Immediate</li>
              <li>Review & Approval: 2-4 business hours</li>
              <li>Fund Transfer: Within 24 hours of approval</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Settlement Eligibility
            </h4>
            <p>
              Quick Pay is available for settlements that have not yet been
              paid. Once a settlement is fully paid, Quick Pay is no longer
              available for that settlement.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Request Cancellation
            </h4>
            <p>
              You may cancel a pending Quick Pay request at any time before it
              is approved. Once approved or paid, cancellation is not available.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  description: string;
}

function InfoCard({ title, description }: InfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">{description}</p>
      </CardContent>
    </Card>
  );
}

function getSettlementStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'APPROVED':
      return 'bg-blue-100 text-blue-800';
    case 'PAID':
      return 'bg-green-100 text-green-800';
    case 'QUICK_PAY_PENDING':
      return 'bg-orange-100 text-orange-800';
    case 'QUICK_PAY_APPROVED':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}
