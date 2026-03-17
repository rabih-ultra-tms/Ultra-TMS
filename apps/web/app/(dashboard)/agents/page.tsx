'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AgentsDashboard } from '@/components/agents/agents-dashboard';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load agents dashboard
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

function DashboardSkeleton() {
  return <ListPageSkeleton rows={6} columns={4} />;
}

export default function AgentsPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Agents Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor agent performance, commissions, and leads
            </p>
          </div>
          <Button asChild>
            <Link href="/agents/new">
              <Plus className="mr-2 size-4" />
              New Agent
            </Link>
          </Button>
        </div>

        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <span className="text-foreground font-medium">Agents</span>
          {' > '}
          <span>Dashboard</span>
        </nav>

        {/* Dashboard Content */}
        <Suspense fallback={<DashboardSkeleton />}>
          <AgentsDashboard />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
