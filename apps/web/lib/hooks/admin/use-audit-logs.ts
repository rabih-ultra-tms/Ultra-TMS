'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { AuditLogEntry } from '@/lib/types/auth';

export interface AuditLogParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  entityType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

interface AuditLogListResponse {
  data: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

function unwrapPaginated(response: unknown): AuditLogListResponse {
  const body = response as Record<string, unknown>;
  const data = (body.data ?? []) as AuditLogEntry[];
  const apiPagination = body.pagination as Record<string, unknown> | undefined;
  return {
    data,
    pagination: {
      page: Number(apiPagination?.page ?? 1),
      limit: Number(apiPagination?.limit ?? 20),
      total: Number(apiPagination?.total ?? 0),
      pages: Number(apiPagination?.totalPages ?? 1),
    },
  };
}

export function useAuditLogs(params: AuditLogParams) {
  return useQuery<AuditLogListResponse>({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.search) searchParams.set('search', params.search);
      if (params.action) searchParams.set('action', params.action);
      if (params.entityType) searchParams.set('entityType', params.entityType);
      if (params.userId) searchParams.set('userId', params.userId);
      if (params.startDate) searchParams.set('startDate', params.startDate);
      if (params.endDate) searchParams.set('endDate', params.endDate);

      const response = await apiClient.get(
        `/audit/search?${searchParams.toString()}`
      );
      return unwrapPaginated(response);
    },
    placeholderData: (prev) => prev,
  });
}
