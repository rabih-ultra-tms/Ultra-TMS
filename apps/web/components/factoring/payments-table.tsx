'use client';

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
import { FactoredPayment, FactoredPaymentStatus } from '@/lib/hooks/factoring';
import { Edit2 } from 'lucide-react';

interface PaymentsTableProps {
  payments: FactoredPayment[];
  isLoading: boolean;
  onProcess: (payment: FactoredPayment) => void;
}

function getStatusBadgeVariant(
  status?: FactoredPaymentStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PENDING':
      return 'outline';
    case 'SCHEDULED':
      return 'secondary';
    case 'PROCESSING':
      return 'default';
    case 'PAID':
      return 'default';
    case 'FAILED':
      return 'destructive';
    default:
      return 'default';
  }
}

function getStatusLabel(status?: FactoredPaymentStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'SCHEDULED':
      return 'Scheduled';
    case 'PROCESSING':
      return 'Processing';
    case 'PAID':
      return 'Paid';
    case 'FAILED':
      return 'Failed';
    default:
      return 'Unknown';
  }
}

function formatCurrency(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(date: string | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PaymentsTable({
  payments,
  isLoading,
  onProcess,
}: PaymentsTableProps) {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading payments...
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No factored payments found
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Factoring Company</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell className="font-medium">
                {payment.factoringCompany?.name || 'Unknown'}
              </TableCell>
              <TableCell>{formatCurrency(payment.paymentAmount)}</TableCell>
              <TableCell>{payment.paymentMethod || '-'}</TableCell>
              <TableCell>{formatDate(payment.paymentDate)}</TableCell>
              <TableCell>
                <Badge
                  variant={getStatusBadgeVariant(
                    payment.customFields?.status as FactoredPaymentStatus
                  )}
                >
                  {getStatusLabel(
                    payment.customFields?.status as FactoredPaymentStatus
                  )}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onProcess(payment)}
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Process</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
