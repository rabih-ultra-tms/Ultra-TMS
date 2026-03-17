'use client';

import { use, Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { DetailPageSkeleton } from '@/components/shared/detail-page-skeleton';
import { useAgent } from '@/lib/hooks/agents';
import { AgentPerformanceChart } from '@/components/agents/agent-performance-chart';
import { AgentCommissionsTable } from '@/components/agents/agent-commissions-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load agent performance
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

function PerformanceContent({ id }: { id: string }) {
  const { data: agent, isLoading, error } = useAgent(id);

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !agent) {
    return <ErrorFallback />;
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/agents/${id}`}>
              <ChevronLeft className="size-4 mr-1" />
              Back to Agent
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          {agent.companyName} - Performance
        </h1>
        <p className="text-muted-foreground mt-2">
          Revenue metrics, volume tracking, and commission history
        </p>
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
        <Link
          href={`/agents/${id}`}
          className="hover:text-foreground transition-colors"
        >
          {agent.companyName}
        </Link>
        {' > '}
        <span className="text-foreground font-medium">Performance</span>
      </nav>

      {/* Performance Charts */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Volume Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<div className="h-80 bg-muted animate-pulse rounded" />}
            >
              <AgentPerformanceChart agentId={id} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Commissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Commission History</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={<div className="h-96 bg-muted animate-pulse rounded" />}
            >
              <AgentCommissionsTable agentId={id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AgentPerformancePage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<DetailPageSkeleton />}>
        <PerformanceContent id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
