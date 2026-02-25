import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
      // Filter out undefined values and ensure page/limit are numbers
      const cleanParams: Record<string, string | number | boolean> = {
        page: Number(params.page) || 1,
        limit: Number(params.limit) || 10,
      };
      
      if (params.search) cleanParams.search = params.search;
      if (params.status) cleanParams.status = params.status;
      if (params.carrierType) cleanParams.carrierType = params.carrierType;
      if (params.state) cleanParams.state = params.state;
      if (params.sortBy) cleanParams.sortBy = params.sortBy;
      if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;
      
      const raw = await apiClient.get<unknown>('/operations/carriers', cleanParams);
      const r = raw as { data: OperationsCarrierListItem[]; pagination: { total: number; page: number; limit: number; totalPages: number } };
      return {
        data: r.data,
        total: r.pagination?.total ?? 0,
        page: r.pagination?.page ?? 1,
        limit: r.pagination?.limit ?? 10,
        totalPages: r.pagination?.totalPages ?? 1,
      };
    },
  });
};

export const useCarrier = (id: string) => {
  return useQuery({
    queryKey: [CARRIERS_KEY, id],
    queryFn: async () => {
      return await apiClient.get<OperationsCarrier>(
        `/operations/carriers/${id}`
      );
    },
    enabled: !!id,
  });
};

export const useCreateCarrier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OperationsCarrier>) => {
      const payload = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== '')
      );
      return await apiClient.post<OperationsCarrier>(
        '/operations/carriers',
        payload
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY],
      });
    },
  });
};

export const useUpdateCarrier = (id?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OperationsCarrier> & { id?: string }) => {
      const targetId = data.id || id;
      if (!targetId) throw new Error('Carrier ID is required for update');
      const { id: _, ...rest } = data;
      // Strip empty strings so @IsOptional() fields aren't sent as "" (which fails @IsEmail etc.)
      const updateData = Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== '')
      );
      return await apiClient.patch<OperationsCarrier>(
        `/operations/carriers/${targetId}`,
        updateData
      );
    },
    onSuccess: (_, variables) => {
      const targetId = variables.id || id;
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, targetId],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, 'list'],
      });
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, 'stats'],
      });
      toast.success('Carrier updated successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to update carrier', { description: error.message });
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
      queryClient.invalidateQueries({
        queryKey: [CARRIERS_KEY, 'stats'],
      });
    },
  });
};

// Carrier stats
export const useCarrierStats = () => {
  return useQuery({
    queryKey: [CARRIERS_KEY, 'stats'],
    queryFn: async () => {
      const raw = await apiClient.get<unknown>('/operations/carriers/stats');
      return (raw as { data: { total: number; byType: Record<string, number>; byStatus: Record<string, number> } }).data;
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
      return await apiClient.get<OperationsCarrierDriver[]>(
        `/operations/carriers/${carrierId}/drivers`
      );
    },
    enabled: !!carrierId,
  });
};

export const useCarrierDriver = (carrierId: string, driverId: string) => {
  return useQuery({
    queryKey: [CARRIERS_KEY, carrierId, 'drivers', driverId],
    queryFn: async () => {
      return await apiClient.get<OperationsCarrierDriver>(
        `/operations/carriers/${carrierId}/drivers/${driverId}`
      );
    },
    enabled: !!carrierId && !!driverId,
  });
};

export const useCreateDriver = (carrierId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OperationsCarrierDriver>) => {
      return await apiClient.post<OperationsCarrierDriver>(
        `/operations/carriers/${carrierId}/drivers`,
        data
      );
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
      return await apiClient.patch<OperationsCarrierDriver>(
        `/operations/carriers/${carrierId}/drivers/${driverId}`,
        data
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
      return await apiClient.get<OperationsCarrierTruck[]>(
        `/operations/carriers/${carrierId}/trucks`
      );
    },
    enabled: !!carrierId,
  });
};

export const useCarrierTruck = (carrierId: string, truckId: string) => {
  return useQuery({
    queryKey: [CARRIERS_KEY, carrierId, 'trucks', truckId],
    queryFn: async () => {
      return await apiClient.get<OperationsCarrierTruck>(
        `/operations/carriers/${carrierId}/trucks/${truckId}`
      );
    },
    enabled: !!carrierId && !!truckId,
  });
};

export const useCreateTruck = (carrierId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OperationsCarrierTruck>) => {
      return await apiClient.post<OperationsCarrierTruck>(
        `/operations/carriers/${carrierId}/trucks`,
        data
      );
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
      return await apiClient.patch<OperationsCarrierTruck>(
        `/operations/carriers/${carrierId}/trucks/${truckId}`,
        data
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

export const useAssignDriverToTruck = (carrierId: string, truckId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driverId: string) => {
      return await apiClient.patch<OperationsCarrierTruck>(
        `/operations/carriers/${carrierId}/trucks/${truckId}/assign-driver/${driverId}`
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
