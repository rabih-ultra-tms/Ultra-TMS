'use client';

import { useState } from 'react';
import { Amendment } from '@/lib/api/contracts/types';
import { amendmentsApi } from '@/lib/api/contracts/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MoreVertical, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface AmendmentsTabProps {
  amendments: Amendment[];
  contractId: string;
  isLoading: boolean;
}

export default function AmendmentsTab({
  amendments,
  contractId,
  isLoading,
}: AmendmentsTabProps) {
  const [applyingAmendment, setApplyingAmendment] = useState<string | null>(
    null
  );

  const handleApplyAmendment = async (amendmentId: string) => {
    try {
      setApplyingAmendment(amendmentId);
      await amendmentsApi.apply(contractId, amendmentId);
      toast.success('Amendment applied successfully');
    } catch (_error) {
      toast.error('Failed to apply amendment');
    } finally {
      setApplyingAmendment(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-3 py-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!amendments || amendments.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="mb-4 text-sm text-text-muted">
            No amendments have been created yet
          </p>
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Create Amendment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Amendments</CardTitle>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Create Amendment
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {amendments.map((amendment) => (
            <div
              key={amendment.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4"
            >
              <div className="flex-1">
                <h4 className="font-semibold text-text-primary">
                  {amendment.title}
                </h4>
                <p className="mt-1 text-sm text-text-muted">
                  {amendment.description}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    Effective:{' '}
                    {new Date(amendment.effectiveDate).toLocaleDateString()}
                  </span>
                  <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-blue-800">
                    {amendment.status}
                  </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  {amendment.status !== 'APPLIED' && (
                    <DropdownMenuItem
                      onClick={() => handleApplyAmendment(amendment.id)}
                      disabled={applyingAmendment === amendment.id}
                      className="gap-2"
                    >
                      <CheckCircle2 className="size-4" />
                      Apply Amendment
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
