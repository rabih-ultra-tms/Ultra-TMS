'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Suspense } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { ListPage } from '@/components/patterns/list-page';
import { useAgents } from '@/lib/hooks/agents';
import type { Agent } from '@/lib/hooks/agents/use-agents';
import { getAgentColumns } from '@/components/agents/agent-list-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { ListPageSkeleton } from '@/components/shared/list-page-skeleton';

function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">
          Failed to load agents list
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

function ListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || undefined;
  const statusFilter = searchParams.get('status') || 'all';
  const typeFilter = searchParams.get('agentType') || 'all';

  const [searchInput, setSearchInput] = useState(search ?? '');

  const { data, isLoading, error, refetch } = useAgents({
    page,
    limit,
    search,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    agentType: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (row: Agent) => {
    router.push(`/agents/${row.id}`);
  };

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchInput) {
      params.set('search', searchInput);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [searchInput, searchParams, router]);

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('agentType');
    } else {
      params.set('agentType', value);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const columns = getAgentColumns();

  return (
    <ListPage
      title="Agents"
      description="Manage your agent network and partnerships."
      headerActions={
        <Button asChild>
          <Link href="/agents/new">
            <Plus className="mr-2 size-4" />
            New Agent
          </Link>
        </Button>
      }
      filters={
        <div className="flex items-center gap-3 p-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-text-muted" />
            <Input
              placeholder="Search agents..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="SUSPENDED">Suspended</SelectItem>
              <SelectItem value="TERMINATED">Terminated</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="INDEPENDENT">Independent</SelectItem>
              <SelectItem value="AGENCY">Agency</SelectItem>
              <SelectItem value="BROKERAGE">Brokerage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      data={data?.data || []}
      columns={columns}
      total={data?.pagination?.total || 0}
      page={page}
      pageSize={limit}
      pageCount={data?.pagination?.totalPages || 1}
      onPageChange={handlePageChange}
      isLoading={isLoading}
      error={error ? (error as Error) : null}
      onRetry={refetch}
      onRowClick={handleRowClick}
      entityLabel="agents"
    />
  );
}

export default function AgentsListPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <div className="container py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6">
          <Link
            href="/agents"
            className="hover:text-foreground transition-colors"
          >
            Agents
          </Link>
          {' > '}
          <span className="text-foreground font-medium">List</span>
        </nav>

        {/* List Content */}
        <Suspense fallback={<ListPageSkeleton rows={10} columns={6} />}>
          <ListContent />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}
