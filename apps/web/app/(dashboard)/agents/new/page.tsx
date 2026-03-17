'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AgentForm } from '@/components/agents/agent-form';
import { FormPageSkeleton } from '@/components/shared/form-page-skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load agent setup form
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

export default function NewAgentPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/agents">
                <ChevronLeft className="size-4 mr-1" />
                Back to Agents
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Agent
          </h1>
          <p className="text-muted-foreground mt-2">
            Set up a new freight agent or sub-broker
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
          <span className="text-foreground font-medium">New</span>
        </nav>

        {/* Form Content */}
        <Suspense fallback={<FormPageSkeleton />}>
          <AgentForm />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
