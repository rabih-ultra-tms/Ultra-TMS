import { useQuery } from '@tanstack/react-query';
import { TruckType } from '@/types/truck-types';
import { apiClient } from '@/lib/api-client';

const TRUCK_TYPES_KEY = 'truck-types';

export const useTruckTypes = (category?: string) => {
  return useQuery({
    queryKey: [TRUCK_TYPES_KEY, 'list', category],
    queryFn: async () => {
      const response = await apiClient.get<TruckType[]>(
        '/operations/truck-types',
        { params: category ? { category } : undefined }
      );
      return response.data;
    },
  });
};

export const useTruckType = (id: string) => {
  return useQuery({
    queryKey: [TRUCK_TYPES_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<TruckType>(
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
      return response.data;
    },
  });
};
