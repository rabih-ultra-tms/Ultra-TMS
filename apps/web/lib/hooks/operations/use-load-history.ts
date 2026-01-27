import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  LoadHistory,
  LoadHistoryListResponse,
  LoadHistoryListParams,
  LaneStats,
  SimilarLoadsParams,
} from '@/types/load-history';
import { apiClient } from '@/lib/api-client';

const LOAD_HISTORY_KEY = 'load-history';

export const useLoadHistory = (params: LoadHistoryListParams) => {
  // Ensure numeric fields are numbers and valid
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.max(10, Number(params.limit) || 25);
  
  return useQuery({
    queryKey: [LOAD_HISTORY_KEY, 'list', page, limit, params.search, params.status, params.carrierId, params.sortBy, params.sortOrder],
    queryFn: async () => {
      // Build query params with guaranteed valid values
      const queryParams: Record<string, string | number | boolean | undefined> = {
        page,
        limit,
      };
      
      // Only add optional params if they have values
      if (params.search) queryParams.search = params.search;
      if (params.status) queryParams.status = params.status;
      if (params.carrierId) queryParams.carrierId = params.carrierId;
      if (params.sortBy) queryParams.sortBy = params.sortBy;
      if (params.sortOrder) queryParams.sortOrder = params.sortOrder;
      
      const response = await apiClient.get<LoadHistoryListResponse>(
        '/operations/load-history',
        queryParams
      );
      return response;
    },
  });
};

export const useLoadHistoryItem = (id: string) => {
  return useQuery({
    queryKey: [LOAD_HISTORY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: LoadHistory }>(
        `/operations/load-history/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useLoadHistoryByCarrier = (carrierId: string) => {
  return useQuery({
    queryKey: [LOAD_HISTORY_KEY, 'carrier', carrierId],
    queryFn: async () => {
      const response = await apiClient.get<{ data: LoadHistory[] }>(
        `/operations/load-history/carrier/${carrierId}`
      );
      return response.data;
    },
    enabled: !!carrierId,
  });
};

export const useSimilarLoads = (params: SimilarLoadsParams) => {
  return useQuery({
    queryKey: [LOAD_HISTORY_KEY, 'similar', params],
    queryFn: async () => {
      // Ensure numeric fields are numbers and valid
      const queryParams: Record<string, string | number | boolean | undefined> = {};
      
      if (params.originState) queryParams.originState = params.originState;
      if (params.destinationState) queryParams.destinationState = params.destinationState;
      
      const weight = Number(params.weightLbs);
      if (!isNaN(weight) && weight > 0) queryParams.weightLbs = weight;
      
      const length = Number(params.lengthIn);
      if (!isNaN(length) && length > 0) queryParams.lengthIn = length;
      
      const width = Number(params.widthIn);
      if (!isNaN(width) && width > 0) queryParams.widthIn = width;
      
      const height = Number(params.heightIn);
      if (!isNaN(height) && height > 0) queryParams.heightIn = height;
      
      const response = await apiClient.get<{ data: LoadHistory[] }>(
        '/operations/load-history/similar',
        queryParams
      );
      return response.data;
    },
    enabled: !!(
      params.originState &&
      params.destinationState &&
      params.weightLbs &&
      params.lengthIn &&
      params.widthIn &&
      params.heightIn
    ),
  });
};

export const useLoadHistoryStats = () => {
  return useQuery({
    queryKey: [LOAD_HISTORY_KEY, 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<{
        data: {
          totalLoads: number;
          completedLoads: number;
          totalRevenueCents: number;
          totalCostCents: number;
          totalMarginCents: number;
        };
      }>('/operations/load-history/stats');
      return response.data;
    },
  });
};

export const useLaneStats = (originState: string, destinationState: string) => {
  return useQuery({
    queryKey: [LOAD_HISTORY_KEY, 'lane-stats', originState, destinationState],
    queryFn: async () => {
      const response = await apiClient.get<{ data: LaneStats }>(
        `/operations/load-history/lane-stats/${originState}/${destinationState}`
      );
      return response.data;
    },
    enabled: !!originState && !!destinationState,
  });
};

export const useCreateLoadHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<LoadHistory>) => {
      const response = await apiClient.post<{ data: LoadHistory }>(
        '/operations/load-history',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LOAD_HISTORY_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [LOAD_HISTORY_KEY, 'stats'],
      });
    },
  });
};

export const useUpdateLoadHistory = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<LoadHistory>) => {
      const response = await apiClient.patch<{ data: LoadHistory }>(
        `/operations/load-history/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LOAD_HISTORY_KEY, id],
      });
      queryClient.invalidateQueries({
        queryKey: [LOAD_HISTORY_KEY, 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: [LOAD_HISTORY_KEY, 'stats'],
      });
    },
  });
};

export const useDeleteLoadHistory = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deleteId?: string) => {
      const targetId = deleteId || id;
      if (!targetId) throw new Error('Load History ID is required for deletion');
      await apiClient.delete(`/operations/load-history/${targetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [LOAD_HISTORY_KEY, id],
      });
      queryClient.invalidateQueries({
        queryKey: [LOAD_HISTORY_KEY, 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: [LOAD_HISTORY_KEY, 'stats'],
      });
    },
  });
};
