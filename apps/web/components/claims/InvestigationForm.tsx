'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { claimSettlementClient, claimsClient } from '@/lib/api/claims';
import {
  ClaimDetailResponse,
  ClaimDisposition,
  ClaimStatus,
} from '@/lib/api/claims/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// ===========================
// Validation Schema
// ===========================

const investigationFormSchema = z.object({
  rootCause: z
    .string()
    .min(1, 'Root cause is required')
    .min(10, 'Root cause must be at least 10 characters')
    .max(2000, 'Root cause must not exceed 2000 characters'),
  disposition: z.nativeEnum(ClaimDisposition),
  investigationNotes: z
    .string()
    .min(1, 'Investigation findings are required')
    .min(10, 'Investigation findings must be at least 10 characters')
    .max(3000, 'Investigation findings must not exceed 3000 characters'),
});

type InvestigationFormValues = z.infer<typeof investigationFormSchema>;

// ===========================
// Props and Component
// ===========================

interface InvestigationFormProps {
  claimId: string;
  claim: ClaimDetailResponse;
  onSuccess?: () => void;
}

export function InvestigationForm({
  claimId,
  claim,
  onSuccess,
}: InvestigationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<InvestigationFormValues>({
    resolver: zodResolver(investigationFormSchema),
    defaultValues: {
      rootCause: claim.rootCause || '',
      disposition: claim.disposition || undefined,
      investigationNotes: claim.investigationNotes || '',
    },
  });

  const onSubmit = async (values: InvestigationFormValues) => {
    try {
      setIsSubmitting(true);

      // Step 1: Save investigation findings
      // This is the critical operation - investigation data must be saved
      await claimSettlementClient.updateInvestigation(claimId, {
        rootCause: values.rootCause,
        disposition: values.disposition,
        investigationNotes: values.investigationNotes,
      });

      // Step 2: Attempt to advance claim status based on current status
      // This is optional - if it fails, investigation is already saved
      const currentStatus = claim.status;

      try {
        if (
          currentStatus === ClaimStatus.SUBMITTED ||
          currentStatus === ClaimStatus.PENDING_DOCUMENTATION
        ) {
          // Advance to UNDER_INVESTIGATION
          await claimsClient.updateStatus(claimId, {
            status: ClaimStatus.UNDER_INVESTIGATION,
            reason: 'Investigation findings added',
          });
          toast.success(
            'Investigation updated. Claim status advanced to Under Investigation.'
          );
        } else if (currentStatus === ClaimStatus.UNDER_INVESTIGATION) {
          // Investigation status remains UNDER_INVESTIGATION
          // Investigation findings are recorded but status doesn't change
          toast.success(
            'Investigation findings recorded successfully. Claim remains under investigation.'
          );
        } else {
          // Unexpected status - just acknowledge the investigation was saved
          toast.success('Investigation updated successfully.');
        }
      } catch (statusErr) {
        // Status update failed, but investigation was already saved
        // This is acceptable - the investigation data is persistent
        console.warn(
          'Status update failed, but investigation findings were saved:',
          statusErr
        );
        toast.warning(
          'Investigation findings saved, but status update encountered an issue. Investigation data is persisted.'
        );
      }

      // Invalidate query to refresh claim detail
      queryClient.invalidateQueries({
        queryKey: ['claims', 'detail', claimId],
      });

      // Call success callback after both operations (investigation save + status update attempt)
      onSuccess?.();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update investigation';
      toast.error(`Investigation update failed: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investigation Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Root Cause Field */}
            <FormField
              control={form.control}
              name="rootCause"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Root Cause Analysis</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the root cause of the claim. Include relevant details about what happened and why."
                      className="min-h-[120px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed analysis of the root cause (10-2000
                    characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Disposition Field */}
            <FormField
              control={form.control}
              name="disposition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Liability Disposition</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select who is liable" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ClaimDisposition.CARRIER_LIABILITY}>
                        Carrier Liability
                      </SelectItem>
                      <SelectItem value={ClaimDisposition.SHIPPER_LIABILITY}>
                        Shipper Liability
                      </SelectItem>
                      <SelectItem value={ClaimDisposition.RECEIVER_LIABILITY}>
                        Receiver Liability
                      </SelectItem>
                      <SelectItem value={ClaimDisposition.SHARED_LIABILITY}>
                        Shared Liability
                      </SelectItem>
                      <SelectItem value={ClaimDisposition.NO_LIABILITY}>
                        No Liability
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Determine who is liable based on investigation findings
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Investigation Findings Field */}
            <FormField
              control={form.control}
              name="investigationNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Investigation Findings</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Document your investigation findings, evidence reviewed, interviews conducted, and conclusions. This will support your liability determination."
                      className="min-h-[150px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed investigation findings and evidence (10-3000
                    characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isDirty}
                className="gap-2"
              >
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isSubmitting ? 'Submitting...' : 'Submit Investigation'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
