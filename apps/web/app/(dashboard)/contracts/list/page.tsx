'use client';

import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContracts } from '@/lib/hooks/contracts/useContracts';
import { ContractStatus, ContractType } from '@/lib/api/contracts/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import ContractFilters from '@/components/contracts/ContractFilters';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadgeColor(status: ContractStatus): string {
  switch (status) {
    case ContractStatus.DRAFT:
      return 'bg-gray-100 text-gray-800';
    case ContractStatus.PENDING_REVIEW:
    case ContractStatus.PENDING_SIGNATURE:
      return 'bg-yellow-100 text-yellow-800';
    case ContractStatus.APPROVED:
    case ContractStatus.SIGNED:
    case ContractStatus.ACTIVE:
      return 'bg-green-100 text-green-800';
    case ContractStatus.EXPIRED:
    case ContractStatus.TERMINATED:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function ContractsListContent() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{
    type?: ContractType;
    status?: ContractStatus[];
    partyId?: string;
    dateRange?: { startDate: string; endDate: string };
  }>({});

  const { contracts, pagination, isLoading, error } = useContracts({
    filters,
    page,
    limit: 20,
  });

  const totalPages = useMemo(
    () => pagination?.totalPages || 1,
    [pagination?.totalPages]
  );

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Contracts</h1>
          <p className="mt-1 text-sm text-text-muted">
            Browse and manage all contracts
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>Failed to load contracts. Please try again.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Contracts</h1>
          <p className="mt-1 text-sm text-text-muted">
            Browse and manage all contracts
          </p>
        </div>
        <Link href="/contracts/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            New Contract
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <ContractFilters filters={filters} setFilters={setFilters} />

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !contracts.length ? (
            <div className="py-8 text-center text-sm text-text-muted">
              No contracts found. Try adjusting filters or{' '}
              <Link href="/contracts/new" className="text-blue-600 underline">
                create a new contract
              </Link>
              .
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract #</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow
                      key={contract.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-blue-600">
                        {contract.contractNumber}
                      </TableCell>
                      <TableCell>{contract.partyName}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          {contract.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(contract.status)}`}
                        >
                          {contract.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-text-muted">
                        {new Date(contract.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-text-muted">
                        {new Date(contract.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(contract.value)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/contracts/${contract.id}`)
                              }
                            >
                              View Details
                            </DropdownMenuItem>
                            {contract.status === ContractStatus.DRAFT && (
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(`/contracts/${contract.id}/edit`)
                                }
                              >
                                Edit Contract
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between border-t pt-6">
                <div className="text-sm text-text-muted">
                  Page {page} of {totalPages} (Total: {pagination?.total || 0}{' '}
                  contracts)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={page <= 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="size-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
                    className="gap-1"
                  >
                    Next
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ContractsList() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted">
          Loading contracts...
        </div>
      }
    >
      <ContractsListContent />
    </Suspense>
  );
}
