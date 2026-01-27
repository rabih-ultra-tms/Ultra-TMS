import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  OperationsCarrier,
  OperationsCarrierListItem,
  OperationsCarrierDriver,
  OperationsCarrierTruck,
  CarrierListParams,
} from '@/types/carriers';
import { apiClient } from '@/lib/api-client';

const CARRIERS_KEY = 'carriers';

// ============================================================================
// CARRIER QUERIES & MUTATIONS
// ============================================================================

export const useCarriers = (params: CarrierListParams) => {
  return useQuery({
    queryKey: [CARRIERS_KEY, 'list', params],
    queryFn: async () => {
      const response = await apiClient.get<{
        data: OperationsCarrierListItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>('/operations/carriers', { params });
      return response.data;
    },
  });
};

export const useCarrier = (id: string) => {
  return useQuery({
    queryKey: [CARRIERS_KEY, id],
    queryFn: async () => {
      const response = await apiClient.get<OperationsCarrier>(
        `/operations/carriers/${id}`
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OperationsCarrier>) => {
      const response = await apiClient.post<OperationsCarrier>(
        '/operations/carriers',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY],
      });
    },
  });
};

export const useUpdateCarrier = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OperationsCarrier>) => {
      const response = await apiClient.patch<OperationsCarrier>(
        `/operations/carriers/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, id],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, 'list'],
      });
    },
  });
};

export const useDeleteCarrier = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deleteId?: string) => {
      const targetId = deleteId || id;
      if (!targetId) throw new Error('Carrier ID is required for deletion');
      await apiClient.delete(`/operations/carriers/${targetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, id],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, 'list'],
      });
    },
  });
};

// ============================================================================
// DRIVER QUERIES & MUTATIONS
// ============================================================================

export const useCarrierDrivers = (carrierId: string) => {
  return useQuery({
    queryKey: [CARRIERS_KEY, carrierId, 'drivers'],
    queryFn: async () => {
      const response = await apiClient.get<OperationsCarrierDriver[]>(
        `/operations/carriers/${carrierId}/drivers`
      );
      return response.data;
    },
    enabled: !!carrierId,
  });
};

export const useCarrierDriver = (carrierId: string, driverId: string) => {
  return useQuery({
    queryKey: [CARRIERS_KEY, carrierId, 'drivers', driverId],
    queryFn: async () => {
      const response = await apiClient.get<OperationsCarrierDriver>(
        `/operations/carriers/${carrierId}/drivers/${driverId}`
      );
      return response.data;
    },
    enabled: !!carrierId && !!driverId,
  });
};

export const useCreateDriver = (carrierId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OperationsCarrierDriver>) => {
      const response = await apiClient.post<OperationsCarrierDriver>(
        `/operations/carriers/${carrierId}/drivers`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'drivers'],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId],
      });
    },
  });
};

export const useUpdateDriver = (carrierId: string, driverId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OperationsCarrierDriver>) => {
      const response = await apiClient.patch<OperationsCarrierDriver>(
        `/operations/carriers/${carrierId}/drivers/${driverId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'drivers', driverId],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'drivers'],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId],
      });
    },
  });
};

export const useDeleteDriver = (carrierId: string, driverId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(
        `/operations/carriers/${carrierId}/drivers/${driverId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'drivers', driverId],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'drivers'],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId],
      });
    },
  });
};

// ============================================================================
// TRUCK QUERIES & MUTATIONS
// ============================================================================

export const useCarrierTrucks = (carrierId: string) => {
  return useQuery({
    queryKey: [CARRIERS_KEY, carrierId, 'trucks'],
    queryFn: async () => {
      const response = await apiClient.get<OperationsCarrierTruck[]>(
        `/operations/carriers/${carrierId}/trucks`
      );
      return response.data;
    },
    enabled: !!carrierId,
  });
};

export const useCarrierTruck = (carrierId: string, truckId: string) => {
  return useQuery({
    queryKey: [CARRIERS_KEY, carrierId, 'trucks', truckId],
    queryFn: async () => {
      const response = await apiClient.get<OperationsCarrierTruck>(
        `/operations/carriers/${carrierId}/trucks/${truckId}`
      );
      return response.data;
    },
    enabled: !!carrierId && !!truckId,
  });
};

export const useCreateTruck = (carrierId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OperationsCarrierTruck>) => {
      const response = await apiClient.post<OperationsCarrierTruck>(
        `/operations/carriers/${carrierId}/trucks`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'trucks'],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId],
      });
    },
  });
};

export const useUpdateTruck = (carrierId: string, truckId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OperationsCarrierTruck>) => {
      const response = await apiClient.patch<OperationsCarrierTruck>(
        `/operations/carriers/${carrierId}/trucks/${truckId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'trucks', truckId],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'trucks'],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId],
      });
    },
  });
};

export const useAssignDriverToTruck = (carrierId: string, truckId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverId: string) => {
      const response = await apiClient.patch<OperationsCarrierTruck>(
        `/operations/carriers/${carrierId}/trucks/${truckId}/assign-driver/${driverId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'trucks', truckId],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'trucks'],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId],
      });
    },
  });
};

export const useDeleteTruck = (carrierId: string, truckId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.delete(
        `/operations/carriers/${carrierId}/trucks/${truckId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'trucks', truckId],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId, 'trucks'],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, carrierId],
      });
    },
  });
};
