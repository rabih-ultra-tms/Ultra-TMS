'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useContractDetail } from '@/lib/hooks/contracts/useContractDetail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

interface ContractEditPageProps {
  params: {
    id: string;
  };
}

function ContractEditPageContent({ params }: ContractEditPageProps) {
  const { contract, isLoading, error } = useContractDetail(params.id);

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

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load contract details. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading || !contract) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
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
            <h1 className="text-2xl font-bold text-text-primary">
              Edit Contract
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {contract.contractNumber} - {contract.contractName}
            </p>
          </div>
        </div>
        <Link href={`/contracts/${contract.id}`}>
          <Button variant="outline">View Full Contract</Button>
        </Link>
      </div>

      {/* Edit Form Placeholder */}
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-text-muted">
            Contract editing functionality coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ContractEditPage({ params }: ContractEditPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted">
          Loading contract...
        </div>
      }
    >
      <ContractEditPageContent params={params} />
    </Suspense>
  );
}
