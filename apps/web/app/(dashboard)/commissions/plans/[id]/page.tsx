'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Star,
  Trash2,
  Layers,
  Percent,
  DollarSign,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  usePlan,
  useActivatePlan,
  useDeletePlan,
} from '@/lib/hooks/commissions/use-plans';
import type { PlanType, PlanTier } from '@/lib/hooks/commissions/use-plans';
import { useReps } from '@/lib/hooks/commissions/use-reps';

// ===========================
// Helpers
// ===========================

const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  PERCENTAGE: 'Margin Percentage',
  FLAT: 'Flat Per Load',
  TIERED_PERCENTAGE: 'Tiered Percentage',
  TIERED_FLAT: 'Tiered Flat',
};

const PLAN_TYPE_ICONS: Record<PlanType, React.ReactNode> = {
  PERCENTAGE: <Percent className="size-5" />,
  FLAT: <DollarSign className="size-5" />,
  TIERED_PERCENTAGE: <Layers className="size-5" />,
  TIERED_FLAT: <Layers className="size-5" />,
};

// ===========================
// Tier Table
// ===========================

function TierTable({
  tiers,
  isPercentage,
}: {
  tiers: PlanTier[];
  isPercentage: boolean;
}) {
  if (tiers.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-2.5 text-left font-medium text-text-muted">
              Min Margin %
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-text-muted">
              Max Margin %
            </th>
            <th className="px-4 py-2.5 text-right font-medium text-text-muted">
              {isPercentage ? 'Rate (%)' : 'Amount ($)'}
            </th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, i) => (
            <tr key={i} className="border-b last:border-b-0">
              <td className="px-4 py-2.5">{tier.minMargin}%</td>
              <td className="px-4 py-2.5">
                {tier.maxMargin !== null ? `${tier.maxMargin}%` : 'No limit'}
              </td>
              <td className="px-4 py-2.5 text-right font-medium">
                {isPercentage ? `${tier.rate}%` : `$${tier.rate.toFixed(2)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ===========================
// Page
// ===========================

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params.id as string;

  const { data: plan, isLoading } = usePlan(planId);
  const activatePlan = useActivatePlan();
  const deletePlan = useDeletePlan();
  const { data: repsData } = useReps({ limit: 100 });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Filter reps that use this plan
  const assignedReps =
    repsData?.data?.filter((rep) => rep.planId === planId) ?? [];

  const handleActivate = async () => {
    try {
      await activatePlan.mutateAsync(planId);
      toast.success('Plan set as default');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to activate plan';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    try {
      await deletePlan.mutateAsync(planId);
      toast.success('Plan deleted');
      router.push('/commissions/plans');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete plan';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/commissions/plans">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center size-8 rounded-md bg-brand-accent/10 text-brand-accent">
                    {plan && PLAN_TYPE_ICONS[plan.type]}
                  </div>
                  <h1 className="text-2xl font-bold text-text-primary">
                    {plan?.name}
                  </h1>
                </div>
                {plan?.description && (
                  <p className="mt-1 text-sm text-text-muted ml-10">
                    {plan.description}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {plan && (
          <div className="flex items-center gap-2">
            {!plan.isDefault && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleActivate}
                disabled={activatePlan.isPending}
              >
                <Star className="mr-1.5 size-3.5" />
                {activatePlan.isPending ? 'Setting...' : 'Set as Default'}
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/commissions/plans/${planId}/edit`}>
                <Edit className="mr-1.5 size-3.5" />
                Edit
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
              disabled={assignedReps.length > 0}
            >
              <Trash2 className="mr-1.5 size-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Status Badges */}
      {plan && (
        <div className="flex items-center gap-2 ml-10">
          {plan.isDefault && (
            <Badge variant="default">Default Plan</Badge>
          )}
          <Badge variant={plan.isActive ? 'outline' : 'secondary'}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Badge variant="outline">{PLAN_TYPE_LABELS[plan.type]}</Badge>
        </div>
      )}

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
          <CardDescription>
            How commissions are calculated under this plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          ) : plan?.type === 'PERCENTAGE' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">Commission Rate:</span>
                <span className="text-lg font-semibold text-text-primary">
                  {plan.rate}%
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Applied as a percentage of the load margin
              </p>
            </div>
          ) : plan?.type === 'FLAT' ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">Flat Amount:</span>
                <span className="text-lg font-semibold text-text-primary">
                  ${plan.flatAmount?.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Fixed dollar amount per completed load
              </p>
            </div>
          ) : plan ? (
            <div className="space-y-3">
              <p className="text-sm text-text-muted">
                Rate varies by load margin percentage:
              </p>
              <TierTable
                tiers={plan.tiers}
                isPercentage={plan.type === 'TIERED_PERCENTAGE'}
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Assigned Reps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="size-4" />
            Assigned Reps ({assignedReps.length})
          </CardTitle>
          <CardDescription>
            Sales representatives currently using this plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignedReps.length === 0 ? (
            <p className="text-sm text-text-muted py-4 text-center">
              No reps are assigned to this plan.
            </p>
          ) : (
            <div className="divide-y">
              {assignedReps.map((rep) => (
                <Link
                  key={rep.id}
                  href={`/commissions/reps/${rep.id}`}
                  className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-3 px-3 rounded-md transition-colors"
                >
                  <div>
                    <span className="font-medium text-text-primary text-sm">
                      {rep.name}
                    </span>
                    <p className="text-xs text-text-muted">{rep.email}</p>
                  </div>
                  <Badge
                    variant={rep.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {rep.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
          {assignedReps.length > 0 && (
            <p className="text-xs text-text-muted mt-3">
              This plan cannot be deleted while reps are assigned to it.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Commission Plan"
        description={`Are you sure you want to delete "${plan?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Plan"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}
