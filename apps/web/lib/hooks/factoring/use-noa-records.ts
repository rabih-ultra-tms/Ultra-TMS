import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Types
export interface NoaRecord {
  id: string;
  tenantId: string;
  carrierId: string;
  factoringCompanyId: string;
  noaNumber: string;
  noaDate: string;
  noaExpiryDate: string | null;
  status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'EXPIRED' | 'RELEASED';
  verificationMethod: 'PHONE_CALL' | 'EMAIL' | 'FAX' | 'ONLINE_PORTAL' | 'MAIL';
  verificationDate: string | null;
  verificationNotes: string | null;
  externalId: string | null;
  sourceSystem: string | null;
  customFields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: string;
  updatedById: string;
}

export interface NoaRecordList {
  data: NoaRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NoaFilters {
  status?: NoaRecord['status'];
  factoringCompanyId?: string;
  carrierId?: string;
  page?: number;
  limit?: number;
}

export interface CreateNoaRecordDto {
  carrierId: string;
  factoringCompanyId: string;
  noaNumber: string;
  noaDate: string;
  noaExpiryDate?: string;
  verificationMethod?:
    | 'PHONE_CALL'
    | 'EMAIL'
    | 'FAX'
    | 'ONLINE_PORTAL'
    | 'MAIL';
}

export interface VerifyNoaDto {
  verificationDate?: string;
  verificationNotes?: string;
}

export interface ReleaseNoaDto {
  releaseNotes?: string;
}

// Query key factory
const noaKeys = {
  all: () => ['factoring', 'noa'] as const,
  list: (filters?: NoaFilters) =>
    ['factoring', 'noa', 'list', filters] as const,
  detail: (id: string) => ['factoring', 'noa', id] as const,
};

// Unwrap utility
function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// Hook: List NOA records
export function useNoaRecords(filters?: NoaFilters) {
  return useQuery<NoaRecordList>({
    queryKey: noaKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.factoringCompanyId)
        params.set('factoringCompanyId', filters.factoringCompanyId);
      if (filters?.carrierId) params.set('carrierId', filters.carrierId);
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 20;
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const response = await apiClient.get(`/noa-records?${params}`);
      return response as NoaRecordList;
    },
    staleTime: 30_000,
  });
}

// Hook: Get single NOA record
export function useNoaRecord(id: string) {
  return useQuery<NoaRecord>({
    queryKey: noaKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/noa-records/${id}`);
      return unwrap<NoaRecord>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// Hook: Create NOA record
export function useCreateNoaRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateNoaRecordDto) =>
      apiClient.post('/noa-records', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noaKeys.all() });
    },
  });
}

// Hook: Verify NOA record
export function useVerifyNoaRecord(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: VerifyNoaDto) =>
      apiClient.post(`/noa-records/${id}/verify`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noaKeys.all() });
      qc.invalidateQueries({ queryKey: noaKeys.detail(id) });
    },
  });
}

// Hook: Release NOA record
export function useReleaseNoaRecord(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: ReleaseNoaDto) =>
      apiClient.post(`/noa-records/${id}/release`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noaKeys.all() });
      qc.invalidateQueries({ queryKey: noaKeys.detail(id) });
    },
  });
}

// Hook: Delete NOA record (soft delete)
export function useDeleteNoaRecord(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => apiClient.delete(`/noa-records/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noaKeys.all() });
    },
  });
}
