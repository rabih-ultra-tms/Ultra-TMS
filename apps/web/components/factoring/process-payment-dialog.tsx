'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  FactoredPayment,
  ProcessPaymentDto,
  FactoredPaymentStatus,
} from '@/lib/hooks/factoring';
import { useToast } from '@/lib/hooks/use-toast';

interface ProcessPaymentDialogProps {
  payment: FactoredPayment | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (dto: ProcessPaymentDto) => Promise<void>;
  isLoading: boolean;
}

const statusOptions: FactoredPaymentStatus[] = [
  'PENDING',
  'SCHEDULED',
  'PROCESSING',
  'PAID',
  'FAILED',
];

const paymentMethods = ['ACH', 'CHECK', 'WIRE', 'CREDIT_CARD'];

export function ProcessPaymentDialog({
  payment,
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
}: ProcessPaymentDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProcessPaymentDto>({
    status: payment?.customFields?.status as FactoredPaymentStatus,
    paymentAmount: payment?.paymentAmount ?? undefined,
    paymentMethod:
      (payment?.paymentMethod as
        | 'ACH'
        | 'CHECK'
        | 'WIRE'
        | 'CREDIT_CARD'
        | undefined) ?? undefined,
    paymentDate: payment?.paymentDate?.split('T')[0] ?? undefined,
    verificationCode: payment?.verificationCode ?? undefined,
    notes: payment?.notes ?? undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      toast({
        title: 'Success',
        description: 'Payment processed successfully',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to process payment',
        variant: 'destructive',
      });
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process Factored Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Payment Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.paymentAmount ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    paymentAmount: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="date">Payment Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.paymentDate ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as FactoredPaymentStatus,
                  })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="method">Payment Method</Label>
              <Select
                value={formData.paymentMethod ?? ''}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    paymentMethod: value as
                      | 'ACH'
                      | 'CHECK'
                      | 'WIRE'
                      | 'CREDIT_CARD',
                  })
                }
              >
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="code">Verification Code</Label>
            <Input
              id="code"
              value={formData.verificationCode ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, verificationCode: e.target.value })
              }
              placeholder="Reference or confirmation code"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes ?? ''}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes about this payment"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Process Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
