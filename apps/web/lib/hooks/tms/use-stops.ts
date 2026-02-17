import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export type StopType = 'PICKUP' | 'DELIVERY' | 'STOP';

export type StopStatus =
  | 'PENDING'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'LOADING'
  | 'LOADED'
  | 'UNLOADING'
  | 'UNLOADED'
  | 'DEPARTED'
  | 'SKIPPED';

export interface Stop {
  id: string;
  orderId: string;
  loadId: string;
  sequenceNumber: number;
  stopType: StopType;
  status: StopStatus;
  facilityName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  contactName?: string;
  contactPhone?: string;
  appointmentDate?: string;
  appointmentTimeFrom?: string;
  appointmentTimeTo?: string;
  arrivedAt?: string;
  departedAt?: string;
  weight?: number;
  pieces?: number;
  pallets?: number;
  referenceNumber?: string;
  bolNumber?: string;
  instructions?: string;
  freeTimeMinutes?: number;
  detentionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StopDetention {
  stopId: string;
  dwellTimeMinutes: number;
  freeTimeMinutes: number;
  detentionMinutes: number;
  detentionHours: number;
  billableHours: number;
  detentionRate: number;
  detentionCharge: number;
}

export interface ReorderStopsRequest {
  orderId: string;
  stopIds: string[];
}

// Helper to unwrap { data: T } envelope from apiClient responses
function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

// Backend route: GET /api/v1/orders/:orderId/stops
export function useStops(orderId: string) {
  return useQuery<Stop[]>({
    queryKey: ['orders', orderId, 'stops'],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${orderId}/stops`);
      return unwrap<Stop[]>(response);
    },
    enabled: !!orderId,
    staleTime: 30000,
  });
}

// Backend route: GET /api/v1/orders/:orderId/stops/:id
export function useStop(orderId: string, stopId: string) {
  return useQuery<Stop>({
    queryKey: ['orders', orderId, 'stops', stopId],
    queryFn: async () => {
      const response = await apiClient.get(`/orders/${orderId}/stops/${stopId}`);
      return unwrap<Stop>(response);
    },
    enabled: !!orderId && !!stopId,
    staleTime: 60000,
  });
}

// Note: No standalone detention endpoint exists on the backend.
// Detention data should be derived client-side from stop arrival/departure times.
export function useStopDetention(stopId: string) {
  return useQuery<StopDetention>({
    queryKey: ['stops', stopId, 'detention'],
    queryFn: async (): Promise<StopDetention> => {
      return {
        stopId,
        dwellTimeMinutes: 0,
        freeTimeMinutes: 0,
        detentionMinutes: 0,
        detentionHours: 0,
        billableHours: 0,
        detentionRate: 0,
        detentionCharge: 0,
      };
    },
    enabled: false, // Disabled until backend endpoint exists
    staleTime: 30000,
  });
}

// Backend route: POST /api/v1/orders/:orderId/stops/:id/arrive
export function useMarkArrived() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stopId, orderId }: { stopId: string; orderId: string }) => {
      const response = await apiClient.post(`/orders/${orderId}/stops/${stopId}/arrive`, {
        arrivedAt: new Date().toISOString(),
      });
      return unwrap<Stop>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId, 'stops'] });
      toast.success('Stop marked as arrived');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark stop as arrived');
    },
  });
}

// Backend route: POST /api/v1/orders/:orderId/stops/:id/depart
export function useMarkDeparted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stopId, orderId }: { stopId: string; orderId: string }) => {
      const response = await apiClient.post(`/orders/${orderId}/stops/${stopId}/depart`, {
        departedAt: new Date().toISOString(),
      });
      return unwrap<Stop>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId, 'stops'] });
      toast.success('Stop marked as departed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark stop as departed');
    },
  });
}

// Backend route: PUT /api/v1/orders/:orderId/stops/:id
export function useUpdateStopStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stopId,
      orderId,
      status,
    }: {
      stopId: string;
      orderId: string;
      status: StopStatus;
    }) => {
      const response = await apiClient.put(`/orders/${orderId}/stops/${stopId}`, { status });
      return unwrap<Stop>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId, 'stops'] });
      toast.success('Stop status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update stop status');
    },
  });
}

// Backend route: POST /api/v1/orders/:orderId/stops
export function useCreateStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, ...stopData }: Partial<Stop> & { orderId: string }) => {
      const response = await apiClient.post(`/orders/${orderId}/stops`, stopData);
      return unwrap<Stop>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId, 'stops'] });
      toast.success('Stop created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create stop');
    },
  });
}

// Backend route: PUT /api/v1/orders/:orderId/stops/:id
export function useUpdateStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      stopId,
      orderId,
      data,
    }: {
      stopId: string;
      orderId: string;
      data: Partial<Stop>;
    }) => {
      const response = await apiClient.put(`/orders/${orderId}/stops/${stopId}`, data);
      return unwrap<Stop>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId, 'stops'] });
      toast.success('Stop updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update stop');
    },
  });
}

// Backend route: DELETE /api/v1/orders/:orderId/stops/:id
export function useDeleteStop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stopId, orderId }: { stopId: string; orderId: string }) => {
      await apiClient.delete(`/orders/${orderId}/stops/${stopId}`);
      return { stopId, orderId };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId, 'stops'] });
      toast.success('Stop deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete stop');
    },
  });
}

// Backend route: PUT /api/v1/orders/:orderId/stops/reorder
export function useReorderStops() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, stopIds }: ReorderStopsRequest) => {
      const response = await apiClient.put(`/orders/${orderId}/stops/reorder`, { stopIds });
      return unwrap<Stop[]>(response);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId, 'stops'] });
      toast.success('Stops reordered successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reorder stops');
    },
  });
}
