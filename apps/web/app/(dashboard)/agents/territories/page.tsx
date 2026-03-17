'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { useAgents } from '@/lib/hooks/agents';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load territories
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Please refresh the page or contact support.
        </p>
      </div>
      <Button variant="outline" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  );
}

function TerritoriesContent() {
  const { data: agentsData, isLoading, error } = useAgents({ limit: 1000 });

  if (isLoading) {
    return <ListPageSkeleton rows={10} columns={4} />;
  }

  if (error) {
    return <ErrorFallback />;
  }

  const agents = agentsData?.data || [];

  // Filter agents that have territories
  const agentsWithTerritories = agents.filter(
    (agent) => agent.territories && Object.keys(agent.territories).length > 0
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Agent Territories
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage geographic territories assigned to agents
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6">
        <Link
          href="/agents"
          className="hover:text-foreground transition-colors"
        >
          Agents
        </Link>
        {' > '}
        <span className="text-foreground font-medium">Territories</span>
      </nav>

      {/* Territories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Territory Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {agentsWithTerritories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No agents have territories configured
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent Name</TableHead>
                    <TableHead>Agent Code</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Territories</TableHead>
                    <TableHead>Industry Focus</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentsWithTerritories.map((agent) => (
                    <TableRow
                      key={agent.id}
                      className="cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => {}}
                    >
                      <TableCell className="font-medium">
                        <Link
                          href={`/agents/${agent.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {agent.companyName}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {agent.agentCode}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                          {agent.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {agent.territories && Array.isArray(agent.territories)
                          ? agent.territories.join(', ')
                          : agent.territories &&
                              typeof agent.territories === 'object'
                            ? Object.keys(
                                agent.territories as Record<string, unknown>
                              ).join(', ')
                            : 'Not configured'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {agent.industryFocus &&
                        Array.isArray(agent.industryFocus)
                          ? agent.industryFocus.join(', ')
                          : agent.industryFocus &&
                              typeof agent.industryFocus === 'object'
                            ? Object.keys(
                                agent.industryFocus as Record<string, unknown>
                              ).join(', ')
                            : 'Not specified'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              With Territories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentsWithTerritories.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Territory Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.length > 0
                ? Math.round(
                    (agentsWithTerritories.length / agents.length) * 100
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AgentTerritoriesPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<ListPageSkeleton rows={10} columns={4} />}>
        <TerritoriesContent />
      </Suspense>
    </ErrorBoundary>
  );
}
