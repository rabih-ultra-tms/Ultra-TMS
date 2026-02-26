/**
 * Dispatch Board Data Hooks
 *
 * React Query hooks for fetching and mutating dispatch board data.
 * Includes optimistic updates, error handling, and cache invalidation.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type {
  DispatchBoardData,
  DispatchBoardStats,
  DispatchFilters,
  DispatchLoad,
  DispatchStop,
  EquipmentType,
  KanbanLane,
  LoadStatus,
  MutationError,
  SortConfig,
} from '@/lib/types/dispatch';
import { STATUS_TO_LANE } from '@/lib/types/dispatch';

/**
 * Query keys for dispatch board data
 */
export const dispatchKeys = {
  all: ['dispatch'] as const,
  board: (filters?: DispatchFilters) => ['dispatch', 'board', filters] as const,
  stats: (filters?: DispatchFilters) => ['dispatch', 'stats', filters] as const,
  load: (id: number) => ['dispatch', 'load', id] as const,
};

/**
 * Transform API response to grouped board data
 */
function transformToBoardData(
  loads: DispatchLoad[],
  sortConfig?: SortConfig
): DispatchBoardData {
  // Group loads by lane
  const loadsByLane: Record<KanbanLane, DispatchLoad[]> = {
    UNASSIGNED: [],
    TENDERED: [],
    DISPATCHED: [],
    IN_TRANSIT: [],
    DELIVERED: [],
    COMPLETED: [],
  };

  loads.forEach((load) => {
    const lane = STATUS_TO_LANE[load.status] ?? 'UNASSIGNED';
    loadsByLane[lane].push(load);
  });

  // Sort loads within each lane
  if (sortConfig) {
    Object.keys(loadsByLane).forEach((lane) => {
      loadsByLane[lane as KanbanLane] = sortLoads(
        loadsByLane[lane as KanbanLane],
        sortConfig
      );
    });
  }

  // Calculate stats
  const stats: DispatchBoardStats = {
    unassigned: loadsByLane.UNASSIGNED.length,
    tendered: loadsByLane.TENDERED.length,
    dispatched: loadsByLane.DISPATCHED.length,
    inTransit: loadsByLane.IN_TRANSIT.length,
    atStop: loads.filter((l) => ['AT_PICKUP', 'AT_DELIVERY'].includes(l.status)).length,
    deliveredToday: loadsByLane.DELIVERED.filter((l) => {
      const deliveryDate = l.stops.find((s) => s.type === 'DELIVERY')?.appointmentDate;
      return deliveryDate === new Date().toISOString().split('T')[0];
    }).length,
    totalActive: loads.filter((l) => !['COMPLETED', 'CANCELLED'].includes(l.status)).length,
    atRisk: loads.filter((l) => {
      if (l.hasExceptions) return true;
      const staleThreshold = 4 * 60 * 60 * 1000; // 4 hours
      const age = Date.now() - new Date(l.statusChangedAt).getTime();
      return age > staleThreshold && ['PENDING', 'IN_TRANSIT'].includes(l.status);
    }).length,
  };

  return { loads, loadsByLane, stats };
}

/**
 * Sort loads within a lane
 */
