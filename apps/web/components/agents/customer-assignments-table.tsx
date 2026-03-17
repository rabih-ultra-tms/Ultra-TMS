'use client';

import { useAgentCustomers, useTerminateAssignment } from '@/lib/hooks/agents';
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

interface CustomerAssignmentsTableProps {
  agentId: string;
}

const assignmentTypeConfig: Record<
  string,
  { variant: 'default' | 'secondary' | 'outline'; label: string }
> = {
  EXCLUSIVE: { variant: 'default', label: 'Exclusive' },
  NON_EXCLUSIVE: { variant: 'secondary', label: 'Non-Exclusive' },
  PREFERRED: { variant: 'outline', label: 'Preferred' },
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function CustomerAssignmentsTable({
  agentId,
}: CustomerAssignmentsTableProps) {
  const { data: assignments, isLoading, error } = useAgentCustomers(agentId);
  const { mutate: terminate } = useTerminateAssignment();

  const assignmentsData = assignments ?? [];

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Failed to load assignments: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Assignments</CardTitle>
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
        <CardTitle className="text-lg">Customer Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        {assignmentsData.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-text-muted">
              No customer assignments found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Assignment Date</TableHead>
                  <TableHead>Sunset Date</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignmentsData.map((assignment) => {
                  const typeConfig =
                    assignmentTypeConfig[assignment.assignmentType] ||
                    assignmentTypeConfig.NON_EXCLUSIVE;
                  const hasSunset =
                    assignment.sunsetStartDate &&
                    new Date(assignment.sunsetStartDate) > new Date();

                  return (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.customer?.name || assignment.customerId}
                      </TableCell>
                      <TableCell>
                        <Badge variant={typeConfig!.variant as any}>
                          {typeConfig!.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">
                        {assignment.protectionStart
                          ? formatDate(assignment.protectionStart)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {hasSunset ? (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-900"
                          >
                            {formatDate(assignment.sunsetStartDate)}
                          </Badge>
                        ) : assignment.sunsetStartDate ? (
                          <span className="text-sm text-text-muted">
                            {formatDate(assignment.sunsetStartDate)}
                          </span>
                        ) : (
                          <span className="text-sm text-text-muted">—</span>
                        )}
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
                            <DropdownMenuItem asChild>
                              <a
                                href={`/agents/${agentId}/customers/${assignment.customerId}`}
                              >
                                View Details
                              </a>
                            </DropdownMenuItem>
                            {!hasSunset && (
                              <DropdownMenuItem
                                onClick={() =>
                                  terminate({
                                    assignmentId: assignment.id,
                                    agentId,
                                  })
                                }
                              >
                                Start Sunset
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() =>
                                terminate({
                                  assignmentId: assignment.id,
                                  agentId,
                                })
                              }
                            >
                              Terminate
                            </DropdownMenuItem>
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
