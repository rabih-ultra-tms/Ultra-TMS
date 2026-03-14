'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Download, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  usePaymentHistory,
  Payment,
  PaymentStatus,
  usePaymentDetail,
} from '@/lib/hooks/carrier/use-payments';

interface PaymentHistoryProps {
  onDetailView?: (payment: Payment) => void;
}

export function PaymentHistory({ onDetailView }: PaymentHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>(
    'ALL'
  );
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [detailPaymentId, setDetailPaymentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const pageSize = 10;

  const {
    data: payments = [],
    isLoading,
    error,
  } = usePaymentHistory({
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: pageSize,
    offset: currentPage * pageSize,
  });

  const { data: detailPayment } = usePaymentDetail(detailPaymentId || '');

  const sortedPayments = useMemo(() => {
    const sorted = [...(payments || [])].sort((a, b) => {
      const dateA = new Date(a.paymentDate).getTime();
      const dateB = new Date(b.paymentDate).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  }, [payments, sortOrder]);

  const handleDownloadReceipt = (paymentId: string) => {
    // Placeholder for download logic
    console.log('Downloading receipt for payment:', paymentId);
  };

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.PAID:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Payments</h3>
          <p className="text-sm text-red-800 mt-1">
            {error instanceof Error
              ? error.message
              : 'Failed to load payment history'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value: PaymentStatus | 'ALL') =>
                  setStatusFilter(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value={PaymentStatus.PENDING}>Pending</SelectItem>
                  <SelectItem value={PaymentStatus.PAID}>Paid</SelectItem>
                  <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                From Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(0);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                To Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(0);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sort
              </label>
              <Select
                value={sortOrder}
                onValueChange={(value: 'newest' | 'oldest') =>
                  setSortOrder(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-slate-600">Loading payments...</p>
              </div>
            ) : sortedPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-600">
                <p>No payments found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold">
                      Load ID
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Amount
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Status
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Payment Date
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold">
                      Method
                    </TableHead>
                    <TableHead className="text-right text-slate-700 font-semibold">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedPayments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="hover:bg-slate-50 border-b border-slate-200 last:border-0"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {payment.loadId || '-'}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(payment.status)} border-0`}
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {formatDate(payment.paymentDate)}
                      </TableCell>
                      <TableCell className="text-slate-700">
                        {payment.paymentMethod || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setDetailPaymentId(payment.id);
                              onDetailView?.(payment);
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReceipt(payment.id)}
                            className="text-slate-600 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && sortedPayments.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-slate-600">
                Showing {currentPage * pageSize + 1} to{' '}
                {Math.min(
                  (currentPage + 1) * pageSize,
                  (payments?.length ?? 0) + currentPage * pageSize
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={sortedPayments.length < pageSize}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Detail Modal */}
      {detailPaymentId && detailPayment && (
        <PaymentDetailModal
          payment={detailPayment}
          open={!!detailPaymentId}
          onOpenChange={(open) => {
            if (!open) setDetailPaymentId(null);
          }}
          onDownload={handleDownloadReceipt}
        />
      )}
    </>
  );
}

interface PaymentDetailModalProps {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (paymentId: string) => void;
}

export function PaymentDetailModal({
  payment,
  open,
  onOpenChange,
  onDownload,
}: PaymentDetailModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Payment #{payment.paymentNumber || payment.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Amount Section */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Amount
            </h3>
            <div className="flex justify-between items-baseline">
              <span className="text-slate-600">Total Amount</span>
              <span className="text-2xl font-bold text-slate-900">
                {formatCurrency(payment.amount)}
              </span>
            </div>
          </div>

          {/* Payment Information */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Payment Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Number</span>
                <span className="text-slate-900 font-medium">
                  {payment.paymentNumber || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Status</span>
                <Badge
                  variant="outline"
                  className={`${getStatusColorClass(payment.status)} border-0`}
                >
                  {payment.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Date</span>
                <span className="text-slate-900 font-medium">
                  {formatDate(payment.paymentDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Payment Method</span>
                <span className="text-slate-900 font-medium">
                  {payment.paymentMethod || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Load Information */}
          {payment.loadId && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Load Information
              </h3>
              <div className="flex justify-between">
                <span className="text-slate-600">Load ID</span>
                <span className="text-slate-900 font-medium">
                  {payment.loadId}
                </span>
              </div>
            </div>
          )}

          {/* Reference & Notes */}
          <div className="space-y-3">
            {payment.referenceNumber && (
              <div className="flex justify-between">
                <span className="text-slate-600">Reference Number</span>
                <span className="text-slate-900 font-medium">
                  {payment.referenceNumber}
                </span>
              </div>
            )}
            {payment.notes && (
              <div className="flex flex-col gap-2">
                <span className="text-slate-600 text-sm">Notes</span>
                <p className="text-slate-900 text-sm bg-slate-50 p-2 rounded">
                  {payment.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={() => onDownload(payment.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getStatusColorClass(status: PaymentStatus): string {
  switch (status) {
    case PaymentStatus.PENDING:
      return 'bg-yellow-100 text-yellow-800';
    case PaymentStatus.PAID:
      return 'bg-green-100 text-green-800';
    case PaymentStatus.FAILED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}
