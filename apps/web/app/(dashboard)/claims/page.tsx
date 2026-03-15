'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useClaimList } from '@/lib/hooks/claims';
import { ClaimStatus } from '@/lib/api/claims/types';
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
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  Plus,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadgeColor(status: ClaimStatus): string {
  switch (status) {
    case ClaimStatus.DRAFT:
      return 'bg-gray-100 text-gray-800';
    case ClaimStatus.SUBMITTED:
    case ClaimStatus.PENDING_DOCUMENTATION:
      return 'bg-yellow-100 text-yellow-800';
    case ClaimStatus.UNDER_INVESTIGATION:
      return 'bg-blue-100 text-blue-800';
    case ClaimStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case ClaimStatus.DENIED:
      return 'bg-red-100 text-red-800';
    case ClaimStatus.SETTLED:
      return 'bg-purple-100 text-purple-800';
    case ClaimStatus.CLOSED:
      return 'bg-slate-100 text-slate-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function ClaimsDashboardContent() {
  const router = useRouter();
  const { claims, isLoading, error } = useClaimList({ limit: 1000 });

  // Calculate KPIs
  const totalClaims = claims.length;
  const openClaims = claims.filter(
    (claim) =>
      claim.status === ClaimStatus.DRAFT ||
      claim.status === ClaimStatus.SUBMITTED ||
      claim.status === ClaimStatus.UNDER_INVESTIGATION ||
      claim.status === ClaimStatus.PENDING_DOCUMENTATION
  ).length;
  const resolvedClaims = claims.filter(
    (claim) =>
      claim.status === ClaimStatus.APPROVED ||
      claim.status === ClaimStatus.DENIED ||
      claim.status === ClaimStatus.SETTLED ||
      claim.status === ClaimStatus.CLOSED
  ).length;
  const totalValue = claims.reduce(
    (sum, claim) => sum + (claim.claimedAmount || 0),
    0
  );

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Claims</h1>
          <p className="mt-1 text-sm text-text-muted">
            Track and manage insurance claims and settlements
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="size-5 shrink-0" />
          <span>
            Failed to load claims data. Please try refreshing the page.
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
          <h1 className="text-2xl font-bold text-text-primary">Claims</h1>
          <p className="mt-1 text-sm text-text-muted">
            Track and manage insurance claims and settlements
          </p>
        </div>
        <Link href="/claims/new">
          <Button className="gap-2">
            <Plus className="size-4" />
            New Claim
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Claims */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
            <FileText className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{totalClaims}</div>
                <p className="mt-1 text-xs text-text-muted">All time</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Open Claims */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Claims</CardTitle>
            <Clock className="size-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{openClaims}</div>
                <p className="mt-1 text-xs text-text-muted">
                  Awaiting resolution
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Resolved Claims */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Claims
            </CardTitle>
            <CheckCircle className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <>
                <div className="text-2xl font-bold">{resolvedClaims}</div>
                <p className="mt-1 text-xs text-text-muted">
                  Completed or closed
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="size-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalValue)}
                </div>
                <p className="mt-1 text-xs text-text-muted">Claimed amount</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Claims Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Claims</CardTitle>
          <Link href="/claims/list">
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
          ) : !claims.length ? (
            <p className="py-8 text-center text-sm text-text-muted">
              No claims yet. Create one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Filed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.slice(0, 10).map((claim) => (
                  <TableRow
                    key={claim.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/claims/${claim.id}`)}
                  >
                    <TableCell className="font-medium text-blue-600">
                      {claim.claimNumber}
                    </TableCell>
                    <TableCell>{claim.claimType}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(claim.status)}`}
                      >
                        {claim.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(claim.claimedAmount)}
                    </TableCell>
                    <TableCell className="text-sm text-text-muted">
                      {new Date(claim.filedDate).toLocaleDateString()}
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

export default function ClaimsDashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted">Loading claims...</div>
      }
    >
      <ClaimsDashboardContent />
    </Suspense>
  );
}
