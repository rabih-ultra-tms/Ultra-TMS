'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useClaimDetail } from '@/lib/hooks/claims';
import { SettlementCalculator } from '@/components/claims/SettlementCalculator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DetailPageSkeleton } from '@/components/shared/detail-page-skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { ClaimStatus } from '@/lib/api/claims/types';

function formatStatus(status: ClaimStatus): string {
  return status.split('_').join(' ');
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

export default function SettlementPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { claim, isLoading, error, refetch } = useClaimDetail(params.id);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span>Claims / Settlement</span>
          </div>
          <Button variant="ghost" size="sm" asChild className="-mr-2">
            <Link href="/claims">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Claims
            </Link>
          </Button>
        </div>
        <DetailPageSkeleton />
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span>Claims / Settlement</span>
          </div>
          <Button variant="ghost" size="sm" asChild className="-mr-2">
            <Link href="/claims">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Claims
            </Link>
          </Button>
        </div>
        <ErrorState
          title="Failed to load claim"
          message={error?.message || 'Unknown error occurred'}
          retry={refetch}
          backButton={
            <Button variant="outline" asChild>
              <Link href="/claims">Back to Claims</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Top Nav: Breadcrumb + Back */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span>Claims / {claim.claimNumber} / Settlement</span>
        </div>
        <Button variant="ghost" size="sm" asChild className="-mr-2">
          <Link href="/claims">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Claims
          </Link>
        </Button>
      </div>

      {/* Header Area */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Settlement - {claim.claimNumber}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{claim.claimantName}</span>
            <span className="text-border mx-1">|</span>
            <Badge variant={getStatusBadgeVariant(claim.status)}>
              {formatStatus(claim.status)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Settlement Calculator */}
      <SettlementCalculator
        claim={claim}
        claimId={params.id}
        onSuccess={() => {
          refetch();
          router.push(`/claims/${params.id}`);
        }}
      />
    </div>
  );
}
