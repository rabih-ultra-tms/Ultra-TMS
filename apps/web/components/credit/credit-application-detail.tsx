'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useCreditApplication,
  useApproveCreditApplication,
} from '@/lib/hooks/credit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/format';

const approvalSchema = z.object({
  recommendedLimit: z.number().min(1000, 'Minimum limit is $1,000'),
  notes: z.string().optional(),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

interface CreditApplicationDetailProps {
  applicationId: string;
  mode: 'view' | 'review';
}

export function CreditApplicationDetail({
  applicationId,
  mode,
}: CreditApplicationDetailProps) {
  const {
    data: application,
    isLoading,
    error,
  } = useCreditApplication(applicationId);
  const { mutateAsync: approveApplication, isPending: isApproving } =
    useApproveCreditApplication();

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      recommendedLimit: application?.creditLimit,
    },
  });

  if (isLoading) {
    return <ApplicationDetailSkeleton />;
  }

  if (error || !application) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <p className="text-sm text-red-700">
          Failed to load application details.
        </p>
      </div>
    );
  }

  const onApprove = async (data: ApprovalFormData) => {
    try {
      setSubmitStatus('idle');
      await approveApplication({
        applicationId,
        approvedLimit: data.recommendedLimit,
        notes: data.notes,
      });
      setSubmitStatus('success');
      setErrorMessage('');
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to approve application'
      );
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      return;
    }

    try {
      setIsRejecting(true);
      setSubmitStatus('idle');
      // Call reject mutation here when available
      setSubmitStatus('success');
      setErrorMessage('');
    } catch (err) {
      setSubmitStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to reject application'
      );
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {submitStatus === 'success' && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-700">
            {mode === 'review'
              ? 'Application processed successfully!'
              : 'Application details loaded.'}
          </p>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Application Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-gray-600">Company Name</Label>
              <p className="mt-1 text-lg font-medium">
                {application?.companyName}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Status</Label>
              <p className="mt-1 text-lg font-medium">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    application?.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : application?.status === 'APPROVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {application?.status}
                </span>
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Requested Limit</Label>
              <p className="mt-1 text-lg font-medium">
                {formatCurrency(application?.requestedLimit || 0)}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Industry</Label>
              <p className="mt-1 text-lg font-medium">
                {application?.industry}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Annual Revenue</Label>
              <p className="mt-1 text-lg font-medium">
                {formatCurrency(application?.annualRevenue || 0)}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Credit Score</Label>
              <p className="mt-1 text-lg font-medium">
                {application?.businessCreditScore}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Contact Name</Label>
              <p className="mt-1 text-lg font-medium">
                {application?.contactName}
              </p>
            </div>
            <div>
              <Label className="text-gray-600">Contact Email</Label>
              <p className="mt-1 text-lg font-medium">
                {application?.contactEmail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {mode === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Application Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onApprove)} className="space-y-4">
              <div>
                <Label htmlFor="recommendedLimit">
                  Recommended Credit Limit
                </Label>
                <Input
                  id="recommendedLimit"
                  type="number"
                  placeholder="Enter recommended limit"
                  {...register('recommendedLimit', { valueAsNumber: true })}
                  className={errors.recommendedLimit ? 'border-red-500' : ''}
                />
                {errors.recommendedLimit && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.recommendedLimit.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add approval notes (optional)"
                  {...register('notes')}
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isApproving}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isApproving ? 'Approving...' : 'Approve Application'}
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    // Toggle rejection form
                    if (isRejecting) {
                      setIsRejecting(false);
                      setRejectionReason('');
                    } else {
                      setIsRejecting(true);
                    }
                  }}
                >
                  Reject
                </Button>
              </div>

              {isRejecting && (
                <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <Label htmlFor="rejectionReason" className="text-red-900">
                    Rejection Reason
                  </Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Explain why this application is being rejected"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="border-red-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleReject}
                    disabled={isRejecting}
                    className="w-full"
                  >
                    {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ApplicationDetailSkeleton() {
  return (
    <div data-testid="application-detail-skeleton">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
