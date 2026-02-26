'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ListPage } from '@/components/patterns/list-page';
import { usePlans } from '@/lib/hooks/commissions/use-plans';
import type { CommissionPlan, BackendPlanType } from '@/lib/hooks/commissions/use-plans';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Plus } from 'lucide-react';
import Link from 'next/link';

// ===========================
// Plan Type Labels
// ===========================

const PLAN_TYPE_LABELS: Record<BackendPlanType, string> = {
  PERCENT_MARGIN: 'Percentage',
  PERCENT_REVENUE: 'Percentage (Revenue)',
  FLAT_FEE: 'Flat Rate',
  TIERED: 'Tiered',
  CUSTOM: 'Custom',
};

// ===========================
// Columns
// ===========================

function getPlanColumns(): ColumnDef<CommissionPlan>[] {
  return [
    {
      accessorKey: 'name',
      header: 'Plan Name',
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-text-primary">
            {row.original.name}
          </span>
          {row.original.description && (
            <p className="text-xs text-text-muted line-clamp-1">
              {row.original.description}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'planType',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {PLAN_TYPE_LABELS[row.original.planType]}
        </Badge>
      ),
    },
    {
      accessorKey: 'percentRate',
      header: 'Rate / Amount',
      cell: ({ row }) => {
        const plan = row.original;
        if ((plan.planType === 'PERCENT_MARGIN' || plan.planType === 'PERCENT_REVENUE') && plan.percentRate !== null) {
          return <span className="font-medium">{Number(plan.percentRate)}%</span>;
        }
        if (plan.planType === 'FLAT_FEE' && plan.flatAmount !== null) {
          return <span className="font-medium">${Number(plan.flatAmount).toFixed(2)}</span>;
        }
        if (plan.tiers.length > 0) {
          return (
            <span className="text-text-muted">
              {plan.tiers.length} tier{plan.tiers.length !== 1 ? 's' : ''}
            </span>
          );
        }
        return <span className="text-text-muted italic">Not set</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          {row.original.isDefault && (
            <Badge variant="default" className="text-xs">
              Default
            </Badge>
          )}
          <Badge
            variant={row.original.status === 'ACTIVE' ? 'outline' : 'secondary'}
          >
            {row.original.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      ),
    },
    {
      id: 'repCount',
      header: () => <div className="text-right">Reps</div>,
      cell: ({ row }) => (
        <div className="text-right text-text-muted">
          {row.original._count?.assignments ?? 0}
        </div>
      ),
    },
  ];
}

// ===========================
// Page
// ===========================

export default function CommissionPlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || undefined;
  const typeFilter = searchParams.get('type') || 'all';

  const [searchInput, setSearchInput] = useState(search ?? '');

  const { data, isLoading, error, refetch } = usePlans({
    page,
    limit,
    search,
    type: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (row: CommissionPlan) => {
    router.push(`/commissions/plans/${row.id}`);
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

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('type');
    } else {
      params.set('type', value);
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const columns = getPlanColumns();

  return (
    <ListPage
      title="Commission Plans"
      description="Manage commission plan configurations for sales reps."
      headerActions={
        <Button asChild>
          <Link href="/commissions/plans/new">
            <Plus className="mr-2 size-4" />
            New Plan
          </Link>
        </Button>
      }
      filters={
        <div className="flex items-center gap-3 p-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-text-muted" />
            <Input
              placeholder="Search plans..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="PERCENT_MARGIN">Percentage</SelectItem>
              <SelectItem value="FLAT_FEE">Flat Rate</SelectItem>
              <SelectItem value="TIERED">Tiered</SelectItem>
              <SelectItem value="CUSTOM">Custom</SelectItem>
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
      entityLabel="plans"
    />
  );
}
