'use client';

import { useState } from 'react';
import { useAgentCommissions } from '@/lib/hooks/agents';
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
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';

interface AgentCommissionsTableProps {
  agentId: string;
  limit?: number;
}

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function AgentCommissionsTable({
  agentId,
  limit = 20,
}: AgentCommissionsTableProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useAgentCommissions(agentId, {
    page,
    limit,
  });

  const commissions = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Failed to load commissions: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Commissions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : commissions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-text-muted">No commissions found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell className="font-medium">
                        {formatDate(
                          commission.commissionPeriod ?? commission.createdAt
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-text-secondary">
                          {commission.splitType}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-mono font-medium">
                          {formatCurrency(commission.netCommission)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            commission.status === 'PAID'
                              ? 'default'
                              : commission.status === 'PENDING'
                                ? 'outline'
                                : 'secondary'
                          }
                        >
                          {commission.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="pt-4">
                <Pagination
                  page={page}
                  limit={limit}
                  total={pagination?.total ?? 0}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
