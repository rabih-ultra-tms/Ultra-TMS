/**
 * Tracking Map Data Hooks
 *
 * React Query for REST + WebSocket real-time position updates.
 * Namespace: /tracking
 * Polling fallback: 15s when WebSocket is disconnected.
 */

import { useEffect } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { useSocket } from '@/lib/socket/socket-provider'
import { SOCKET_EVENTS } from '@/lib/socket/socket-config'
import type { LoadLocationUpdatedEvent } from '@/lib/socket/socket-config'

// ─── Types ────────────────────────────────────────────────────────────────────

export type EtaStatus = 'on-time' | 'tight' | 'at-risk' | 'stale'

export interface TrackingPosition {
  loadId: string
  loadNumber: string
  lat: number
  lng: number
  heading: number
  speed: number
  timestamp: string
  status: string
  eta: string | null
  etaStatus: EtaStatus
  carrier: { id: string; name: string; mcNumber: string } | null
  driver: { name: string; phone: string } | null
  origin: string
  destination: string
  equipmentType: string
}

export interface TrackingFilters {
  etaStatus?: EtaStatus[]
  equipmentType?: string[]
  carrierId?: string
  customerId?: string
}

export interface TrackingStop {
  id: string
  sequence: number
  stopType: 'PICKUP' | 'DELIVERY'
  facilityName: string
  city: string
  state: string
  status: string
  appointmentTimeFrom: string | null
}

export interface TrackingLoadDetail {
  id: string
  loadNumber: string
  status: string
  eta: string | null
  carrier: { id: string; name: string; mcNumber: string } | null
  driver: { name: string; phone: string } | null
  truckNumber: string | null
  trailerNumber: string | null
  stops: TrackingStop[]
  lastCheckCall: {
    timestamp: string
    location: string
    notes: string
  } | null
  totalMiles: number | null
  remainingMiles: number | null
}

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const trackingKeys = {
  all: ['tracking'] as const,
  positions: () => ['tracking', 'positions'] as const,
  loadDetail: (loadId: string) => ['tracking', 'load', loadId] as const,
}

// ─── API Fetchers ─────────────────────────────────────────────────────────────

async function fetchTrackingPositions(
  filters: TrackingFilters,
): Promise<TrackingPosition[]> {
  const params = new URLSearchParams()
  // Use existing loads endpoint with in-transit status filter
  params.set('status', 'IN_TRANSIT,DISPATCHED,AT_PICKUP,AT_DELIVERY')
  if (filters.etaStatus?.length) params.set('etaStatus', filters.etaStatus.join(','))
  if (filters.equipmentType?.length)
    params.set('equipmentType', filters.equipmentType.join(','))
  if (filters.carrierId) params.set('carrierId', filters.carrierId)
  if (filters.customerId) params.set('customerId', filters.customerId)

  const qs = params.toString()
  const url = `/api/v1/loads${qs ? `?${qs}` : ''}`
  const resp = await fetch(url, { credentials: 'include' })
  if (!resp.ok) throw new Error('Failed to fetch tracking positions')
  const body = await resp.json()
  return body.data ?? body
}

async function fetchLoadDetail(loadId: string): Promise<TrackingLoadDetail> {
  const resp = await fetch(`/api/v1/loads/${loadId}`, { credentials: 'include' })
  if (!resp.ok) throw new Error(`Failed to fetch load ${loadId}`)
  const body = await resp.json()
  const load = body.data ?? body
  // Normalize: backend nests stops under load.order.stops, driver as flat fields
  return {
    ...load,
    stops: load.stops ?? load.order?.stops ?? [],
    driver: load.driver ?? (load.driverName ? { name: load.driverName, phone: load.driverPhone ?? '' } : null),
  }
}

