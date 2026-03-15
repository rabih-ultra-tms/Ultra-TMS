'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useContracts } from '@/lib/hooks/contracts/useContracts';
import { ContractStatus } from '@/lib/api/contracts/types';
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
  CheckCircle,
  AlertCircle,
  DollarSign,
  Plus,
  ArrowRight,
  Calendar,
} from 'lucide-react';

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

function isExpiringWithin30Days(endDate: string): boolean {
  const today = new Date();
  const expireDate = new Date(endDate);
  const diffTime = expireDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 30;
}

function isExpired(contract: {
  status: ContractStatus;
  endDate: string;
}): boolean {
  return (
    contract.status === ContractStatus.TERMINATED ||
    new Date(contract.endDate) < new Date()
  );
}

function ContractsDashboardContent() {
  const router = useRouter();
  const { contracts, isLoading, error } = useContracts({ limit: 1000 });

  // Calculate KPIs
  const activeContracts = contracts.filter(
    (c) => c.status === ContractStatus.ACTIVE
  ).length;

  const expiringContracts = contracts.filter(
    (c) =>
      c.status === ContractStatus.ACTIVE && isExpiringWithin30Days(c.endDate)
  ).length;

  const expiredContracts = contracts.filter((c) => isExpired(c)).length;

  const totalRevenue = contracts.reduce(
    (sum, contract) => sum + (contract.value || 0),
    0
  );

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Contracts</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage contracts with carriers, customers, and vendors
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="size-5 shrink-0" />
          <span>
            Failed to load contracts data. Please try refreshing the page.
          </span>
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
            Manage contracts with carriers, customers, and vendors
          </p>
        </div>
        <Link href="/contracts/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            New Contract
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Active Contracts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Contracts
            </CardTitle>
            <CheckCircle className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{activeContracts}</div>
                <p className="mt-1 text-xs text-text-muted">
                  Currently in effect
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Calendar className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{expiringContracts}</div>
                <p className="mt-1 text-xs text-text-muted">Within 30 days</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Expired */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{expiredContracts}</div>
                <p className="mt-1 text-xs text-text-muted">
                  Terminated or past end date
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Revenue Under Contract */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenue Under Contract
            </CardTitle>
            <DollarSign className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalRevenue)}
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  Total contract value
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Contracts Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Contracts</CardTitle>
          <Link href="/contracts/list">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : !contracts.length ? (
            <p className="py-8 text-center text-sm text-text-muted">
              No contracts yet. Create one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract #</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.slice(0, 10).map((contract) => (
                  <TableRow
                    key={contract.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/contracts/${contract.id}`)}
                  >
                    <TableCell className="font-medium text-blue-600">
                      {contract.contractNumber}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-medium text-text-primary">
                          {contract.partyName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{contract.type}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(contract.status)}`}
                      >
                        {contract.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-text-muted">
                      {new Date(contract.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(contract.value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ContractsDashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted">
          Loading contracts...
        </div>
      }
    >
      <ContractsDashboardContent />
    </Suspense>
  );
}
