import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LoadPlannerQuote,
  LoadPlannerQuoteListItem,
  LoadPlannerQuoteStats,
  LoadPlannerQuoteListParams,
} from '@/types/load-planner-quotes';
import { apiClient } from '@/lib/api-client';

const LOAD_PLANNER_QUOTES_KEY = 'load-planner-quotes';

export const useLoadPlannerQuotes = (params: LoadPlannerQuoteListParams) => {
  // Ensure numeric fields are numbers and valid
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(10, Number(params.limit) || 25);
  
  return useQuery({
    queryKey: [LOAD_PLANNER_QUOTES_KEY, 'list', page, limit, params.search, params.status, params.pickupState, params.dropoffState, params.sortBy, params.sortOrder],
    queryFn: async () => {
      // Build query params with guaranteed valid values
      const queryParams: Record<string, string | number | boolean | undefined> = {
        page,
        limit,
      };
      
      // Only add optional params if they have values
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.pickupState) queryParams.pickupState = params.pickupState;
      if (params.dropoffState) queryParams.dropoffState = params.dropoffState;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      
      const response = await apiClient.get<{
        data: LoadPlannerQuoteListItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>('/operations/load-planner-quotes', queryParams);
      return response;
    },
  });
};

export const useLoadPlannerQuote = (id: string) => {
  return useQuery({
    queryKey: [LOAD_PLANNER_QUOTES_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: LoadPlannerQuote }>(
        `/operations/load-planner-quotes/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useLoadPlannerQuotePublic = (publicToken: string) => {
  return useQuery({
    queryKey: [LOAD_PLANNER_QUOTES_KEY, 'public', publicToken],
    queryFn: async () => {
      const response = await apiClient.get<{ data: LoadPlannerQuote }>(
        `/operations/load-planner-quotes/public/${publicToken}`
      );
      return response.data;
    },
    enabled: !!publicToken,
  });
};

export const useLoadPlannerQuoteStats = () => {
  return useQuery({
    queryKey: [LOAD_PLANNER_QUOTES_KEY, 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: LoadPlannerQuoteStats }>(
        '/operations/load-planner-quotes/stats'
      );
      return response.data;
    },
  });
};

export const useCreateLoadPlannerQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<LoadPlannerQuote>) => {
      const response = await apiClient.post<{ data: LoadPlannerQuote }>(
        '/operations/load-planner-quotes',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LOAD_PLANNER_QUOTES_KEY],
      });
    },
  });
};

export const useUpdateLoadPlannerQuote = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<LoadPlannerQuote>) => {
      const response = await apiClient.patch<{ data: LoadPlannerQuote }>(
        `/operations/load-planner-quotes/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LOAD_PLANNER_QUOTES_KEY, id],
      });
      queryClient.invalidateQueries({
        queryKey: [LOAD_PLANNER_QUOTES_KEY, 'list'],
      });
    },
  });
};

export const useUpdateLoadPlannerQuoteStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (status: string) => {
      const response = await apiClient.patch<{ data: LoadPlannerQuote }>(
        `/operations/load-planner-quotes/${id}/status`,
        { status }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LOAD_PLANNER_QUOTES_KEY, id],
      });
      queryClient.invalidateQueries({
        queryKey: [LOAD_PLANNER_QUOTES_KEY, 'list'],
      });
    },
  });
};

export const useDuplicateLoadPlannerQuote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<{ data: LoadPlannerQuote }>(
        `/operations/load-planner-quotes/${id}/duplicate`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LOAD_PLANNER_QUOTES_KEY],
      });
    },
  });
};

export const useDeleteLoadPlannerQuote = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deleteId?: string) => {
      const targetId = deleteId || id;
      if (!targetId) throw new Error('Quote ID is required for deletion');
      await apiClient.delete(`/operations/load-planner-quotes/${targetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LOAD_PLANNER_QUOTES_KEY, id],
      });
      queryClient.invalidateQueries({
        queryKey: [LOAD_PLANNER_QUOTES_KEY, 'list'],
      });
    },
  });
};
