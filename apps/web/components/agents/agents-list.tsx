'use client';

import { useState } from 'react';
import { useAgents } from '@/lib/hooks/agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
import { AgentStatusBadge } from './agent-status-badge';

interface AgentsListProps {
  tenantId: string;
  onSelect?: (agentId: string) => void;
}

export function AgentsList({ _tenantId, onSelect }: AgentsListProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const { data, isLoading, error } = useAgents({
    page,
    limit,
    search,
    status: statusFilter === 'all' ? undefined : statusFilter,
    agentType: typeFilter === 'all' ? undefined : typeFilter,
  });

  const agents = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const handleRowClick = (agentId: string) => {
    if (onSelect) {
      onSelect(agentId);
    }
  };

  if (error) {
    return (
      <Card className="border-destructive bg-destructive/5">
        <CardContent className="pt-6">
          <p className="text-sm text-destructive">
            Failed to load agents: {error.message}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Agents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-text-secondary">
              Search
            </label>
            <Input
              placeholder="Search by code or company name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="mt-1"
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="text-sm font-medium text-text-secondary">
              Status
            </label>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-32">
            <label className="text-sm font-medium text-text-secondary">
              Type
            </label>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="INDEPENDENT_AGENT">
                  Independent Agent
                </SelectItem>
                <SelectItem value="BROKER">Broker</SelectItem>
                <SelectItem value="CARRIER">Carrier</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : agents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-text-muted">
              No agents found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow
                      key={agent.id}
                      onClick={() => handleRowClick(agent.id)}
                      className={
                        onSelect
                          ? 'cursor-pointer transition-colors hover:bg-muted'
                          : 'cursor-pointer transition-colors'
                      }
                    >
                      <TableCell className="font-mono text-sm">
                        {agent.agentCode}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-text-primary">
                            {agent.companyName}
                          </p>
                          {agent.dbaName && (
                            <p className="text-xs text-text-muted">
                              DBA: {agent.dbaName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-text-primary">
                            {agent.contactFirstName} {agent.contactLastName}
                          </p>
                          <p className="text-xs text-text-muted">
                            {agent.contactEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-text-secondary">
                          {agent.agentType}
                        </span>
                      </TableCell>
                      <TableCell>
                        <AgentStatusBadge status={agent.status as any} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
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
