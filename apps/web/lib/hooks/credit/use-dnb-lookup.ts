import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ===========================
// Types
// ===========================

export interface DnbCompanyResult {
  dunNumber: string;
  companyName: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  phone?: string | null;
  creditScore?: number | null;
  riskRating?: string | null;
  yearsInBusiness?: number | null;
  employeeCount?: number | null;
  industryCode?: string | null;
  industrialDescription?: string | null;
}

export interface DnbLookupResponse {
  results: DnbCompanyResult[];
  searchTerm: string;
  totalResults: number;
  executedAt: string;
}

export interface DnbLookupParams {
  limit?: number;
  offset?: number;
}

// ===========================
// Query Keys
// ===========================

export const dnbLookupKeys = {
  all: ['dnb-lookup'] as const,
  searches: () => [...dnbLookupKeys.all, 'search'] as const,
  search: (company: string, params?: DnbLookupParams) =>
    [...dnbLookupKeys.searches(), company, params] as const,
};

// ===========================
// Helpers
// ===========================

function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// ===========================
// Query Hooks
// ===========================

export function useDnbLookup(companyName: string, params?: DnbLookupParams) {
  return useQuery<DnbLookupResponse>({
    queryKey: dnbLookupKeys.search(companyName, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set('company', companyName);
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());

      const response = await apiClient.get(
        `/credit/dnb?${searchParams.toString()}`
      );
      return unwrap<DnbLookupResponse>(response);
    },
    enabled: !!companyName,
    staleTime: 3600_000, // DNB data changes infrequently, cache for 1 hour
  });
}
