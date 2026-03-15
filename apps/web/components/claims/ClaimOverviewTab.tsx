'use client';

import { ClaimDetailResponse, ClaimStatus } from '@/lib/api/claims/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ClaimOverviewTabProps {
  claim: ClaimDetailResponse;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

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

export function ClaimOverviewTab({ claim }: ClaimOverviewTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Claim Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Claim Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <p className="text-sm text-muted-foreground">Claim Type</p>
            <p className="font-medium">{claim.claimType.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">{claim.description || '—'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Dates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Incident Date</p>
            <p className="font-medium">{formatDate(claim.incidentDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Filed Date</p>
            <p className="font-medium">{formatDate(claim.filedDate)}</p>
          </div>
          {claim.receivedDate && (
            <div>
              <p className="text-sm text-muted-foreground">Received Date</p>
              <p className="font-medium">{formatDate(claim.receivedDate)}</p>
            </div>
          )}
          {claim.dueDate && (
            <div>
              <p className="text-sm text-muted-foreground">Due Date</p>
              <p className="font-medium">{formatDate(claim.dueDate)}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Amount Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Amount</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Claimed Amount</p>
            <p className="text-xl font-bold">
              {formatCurrency(claim.claimedAmount)}
            </p>
          </div>
          {claim.approvedAmount !== undefined && (
            <div>
              <p className="text-sm text-muted-foreground">Approved Amount</p>
              <p className="text-xl font-bold">
                {formatCurrency(claim.approvedAmount)}
              </p>
            </div>
          )}
          {claim.paidAmount > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Paid Amount</p>
              <p className="text-xl font-bold">
                {formatCurrency(claim.paidAmount)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claimant Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Claimant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="font-medium">{claim.claimantName}</p>
          </div>
          {claim.claimantCompany && (
            <div>
              <p className="text-sm text-muted-foreground">Company</p>
              <p className="font-medium">{claim.claimantCompany}</p>
            </div>
          )}
          {claim.claimantEmail && (
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm">{claim.claimantEmail}</p>
            </div>
          )}
          {claim.claimantPhone && (
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="text-sm">{claim.claimantPhone}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Information Card */}
      {(claim.loadId || claim.orderId || claim.carrierId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">References</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {claim.loadId && (
              <div>
                <p className="text-sm text-muted-foreground">Load ID</p>
                <p className="font-medium">{claim.loadId}</p>
              </div>
            )}
            {claim.orderId && (
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-medium">{claim.orderId}</p>
              </div>
            )}
            {claim.carrierId && (
              <div>
                <p className="text-sm text-muted-foreground">Carrier ID</p>
                <p className="font-medium">{claim.carrierId}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
