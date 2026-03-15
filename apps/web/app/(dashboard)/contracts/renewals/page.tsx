'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useContracts } from '@/lib/hooks/contracts/useContracts';
import { RenewalQueue } from '@/components/contracts/RenewalQueue';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';

function RenewalsPageContent() {
  const { contracts, isLoading, error, refetch } = useContracts({ limit: 1000 });

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
          <h1 className="text-2xl font-bold text-text-primary">Renewals</h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage contract renewals and expiry tracking
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
            <h1 className="text-2xl font-bold text-text-primary">Renewals</h1>
            <p className="mt-1 text-sm text-text-muted">
              Manage contract renewals and expiry tracking
            </p>
          </div>
        </div>
      </div>

      {/* Renewal Queue */}
      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Renewal Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-muted">
              Renewal management coming soon
            </p>
          </CardContent>
        </Card>
      )}

      {/* Renewal Tips Card */}
      <Card>
        <CardHeader>
          <CardTitle>Renewal Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-text-primary mb-1">
                Enable Auto-Renewal
              </h4>
              <p className="text-text-muted">
                Toggle the auto-renewal button for contracts that should renew
                automatically when they expire.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1">
                Review Terms
              </h4>
              <p className="text-text-muted">
                Before renewing, review the current terms to ensure they still
                meet your business needs.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-1">
                Renew Early
              </h4>
              <p className="text-text-muted">
                Renew contracts 30+ days before expiry to avoid service
                disruptions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RenewalsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted">
          Loading renewals...
        </div>
      }
    >
      <RenewalsPageContent />
    </Suspense>
  );
}
