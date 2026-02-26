'use client';

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { FormPage, FormSection } from '@/components/patterns/form-page';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TierEditor } from '@/components/commissions/tier-editor';
import {
  useCreatePlan,
  useUpdatePlan,
} from '@/lib/hooks/commissions/use-plans';
import type { CommissionPlan, PlanType, PlanTier, CreatePlanInput, BackendPlanType } from '@/lib/hooks/commissions/use-plans';

// ===========================
// Schema
// ===========================

const tierSchema = z.object({
  minMargin: z.number().min(0).max(100),
  maxMargin: z.number().min(0).max(100).nullable(),
  rate: z.number().min(0),
});

const planSchema = z
  .object({
    name: z.string().min(1, 'Plan name is required').max(100),
    type: z.enum(['PERCENTAGE', 'FLAT', 'TIERED_PERCENTAGE', 'TIERED_FLAT']),
    description: z.string().max(500).optional().or(z.literal('')),
    rate: z.number().min(0).max(100).optional().nullable(),
    flatAmount: z.number().min(0).optional().nullable(),
    tiers: z.array(tierSchema).optional(),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'PERCENTAGE' && (data.rate === null || data.rate === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Rate is required for percentage plans',
        path: ['rate'],
      });
    }
    if (data.type === 'FLAT' && (data.flatAmount === null || data.flatAmount === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Flat amount is required for flat rate plans',
        path: ['flatAmount'],
      });
    }
    if (
      (data.type === 'TIERED_PERCENTAGE' || data.type === 'TIERED_FLAT') &&
      (!data.tiers || data.tiers.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'At least one tier is required for tiered plans',
        path: ['tiers'],
      });
    }
  });

type PlanFormValues = z.infer<typeof planSchema>;

// ===========================
// Plan Type Options
// ===========================

const PLAN_TYPE_OPTIONS: { value: PlanType; label: string; description: string }[] = [
  {
    value: 'PERCENTAGE',
    label: 'Percentage',
    description: 'Fixed percentage of margin or revenue',
  },
  {
    value: 'FLAT',
    label: 'Flat Rate',
    description: 'Fixed dollar amount per load',
  },
  {
    value: 'TIERED_PERCENTAGE',
    label: 'Tiered Percentage',
    description: 'Percentage rate varies by margin tier',
  },
  {
    value: 'TIERED_FLAT',
    label: 'Tiered Flat',
    description: 'Flat amount varies by margin tier',
  },
];

// ===========================
// Default Tiers
// ===========================

// Reverse mapping: backend planType → frontend form type
const BACKEND_TO_FORM_TYPE: Record<BackendPlanType, PlanType> = {
  PERCENT_MARGIN: 'PERCENTAGE',
  PERCENT_REVENUE: 'PERCENTAGE',
  FLAT_FEE: 'FLAT',
  TIERED: 'TIERED_PERCENTAGE',
  CUSTOM: 'PERCENTAGE',
};

const DEFAULT_TIERS: PlanTier[] = [
  { minMargin: 0, maxMargin: 12, rate: 8 },
  { minMargin: 12, maxMargin: 18, rate: 10 },
  { minMargin: 18, maxMargin: 25, rate: 12 },
  { minMargin: 25, maxMargin: null, rate: 15 },
];

// ===========================
// Component
// ===========================

interface CommissionPlanFormProps {
  plan?: CommissionPlan;
}

