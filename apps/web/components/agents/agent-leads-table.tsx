'use client';

import {
  useAgentLeads,
  useQualifyLead,
  useConvertLead,
  useRejectLead,
} from '@/lib/hooks/agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';

interface AgentLeadsTableProps {
  agentId: string;
}

const statusConfig: Record<
  string,
  { variant: 'default' | 'secondary' | 'outline'; label: string }
> = {
  NEW: { variant: 'outline', label: 'New' },
  QUALIFIED: { variant: 'secondary', label: 'Qualified' },
  CONVERTED: { variant: 'default', label: 'Converted' },
  REJECTED: { variant: 'secondary', label: 'Rejected' },
};

export function AgentLeadsTable({ agentId }: AgentLeadsTableProps) {
  const { data, isLoading, error } = useAgentLeads(agentId);
  const { mutate: qualify } = useQualifyLead(agentId);
  const { mutate: _convert } = useConvertLead(agentId);
  const { mutate: reject } = useRejectLead(agentId);

  const leadsData = data?.data ?? [];

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Failed to load leads: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Leads</CardTitle>
      </CardHeader>
      <CardContent>
        {leadsData.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-text-muted">No leads found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Loads</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leadsData.map((lead) => {
                  const config = statusConfig[lead.status] || statusConfig.NEW;
                  return (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.companyName}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-text-secondary">—</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config!.variant as any}>
                          {config!.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            {lead.status === 'NEW' && (
                              <DropdownMenuItem
                                onClick={() => qualify(lead.id)}
                              >
                                Qualify
                              </DropdownMenuItem>
                            )}
                            {(lead.status === 'QUALIFIED' ||
                              lead.status === 'NEW') && (
                              <DropdownMenuItem
                                onClick={() =>
                                  reject({
                                    leadId: lead.id,
                                    reason: 'Manual rejection',
                                  })
                                }
                              >
                                Reject
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
