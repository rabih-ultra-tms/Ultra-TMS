'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'VOID';

export type ReferenceType = 'INVOICE' | 'SETTLEMENT' | 'PAYMENT' | 'MANUAL';

export interface JournalEntryLine {
  id: string;
  accountId: string;
  accountName: string;
  accountNumber: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
}

export interface JournalEntry {
  id: string;
  entryNumber: string;
  status: JournalEntryStatus;
  date: string;
  description: string;
  referenceType: ReferenceType;
  referenceId?: string;
  totalDebit: number;
  totalCredit: number;
  lines: JournalEntryLine[];
  postedAt?: string;
  voidedAt?: string;
  voidReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntriesParams {
  page?: number;
  limit?: number;
  status?: string;
  referenceType?: string;
}

export interface JournalEntriesResponse {
  data: JournalEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===========================
// Query Keys
// ===========================

export const journalEntryKeys = {
  all: ['journal-entries'] as const,
  lists: () => [...journalEntryKeys.all, 'list'] as const,
  list: (params: JournalEntriesParams) =>
    [...journalEntryKeys.lists(), params] as const,
  details: () => [...journalEntryKeys.all, 'detail'] as const,
  detail: (id: string) => [...journalEntryKeys.details(), id] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  if (body.pagination) {
    return { data: body.data, pagination: body.pagination } as T;
  }
  return (body.data ?? response) as T;
}

// ===========================
// Query Hooks
// ===========================

export function useJournalEntries(params: JournalEntriesParams) {
  return useQuery<JournalEntriesResponse>({
    queryKey: journalEntryKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.status && params.status !== 'all')
        searchParams.set('status', params.status);
      if (params.referenceType && params.referenceType !== 'all')
        searchParams.set('referenceType', params.referenceType);

      const response = await apiClient.get(
        `/journal-entries?${searchParams.toString()}`
      );
      return unwrap<JournalEntriesResponse>(response);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useJournalEntry(id: string) {
  return useQuery<JournalEntry>({
    queryKey: journalEntryKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/journal-entries/${id}`);
      return unwrap<JournalEntry>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
    retry: 2,
  });
}

// ===========================
// Mutation Hooks
// ===========================

export function usePostJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/journal-entries/${id}/post`);
      return unwrap<JournalEntry>(response);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to post journal entry');
    },
  });
}

export function useVoidJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await apiClient.post(`/journal-entries/${id}/void`, {
        reason,
      });
      return unwrap<JournalEntry>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: journalEntryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to void journal entry');
    },
  });
}
