'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgentCommissions } from '@/lib/hooks/agents/use-agent-commissions';

// ===========================
// Helpers
// ===========================

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  APPROVED: 'default',
  PAID: 'default',
  REVERSED: 'destructive',
};

// ===========================
// Component
// ===========================

interface AgentCommissionsTabProps {
  agentId: string;
}

export function AgentCommissionsTab({ agentId }: AgentCommissionsTabProps) {
  const { data: response, isLoading } = useAgentCommissions(agentId);
  const commissions = response?.data ?? [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission History</CardTitle>
      </CardHeader>
      <CardContent>
        {commissions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No commission records found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Load ID</th>
                  <th className="pb-2 pr-4 font-medium text-right">
                    Commission Base
                  </th>
                  <th className="pb-2 pr-4 font-medium text-right">Gross</th>
                  <th className="pb-2 pr-4 font-medium text-right">Net</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((commission) => (
                  <tr key={commission.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      {formatDate(commission.createdAt)}
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs">
                      {commission.loadId || '—'}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatCurrency(commission.commissionBase)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatCurrency(commission.grossCommission)}
                    </td>
                    <td className="py-3 pr-4 text-right font-medium">
                      {formatCurrency(commission.netCommission)}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={statusVariant[commission.status] || 'outline'}
                      >
                        {commission.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
