'use client';

import Link from 'next/link';
import { Claim, ClaimStatus, ClaimType } from '@/lib/api/claims/types';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/utils';

interface ClaimCardProps {
  claim: Claim;
  onSelect?: (claim: Claim) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadgeVariant(
  status: ClaimStatus
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case ClaimStatus.DRAFT:
    case ClaimStatus.PENDING_DOCUMENTATION:
      return 'secondary';
    case ClaimStatus.SUBMITTED:
    case ClaimStatus.UNDER_INVESTIGATION:
      return 'outline';
    case ClaimStatus.APPROVED:
    case ClaimStatus.SETTLED:
      return 'default';
    case ClaimStatus.DENIED:
      return 'destructive';
    case ClaimStatus.CLOSED:
      return 'secondary';
    default:
      return 'default';
  }
}

function formatClaimType(type: ClaimType): string {
  const typeMap: Record<ClaimType, string> = {
    [ClaimType.CARGO_DAMAGE]: 'Cargo Damage',
    [ClaimType.CARGO_LOSS]: 'Cargo Loss',
    [ClaimType.SHORTAGE]: 'Shortage',
    [ClaimType.LATE_DELIVERY]: 'Late Delivery',
    [ClaimType.OVERCHARGE]: 'Overcharge',
    [ClaimType.OTHER]: 'Other',
  };
  return typeMap[type] || type;
}

function formatStatus(status: ClaimStatus): string {
  return status.split('_').join(' ');
}

export function ClaimCard({ claim, onSelect }: ClaimCardProps) {
  const handleClick = () => {
    if (onSelect) {
      onSelect(claim);
    }
  };

  return (
    <TableRow
      onClick={handleClick}
      className="cursor-pointer hover:bg-muted transition-colors"
    >
      {/* Claim Number */}
      <TableCell className="font-medium">
        <Link
          href={`/claims/${claim.id}`}
          className="text-blue-600 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {claim.claimNumber}
        </Link>
      </TableCell>

      {/* Status Badge */}
      <TableCell>
        <Badge variant={getStatusBadgeVariant(claim.status)}>
          {formatStatus(claim.status)}
        </Badge>
      </TableCell>

      {/* Claim Type */}
      <TableCell>{formatClaimType(claim.claimType)}</TableCell>

      {/* Claimant Name */}
      <TableCell>{claim.claimantName}</TableCell>

      {/* Claimed Amount */}
      <TableCell className="text-right font-medium">
        {formatCurrency(claim.claimedAmount)}
      </TableCell>

      {/* Approved Amount */}
      <TableCell className="text-right">
        {claim.approvedAmount ? formatCurrency(claim.approvedAmount) : '—'}
      </TableCell>

      {/* Filed Date */}
      <TableCell className="text-sm text-muted-foreground">
        {formatDate(claim.filedDate)}
      </TableCell>
    </TableRow>
  );
}
