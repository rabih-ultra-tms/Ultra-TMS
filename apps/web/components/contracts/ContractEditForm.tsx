'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Save } from 'lucide-react';
import { Contract, ContractStatus, Amendment } from '@/lib/api/contracts/types';
import { amendmentsApi } from '@/lib/api/contracts/client';
import { toast } from 'sonner';

const amendmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  changes: z.record(z.string(), z.any()).optional(),
});

type AmendmentFormData = z.infer<typeof amendmentSchema>;

interface ContractEditFormProps {
  contract: Contract;
  onSuccess?: () => void;
}

/**
 * Contract Edit Form with Amendment Creation
 * Editable fields create amendments instead of direct updates
 * Only shows editable fields for ACTIVE contracts
 */
export function ContractEditForm({
  contract,
  onSuccess,
}: ContractEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [showAmendmentHistory, setShowAmendmentHistory] = useState(false);

  // Check if contract allows editing
  const canEdit =
    contract.status === ContractStatus.ACTIVE ||
    contract.status === ContractStatus.APPROVED ||
    contract.status === ContractStatus.SIGNED;

  const form = useForm<AmendmentFormData>({
    resolver: zodResolver(amendmentSchema),
    defaultValues: {
      title: '',
      description: '',
      effectiveDate: new Date().toISOString().split('T')[0],
      changes: {},
    },
  });

  const onSubmit = async (data: AmendmentFormData) => {
    if (!canEdit) {
      toast.error('This contract cannot be edited in its current status');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create amendment (creates a new record, not direct update)
      await amendmentsApi.create(contract.id, {
        title: data.title,
        description: data.description,
        effectiveDate: data.effectiveDate,
        changes: data.changes || {},
      });

      toast.success('Amendment created successfully');
      form.reset();

      // Fetch updated amendments
      await fetchAmendments();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create amendment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchAmendments = async () => {
    try {
      const data = await amendmentsApi.listForContract(contract.id);
      setAmendments(data);
    } catch (error) {
      console.error('Failed to fetch amendments:', error);
    }
  };

  const getStatusBadgeColor = (status: ContractStatus): string => {
    switch (status) {
      case ContractStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case ContractStatus.PENDING_REVIEW:
      case ContractStatus.PENDING_SIGNATURE:
        return 'bg-yellow-100 text-yellow-800';
      case ContractStatus.APPROVED:
      case ContractStatus.SIGNED:
      case ContractStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case ContractStatus.EXPIRED:
      case ContractStatus.TERMINATED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Contract Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contract Information</CardTitle>
            <Badge className={getStatusBadgeColor(contract.status)}>
              {contract.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-text-muted">
                Contract Number
              </p>
              <p className="mt-1 text-sm font-semibold">
                {contract.contractNumber}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Contract Name</p>
              <p className="mt-1 text-sm font-semibold">{contract.contractName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Party</p>
              <p className="mt-1 text-sm font-semibold">{contract.partyName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Type</p>
              <p className="mt-1 text-sm font-semibold">{contract.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Start Date</p>
              <p className="mt-1 text-sm font-semibold">
                {new Date(contract.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">End Date</p>
              <p className="mt-1 text-sm font-semibold">
                {new Date(contract.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Value</p>
              <p className="mt-1 text-sm font-semibold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: contract.currency,
                }).format(contract.value)}
              </p>
            </div>
          </div>

          {contract.terms && (
            <div>
              <p className="text-sm font-medium text-text-muted">Terms</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">
                {contract.terms}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editing Status */}
      {!canEdit && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This contract cannot be edited in its current status ({contract.status}
            ). Only ACTIVE, APPROVED, or SIGNED contracts can be amended.
          </AlertDescription>
        </Alert>
      )}

      {/* Amendment Creation Form */}
      {canEdit && (
        <Card>
          <CardHeader>
            <CardTitle>Create Amendment</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amendment Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Rate Increase, Renewal Terms"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief title describing the amendment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed description of the amendment and its impact"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Explain what is being changed and why
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When will this amendment take effect
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Amendments create a new amendment record. Once submitted, the
                    amendment must be approved before taking effect.
                  </AlertDescription>
                </Alert>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Creating Amendment...' : 'Create Amendment'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Amendment History */}
      {amendments.length > 0 && (
        <Card>
          <CardHeader>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowAmendmentHistory(!showAmendmentHistory)}
            >
              <CardTitle>Amendment History</CardTitle>
              <Badge variant="outline">{amendments.length}</Badge>
            </div>
          </CardHeader>
          {showAmendmentHistory && (
            <CardContent>
              <div className="space-y-4">
                {amendments.map((amendment) => (
                  <div
                    key={amendment.id}
                    className="border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary">
                          {amendment.title}
                        </h4>
                        <p className="mt-1 text-sm text-text-muted">
                          {amendment.description}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          <span className="text-xs text-text-muted">
                            Effective:{' '}
                            {new Date(
                              amendment.effectiveDate
                            ).toLocaleDateString()}
                          </span>
                          <Badge variant="outline">{amendment.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
