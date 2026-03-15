'use client';

import { Contract } from '@/lib/api/contracts/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ContractOverviewTabProps {
  contract: Contract;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ContractOverviewTab({
  contract,
}: ContractOverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-text-muted">Contract Number</p>
                <p className="mt-1 font-medium">{contract.contractNumber}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Contract Name</p>
                <p className="mt-1 font-medium">{contract.contractName}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Type</p>
                <p className="mt-1 font-medium">{contract.type}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Status</p>
                <p className="mt-1 font-medium">{contract.status}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Currency</p>
                <p className="mt-1 font-medium">{contract.currency}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Total Value</p>
                <p className="mt-1 font-medium">
                  {formatCurrency(contract.value)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Parties */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Party</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-text-muted">Party Name</p>
                <p className="mt-1 font-medium">{contract.partyName}</p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Party ID</p>
                <p className="mt-1 font-medium text-gray-600">{contract.partyId}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Duration</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-sm text-text-muted">Start Date</p>
                <p className="mt-1 font-medium">
                  {new Date(contract.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">End Date</p>
                <p className="mt-1 font-medium">
                  {new Date(contract.endDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Duration</p>
                <p className="mt-1 font-medium">
                  {Math.floor(
                    (new Date(contract.endDate).getTime() -
                      new Date(contract.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Terms */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Terms</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm text-text-primary">{contract.terms}</p>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div>
            <h3 className="mb-4 font-semibold text-text-primary">Metadata</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-text-muted">Created At</p>
                <p className="mt-1 font-medium">
                  {new Date(contract.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-text-muted">Updated At</p>
                <p className="mt-1 font-medium">
                  {new Date(contract.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {contract.externalId && (
                <div>
                  <p className="text-sm text-text-muted">External ID</p>
                  <p className="mt-1 font-medium">{contract.externalId}</p>
                </div>
              )}
              {contract.sourceSystem && (
                <div>
                  <p className="text-sm text-text-muted">Source System</p>
                  <p className="mt-1 font-medium">{contract.sourceSystem}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
