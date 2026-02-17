'use client';

import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { CommissionPlanForm } from '@/components/commissions/commission-plan-form';
import { usePlan } from '@/lib/hooks/commissions/use-plans';

export default function EditCommissionPlanPage() {
  const params = useParams();
  const planId = params.id as string;
  const { data: plan, isLoading, error } = usePlan(planId);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Error loading plan"
          message={(error as Error).message}
        />
      </div>
    );
  }

  if (!plan) return null;

  return <CommissionPlanForm plan={plan} />;
}
