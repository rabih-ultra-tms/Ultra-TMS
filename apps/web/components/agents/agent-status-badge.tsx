'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type AgentStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';

interface AgentStatusBadgeProps {
  status: AgentStatus;
  className?: string;
}

const statusConfig: Record<
  AgentStatus,
  {
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    label: string;
  }
> = {
  PENDING: {
    variant: 'outline',
    label: 'Pending',
  },
  ACTIVE: {
    variant: 'default',
    label: 'Active',
  },
  SUSPENDED: {
    variant: 'secondary',
    label: 'Suspended',
  },
  TERMINATED: {
    variant: 'destructive',
    label: 'Terminated',
  },
};

export function AgentStatusBadge({ status, className }: AgentStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Badge variant={config.variant} className={cn('capitalize', className)}>
      {config.label}
    </Badge>
  );
}
