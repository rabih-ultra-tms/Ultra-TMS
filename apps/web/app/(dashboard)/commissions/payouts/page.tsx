'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ListPage } from '@/components/patterns/list-page';
import { getPayoutColumns } from '@/components/commissions/payout-table';
import {
  usePayouts,
  useGeneratePayout,
} from '@/lib/hooks/commissions/use-payouts';
import type { CommissionPayout } from '@/lib/hooks/commissions/use-payouts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FAILED', label: 'Failed' },
];

export default function PayoutsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const status = searchParams.get('status') || 'all';

  const [generateOpen, setGenerateOpen] = useState(false);
  const [repIdInput, setRepIdInput] = useState('');

  const { data, isLoading, error, refetch } = usePayouts({
    page,
    limit,
    status,
  });

  const generatePayout = useGeneratePayout();

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      if (!updates.page) params.set('page', '1');
      router.push(`?${params.toString()}`);
    },
    [searchParams, router]
  );

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const handleStatusChange = (value: string) => {
    updateParams({ status: value === 'all' ? undefined : value });
  };

  const handleRowClick = (row: CommissionPayout) => {
    router.push(`/commissions/payouts/${row.id}`);
  };

  const handleGenerate = async () => {
    if (!repIdInput.trim()) return;
    try {
      await generatePayout.mutateAsync(repIdInput.trim());
      toast.success('Payout generated successfully');
      setGenerateOpen(false);
      setRepIdInput('');
    } catch {
      toast.error('Failed to generate payout');
    }
  };

  const columns = getPayoutColumns();

  return (
    <>
      <ListPage
        title="Commission Payouts"
        description="Generate and process commission payouts for sales reps."
        headerActions={
          <Button onClick={() => setGenerateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Generate Payout
          </Button>
        }
        filters={
          <div className="flex items-center gap-3">
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
        data={data?.data || []}
        columns={columns}
        total={data?.pagination?.total || 0}
        page={page}
        pageSize={limit}
        pageCount={data?.pagination?.totalPages || 1}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        error={error ? (error as Error) : null}
        onRetry={refetch}
        onRowClick={handleRowClick}
        entityLabel="payouts"
      />

      {/* Generate Payout Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Payout</DialogTitle>
            <DialogDescription>
              Create a payout from all approved transactions for a sales rep.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="repId">Sales Rep ID</Label>
              <Input
                id="repId"
                placeholder="Enter rep ID..."
                value={repIdInput}
                onChange={(e) => setRepIdInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setGenerateOpen(false)}
              disabled={generatePayout.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!repIdInput.trim() || generatePayout.isPending}
            >
              {generatePayout.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
