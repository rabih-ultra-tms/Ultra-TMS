'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { toast } from 'sonner';
import { usePayout, useProcessPayout } from '@/lib/hooks/commissions/use-payouts';
import {
  PayoutSummary,
  PayoutTransactions,
} from '@/components/commissions/payout-detail-card';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  PROCESSING: 'secondary',
  PAID: 'default',
  FAILED: 'destructive',
};

type PaymentMethod = 'ACH' | 'CHECK' | 'WIRE';

export default function PayoutDetailPage() {
  const params = useParams();
  const payoutId = params.id as string;

  const { data: payout, isLoading } = usePayout(payoutId);
  const processMutation = useProcessPayout();

  const [method, setMethod] = useState<PaymentMethod | ''>('');

  const handleProcess = async () => {
    if (!method) return;
    try {
      await processMutation.mutateAsync({ payoutId, method });
      toast.success('Payout processing started');
    } catch {
      toast.error('Failed to process payout');
    }
  };

  const canProcess = payout?.status === 'PENDING';

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/commissions/payouts">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            {isLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <>
                <h1 className="text-2xl font-bold text-text-primary">
                  Payout — {payout?.repName}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                  ID: {payoutId}
                </p>
              </>
            )}
          </div>
          {payout && (
            <Badge variant={statusVariant[payout.status]}>
              {payout.status}
            </Badge>
          )}
        </div>

        {/* Process Action */}
        {canProcess && (
          <div className="flex items-center gap-2">
            <Select
              value={method}
              onValueChange={(v) => setMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Method..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACH">ACH</SelectItem>
                <SelectItem value="CHECK">Check</SelectItem>
                <SelectItem value="WIRE">Wire</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleProcess}
              disabled={!method || processMutation.isPending}
            >
              {processMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Process Payout
            </Button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <PayoutSummary payout={payout} isLoading={isLoading} />

      {/* Transactions Table */}
      <PayoutTransactions payout={payout} isLoading={isLoading} />
    </div>
  );
}