async function updateLoadStatus(loadId: string, newStatus: string): Promise<void> {
  const resp = await fetch(`/api/v1/loads/${loadId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status: newStatus }),
  })
  if (!resp.ok) throw new Error('Failed to update load status')
}

async function createCheckCall(payload: {
  loadId: string
  location: string
  notes: string
  lat?: number
  lng?: number
}): Promise<void> {
  // Correct endpoint: nested under loads, not top-level /checkcalls
  const resp = await fetch(`/api/v1/loads/${payload.loadId}/check-calls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  if (!resp.ok) throw new Error('Failed to create check call')
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Fetch and maintain live GPS positions for all active loads.
 * Merges WebSocket location events directly into React Query cache.
 * Falls back to 15s polling when WebSocket is disconnected.
 */
export function useTrackingPositions(filters: TrackingFilters = {}) {
  const { socket, connected } = useSocket()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [...trackingKeys.positions(), filters],
    queryFn: () => fetchTrackingPositions(filters),
    refetchInterval: connected ? false : 15_000,
    staleTime: 15_000,
  })

  // Subscribe to real-time position events
  useEffect(() => {
    if (!socket) return

    const handleLocationUpdate = (event: LoadLocationUpdatedEvent) => {
      queryClient.setQueriesData<TrackingPosition[]>(
        { queryKey: ['tracking', 'positions'] },
        (prev) => {
          if (!prev) return prev
          return prev.map((pos) =>
            pos.loadId === event.loadId
              ? {
                  ...pos,
                  lat: event.location.lat,
                  lng: event.location.lng,
                  speed: event.speed ?? pos.speed,
                  timestamp: new Date().toISOString(),
                  eta: event.eta ?? pos.eta,
                  // Recalculate etaStatus when ETA changes
                  etaStatus: event.eta ? deriveEtaStatus(event.eta) : pos.etaStatus,
                }
              : pos,
          )
        },
      )
    }

    socket.on(SOCKET_EVENTS.LOAD_LOCATION_UPDATED, handleLocationUpdate)
    return () => {
      socket.off(SOCKET_EVENTS.LOAD_LOCATION_UPDATED, handleLocationUpdate)
    }
  }, [socket, queryClient])

  return query
}

/**
 * Fetch full load detail for the tracking side panel.
 * Only fetches when a loadId is selected.
 */
export function useLoadTrackingDetail(loadId: string | null) {
  return useQuery({
    queryKey: trackingKeys.loadDetail(loadId ?? '__none__'),
    queryFn: () => fetchLoadDetail(loadId!),
    enabled: !!loadId,
    staleTime: 30_000,
  })
}

/** Mutation: update load status from the tracking side panel */
export function useUpdateLoadStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ loadId, status }: { loadId: string; status: string }) =>
      updateLoadStatus(loadId, status),
    onSuccess: (_data, { loadId }) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.loadDetail(loadId) })
      queryClient.invalidateQueries({ queryKey: trackingKeys.positions() })
    },
  })
}

/** Mutation: log a check call from the tracking side panel */
export function useCreateTrackingCheckCall() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCheckCall,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: trackingKeys.loadDetail(variables.loadId) })
    },
  })
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/** Map ETA status to a Tailwind color class for the marker */
export const ETA_STATUS_COLORS: Record<EtaStatus, string> = {
  'on-time': '#10B981', // emerald-500
  tight: '#F59E0B',     // amber-500
  'at-risk': '#EF4444', // red-500
  stale: '#9CA3AF',     // gray-400
}

/** Human-readable ETA status label */
export const ETA_STATUS_LABELS: Record<EtaStatus, string> = {
  'on-time': 'On Time',
  tight: 'Tight',
  'at-risk': 'At Risk',
  stale: 'Stale GPS',
}

/** Format timestamp as "2m ago" / "1h 15m ago" */
export function formatTimestampAge(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const h = Math.floor(diffMin / 60)
  const m = diffMin % 60
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`
}

/** Returns true if GPS is stale (no update in 30+ min) */
export function isGpsStale(timestamp: string): boolean {
  return Date.now() - new Date(timestamp).getTime() > 30 * 60_000
}

/** Derive ETA status from an ETA timestamp string */
function deriveEtaStatus(eta: string): EtaStatus {
  const etaTime = new Date(eta).getTime()
  const now = Date.now()
  const hoursUntilEta = (etaTime - now) / (1000 * 60 * 60)
  if (hoursUntilEta < 0) return 'at-risk'
  if (hoursUntilEta < 1) return 'tight'
  return 'on-time'
}
