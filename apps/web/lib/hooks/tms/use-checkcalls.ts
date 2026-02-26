import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
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
      const response = await apiClient.get<{ data: CheckCall[] }>(`/loads/${loadId}/check-calls`);
      const body = response as Record<string, unknown>;
      const raw = (body.data ?? response) as Array<Record<string, unknown>>;

      // Map backend field names → frontend CheckCall interface
      return raw.map((cc): CheckCall => {
        const calledByRaw = cc.calledBy as Record<string, unknown> | undefined;
        const createdByRaw = cc.createdBy as Record<string, unknown> | undefined;
        return {
          id: String(cc.id ?? ''),
          loadId: String(cc.loadId ?? ''),
          loadNumber: String(cc.loadNumber ?? ''),
          // backend stores form "type" as "status"
          type: (cc.type ?? cc.status ?? 'CHECK_CALL') as CheckCall['type'],
          // backend uses createdAt (set from timestamp), frontend expects calledAt
          calledAt: String(cc.calledAt ?? cc.createdAt ?? new Date().toISOString()),
          city: String(cc.city ?? ''),
          state: String(cc.state ?? ''),
          locationDescription: String(cc.locationDescription ?? cc.location ?? ''),
          lat: typeof cc.latitude === 'number' ? cc.latitude : typeof cc.lat === 'number' ? cc.lat : null,
          lng: typeof cc.longitude === 'number' ? cc.longitude : typeof cc.lng === 'number' ? cc.lng : null,
          gpsSource: (cc.gpsSource ?? 'MANUAL') as 'GPS' | 'MANUAL',
          etaToNextStop: cc.eta ? String(cc.eta) : cc.etaToNextStop ? String(cc.etaToNextStop) : null,
          notes: String(cc.notes ?? ''),
          calledBy: {
            id: String(calledByRaw?.id ?? cc.createdById ?? ''),
            name: String(calledByRaw?.name ?? createdByRaw?.name ?? cc.createdById ?? 'System'),
          },
          source: (cc.source ?? 'MANUAL') as 'MANUAL' | 'AUTO' | 'WEBSOCKET',
          statusAtTime: String(cc.statusAtTime ?? ''),
          createdAt: String(cc.createdAt ?? new Date().toISOString()),
          updatedAt: String(cc.updatedAt ?? new Date().toISOString()),
        };
      });
    },
    enabled: !!loadId,
    staleTime: 30000,
  });
}

export function useCreateCheckCall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCheckCallData) => {
      // Map frontend shape → CreateCheckCallDto shape
      // loadId goes in the URL; forbidden fields (type, locationDescription, gpsSource) are remapped or dropped
      const payload: Record<string, unknown> = {
        timestamp: data.calledAt ?? new Date().toISOString(),
        status: data.type,          // form "type" = DTO "status"
        city: data.city,
        state: data.state,
        notes: data.notes,
        ...(data.locationDescription ? { location: data.locationDescription } : {}),
        ...(data.lat !== undefined ? { lat: data.lat } : {}),
        ...(data.lng !== undefined ? { lng: data.lng } : {}),
        ...(data.etaToNextStop ? { eta: data.etaToNextStop } : {}),
      };

      // Backend: POST /api/v1/loads/:id/check-calls
      const response = await apiClient.post<{ data: CheckCall }>(`/loads/${data.loadId}/check-calls`, payload);
      const body = response as Record<string, unknown>;
      return (body.data ?? response) as CheckCall;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checkcalls', variables.loadId] });
      queryClient.invalidateQueries({ queryKey: ['check-calls', variables.loadId] });
      queryClient.invalidateQueries({ queryKey: ['load', variables.loadId] });
      toast.success('Check call logged successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to log check call');
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
