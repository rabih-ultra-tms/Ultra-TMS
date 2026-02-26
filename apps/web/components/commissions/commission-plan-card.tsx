'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layers, Percent, DollarSign, Users } from 'lucide-react';
import type { CommissionPlan, BackendPlanType } from '@/lib/hooks/commissions/use-plans';

const PLAN_TYPE_LABELS: Record<BackendPlanType, string> = {
  PERCENT_MARGIN: 'Percentage',
  PERCENT_REVENUE: 'Percentage (Revenue)',
  FLAT_FEE: 'Flat Rate',
  TIERED: 'Tiered',
  CUSTOM: 'Custom',
};

const PLAN_TYPE_ICONS: Record<BackendPlanType, React.ReactNode> = {
  PERCENT_MARGIN: <Percent className="size-4" />,
  PERCENT_REVENUE: <Percent className="size-4" />,
  FLAT_FEE: <DollarSign className="size-4" />,
  TIERED: <Layers className="size-4" />,
  CUSTOM: <Layers className="size-4" />,
};

function formatRate(plan: CommissionPlan): string {
  if ((plan.planType === 'PERCENT_MARGIN' || plan.planType === 'PERCENT_REVENUE') && plan.percentRate !== null) {
    return `${plan.percentRate}%`;
  }
  if (plan.planType === 'FLAT_FEE' && plan.flatAmount !== null) {
    return `$${Number(plan.flatAmount).toFixed(2)}`;
  }
  if (plan.planType === 'TIERED' && plan.tiers.length > 0) {
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
              {PLAN_TYPE_ICONS[plan.planType]}
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
            <Badge variant={plan.status === 'ACTIVE' ? 'outline' : 'secondary'}>
              {plan.status === 'ACTIVE' ? 'Active' : 'Inactive'}
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
                {PLAN_TYPE_LABELS[plan.planType]}
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
              {plan._count?.assignments ?? 0} rep{(plan._count?.assignments ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
