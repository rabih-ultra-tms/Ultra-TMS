'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DetailPage, DetailTab } from '@/components/patterns/detail-page';
import { useClaimDetail } from '@/lib/hooks/claims';
import { ClaimStatus } from '@/lib/api/claims/types';
import { claimsClient } from '@/lib/api/claims';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  Clock,
  MoreHorizontal,
  Edit,
  Send,
  Users,
  ChevronDown,
} from 'lucide-react';
import { ClaimOverviewTab } from '@/components/claims/ClaimOverviewTab';
import { ClaimItemsTab } from '@/components/claims/ClaimItemsTab';
import { ClaimDocumentsTab } from '@/components/claims/ClaimDocumentsTab';
import { ClaimNotesTab } from '@/components/claims/ClaimNotesTab';
import { ClaimTimelineTab } from '@/components/claims/ClaimTimelineTab';
import { Badge } from '@/components/ui/badge';

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

export default function ClaimDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { claim, items, documents, notes, isLoading, error, refetch } =
    useClaimDetail(params.id);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFileClaim = async () => {
    try {
      setIsUpdating(true);
      await claimsClient.file(params.id, {});
      toast.success('Claim filed successfully');
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to file claim';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangeStatus = async () => {
    if (!selectedStatus) return;
    try {
      setIsUpdating(true);
      await claimsClient.updateStatus(params.id, {
        status: selectedStatus as ClaimStatus,
      });
      toast.success('Status updated successfully');
      setShowStatusDialog(false);
      setSelectedStatus('');
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update status';
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const isDraft = claim?.status === ClaimStatus.DRAFT;

  const actions = (
    <>
      {isDraft && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleFileClaim}
          disabled={isUpdating}
        >
          <Send className="mr-2 size-4" />
          File Claim
        </Button>
      )}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Users className="mr-2 size-4" />
            Assign
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Handler</DialogTitle>
            <DialogDescription>
              Select a handler to assign this claim
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Handler assignment functionality coming soon
            </p>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <ChevronDown className="mr-2 size-4" />
            Change Status
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Claim Status</DialogTitle>
            <DialogDescription>
              Select a new status for this claim
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select
              value={selectedStatus}
              onValueChange={(value: string) => setSelectedStatus(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ClaimStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={ClaimStatus.SUBMITTED}>Submitted</SelectItem>
                <SelectItem value={ClaimStatus.UNDER_INVESTIGATION}>
                  Under Investigation
                </SelectItem>
                <SelectItem value={ClaimStatus.PENDING_DOCUMENTATION}>
                  Pending Documentation
                </SelectItem>
                <SelectItem value={ClaimStatus.APPROVED}>Approved</SelectItem>
                <SelectItem value={ClaimStatus.DENIED}>Denied</SelectItem>
                <SelectItem value={ClaimStatus.SETTLED}>Settled</SelectItem>
                <SelectItem value={ClaimStatus.CLOSED}>Closed</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleChangeStatus}
              disabled={!selectedStatus || isUpdating}
              className="w-full"
            >
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isDraft && (
            <DropdownMenuItem
              onClick={() => router.push(`/claims/${params.id}/edit`)}
            >
              <Edit className="mr-2 size-4" />
              Edit Claim
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const tabs: DetailTab[] = [
    {
      value: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      content: claim ? <ClaimOverviewTab claim={claim} /> : null,
    },
    {
      value: 'items',
      label: `Items (${items?.length || 0})`,
      icon: Package,
      content: claim ? (
        <ClaimItemsTab
          claimId={params.id}
          items={items}
          onItemsChange={refetch}
        />
      ) : null,
    },
    {
      value: 'documents',
      label: `Documents (${documents?.length || 0})`,
      icon: FileText,
      content: claim ? (
        <ClaimDocumentsTab
          claimId={params.id}
          documents={documents}
          onDocumentsChange={refetch}
        />
      ) : null,
    },
    {
      value: 'notes',
      label: `Notes (${notes?.length || 0})`,
      icon: MessageSquare,
      content: claim ? (
        <ClaimNotesTab
          claimId={params.id}
          notes={notes}
          onNotesChange={refetch}
        />
      ) : null,
    },
    {
      value: 'timeline',
      label: 'Timeline',
      icon: Clock,
      content: claim ? <ClaimTimelineTab claim={claim} /> : null,
    },
  ];

  return (
    <>
      <DetailPage
        title={claim?.claimNumber || 'Claim Details'}
        subtitle={
          claim && (
            <div className="flex items-center gap-2">
              <span>
                {claim.claimantName} • {claim.claimType.replace(/_/g, ' ')}
              </span>
            </div>
          )
        }
        tags={
          claim && (
            <Badge variant={getStatusBadgeVariant(claim.status)}>
              {formatStatus(claim.status)}
            </Badge>
          )
        }
        actions={actions}
        backLink="/claims"
        backLabel="Back to Claims"
        breadcrumb={<span>Claims / {claim?.claimNumber || '...'}</span>}
        tabs={tabs}
        isLoading={isLoading}
        error={error as Error}
        onRetry={refetch}
      />
    </>
  );
}
