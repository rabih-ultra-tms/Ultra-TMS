import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface CheckCall {
  id: string;
  loadId: string;
  loadNumber: string;
  type: 'CHECK_CALL' | 'ARRIVAL' | 'DEPARTURE' | 'DELAY' | 'ISSUE';
  calledAt: string;
  city: string;
  state: string;
  locationDescription: string;
  lat: number | null;
  lng: number | null;
  gpsSource: 'GPS' | 'MANUAL';
  etaToNextStop: string | null;
  notes: string;
  calledBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  source: 'MANUAL' | 'AUTO' | 'WEBSOCKET';
  statusAtTime: string;
  stopId?: string;
  nextCheckCallAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCheckCallData {
  loadId: string;
  type: 'CHECK_CALL' | 'ARRIVAL' | 'DEPARTURE' | 'DELAY' | 'ISSUE';
  city: string;
  state: string;
  locationDescription?: string;
  lat?: number;
  lng?: number;
  gpsSource?: 'GPS' | 'MANUAL';
  etaToNextStop?: string;
  notes?: string;
  calledAt?: string;
  stopId?: string;
  nextCheckCallAt?: string;
}

export interface OverdueCheckCall {
  loadId: string;
  loadNumber: string;
  carrierName: string;
  driverName: string;
  lastCheckCallAt: string | null;
  hoursOverdue: number;
  status: string;
}

export function useCheckCalls(loadId: string) {
  return useQuery({
    queryKey: ['checkcalls', loadId],
    queryFn: async () => {
      // apiClient baseUrl = http://localhost:3001/api/v1 — use relative paths only
      // Backend: GET /api/v1/loads/:id/check-calls (with hyphen)
      const response = await apiClient.get<{ data: CheckCall[] }>(`/loads/${loadId}/check-calls`);
      const body = response as Record<string, unknown>;
      return (body.data ?? response) as CheckCall[];
    },
    enabled: !!loadId,
    staleTime: 30000,
  });
}

export function useCreateCheckCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCheckCallData) => {
      // Backend: POST /api/v1/loads/:id/check-calls
      const response = await apiClient.post<{ data: CheckCall }>(`/loads/${data.loadId}/check-calls`, data);
      const body = response as Record<string, unknown>;
      return (body.data ?? response) as CheckCall;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkcalls', variables.loadId] });
      queryClient.invalidateQueries({ queryKey: ['check-calls', variables.loadId] });
      queryClient.invalidateQueries({ queryKey: ['load', variables.loadId] });
    },
  });
}

// Note: No standalone /checkcalls/overdue endpoint exists on the backend.
// Overdue check call data should be derived client-side from load data.
export function useOverdueCheckCalls() {
  return useQuery({
    queryKey: ['overdue-checkcalls'],
    queryFn: async (): Promise<OverdueCheckCall[]> => {
      return [];
    },
    staleTime: 30000,
    enabled: false, // Disabled until backend endpoint exists
  });
}

// Note: No standalone /checkcalls/stats endpoint exists on the backend.
export function useCheckCallStats(_filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['checkcall-stats'],
    queryFn: async () => {
      return {
        totalToday: 0,
        overdue: 0,
        onTimePercentage: 0,
        autoRate: 0,
      };
    },
    staleTime: 60000,
    enabled: false, // Disabled until backend endpoint exists
  });
}
