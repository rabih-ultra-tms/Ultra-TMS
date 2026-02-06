import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface InlandServiceType {
  id: string;
  name: string;
  description?: string | null;
  defaultRateCents: number;
  billingUnit: string;
  sortOrder: number;
  isActive: boolean;
}

const INLAND_SERVICE_TYPES_KEY = 'inland-service-types';

export const useInlandServiceTypes = () => {
  return useQuery({
    queryKey: [INLAND_SERVICE_TYPES_KEY],
    queryFn: async () => {
      const response = await apiClient.get<{ data: InlandServiceType[] }>(
        '/operations/inland-service-types'
      );
      return response.data;
    },
  });
};
