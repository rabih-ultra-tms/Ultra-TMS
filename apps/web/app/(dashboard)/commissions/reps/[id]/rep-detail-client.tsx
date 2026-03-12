'use client';

import { useState } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  useRep,
  useRepTransactions,
  useAssignPlan,
} from '@/lib/hooks/commissions/use-reps';
import {
  RepSummary,
  TransactionHistory,
} from '@/components/commissions/rep-detail-card';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface CommissionPlan {
  id: string;
  name: string;
}

function usePlans() {
  return useQuery<CommissionPlan[]>({
    queryKey: ['commissions', 'plans', 'list'],
    queryFn: async () => {
      const response = await apiClient.get('/commissions/plans');
      const body = response as Record<string, unknown>;
      const data = (body.data ?? response) as CommissionPlan[];
      return Array.isArray(data) ? data : [];
    },
    staleTime: 60_000,
  });
}

export function RepDetailClient({ repId }: { repId: string }) {
  const { data: rep, isLoading: repLoading, isError: repError } = useRep(repId);
  const { data: txData, isLoading: txLoading } = useRepTransactions(repId);
  const { data: plans } = usePlans();
  const assignPlan = useAssignPlan();

  const [selectedPlanId, setSelectedPlanId] = useState('');

  const handleAssignPlan = async () => {
    if (!selectedPlanId) return;
    try {
      await assignPlan.mutateAsync({ repId, planId: selectedPlanId });
      toast.success('Commission plan assigned');
      setSelectedPlanId('');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to assign plan';
      toast.error(message);
    }
  };

  // Show error state if rep failed to load
  if (repError && !repLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/commissions/reps">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Sales Rep</h1>
            <p className="mt-1 text-sm text-text-muted">Not found</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-text-muted">
              The sales rep could not be found. It may have been deleted or the
              ID is invalid.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/commissions/reps">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            {repLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <>
                <h1 className="text-2xl font-bold text-text-primary">
                  {rep?.name}
                </h1>
                <p className="mt-1 text-sm text-text-muted">{rep?.email}</p>
              </>
            )}
          </div>
          {rep && (
            <Badge variant={rep.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {rep.status}
            </Badge>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <RepSummary rep={rep} isLoading={repLoading} />

      {/* Plan Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4" />
            Commission Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-text-muted">Current plan:</p>
              <div className="font-medium text-text-primary">
                {repLoading ? (
                  <Skeleton className="h-5 w-32" />
                ) : rep?.planName ? (
                  rep.planName
                ) : (
                  <span className="italic text-text-muted">
                    No plan assigned
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select plan..." />
                </SelectTrigger>
                <SelectContent>
                  {plans?.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={handleAssignPlan}
                disabled={!selectedPlanId || assignPlan.isPending}
              >
                {assignPlan.isPending ? 'Assigning...' : 'Assign'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <TransactionHistory
        transactions={txData?.data ?? []}
        isLoading={txLoading}
      />
    </div>
  );
}
