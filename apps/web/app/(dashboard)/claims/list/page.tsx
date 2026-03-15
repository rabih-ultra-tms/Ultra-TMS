'use client';

import { useState, Suspense, useCallback } from 'react';
import { useClaimList } from '@/lib/hooks/claims';
import {
  ClaimFilters,
  ClaimFiltersState,
} from '@/components/claims/ClaimFilters';
import { ClaimCard } from '@/components/claims/ClaimCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';
import { Plus, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const PAGE_SIZE = 20;

function ClaimsListContent() {
  const [filters, setFilters] = useState<ClaimFiltersState>({});
  const [page, setPage] = useState(1);

  // Fetch claims with filters
  const { claims, pagination, isLoading, error, refetch } = useClaimList({
    filters: {
      status: filters.status,
      claimType: filters.claimType,
      carrierId: filters.carrierId,
      dateRange:
        filters.dateFrom && filters.dateTo
          ? {
              startDate: filters.dateFrom,
              endDate: filters.dateTo,
            }
          : undefined,
    },
    page,
    limit: PAGE_SIZE,
  });

  // Filter on client side for search
  const filteredClaims = claims.filter((claim) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    return (
      claim.claimNumber.toLowerCase().includes(searchLower) ||
      claim.claimantName.toLowerCase().includes(searchLower) ||
      claim.claimantCompany?.toLowerCase().includes(searchLower)
    );
  });

  const handleFilterChange = useCallback((newFilters: ClaimFiltersState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Claims List
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Browse and manage all claims
            </p>
          </div>
          <Link href="/claims/new">
            <Button className="gap-2">
              <Plus className="size-4" />
              New Claim
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="size-5 shrink-0" />
          <div className="flex-1">
            <span>Failed to load claims. Please try again.</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            className="text-red-700 hover:text-red-900"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const totalPages = pagination?.totalPages || 1;
  const hasFilters =
    filters.search ||
    filters.status ||
    filters.claimType ||
    filters.carrierId ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.amountMin ||
    filters.amountMax;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Claims List</h1>
          <p className="mt-1 text-sm text-text-muted">
            Browse and manage all claims
          </p>
        </div>
        <Link href="/claims/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            New Claim
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <ClaimFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        isLoading={isLoading}
      />

      {/* Results Info */}
      {!isLoading && (
        <div className="text-sm text-text-muted">
          Showing{' '}
          <span className="font-medium">
            {filteredClaims.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
            {filteredClaims.length > 0 &&
              ` - ${Math.min(page * PAGE_SIZE, pagination?.total || 0)}`}
          </span>{' '}
          of <span className="font-medium">{pagination?.total || 0}</span>{' '}
          claims
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Claims</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-24" />
                </div>
              ))}
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold text-text-primary mb-1">
                No claims found
              </h3>
              <p className="text-sm text-text-muted mb-4">
                {hasFilters
                  ? 'Try adjusting your filters to find what you are looking for.'
                  : 'Start by creating your first claim.'}
              </p>
              {hasFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFilterChange({})}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/50">
                  <TableHead>Claim #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Claimant</TableHead>
                  <TableHead className="text-right">Claimed Amount</TableHead>
                  <TableHead className="text-right">Approved Amount</TableHead>
                  <TableHead>Filed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <ClaimCard key={claim.id} claim={claim} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && filteredClaims.length > 0 && totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <Button
                    variant={page === pageNum ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                  >
                    {totalPages}
                  </Button>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}

export default function ClaimsListPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ClaimsListContent />
    </Suspense>
  );
}
