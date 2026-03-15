'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useContracts } from '@/lib/hooks/contracts/useContracts';
import { ContractReports } from '@/components/contracts/ContractReports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  AlertCircle,
  BarChart3,
  FileText,
  TrendingUp,
} from 'lucide-react';

function ReportsPageContent() {
  const { contracts, isLoading, error } = useContracts({ limit: 1000 });

  // Calculate summary statistics
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter(
    (c) => c.status === 'ACTIVE'
  ).length;
  const totalValue = contracts.reduce((sum, c) => sum + (c.value || 0), 0);
  const averageValue = totalContracts > 0 ? totalValue / totalContracts : 0;

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Link href="/contracts">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Contracts
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
          <p className="mt-1 text-sm text-text-muted">
            Contract analytics and performance reports
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load contracts data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/contracts">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Reports</h1>
            <p className="mt-1 text-sm text-text-muted">
              Contract analytics and performance reports
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contracts
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalContracts}</div>
              <p className="mt-1 text-xs text-text-muted">All contract types</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Contracts
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContracts}</div>
              <p className="mt-1 text-xs text-text-muted">
                {totalContracts > 0
                  ? Math.round((activeContracts / totalContracts) * 100)
                  : 0}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Value
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(totalValue)}
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Sum of all contracts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Value
              </CardTitle>
              <FileText className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(averageValue)}
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Per contract average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Tabs */}
      <ContractReports contracts={contracts} isLoading={isLoading} />

      {/* Report Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>About These Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-text-primary mb-1">
              Expiry Report
            </h4>
            <p className="text-text-muted">
              Shows the distribution of contract expiries by month. Use this to
              plan renewal activities and identify renewal bottlenecks.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-1">
              Rate Comparison
            </h4>
            <p className="text-text-muted">
              Compares contract values and rates across your portfolio. Useful
              for identifying pricing variations and benchmarking opportunities.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-text-primary mb-1">
              Volume Performance
            </h4>
            <p className="text-text-muted">
              Tracks actual volume against volume commitments. Shows which
              contracts are meeting their commitments and which may need
              attention.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted">
          Loading reports...
        </div>
      }
    >
      <ReportsPageContent />
    </Suspense>
  );
}
