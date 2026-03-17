'use client';

import { useMemo } from 'react';
import { useAgents, useAgentRankings } from '@/lib/hooks/agents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AgentsDashboardProps {
  _tenantId?: string;
}

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function AgentsDashboard({ _tenantId }: AgentsDashboardProps) {
  const { data: agentsData, isLoading: agentsLoading } = useAgents({
    limit: 1000,
  });
  const { data: rankingsData, isLoading: rankingsLoading } = useAgentRankings({
    top: 10,
  });

  const agents = agentsData?.data ?? [];
  const rankings = rankingsData?.data ?? [];

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalAgents = agents.length;
    const activeAgents = agents.filter((_a) => _a.status === 'ACTIVE').length;
    const totalCommission = agents.reduce((sum, _a) => {
      // This would typically come from a dedicated endpoint
      return sum + 0;
    }, 0);
    const topAgent = rankings[0];

    return {
      totalAgents,
      activeAgents,
      totalCommission,
      topAgent,
    };
  }, [agents, rankings]);

  const isLoading = agentsLoading || rankingsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Top Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Total Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {kpis.totalAgents}
            </div>
            <p className="text-xs text-text-muted pt-1">
              {kpis.activeAgents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {kpis.activeAgents}
            </div>
            <p className="text-xs text-text-muted pt-1">
              {kpis.totalAgents > 0
                ? Math.round((kpis.activeAgents / kpis.totalAgents) * 100)
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Total Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-text-primary">
              {formatCurrency(kpis.totalCommission)}
            </div>
            <p className="text-xs text-text-muted pt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Top Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-text-primary truncate">
              {kpis.topAgent?.companyName ?? '—'}
            </div>
            <p className="text-xs text-text-muted pt-1">
              {formatCurrency(kpis.topAgent?.commission)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top 10 Agents</CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-text-muted">No agent data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                    <TableHead className="text-right">Loads</TableHead>
                    <TableHead className="text-right">Avg Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((agent, _index) => (
                    <TableRow key={agent.agentId}>
                      <TableCell>
                        <Badge variant="outline" className="font-bold">
                          #{agent.rank}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-text-primary">
                            {agent.companyName}
                          </p>
                          {agent.contactFirstName && (
                            <p className="text-xs text-text-muted">
                              {agent.contactFirstName} {agent.contactLastName}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {agent.agentCode}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(agent.commission)}
                      </TableCell>
                      <TableCell className="text-right text-text-secondary">
                        {agent.loadCount ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(agent.avgCommission)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
