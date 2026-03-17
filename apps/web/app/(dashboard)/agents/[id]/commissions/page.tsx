'use client';

import { use, Suspense } from 'react';
import Link from 'next/link';
import { ErrorBoundary } from '@/components/error-boundary';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { DetailPageSkeleton } from '@/components/shared/detail-page-skeleton';
import { useAgent, useAgentAgreements } from '@/lib/hooks/agents';
import { AgentAgreementCard } from '@/components/agents/agent-agreement-card';
import { Card, CardContent } from '@/components/ui/card';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load commission details
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

function CommissionsContent({ id }: { id: string }) {
  const {
    data: agent,
    isLoading: agentLoading,
    error: agentError,
  } = useAgent(id);
  const {
    data: agreementsData,
    isLoading: agreementsLoading,
    error: agreementsError,
  } = useAgentAgreements(id);

  const isLoading = agentLoading || agreementsLoading;
  const error = agentError || agreementsError;

  if (isLoading) {
    return <DetailPageSkeleton />;
  }

  if (error || !agent) {
    return <ErrorFallback />;
  }

  const agreements = agreementsData || [];

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
          {agent.companyName} - Commissions
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage commission agreements, splits, and rates
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
        <span className="text-foreground font-medium">Commissions</span>
      </nav>

      {/* Commission Agreements */}
      <div className="space-y-6">
        {agreements.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No commission agreements found for this agent
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agreements.map((agreement) => (
              <Suspense
                key={agreement.id}
                fallback={
                  <div className="h-64 bg-muted animate-pulse rounded" />
                }
              >
                <AgentAgreementCard agreement={agreement} />
              </Suspense>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AgentCommissionsPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<DetailPageSkeleton />}>
        <CommissionsContent id={id} />
      </Suspense>
    </ErrorBoundary>
  );
}
