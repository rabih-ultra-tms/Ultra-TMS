import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export interface TenantService {
  id: string;
  tenantId: string;
  serviceKey: string;
  enabled: boolean;
  displayOrder: number;
}

const TENANT_SERVICES_KEY = 'tenant-services';

export const useTenantServices = () => {
  return useQuery({
    queryKey: [TENANT_SERVICES_KEY],
    queryFn: async () => {
      const response = await apiClient.get<{ data: TenantService[] }>(
        '/tenant-services'
      );
      return response.data;
    },
  });
};

export const useEnabledServices = () => {
  return useQuery({
    queryKey: [TENANT_SERVICES_KEY, 'enabled'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: string[] }>(
        '/tenant-services/enabled'
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateTenantService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: { serviceKey: string; enabled: boolean }) => {
      const response = await apiClient.put<{ data: TenantService }>(
        '/tenant-services',
        dto
      );
      return response.data;
    },
    onSuccess: (_data, variables) => {
      toast.success(
        `${variables.serviceKey} ${variables.enabled ? 'enabled' : 'disabled'}`
      );
      queryClient.invalidateQueries({ queryKey: [TENANT_SERVICES_KEY] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update service');
    },
  });
};
