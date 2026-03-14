'use client';

import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle } from 'lucide-react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useCreateQuickPayRequest,
  calculateQuickPayFee,
  calculateNetAmount,
  type QuickPayResponse,
} from '@/lib/hooks/carrier/use-quick-pay';
import { type Settlement } from '@/lib/hooks/carrier/use-payments';
import { formatCurrency } from '@/lib/utils';

const quickPayFormSchema = z.object({
  notes: z.string().optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Quick Pay terms and conditions',
  }),
});

type QuickPayFormValues = z.infer<typeof quickPayFormSchema>;

interface QuickPayFormProps {
  settlement: Settlement;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function QuickPayForm({
  settlement,
  onSuccess,
  onCancel,
}: QuickPayFormProps) {
  const [successResponse, setSuccessResponse] =
    React.useState<QuickPayResponse | null>(null);
  const createQuickPay = useCreateQuickPayRequest(settlement.id);

  const form = useForm<QuickPayFormValues>({
    resolver: zodResolver(quickPayFormSchema),
    defaultValues: {
      notes: '',
      termsAccepted: false,
    },
  });

  const termsAccepted = form.watch('termsAccepted');

  // Calculate fee and net amount based on settlement amount
  const fee = calculateQuickPayFee(settlement.grossAmount);
  const netAmount = calculateNetAmount(settlement.grossAmount, fee);

  const onSubmit = async (values: QuickPayFormValues) => {
    try {
      const result = await createQuickPay.mutateAsync({
        amount: settlement.grossAmount,
        reason: 'Settlement',
        notes: values.notes || undefined,
      });

      setSuccessResponse(result);
      toast.success(
        `Quick Pay request submitted successfully! Tracking #${result.trackingNumber}`
      );
      onSuccess?.();

      // Optionally reset form after success
      form.reset();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to submit Quick Pay request';
      toast.error(message);
    }
  };

  // If successful, show confirmation
  if (successResponse) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <CardTitle className="text-green-900">
                Quick Pay Request Submitted
              </CardTitle>
              <p className="text-sm text-green-800 mt-1">
                Your settlement quick pay request has been submitted
                successfully
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Confirmation Details */}
          <div className="bg-white rounded-lg p-4 space-y-3 border border-green-100">
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium text-slate-600">
                Settlement
              </span>
              <span className="font-mono font-bold text-slate-900">
                {settlement.settlementNumber}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium text-slate-600">
                Tracking Number
              </span>
              <span className="font-mono font-bold text-green-700">
                {successResponse.trackingNumber}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium text-slate-600">
                Settlement Amount
              </span>
              <span className="font-bold text-slate-900">
                {formatCurrency(successResponse.amount)}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm font-medium text-slate-600">Fee</span>
              <span className="text-slate-900">
                {formatCurrency(successResponse.fee)} (2% or $100 min)
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-600">
                Net Amount
              </span>
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(successResponse.netAmount)}
              </span>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              What happens next?
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  Your Quick Pay request has been submitted and is under review
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  Requests are typically approved within 2-4 business hours
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>
                  Once approved, funds will be transferred within 24 hours
                </span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>The fee will be deducted from your next settlement</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSuccessResponse(null);
                form.reset();
              }}
              className="flex-1"
            >
              Request Another
            </Button>
            <Button
              onClick={() => {
                setSuccessResponse(null);
                onCancel?.();
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Back to Settlements
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Pay Request</CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Settlement {settlement.settlementNumber} •{' '}
          {formatCurrency(settlement.grossAmount)}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Settlement Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">Settlement Amount</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(settlement.grossAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">
                  Quick Pay Fee (2% or $100 min)
                </span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(fee)}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                <span className="font-semibold text-slate-900">
                  Net Amount You'll Receive
                </span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(netAmount)}
                </span>
              </div>
            </div>

            {/* Notes Field */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-700">
                    Notes (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information about this request..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Terms Checkbox */}
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 rounded-lg border border-slate-200 p-4 bg-slate-50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer text-slate-900">
                      I agree to the Quick Pay terms and conditions
                    </FormLabel>
                    <p className="text-xs text-slate-600">
                      I understand that a 2% fee (minimum $100) will be deducted
                      from this settlement amount. The net amount will be
                      available within 24 hours of approval. Requests are
                      typically approved within 2-4 business hours.
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Alert */}
            {createQuickPay.isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  {createQuickPay.error instanceof Error
                    ? createQuickPay.error.message
                    : 'Failed to submit Quick Pay request. Please try again.'}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={createQuickPay.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!termsAccepted || createQuickPay.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createQuickPay.isPending ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