function sortLoads(loads: DispatchLoad[], sortConfig: SortConfig): DispatchLoad[] {
  const { field, direction } = sortConfig;

  return [...loads].sort((a, b) => {
    let aVal: string | number | undefined;
    let bVal: string | number | undefined;

    switch (field) {
      case 'pickupDate':
        aVal = a.stops.find((s) => s.type === 'PICKUP')?.appointmentDate || '';
        bVal = b.stops.find((s) => s.type === 'PICKUP')?.appointmentDate || '';
        break;
      case 'loadAge':
        aVal = new Date(a.statusChangedAt).getTime();
        bVal = new Date(b.statusChangedAt).getTime();
        break;
      case 'margin':
        aVal = a.customerRate && a.carrierRate ? a.customerRate - a.carrierRate : 0;
        bVal = b.customerRate && b.carrierRate ? b.customerRate - b.carrierRate : 0;
        break;
      case 'customerRate':
        aVal = a.customerRate || 0;
        bVal = b.customerRate || 0;
        break;
      case 'customerName':
        aVal = a.customer.name;
        bVal = b.customer.name;
        break;
    }

    if (aVal === undefined || bVal === undefined) return 0;

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Build query string from filters
 */
function buildQueryString(filters?: DispatchFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  if (filters.statuses?.length) {
    filters.statuses.forEach((s) => params.append('status', s));
  }
  if (filters.equipmentTypes?.length) {
    filters.equipmentTypes.forEach((e) => params.append('equipment', e));
  }
  if (filters.carrierId) params.append('carrierId', filters.carrierId.toString());
  if (filters.customerId) params.append('customerId', filters.customerId.toString());
  if (filters.originState?.length) {
    filters.originState.forEach((s) => params.append('originState', s));
  }
  if (filters.destState?.length) {
    filters.destState.forEach((s) => params.append('destState', s));
  }
  if (filters.dispatcherId) params.append('dispatcherId', filters.dispatcherId.toString());
  if (filters.priorities?.length) {
    filters.priorities.forEach((p) => params.append('priority', p));
  }
  if (filters.search) params.append('search', filters.search);

  return params.toString();
}

// Helper to unwrap { data: T } envelope from apiClient responses
function unwrap<T>(response: unknown): T {
  const body = response as Record<string, unknown>;
  return (body.data ?? response) as T;
}

/**
 * Raw load shape returned by the backend GET /loads/board.
 * Stops and customer are nested inside `order`.
 * Carrier uses `legalName` instead of `name`.
 */
interface RawBoardLoad {
  id: string;
  loadNumber: string;
  status: string;
  equipmentType?: string;
  carrierRate?: string | number | null;
  createdAt: string;
  updatedAt: string;
  dispatchedAt?: string | null;
  order?: {
    customerRate?: string | number | null;
    customer?: { id: string; name: string };
    stops?: Array<{
      id: string;
      stopType: string;
      city: string;
      state: string;
      appointmentDate?: string | null;
      status: string;
    }>;
  } | null;
  carrier?: { id: string; legalName: string; mcNumber?: string } | null;
}

/** Parse a rate field (Decimal string, number, null, or Prisma Decimal object) to a finite number > 0 or undefined */
function toRate(val: unknown): number | undefined {
  if (val == null) return undefined;
  const n = Number(val);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Map raw backend board load to the DispatchLoad shape expected by the UI */
function normalizeLoad(raw: RawBoardLoad): DispatchLoad {
  const stops: DispatchLoad['stops'] = (raw.order?.stops ?? []).map((s) => ({
    id: s.id as unknown as number,
    type: (s.stopType === 'PICKUP' ? 'PICKUP' : 'DELIVERY') as 'PICKUP' | 'DELIVERY',
    city: s.city,
    state: s.state,
    appointmentDate: s.appointmentDate ? new Date(s.appointmentDate).toISOString().split('T')[0]! : '',
    status: (s.status as DispatchStop['status']) ?? 'PENDING',
  }));

  return {
    id: raw.id as unknown as number,
    loadNumber: raw.loadNumber,
    status: (raw.status as LoadStatus) ?? 'PENDING',
    equipmentType: (raw.equipmentType as EquipmentType) ?? 'DRY_VAN',
    isHotLoad: false,
    hasExceptions: false,
    customer: raw.order?.customer
      ? { id: raw.order.customer.id as unknown as number, name: raw.order.customer.name }
      : { id: 0, name: 'Unknown' },
    carrier: raw.carrier
      ? { id: raw.carrier.id as unknown as number, name: raw.carrier.legalName, mcNumber: raw.carrier.mcNumber }
      : undefined,
    stops,
    customerRate: toRate(raw.order?.customerRate),
    carrierRate: toRate(raw.carrierRate),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    statusChangedAt: raw.dispatchedAt ?? raw.updatedAt,
  };
}

/**
 * Fetch dispatch board loads
 * Note: Backend GET /loads/board only supports ?status= and ?region= query params.
 * Other filter params (date, equipment, carrier, etc.) are sent but silently ignored by backend.
 */
export function useDispatchLoads(
  filters?: DispatchFilters,
  sortConfig?: SortConfig,
  options?: {
    refetchInterval?: number;
    enabled?: boolean;
  }
) {
  return useQuery({
    queryKey: [...dispatchKeys.board(filters), sortConfig],
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      // apiClient already prepends /api/v1 — don't duplicate it
      const url = `/loads/board${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get(url);
      // Backend returns { data: { total, byStatus, loads } } — extract the loads array
      const body = unwrap<{ total: number; byStatus: Record<string, RawBoardLoad[]>; loads: RawBoardLoad[] }>(response);
      const loads = (body.loads ?? []).map(normalizeLoad);
      return transformToBoardData(loads, sortConfig);
    },
    refetchInterval: options?.refetchInterval ?? 30000,
    enabled: options?.enabled !== false,
    staleTime: 10000,
  });
}

/**
 * Fetch dispatch board stats — computed from board data since no separate stats endpoint exists
 */
export function useDispatchBoardStats(filters?: DispatchFilters) {
  return useQuery({
    queryKey: dispatchKeys.stats(filters),
    queryFn: async () => {
      const queryString = buildQueryString(filters);
      const url = `/loads/board${queryString ? `?${queryString}` : ''}`;
      const response = await apiClient.get(url);
      // Backend returns { data: { total, byStatus, loads } } — extract the loads array
      const body = unwrap<{ total: number; byStatus: Record<string, RawBoardLoad[]>; loads: RawBoardLoad[] }>(response);
      const board = transformToBoardData((body.loads ?? []).map(normalizeLoad));
      return board.stats;
    },
    refetchInterval: 30000,
    staleTime: 10000,
  });
}

/**
 * Fetch single load detail
 */
export function useDispatchLoad(loadId: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: dispatchKeys.load(loadId),
    queryFn: async () => {
      const response = await apiClient.get(`/loads/${loadId}`);
      return unwrap<DispatchLoad>(response);
    },
    enabled: options?.enabled !== false && loadId > 0,
    staleTime: 5000,
  });
}

/**
 * Update load status with optimistic updates
 */
export function useUpdateLoadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loadId,
      newStatus,
      reason,
    }: {
      loadId: number;
      newStatus: LoadStatus;
      reason?: string;
    }) => {
      const response = await apiClient.patch(`/loads/${loadId}/status`, {
        status: newStatus,
        reason,
      });
      return unwrap<DispatchLoad>(response);
    },

    // Optimistic update
    onMutate: async ({ loadId, newStatus }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: dispatchKeys.all });

      // Snapshot previous value
      const previousBoards = queryClient.getQueriesData({
        queryKey: ['dispatch', 'board'],
      });

      // Optimistically update all board queries
      queryClient.setQueriesData<DispatchBoardData>(
        { queryKey: ['dispatch', 'board'] },
        (old) => {
          if (!old) return old;

          const updatedLoads = old.loads.map((load) =>
            load.id === loadId
              ? {
                  ...load,
                  status: newStatus,
                  statusChangedAt: new Date().toISOString(),
                }
              : load
          );

          return transformToBoardData(updatedLoads);
        }
      );

      // Update single load query if it exists
      queryClient.setQueryData<DispatchLoad>(dispatchKeys.load(loadId), (old) => {
        if (!old) return old;
        return {
          ...old,
          status: newStatus,
          statusChangedAt: new Date().toISOString(),
        };
      });

      return { previousBoards };
    },

    // Rollback on error
    onError: (error: MutationError, variables, context) => {
      if (context?.previousBoards) {
        context.previousBoards.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    // Refetch on success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
}

/**
 * Assign carrier to load
 */
export function useAssignCarrier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loadId,
      carrierId,
      driverId,
    }: {
      loadId: number;
      carrierId: number;
      driverId?: number;
    }) => {
      // Backend uses @Patch(':id/assign')
      const response = await apiClient.patch(`/loads/${loadId}/assign`, {
        carrierId,
        driverId,
      });
      return unwrap<DispatchLoad>(response);
    },

    // Optimistic update
    onMutate: async ({ loadId, carrierId }) => {
      await queryClient.cancelQueries({ queryKey: dispatchKeys.all });

      const previousBoards = queryClient.getQueriesData({
        queryKey: ['dispatch', 'board'],
      });

      // We don't have full carrier data for optimistic update
      // Just mark that it has a carrier
      queryClient.setQueriesData<DispatchBoardData>(
        { queryKey: ['dispatch', 'board'] },
        (old) => {
          if (!old) return old;

          const updatedLoads = old.loads.map((load) =>
            load.id === loadId
              ? {
                  ...load,
                  carrier: { id: carrierId, name: 'Assigning...' },
                  updatedAt: new Date().toISOString(),
                }
              : load
          );

          return transformToBoardData(updatedLoads);
        }
      );

      return { previousBoards };
    },

    onError: (error: MutationError, variables, context) => {
      if (context?.previousBoards) {
        context.previousBoards.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
}

/**
 * Dispatch load (send to carrier)
 */
export function useSendDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loadId }: { loadId: number }) => {
      // Backend uses @Patch(':id/dispatch')
      const response = await apiClient.patch(`/loads/${loadId}/dispatch`, {});
      return unwrap<DispatchLoad>(response);
    },

    // Optimistic update to DISPATCHED status
    onMutate: async ({ loadId }) => {
      await queryClient.cancelQueries({ queryKey: dispatchKeys.all });

      const previousBoards = queryClient.getQueriesData({
        queryKey: ['dispatch', 'board'],
      });

      queryClient.setQueriesData<DispatchBoardData>(
        { queryKey: ['dispatch', 'board'] },
        (old) => {
          if (!old) return old;

          const updatedLoads = old.loads.map((load) =>
            load.id === loadId
              ? {
                  ...load,
                  status: 'DISPATCHED' as LoadStatus,
                  statusChangedAt: new Date().toISOString(),
                }
              : load
          );

          return transformToBoardData(updatedLoads);
        }
      );

      return { previousBoards };
    },

    onError: (error: MutationError, variables, context) => {
      if (context?.previousBoards) {
        context.previousBoards.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
}

/**
 * Bulk status update — no backend bulk endpoint exists, so we loop over individual PATCH /loads/:id/status calls
 */
export function useBulkStatusUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loadIds,
      newStatus,
    }: {
      loadIds: number[];
      newStatus: LoadStatus;
    }) => {
      const results = await Promise.allSettled(
        loadIds.map((id) =>
          apiClient.patch(`/loads/${id}/status`, { status: newStatus })
        )
      );
      const updated = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { updated, failed };
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
}

/**
 * Bulk dispatch — no backend bulk endpoint exists, so we loop over individual PATCH /loads/:id/dispatch calls
 */
export function useBulkDispatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ loadIds }: { loadIds: number[] }) => {
      const results = await Promise.allSettled(
        loadIds.map((id) =>
          apiClient.patch(`/loads/${id}/dispatch`, {})
        )
      );
      const dispatched = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      return { dispatched, failed };
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.all });
    },
  });
}

/**
 * Update load ETA via the stops endpoint (PUT /orders/:orderId/stops/:stopId).
 * Updates the stop's appointmentDate to reflect the new ETA.
 */
export function useUpdateLoadEta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      loadId: _loadId,
      stopId,
      newEta,
      reason,
    }: {
      loadId: number;
      stopId: number;
      newEta: string;
      reason?: string;
    }) => {
      const response = await apiClient.put(`/stops/${stopId}`, {
        appointmentDate: newEta,
        notes: reason ? `ETA updated: ${reason}` : undefined,
      });
      return unwrap<DispatchLoad>(response);
    },

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: dispatchKeys.load(variables.loadId) });
      queryClient.invalidateQueries({ queryKey: ['dispatch', 'board'] });
    },

    onError: () => {
      // Errors are handled by the apiClient (throws ApiError)
      // The consuming component should use the mutation's error state
    },
  });
}
