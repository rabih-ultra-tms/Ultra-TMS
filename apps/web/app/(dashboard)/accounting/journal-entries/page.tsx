'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { BookOpen, Send, Ban } from 'lucide-react';

import { ListPage } from '@/components/patterns/list-page';
import { getJournalEntryColumns } from '@/components/accounting/journal-entries-table';
import { JournalEntryStatusBadge } from '@/components/accounting/journal-entry-status-badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  useJournalEntries,
  useJournalEntry,
  usePostJournalEntry,
  useVoidJournalEntry,
} from '@/lib/hooks/accounting/use-journal-entries';
import type {
  JournalEntry,
  JournalEntryStatus,
  ReferenceType,
} from '@/lib/hooks/accounting/use-journal-entries';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const REFERENCE_TYPE_LABELS: Record<ReferenceType, string> = {
  INVOICE: 'Invoice',
  SETTLEMENT: 'Settlement',
  PAYMENT: 'Payment',
  MANUAL: 'Manual',
};

// ---------------------------------------------------------------------------
// Detail Drawer
// ---------------------------------------------------------------------------

interface EntryDrawerProps {
  entryId: string | null;
  onClose: () => void;
}

function EntryDrawer({ entryId, onClose }: EntryDrawerProps) {
  const [voidOpen, setVoidOpen] = useState(false);
  const postEntry = usePostJournalEntry();
  const voidEntry = useVoidJournalEntry();

  const { data: entry, isLoading } = useJournalEntry(entryId ?? '');

  const handlePost = async () => {
    if (!entry) return;
    try {
      await postEntry.mutateAsync(entry.id);
      toast.success('Journal entry posted to GL');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to post journal entry';
      toast.error(message);
    }
  };

  const handleVoidConfirm = async () => {
    if (!entry) return;
    try {
      await voidEntry.mutateAsync({ id: entry.id });
      toast.success('Journal entry voided');
      setVoidOpen(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to void journal entry';
      toast.error(message);
    }
  };

  const totalDebit =
    entry?.lines.reduce((sum, l) => sum + l.debitAmount, 0) ?? 0;
  const totalCredit =
    entry?.lines.reduce((sum, l) => sum + l.creditAmount, 0) ?? 0;

  return (
    <>
      <Sheet
        open={!!entryId}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto flex flex-col gap-0 p-0"
        >
          {isLoading || !entry ? (
            <div className="flex items-center justify-center h-48 text-text-muted">
              Loading…
            </div>
          ) : (
            <>
              {/* Header */}
              <SheetHeader className="px-6 py-5 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <SheetTitle className="text-base font-semibold font-mono">
                      {entry.entryNumber}
                    </SheetTitle>
                    <p className="text-sm text-text-muted">
                      {formatDate(entry.date)} &middot;{' '}
                      {REFERENCE_TYPE_LABELS[entry.referenceType]}
                    </p>
                  </div>
                  <JournalEntryStatusBadge status={entry.status} size="md" />
                </div>
              </SheetHeader>

              {/* Description */}
              <div className="px-6 py-4 border-b border-border">
                <p className="text-sm text-text-primary">{entry.description}</p>
              </div>

              {/* Lines Table */}
              <div className="px-6 py-4 flex-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-3">
                  Journal Lines
                </h3>
                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        <th className="text-left px-3 py-2 text-xs font-medium text-text-muted">
                          Account
                        </th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-text-muted">
                          Description
                        </th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-text-muted">
                          Debit
                        </th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-text-muted">
                          Credit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {entry.lines.map((line) => (
                        <tr
                          key={line.id}
                          className="border-b border-border last:border-0"
                        >
                          <td className="px-3 py-2">
                            <div className="font-mono text-xs text-text-muted">
                              {line.accountNumber}
                            </div>
                            <div className="text-text-primary">
                              {line.accountName}
                            </div>
                          </td>
                          <td className="px-3 py-2 text-text-muted max-w-[180px] truncate">
                            {line.description ?? '—'}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-text-primary">
                            {line.debitAmount > 0
                              ? formatCurrency(line.debitAmount)
                              : '—'}
                          </td>
                          <td className="px-3 py-2 text-right font-medium text-text-primary">
                            {line.creditAmount > 0
                              ? formatCurrency(line.creditAmount)
                              : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/40 border-t border-border font-semibold">
                        <td
                          className="px-3 py-2 text-text-muted text-xs uppercase tracking-wide"
                          colSpan={2}
                        >
                          Totals
                        </td>
                        <td className="px-3 py-2 text-right text-text-primary">
                          {formatCurrency(totalDebit)}
                        </td>
                        <td className="px-3 py-2 text-right text-text-primary">
                          {formatCurrency(totalCredit)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Action Buttons — only shown when there are actions available */}
              {entry.status !== 'VOID' && (
                <div className="px-6 py-4 border-t border-border flex gap-2 justify-end">
                  {entry.status === 'DRAFT' && (
                    <Button
                      onClick={handlePost}
                      disabled={postEntry.isPending}
                      size="sm"
                    >
                      <Send className="mr-2 size-4" />
                      Post to GL
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVoidOpen(true)}
                    disabled={voidEntry.isPending}
                  >
                    <Ban className="mr-2 size-4" />
                    Void
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={voidOpen}
        title="Void journal entry?"
        description="This action cannot be undone. The entry will be marked as void and excluded from financial reports."
        confirmLabel="Void Entry"
        variant="destructive"
        onConfirm={handleVoidConfirm}
        onCancel={() => setVoidOpen(false)}
        isLoading={voidEntry.isPending}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

function JournalEntryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get('status') ?? 'all';
  const referenceType = searchParams.get('referenceType') ?? 'all';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Select value={status} onValueChange={(v) => updateParam('status', v)}>
        <SelectTrigger className="w-[160px] h-8 text-sm">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="POSTED">Posted</SelectItem>
          <SelectItem value="VOID">Void</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={referenceType}
        onValueChange={(v) => updateParam('referenceType', v)}
      >
        <SelectTrigger className="w-[160px] h-8 text-sm">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="INVOICE">Invoice</SelectItem>
          <SelectItem value="SETTLEMENT">Settlement</SelectItem>
          <SelectItem value="PAYMENT">Payment</SelectItem>
          <SelectItem value="MANUAL">Manual</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function JournalEntriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});

  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');
  const status =
    (searchParams.get('status') as JournalEntryStatus) || undefined;
  const referenceType =
    (searchParams.get('referenceType') as ReferenceType) || undefined;

  const { data, isLoading, error, refetch } = useJournalEntries({
    page,
    limit,
    status,
    referenceType,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRowClick = (row: JournalEntry) => {
    setSelectedEntryId(row.id);
  };

  const columns = getJournalEntryColumns();

  return (
    <>
      <ListPage
        title="Journal Entries"
        description="View and manage general ledger journal entries."
        headerActions={
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-text-muted" />
            <span className="text-sm text-text-muted">General Ledger</span>
          </div>
        }
        filters={<JournalEntryFilters />}
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
        onRowClick={handleRowClick}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        entityLabel="journal entries"
      />

      <EntryDrawer
        entryId={selectedEntryId}
        onClose={() => setSelectedEntryId(null)}
      />
    </>
  );
}
