import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Types
export interface FactoringCompany {
  id: string;
  tenantId: string;
  companyCode: string;
  name: string;
  email: string | null;
  phone: string | null;
  fax: string | null;
  address: string | null;
  verificationMethod: 'PHONE_CALL' | 'EMAIL' | 'FAX' | 'ONLINE_PORTAL' | 'MAIL';
  apiEndpoint: string | null;
  verificationSLAHours: number;
  status: 'ACTIVE' | 'INACTIVE';
  externalId: string | null;
  sourceSystem: string | null;
  customFields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: string;
  updatedById: string;
}

export interface FactoringCompanyList {
  data: FactoringCompany[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CompanyFilters {
  status?: 'ACTIVE' | 'INACTIVE';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateFactoringCompanyDto {
  companyCode: string;
  name: string;
  email?: string;
  phone?: string;
  fax?: string;
  address?: string;
  verificationMethod?:
    | 'PHONE_CALL'
    | 'EMAIL'
    | 'FAX'
    | 'ONLINE_PORTAL'
    | 'MAIL';
  apiEndpoint?: string;
  apiKey?: string;
  verificationSLAHours?: number;
  status?: 'ACTIVE' | 'INACTIVE';
}

export type UpdateFactoringCompanyDto = Partial<CreateFactoringCompanyDto>;

// Query key factory
const companiesKeys = {
  all: () => ['factoring', 'companies'] as const,
  list: (filters?: CompanyFilters) =>
    ['factoring', 'companies', 'list', filters] as const,
  detail: (id: string) => ['factoring', 'companies', id] as const,
};

// Unwrap utility
function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// Hook: List factoring companies
export function useFactoringCompanies(filters?: CompanyFilters) {
  return useQuery<FactoringCompanyList>({
    queryKey: companiesKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.search) params.set('search', filters.search);
      const page = filters?.page ?? 1;
      const limit = filters?.limit ?? 20;
      params.set('page', page.toString());
      params.set('limit', limit.toString());

      const response = await apiClient.get(`/factoring-companies?${params}`);
      return response as FactoringCompanyList;
    },
    staleTime: 30_000,
  });
}

// Hook: Get single company
export function useFactoringCompany(id: string) {
  return useQuery<FactoringCompany>({
    queryKey: companiesKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get(`/factoring-companies/${id}`);
      return unwrap<FactoringCompany>(response);
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

// Hook: Create factoring company
export function useCreateFactoringCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateFactoringCompanyDto) =>
      apiClient.post('/factoring-companies', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companiesKeys.all() });
    },
  });
}

// Hook: Update factoring company
export function useUpdateFactoringCompany(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dto: UpdateFactoringCompanyDto) =>
      apiClient.put(`/factoring-companies/${id}`, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companiesKeys.all() });
      qc.invalidateQueries({ queryKey: companiesKeys.detail(id) });
    },
  });
}

// Hook: Delete factoring company (soft delete)
export function useDeleteFactoringCompany(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => apiClient.delete(`/factoring-companies/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companiesKeys.all() });
    },
  });
}
