'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAgentAgreements,
  useActivateAgreement,
  useTerminateAgreement,
} from '@/lib/hooks/agents/use-agent-agreements';
import { toast } from 'sonner';
import { Plus, Play, XCircle } from 'lucide-react';

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

const statusVariant: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  DRAFT: 'outline',
  ACTIVE: 'default',
  TERMINATED: 'destructive',
  EXPIRED: 'secondary',
};

// ===========================
// Component
// ===========================

interface AgentAgreementsTabProps {
  agentId: string;
}

export function AgentAgreementsTab({ agentId }: AgentAgreementsTabProps) {
  const { data: agreements, isLoading } = useAgentAgreements(agentId);
  const activateAgreement = useActivateAgreement();
  const terminateAgreement = useTerminateAgreement();

  const handleNewAgreement = () => {
    toast.info('Agreement creation form coming soon.');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agreements</CardTitle>
        <Button size="sm" onClick={handleNewAgreement}>
          <Plus className="mr-2 h-4 w-4" />
          New Agreement
        </Button>
      </CardHeader>
      <CardContent>
        {!agreements || agreements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No agreements found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Agreement #</th>
                  <th className="pb-2 pr-4 font-medium">Split Type</th>
                  <th className="pb-2 pr-4 font-medium">Split Rate</th>
                  <th className="pb-2 pr-4 font-medium">Effective Date</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agreements.map((agreement) => (
                  <tr key={agreement.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-mono">
                      {agreement.agreementNumber}
                    </td>
                    <td className="py-3 pr-4">{agreement.splitType}</td>
                    <td className="py-3 pr-4">
                      {agreement.splitRate != null
                        ? `${agreement.splitRate}%`
                        : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {formatDate(agreement.effectiveDate)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={statusVariant[agreement.status] || 'outline'}
                      >
                        {agreement.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {agreement.status === 'DRAFT' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              activateAgreement.mutate({
                                agreementId: agreement.id,
                                agentId,
                              })
                            }
                            disabled={activateAgreement.isPending}
                          >
                            <Play className="mr-1 h-3.5 w-3.5" />
                            Activate
                          </Button>
                        )}
                        {agreement.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              terminateAgreement.mutate({
                                agreementId: agreement.id,
                                agentId,
                              })
                            }
                            disabled={terminateAgreement.isPending}
                          >
                            <XCircle className="mr-1 h-3.5 w-3.5" />
                            Terminate
                          </Button>
                        )}
                      </div>
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
