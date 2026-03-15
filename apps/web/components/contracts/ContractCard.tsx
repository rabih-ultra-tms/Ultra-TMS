'use client';

import Link from 'next/link';
import { Contract, ContractStatus } from '@/lib/api/contracts/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, DollarSign, Building2 } from 'lucide-react';

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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function isExpiringWithin30Days(endDate: string): boolean {
  const today = new Date();
  const expireDate = new Date(endDate);
  const diffTime = expireDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 30;
}

interface ContractCardProps {
  contract: Contract;
  onClick?: () => void;
}

export default function ContractCard({
  contract,
  onClick,
}: ContractCardProps) {
  const isExpiring = isExpiringWithin30Days(contract.endDate);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={`/contracts/${contract.id}`}>
              <CardTitle className="text-lg font-semibold text-blue-600 hover:text-blue-700">
                {contract.contractNumber}
              </CardTitle>
            </Link>
            <p className="mt-1 text-sm text-text-muted">{contract.contractName}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeColor(contract.status)}`}
          >
            {contract.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Party & Type */}
        <div className="flex items-center gap-3 text-sm">
          <Building2 className="size-4 text-gray-400" />
          <div>
            <span className="font-medium">{contract.partyName}</span>
            <span className="ml-2 text-text-muted">({contract.type})</span>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Calendar className="size-4" />
              Start Date
            </div>
            <p className="mt-1 font-medium">
              {new Date(contract.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Calendar className="size-4" />
              {isExpiring ? 'Expiring' : 'End Date'}
            </div>
            <p className={`mt-1 font-medium ${isExpiring ? 'text-red-600' : ''}`}>
              {new Date(contract.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Value */}
        <div className="flex items-center gap-3">
          <DollarSign className="size-4 text-gray-400" />
          <span className="text-sm font-medium">
            {formatCurrency(contract.value)}
          </span>
        </div>

        {/* Action */}
        <Link href={`/contracts/${contract.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={onClick}
          >
            View Details
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
