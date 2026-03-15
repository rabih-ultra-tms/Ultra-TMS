'use client';

import { Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useContractDetail } from '@/lib/hooks/contracts/useContractDetail';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ArrowLeft, Download } from 'lucide-react';
import ContractDetailTabs from '@/components/contracts/ContractDetailTabs';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function ContractDetailContent() {
  const router = useRouter();
  const params = useParams();
  const contractId = params.id as string;

  const {
    contract,
    rateTables,
    amendments,
    slas,
    volumeCommitments,
    isLoading,
    isLoadingContract,
    error,
  } = useContractDetail(contractId);

  if (error && isLoadingContract) {
    return (
      <div className="space-y-6 p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="size-5 shrink-0" />
          <span>Failed to load contract. Please try again.</span>
        </div>
      </div>
    );
  }

  if (isLoadingContract) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-24" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="space-y-6 p-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-text-muted">Contract not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <div className="flex gap-2">
          {contract.attachments && contract.attachments.length > 0 && (
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="size-4" />
              Download Documents
            </Button>
          )}
          {contract.status === 'DRAFT' && (
            <Button
              onClick={() => router.push(`/contracts/${contract.id}/edit`)}
            >
              Edit Contract
            </Button>
          )}
        </div>
      </div>

      {/* Contract Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {contract.contractNumber}
              </CardTitle>
              <p className="mt-2 text-sm text-text-muted">
                {contract.contractName}
              </p>
            </div>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              contract.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : contract.status === 'DRAFT'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}>
              {contract.status}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-text-muted">Party</p>
              <p className="mt-1 font-semibold">{contract.partyName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Type</p>
              <p className="mt-1 font-semibold">{contract.type}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Value</p>
              <p className="mt-1 font-semibold">
                {formatCurrency(contract.value)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Currency</p>
              <p className="mt-1 font-semibold">{contract.currency}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Start Date</p>
              <p className="mt-1 font-semibold">
                {new Date(contract.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">End Date</p>
              <p className="mt-1 font-semibold">
                {new Date(contract.endDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Created</p>
              <p className="mt-1 font-semibold">
                {new Date(contract.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Updated</p>
              <p className="mt-1 font-semibold">
                {new Date(contract.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <ContractDetailTabs
        contract={contract}
        rateTables={rateTables}
        amendments={amendments}
        slas={slas}
        volumeCommitments={volumeCommitments}
        isLoading={isLoading}
      />
    </div>
  );
}

export default function ContractDetail() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-text-muted">
          Loading contract details...
        </div>
      }
    >
      <ContractDetailContent />
    </Suspense>
  );
}
