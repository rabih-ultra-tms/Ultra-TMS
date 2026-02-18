'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ListPage } from '@/components/patterns/list-page';
import {
  getTransactionColumns,
  VoidTransactionDialog,
} from '@/components/commissions/transactions-table';
import {
  useTransactions,
  useApproveTransaction,
  useVoidTransaction,
} from '@/lib/hooks/commissions/use-transactions';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'PAID', label: 'Paid' },
  { value: 'VOID', label: 'Void' },
];

export default function CommissionTransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || undefined;
  const status = searchParams.get('status') || 'all';
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;

  const [searchInput, setSearchInput] = useState(search ?? '');
  const [voidTargetId, setVoidTargetId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useTransactions({
    page,
    limit,
    search,
    status,
    startDate,
    endDate,
  });

  const approveMutation = useApproveTransaction();
  const voidMutation = useVoidTransaction();

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

  const handleSearch = useCallback(() => {
    updateParams({ search: searchInput || undefined });
  }, [searchInput, updateParams]);

  const handleStatusChange = (value: string) => {
    updateParams({ status: value === 'all' ? undefined : value });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    updateParams({ [field]: value || undefined });
  };

  const handleApprove = async (transactionId: string) => {
    setApprovingId(transactionId);
    try {
      await approveMutation.mutateAsync(transactionId);
      toast.success('Transaction approved');
    } catch {
      toast.error('Failed to approve transaction');
    } finally {
      setApprovingId(null);
    }
  };

  const handleVoidConfirm = async (reason: string) => {
    if (!voidTargetId) return;
    try {
      await voidMutation.mutateAsync({
        transactionId: voidTargetId,
        reason,
      });
      toast.success('Transaction voided');
    } catch {
      toast.error('Failed to void transaction');
    } finally {
      setVoidTargetId(null);
    }
  };

  const columns = getTransactionColumns({
    onApprove: handleApprove,
    onVoid: (id) => setVoidTargetId(id),
    approvingId,
  });

  return (
    <>
      <ListPage
        title="Commission Transactions"
        description="View and manage earned commissions. Approve pending transactions or void with a reason."
        filters={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 size-4 text-text-muted" />
              <Input
                placeholder="Search by rep name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
            </div>
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
            <Input
              type="date"
              value={startDate ?? ''}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              className="w-40"
              placeholder="Start date"
            />
            <Input
              type="date"
              value={endDate ?? ''}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              className="w-40"
              placeholder="End date"
            />
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
        entityLabel="transactions"
      />
      <VoidTransactionDialog
        open={voidTargetId !== null}
        onConfirm={handleVoidConfirm}
        onCancel={() => setVoidTargetId(null)}
        isLoading={voidMutation.isPending}
      />
    </>
  );
}
