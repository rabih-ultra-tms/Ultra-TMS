'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import { useAgentRankings } from '@/lib/hooks/agents';
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
          Failed to load reports
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

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

function ReportsContent() {
  const {
    data: rankingsData,
    isLoading: rankingsLoading,
    error: rankingsError,
  } = useAgentRankings({ top: 50 });

  if (rankingsLoading) {
    return <ListPageSkeleton rows={10} columns={5} />;
  }

  if (rankingsError) {
    return <ErrorFallback />;
  }

  const rankings = rankingsData?.data || [];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agent Reports</h1>
          <p className="text-muted-foreground mt-2">
            Performance analytics, rankings, and payout summaries
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
        <span className="text-foreground font-medium">Reports</span>
      </nav>

      {/* Rankings Table */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Agent Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No ranking data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Agent Name</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">
                      Commission Earned
                    </TableHead>
                    <TableHead className="text-right">Loads Sourced</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((ranking, index) => (
                    <TableRow key={ranking.agentId} className="hover:bg-muted">
                      <TableCell className="font-bold text-lg">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link
                          href={`/agents/${ranking.agentId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {ranking.companyName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(ranking.commission)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(ranking.totalPaid)}
                      </TableCell>
                      <TableCell className="text-right">
                        {ranking.loadCount || 0}
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rankings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Total Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                rankings.reduce((sum, r) => sum + (r.commission || 0), 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                rankings.reduce((sum, r) => sum + (r.totalPaid || 0), 0)
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Loads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rankings.reduce((sum, r) => sum + (r.loadCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AgentReportsPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<ListPageSkeleton rows={10} columns={5} />}>
        <ReportsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
