'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ListPage } from '@/components/patterns/list-page';
import { getChartOfAccountsColumns } from '@/components/accounting/chart-of-accounts-table';
import { CreateAccountForm } from '@/components/accounting/create-account-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  useChartOfAccounts,
  useDeleteAccount,
} from '@/lib/hooks/accounting/use-chart-of-accounts';
import type {
  ChartOfAccount,
  AccountType,
} from '@/lib/hooks/accounting/use-chart-of-accounts';
import { Button } from '@/components/ui/button';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ChartOfAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL-based state
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '25');
  const typeParam = searchParams.get('type') || 'all';

  // Local dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ChartOfAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChartOfAccount | null>(null);

  const deleteAccount = useDeleteAccount();

  const { data, isLoading, error, refetch } = useChartOfAccounts({
    page,
    limit,
    type: typeParam === 'all' ? undefined : (typeParam as AccountType),
  });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleTypeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleCreateSuccess = () => {
    setCreateOpen(false);
    toast.success('Account created');
  };

  const handleEditSuccess = () => {
    setEditTarget(null);
    toast.success('Account updated');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAccount.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete account';
      toast.error(message);
    }
  };

  // ---------------------------------------------------------------------------
  // Column actions
  // ---------------------------------------------------------------------------

  const columns = getChartOfAccountsColumns({
    onEdit: (account) => setEditTarget(account),
    onDelete: (account) => setDeleteTarget(account),
  });

  // ---------------------------------------------------------------------------
  // Filters toolbar
  // ---------------------------------------------------------------------------

  const filters = (
    <div className="flex items-center gap-3 p-4">
      <Select value={typeParam} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="ASSET">Assets</SelectItem>
          <SelectItem value="LIABILITY">Liabilities</SelectItem>
          <SelectItem value="EQUITY">Equity</SelectItem>
          <SelectItem value="REVENUE">Revenue</SelectItem>
          <SelectItem value="EXPENSE">Expenses</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <ListPage
        title="Chart of Accounts"
        description="Manage your general ledger accounts."
        headerActions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            New Account
          </Button>
        }
        filters={filters}
        data={data?.data ?? []}
        columns={columns}
        total={data?.pagination?.total ?? 0}
        page={page}
        pageSize={limit}
        pageCount={data?.pagination?.totalPages ?? 1}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        error={error ? (error as Error) : null}
        onRetry={refetch}
        entityLabel="accounts"
      />

      {/* Create Account Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Account</DialogTitle>
          </DialogHeader>
          <CreateAccountForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <CreateAccountForm
              account={editTarget}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Account"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.accountName}" (${deleteTarget.accountNumber})? This action cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleteAccount.isPending}
      />
    </>
  );
}
