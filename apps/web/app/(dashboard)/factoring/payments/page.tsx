'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PaymentsTable } from '@/components/factoring/payments-table';
import { ProcessPaymentDialog } from '@/components/factoring/process-payment-dialog';
import {
  useFactoredPayments,
  useProcessPayment,
  FactoredPayment,
  FactoredPaymentStatus,
  ProcessPaymentDto,
} from '@/lib/hooks/factoring';

export default function PaymentsPage() {
  const [selectedPayment, setSelectedPayment] =
    useState<FactoredPayment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [status, setStatus] = useState<FactoredPaymentStatus | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const { data, isLoading, refetch } = useFactoredPayments({
    status: (status as FactoredPaymentStatus) || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const { mutateAsync: processPayment, isPending: isProcessing } =
    useProcessPayment();

  const handleProcessPayment = async (payment: FactoredPayment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (dto: ProcessPaymentDto) => {
    if (!selectedPayment) return;
    try {
      await processPayment({ id: selectedPayment.id, dto });
      refetch();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as FactoredPaymentStatus | '')
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="from">From Date</Label>
            <Input
              id="from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="to">To Date</Label>
            <Input
              id="to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Factored Payments</h2>
        <PaymentsTable
          payments={data?.data ?? []}
          isLoading={isLoading}
          onProcess={handleProcessPayment}
        />
      </div>

      {/* Process Dialog */}
      <ProcessPaymentDialog
        payment={selectedPayment}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        isLoading={isProcessing}
      />
    </div>
  );
}
