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
  return useQuery({
    queryKey: [LOAD_HISTORY_KEY, 'list', params],
    queryFn: async () => {
      const response = await apiClient.get<LoadHistoryListResponse>(
        '/operations/load-history',
        { params }
      );
      return response.data;
    },
  });
};

export const useLoadHistoryItem = (id: string) => {
  return useQuery({
    queryKey: [LOAD_HISTORY_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<LoadHistory>(
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
      const response = await apiClient.get<LoadHistory[]>(
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
      const response = await apiClient.get<LoadHistory[]>(
        '/operations/load-history/similar',
        { params }
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
        totalLoads: number;
        completedLoads: number;
        totalRevenueCents: number;
        totalCostCents: number;
        totalMarginCents: number;
      }>('/operations/load-history/stats');
      return response.data;
    },
  });
};

export const useLaneStats = (originState: string, destinationState: string) => {
  return useQuery({
    queryKey: [LOAD_HISTORY_KEY, 'lane-stats', originState, destinationState],
    queryFn: async () => {
      const response = await apiClient.get<LaneStats>(
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
      const response = await apiClient.post<LoadHistory>(
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
      const response = await apiClient.patch<LoadHistory>(
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
