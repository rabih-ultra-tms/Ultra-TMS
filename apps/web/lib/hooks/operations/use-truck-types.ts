import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  TruckType, 
  TruckTypeListResponse,
  CreateTruckTypeInput,
  UpdateTruckTypeInput,
  CategoryCountsResponse
} from '@/types/truck-types';
import { apiClient } from '@/lib/api-client';

const TRUCK_TYPES_KEY = 'truck-types';

interface TruckTypeListParams {
  category?: string;
  loadingMethod?: string;
  includeInactive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const useTruckTypes = (params?: TruckTypeListParams) => {
  const page = params?.page || 1;
  const limit = params?.limit || 100;
  
  return useQuery({
    queryKey: [TRUCK_TYPES_KEY, 'list', params],
    queryFn: async () => {
      const queryParams: Record<string, string | number | boolean> = {
        page,
        limit,
      };
      
      if (params?.category) queryParams.category = params.category;
      if (params?.loadingMethod) queryParams.loadingMethod = params.loadingMethod;
      if (params?.includeInactive !== undefined) queryParams.includeInactive = params.includeInactive;
      if (params?.search) queryParams.search = params.search;
      
      const response = await apiClient.get<TruckTypeListResponse>(
        '/operations/truck-types',
        queryParams
      );
      return response;
    },
  });
};

export const useTruckType = (id: string) => {
  return useQuery({
    queryKey: [TRUCK_TYPES_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<{ data: TruckType }>(
        `/operations/truck-types/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useTruckTypeCategories = () => {
  return useQuery({
    queryKey: [TRUCK_TYPES_KEY, 'categories'],
    queryFn: async () => {
      const response = await apiClient.get<string[]>(
        '/operations/truck-types/categories'
      );
      return response;
    },
  });
};

export const useCategoryCounts = () => {
  return useQuery({
    queryKey: [TRUCK_TYPES_KEY, 'category-counts'],
    queryFn: async () => {
      const response = await apiClient.get<CategoryCountsResponse>(
        '/operations/truck-types/category-counts'
      );
      return response;
    },
  });
};

export const useCreateTruckType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTruckTypeInput) => {
      const response = await apiClient.post<{ data: TruckType }>(
        '/operations/truck-types',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRUCK_TYPES_KEY] });
    },
  });
};

export const useUpdateTruckType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateTruckTypeInput) => {
      const { id, ...updateData } = data;
      const response = await apiClient.patch<{ data: TruckType }>(
        `/operations/truck-types/${id}`,
        updateData
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRUCK_TYPES_KEY] });
    },
  });
};

export const useDeleteTruckType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/operations/truck-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRUCK_TYPES_KEY] });
    },
  });
};

export const useRestoreTruckType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<{ data: TruckType }>(
        `/operations/truck-types/${id}/restore`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TRUCK_TYPES_KEY] });
    },
  });
};
