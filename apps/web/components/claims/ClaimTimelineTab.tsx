'use client';

import { ClaimDetailResponse, ClaimStatus } from '@/lib/api/claims/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

interface ClaimTimelineTabProps {
  claim: ClaimDetailResponse;
}

interface TimelineEvent {
  timestamp: string;
  status: ClaimStatus;
  title: string;
  description?: string;
}

function getStatusColor(status: ClaimStatus): string {
  switch (status) {
    case ClaimStatus.DRAFT:
      return 'bg-gray-100 text-gray-800';
    case ClaimStatus.SUBMITTED:
    case ClaimStatus.PENDING_DOCUMENTATION:
      return 'bg-yellow-100 text-yellow-800';
    case ClaimStatus.UNDER_INVESTIGATION:
      return 'bg-blue-100 text-blue-800';
    case ClaimStatus.APPROVED:
      return 'bg-green-100 text-green-800';
    case ClaimStatus.DENIED:
      return 'bg-red-100 text-red-800';
    case ClaimStatus.SETTLED:
      return 'bg-purple-100 text-purple-800';
    case ClaimStatus.CLOSED:
      return 'bg-slate-100 text-slate-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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

function formatStatus(status: ClaimStatus): string {
  return status.split('_').join(' ');
}

export function ClaimTimelineTab({ claim }: ClaimTimelineTabProps) {
  // Build timeline from claim events
  const events: TimelineEvent[] = [
    {
      timestamp: claim.createdAt,
      status: ClaimStatus.DRAFT,
      title: 'Claim Created',
      description: 'Initial claim created',
    },
  ];

  // Add filed date if claim was filed
  if (claim.filedDate) {
    events.push({
      timestamp: claim.filedDate,
      status: ClaimStatus.SUBMITTED,
      title: 'Claim Filed',
      description: 'Claim submitted to insurance',
    });
  }

  // Add received date if applicable
  if (claim.receivedDate) {
    events.push({
      timestamp: claim.receivedDate,
      status: ClaimStatus.SUBMITTED,
      title: 'Claim Received',
      description: 'Insurance received the claim',
    });
  }

  // Add current status update
  if (
    claim.status !== ClaimStatus.DRAFT &&
    claim.status !== ClaimStatus.SUBMITTED
  ) {
    events.push({
      timestamp: claim.updatedAt,
      status: claim.status,
      title: formatStatus(claim.status),
      description:
        claim.status === ClaimStatus.APPROVED
          ? `Approved for ${claim.approvedAmount}`
          : claim.status === ClaimStatus.DENIED
            ? 'Claim denied'
            : claim.status === ClaimStatus.SETTLED
              ? 'Claim settled'
              : claim.status === ClaimStatus.CLOSED
                ? 'Claim closed'
                : 'Status updated',
    });
  }

  // Add close date if applicable
  if (claim.closedDate) {
    events.push({
      timestamp: claim.closedDate,
      status: ClaimStatus.CLOSED,
      title: 'Claim Closed',
      description: 'Final claim closure',
    });
  }

  // Sort by timestamp (newest last for display)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No events recorded yet.
          </p>
        ) : (
          <div className="space-y-6">
            {sortedEvents.map((event, index) => (
              <div key={`${event.timestamp}-${index}`} className="flex gap-4">
                {/* Timeline line and dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`h-3 w-3 rounded-full border-2 border-white ${getStatusColor(event.status)}`}
                  />
                  {index < sortedEvents.length - 1 && (
                    <div className="h-12 w-0.5 bg-muted" />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 pb-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-foreground">
                        {event.title}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(event.status)}>
                        {formatStatus(event.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.timestamp)}
                    </p>
                    {event.description && (
                      <p className="text-sm text-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
