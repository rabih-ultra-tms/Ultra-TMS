'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAgentCustomers,
  useTransferAssignment,
  useStartSunset,
  useTerminateAssignment,
} from '@/lib/hooks/agents/use-agent-assignments';
import { ArrowRightLeft, Sunset, XCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  ACTIVE: 'default',
  IN_SUNSET: 'secondary',
  TERMINATED: 'destructive',
};

// ===========================
// Component
// ===========================

interface AgentCustomersTabProps {
  agentId: string;
}

export function AgentCustomersTab({ agentId }: AgentCustomersTabProps) {
  const { data: assignments, isLoading } = useAgentCustomers(agentId);
  const _transferAssignment = useTransferAssignment();
  const startSunset = useStartSunset();
  const terminateAssignment = useTerminateAssignment();

  const handleTransfer = (_assignmentId: string) => {
    // Transfer requires a target agent ID — placeholder for now
    toast.info(
      'Transfer dialog coming soon. Select a target agent to transfer this customer.'
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Assignments</CardTitle>
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
      <CardHeader>
        <CardTitle>Customer Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {!assignments || assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No customer assignments found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Customer</th>
                  <th className="pb-2 pr-4 font-medium">Assignment Type</th>
                  <th className="pb-2 pr-4 font-medium">Split %</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Protection End</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      {assignment.customer?.companyName ||
                        assignment.customer?.name ||
                        assignment.customerId}
                    </td>
                    <td className="py-3 pr-4">{assignment.assignmentType}</td>
                    <td className="py-3 pr-4">
                      {assignment.splitPercent != null
                        ? `${assignment.splitPercent}%`
                        : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={statusVariant[assignment.status] || 'outline'}
                      >
                        {assignment.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      {assignment.protectionEnd
                        ? formatDate(assignment.protectionEnd)
                        : '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {assignment.status === 'ACTIVE' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTransfer(assignment.id)}
                            >
                              <ArrowRightLeft className="mr-1 h-3.5 w-3.5" />
                              Transfer
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                startSunset.mutate({
                                  assignmentId: assignment.id,
                                  agentId,
                                })
                              }
                              disabled={startSunset.isPending}
                            >
                              <Sunset className="mr-1 h-3.5 w-3.5" />
                              Sunset
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                terminateAssignment.mutate({
                                  assignmentId: assignment.id,
                                  agentId,
                                })
                              }
                              disabled={terminateAssignment.isPending}
                            >
                              <XCircle className="mr-1 h-3.5 w-3.5" />
                              Terminate
                            </Button>
                          </>
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
