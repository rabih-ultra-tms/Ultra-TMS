'use client'

/**
 * TrackingSidebar
 *
 * Persistent left panel showing active loads sorted by urgency (at-risk first).
 * Click a load to center the map on it and open the detail panel.
 * Shows WebSocket connection status at the top.
 */

import { WifiOff, RefreshCw, Truck } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useSocket } from '@/lib/socket/socket-provider'
import {
  ETA_STATUS_LABELS,
  formatTimestampAge,
  isGpsStale,
  type EtaStatus,
  type TrackingPosition,
} from '@/lib/hooks/tms/use-tracking'

const ETA_BG: Record<EtaStatus, string> = {
  'on-time': 'bg-emerald-500',
  tight: 'bg-amber-500',
  'at-risk': 'bg-red-500',
  stale: 'bg-gray-400',
}

const ETA_TEXT: Record<EtaStatus, string> = {
  'on-time': 'text-emerald-600',
  tight: 'text-amber-600',
  'at-risk': 'text-red-600',
  stale: 'text-gray-400',
}

// Order urgency: at-risk first, then tight, then on-time, then stale
const ETA_ORDER: EtaStatus[] = ['at-risk', 'tight', 'on-time', 'stale']

function etaUrgencyScore(etaStatus: EtaStatus): number {
  return ETA_ORDER.indexOf(etaStatus)
}

interface TrackingSidebarProps {
  positions: TrackingPosition[]
  selectedLoadId: string | null
  isLoading: boolean
  onSelectLoad: (loadId: string) => void
}

export function TrackingSidebar({
  positions,
  selectedLoadId,
  isLoading,
  onSelectLoad,
}: TrackingSidebarProps) {
  const { connected, status } = useSocket()

  const sorted = [...positions].sort((a, b) => {
    const aStale = isGpsStale(a.timestamp) ? 'stale' : a.etaStatus
    const bStale = isGpsStale(b.timestamp) ? 'stale' : b.etaStatus
    return etaUrgencyScore(aStale) - etaUrgencyScore(bStale)
  })

  const counts = {
    'at-risk': positions.filter((p) => p.etaStatus === 'at-risk').length,
    tight: positions.filter((p) => p.etaStatus === 'tight').length,
    'on-time': positions.filter((p) => p.etaStatus === 'on-time').length,
    stale: positions.filter((p) => isGpsStale(p.timestamp)).length,
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Active Loads</h2>
          <ConnectionStatusBadge connected={connected} status={status} />
        </div>
        {/* Summary chips */}
        {!isLoading && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(counts).map(([key, count]) => {
              if (count === 0) return null
              const etaKey = key as EtaStatus
              return (
                <span
                  key={key}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white ${ETA_BG[etaKey]}`}
                >
                  {count} {ETA_STATUS_LABELS[etaKey]}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Load List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <SidebarSkeletons />
          ) : sorted.length === 0 ? (
            <EmptyState />
          ) : (
            sorted.map((pos) => (
              <LoadRow
                key={pos.loadId}
                position={pos}
                isSelected={pos.loadId === selectedLoadId}
                onClick={() => onSelectLoad(pos.loadId)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer: total count */}
      {!isLoading && positions.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-2">
          <p className="text-xs text-gray-400">
            {positions.length} load{positions.length !== 1 ? 's' : ''} in transit
          </p>
        </div>
      )}
    </aside>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ConnectionStatusBadge({
  connected,
  status,
}: {
  connected: boolean
  status: string
}) {
  if (connected) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Live
      </span>
    )
  }

  if (status === 'reconnecting') {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
        <RefreshCw className="h-3 w-3 animate-spin" />
        Reconnecting
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
      <WifiOff className="h-3 w-3" />
      Polling
    </span>
  )
}

function LoadRow({
  position,
  isSelected,
  onClick,
}: {
  position: TrackingPosition
  isSelected: boolean
  onClick: () => void
}) {
  const stale = isGpsStale(position.timestamp)
  const effectiveEta: EtaStatus = stale ? 'stale' : position.etaStatus
  const lastUpdate = formatTimestampAge(position.timestamp)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
      }`}
    >
      {/* Load # + status dot */}
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${ETA_BG[effectiveEta]}`}
        />
        <span className="font-mono text-xs font-semibold text-gray-900">
          {position.loadNumber}
        </span>
        <span className={`ml-auto text-xs font-medium ${ETA_TEXT[effectiveEta]}`}>
          {ETA_STATUS_LABELS[effectiveEta]}
        </span>
      </div>

      {/* Route */}
      <div className="mt-0.5 flex items-center gap-1 pl-[18px] text-xs text-gray-500">
        <span className="truncate max-w-[80px]">{position.origin}</span>
        <span className="shrink-0 text-gray-300">→</span>
        <span className="truncate max-w-[80px]">{position.destination}</span>
      </div>

      {/* Carrier + last update */}
      <div className="mt-0.5 flex items-center gap-2 pl-[18px]">
        {position.carrier && (
          <span className="truncate text-xs text-gray-400">
            {position.carrier.name}
          </span>
        )}
        <span
          className={`ml-auto shrink-0 text-xs ${
            stale ? 'text-red-400 font-medium' : 'text-gray-300'
          }`}
        >
          {lastUpdate}
        </span>
      </div>
    </button>
  )
}

function SidebarSkeletons() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-4 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="ml-[18px] h-3 w-36" />
          <Skeleton className="ml-[18px] h-3 w-24" />
        </div>
      ))}
    </>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Truck className="h-6 w-6 text-gray-400" />
      </div>
      <p className="mt-3 text-sm font-medium text-gray-900">No active loads</p>
      <p className="mt-1 text-xs text-gray-400">
        Loads appear here once dispatched and reporting GPS
      </p>
    </div>
  )
}
