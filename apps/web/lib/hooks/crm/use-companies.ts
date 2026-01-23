import { useQuery } from "@tanstack/react-query";
import { apiClient, type PaginatedResponse } from "@/lib/api";
import type { Customer } from "@/lib/types/crm";

export interface CompanyListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const companyKeys = {
  all: ["companies"] as const,
  list: (params: CompanyListParams) => [...companyKeys.all, "list", params] as const,
};

export function useCompanies(params: CompanyListParams = {}) {
  const queryParams = params as Record<string, string | number | boolean | null | undefined>;
  return useQuery({
    queryKey: companyKeys.list(params),
    queryFn: () => apiClient.get<PaginatedResponse<Customer>>("/crm/companies", queryParams),
  });
}