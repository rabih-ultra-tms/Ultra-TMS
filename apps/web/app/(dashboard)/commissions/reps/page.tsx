'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ListPage } from '@/components/patterns/list-page';
import { getRepColumns } from '@/components/commissions/rep-commissions-table';
import { useReps } from '@/lib/hooks/commissions/use-reps';
import type { CommissionRep } from '@/lib/hooks/commissions/use-reps';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState, useCallback } from 'react';

export default function SalesRepsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || undefined;

  const [searchInput, setSearchInput] = useState(search ?? '');

  const { data, isLoading, error, refetch } = useReps({
    page,
    limit,
    search,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (row: CommissionRep) => {
    router.push(`/commissions/reps/${row.id}`);
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

  const columns = getRepColumns();

  return (
    <ListPage
      title="Sales Reps"
      description="Manage sales representatives and commission assignments."
      filters={
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-text-muted" />
            <Input
              placeholder="Search reps..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-9"
            />
          </div>
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
      entityLabel="reps"
    />
  );
}
