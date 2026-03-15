'use client';

import { useRouter } from 'next/navigation';
import { useClaimDetail } from '@/lib/hooks/claims';
import { ClaimStatus } from '@/lib/api/claims/types';
import { InvestigationForm } from '@/components/claims/InvestigationForm';
import { InvestigationTimeline } from '@/components/claims/InvestigationTimeline';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

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

export default function ClaimInvestigationPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { claim, isLoading, error, refetch } = useClaimDetail(params.id);

  // Check if investigation is allowed for this claim
  // Investigation is allowed for all submitted and processed claims (excluding DRAFT only)
  const deniedStatuses: ClaimStatus[] = [ClaimStatus.DRAFT];
  const isInvestigationAllowed =
    claim && !deniedStatuses.includes(claim.status);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading claim details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">Failed to load claim details</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Claim not found</p>
        <Button onClick={() => router.push('/claims')}>Back to Claims</Button>
      </div>
    );
  }

  if (!isInvestigationAllowed) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Investigation</h1>
            <p className="text-muted-foreground">Claim {claim.claimNumber}</p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/claims/${params.id}`)}
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Detail
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">
              Investigation is not available for claims in DRAFT status. Please
              submit the claim first.
            </p>
            <p className="text-sm">
              Current status:{' '}
              <Badge variant={getStatusBadgeVariant(claim.status)}>
                {formatStatus(claim.status)}
              </Badge>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investigation</h1>
          <p className="text-muted-foreground">Claim {claim.claimNumber}</p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push(`/claims/${params.id}`)}
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Detail
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Claim Number</p>
              <p className="font-medium">{claim.claimNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge
                variant={getStatusBadgeVariant(claim.status)}
                className="mt-1"
              >
                {formatStatus(claim.status)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Filed Date</p>
              <p className="font-medium">{formatDate(claim.filedDate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investigation Form */}
      <InvestigationForm
        claimId={params.id}
        claim={claim}
        onSuccess={() => {
          refetch();
          router.push(`/claims/${params.id}`);
        }}
      />

      {/* Investigation Timeline */}
      <InvestigationTimeline claim={claim} />
    </div>
  );
}