export function CommissionPlanForm({ plan }: CommissionPlanFormProps) {
  const router = useRouter();
  const isEditing = !!plan;
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();

  const defaultValues: PlanFormValues = {
    name: plan?.name ?? '',
    type: plan ? BACKEND_TO_FORM_TYPE[plan.planType] : 'PERCENTAGE',
    description: plan?.description ?? '',
    rate: plan?.percentRate != null ? Number(plan.percentRate) : null,
    flatAmount: plan?.flatAmount != null ? Number(plan.flatAmount) : null,
    tiers: plan?.tiers?.map((t) => ({
      minMargin: Number(t.thresholdMin),
      maxMargin: t.thresholdMax != null ? Number(t.thresholdMax) : null,
      rate: Number(t.rateAmount),
    })) ?? [],
    isActive: plan ? plan.status === 'ACTIVE' : true,
  };

  const handleSubmit = async (values: PlanFormValues) => {
    // Map frontend plan types to backend PlanType enum
    const planTypeMap: Record<string, string> = {
      PERCENTAGE: 'PERCENT_MARGIN',
      FLAT: 'FLAT_FEE',
      TIERED_PERCENTAGE: 'TIERED',
      TIERED_FLAT: 'TIERED',
    };

    try {
      if (isEditing) {
        await updatePlan.mutateAsync({
          id: plan.id,
          name: values.name,
          description: values.description || undefined,
          status: values.isActive ? 'ACTIVE' : 'INACTIVE',
          percentRate: values.rate ?? undefined,
          flatAmount: values.flatAmount ?? undefined,
        });
        toast.success('Commission plan updated');
      } else {
        // Transform tiers to backend format
        const mappedTiers = values.tiers?.map((tier, index) => ({
          tierNumber: index + 1,
          thresholdType: 'MARGIN',
          thresholdMin: tier.minMargin,
          thresholdMax: tier.maxMargin ?? undefined,
          rateType: values.type === 'TIERED_PERCENTAGE' ? 'PERCENT' : 'FLAT',
          rateAmount: tier.rate,
        }));

        const payload: CreatePlanInput = {
          name: values.name,
          planType: planTypeMap[values.type] ?? values.type,
          description: values.description || undefined,
          percentRate: values.rate ?? undefined,
          flatAmount: values.flatAmount ?? undefined,
          effectiveDate: new Date().toISOString(),
          tiers: mappedTiers && mappedTiers.length > 0 ? mappedTiers : undefined,
        };

        await createPlan.mutateAsync(payload);
        toast.success('Commission plan created');
      }
      router.push('/commissions/plans');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save plan';
      toast.error(message);
    }
  };

  return (
    <FormPage<PlanFormValues>
      title={isEditing ? `Edit Plan: ${plan.name}` : 'New Commission Plan'}
      description={
        isEditing
          ? 'Update commission plan configuration'
          : 'Create a new commission plan for sales reps'
      }
      backPath="/commissions/plans"
      schema={planSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={createPlan.isPending || updatePlan.isPending}
      submitLabel={isEditing ? 'Update Plan' : 'Create Plan'}
    >
      {(form) => {
        const planType = form.watch('type');
        const isTiered =
          planType === 'TIERED_PERCENTAGE' || planType === 'TIERED_FLAT';

        return (
          <>
            {/* Basic Information */}
            <FormSection title="Plan Details" description="Basic plan information">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Standard Commission" {...field} />
                    </FormControl>
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
                        placeholder="Brief description of this plan..."
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <FormLabel className="text-sm font-medium">Active</FormLabel>
                      <FormDescription className="text-xs">
                        Inactive plans cannot be assigned to reps
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>

            {/* Commission Type */}
            <FormSection
              title="Commission Type"
              description="How commissions are calculated"
            >
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-populate default tiers when switching to tiered
                        if (
                          (value === 'TIERED_PERCENTAGE' || value === 'TIERED_FLAT') &&
                          (form.getValues('tiers')?.length ?? 0) === 0
                        ) {
                          form.setValue('tiers', DEFAULT_TIERS, { shouldDirty: true });
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PLAN_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div>
                              <span className="font-medium">{opt.label}</span>
                              <span className="ml-2 text-xs text-text-muted">
                                {opt.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Percentage Rate */}
              {planType === 'PERCENTAGE' && (
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commission Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="e.g., 10"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? null : parseFloat(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Percentage of margin applied to each load
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Flat Amount */}
              {planType === 'FLAT' && (
                <FormField
                  control={form.control}
                  name="flatAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Flat Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="e.g., 50.00"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === '' ? null : parseFloat(e.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Fixed dollar amount per completed load
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Tiered Editor */}
              {isTiered && (
                <FormField
                  control={form.control}
                  name="tiers"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <TierEditor
                          tiers={field.value ?? []}
                          onChange={field.onChange}
                          rateLabel={
                            planType === 'TIERED_PERCENTAGE' ? 'Rate' : 'Amount'
                          }
                          rateSuffix={
                            planType === 'TIERED_PERCENTAGE' ? '%' : '$'
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        {planType === 'TIERED_PERCENTAGE'
                          ? 'Commission rate varies by margin percentage tier'
                          : 'Flat amount varies by margin percentage tier'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </FormSection>
          </>
        );
      }}
    </FormPage>
  );
}
