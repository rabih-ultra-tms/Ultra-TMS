'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Percent, DollarSign, Users } from 'lucide-react';
import type { CommissionPlan, PlanType } from '@/lib/hooks/commissions/use-plans';

const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  PERCENTAGE: 'Percentage',
  FLAT: 'Flat Rate',
  TIERED_PERCENTAGE: 'Tiered %',
  TIERED_FLAT: 'Tiered Flat',
};

const PLAN_TYPE_ICONS: Record<PlanType, React.ReactNode> = {
  PERCENTAGE: <Percent className="size-4" />,
  FLAT: <DollarSign className="size-4" />,
  TIERED_PERCENTAGE: <Layers className="size-4" />,
  TIERED_FLAT: <Layers className="size-4" />,
};

function formatRate(plan: CommissionPlan): string {
  if (plan.type === 'PERCENTAGE' && plan.rate !== null) {
    return `${plan.rate}%`;
  }
  if (plan.type === 'FLAT' && plan.flatAmount !== null) {
    return `$${plan.flatAmount.toFixed(2)}`;
  }
  if (
    (plan.type === 'TIERED_PERCENTAGE' || plan.type === 'TIERED_FLAT') &&
    plan.tiers.length > 0
  ) {
    return `${plan.tiers.length} tier${plan.tiers.length === 1 ? '' : 's'}`;
  }
  return 'Not configured';
}

interface CommissionPlanCardProps {
  plan: CommissionPlan;
}

export function CommissionPlanCard({ plan }: CommissionPlanCardProps) {
  return (
    <Card className="hover:border-brand-accent/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-md bg-brand-accent/10 text-brand-accent">
              {PLAN_TYPE_ICONS[plan.type]}
            </div>
            <div>
              <CardTitle className="text-base">{plan.name}</CardTitle>
              {plan.description && (
                <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                  {plan.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {plan.isDefault && (
              <Badge variant="default" className="text-xs">
                Default
              </Badge>
            )}
            <Badge variant={plan.isActive ? 'outline' : 'secondary'}>
              {plan.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-text-muted">
              Type:{' '}
              <span className="font-medium text-text-primary">
                {PLAN_TYPE_LABELS[plan.type]}
              </span>
            </span>
            <span className="text-text-muted">
              Rate:{' '}
              <span className="font-medium text-text-primary">
                {formatRate(plan)}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-text-muted">
            <Users className="size-3.5" />
            <span className="text-xs">
              {plan.repCount} rep{plan.repCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
