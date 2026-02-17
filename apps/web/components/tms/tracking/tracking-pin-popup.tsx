'use client'

/**
 * TrackingPinPopup
 *
 * Content rendered inside a Google Maps InfoWindow when a load marker is clicked.
 * Shows: load #, carrier, origin → destination, ETA status, last update time.
 * Action: "View Details" opens the side panel for this load.
 *
 * Note: Closing is handled by the InfoWindow's own onCloseClick — no separate
 * onClose prop needed here.
 */

import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ETA_STATUS_COLORS,
  ETA_STATUS_LABELS,
  formatTimestampAge,
  isGpsStale,
  type EtaStatus,
  type TrackingPosition,
} from '@/lib/hooks/tms/use-tracking'

interface TrackingPinPopupProps {
  position: TrackingPosition
  onViewDetails: (loadId: string) => void
}

export function TrackingPinPopup({
  position,
  onViewDetails,
}: TrackingPinPopupProps) {
  const isStale = isGpsStale(position.timestamp)
  const effectiveEtaStatus: EtaStatus = isStale ? 'stale' : position.etaStatus
  const statusColor = ETA_STATUS_COLORS[effectiveEtaStatus]
  const statusLabel = ETA_STATUS_LABELS[effectiveEtaStatus]
  const lastUpdate = formatTimestampAge(position.timestamp)

  return (
    <div className="w-64 rounded-lg bg-white p-0 shadow-lg">
      {/* Header */}
      <div
        className="flex items-center justify-between rounded-t-lg px-3 py-2"
        style={{ backgroundColor: `${statusColor}15`, borderBottom: `2px solid ${statusColor}` }}
      >
        <div>
          <p className="font-mono text-sm font-bold text-gray-900">
            {position.loadNumber}
          </p>
          <span
            className="inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: statusColor }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2 px-3 py-2">
        {/* Route */}
        <div className="flex items-center gap-1 text-sm text-gray-700">
          <span className="font-medium">{position.origin}</span>
          <span className="text-gray-400">→</span>
          <span className="font-medium">{position.destination}</span>
        </div>

        {/* Carrier */}
        {position.carrier && (
          <div className="text-xs text-gray-500">
            <span className="font-medium text-gray-700">{position.carrier.name}</span>
            {position.carrier.mcNumber && (
              <span className="ml-1">· MC# {position.carrier.mcNumber}</span>
            )}
          </div>
        )}

        {/* Speed */}
        {position.speed > 0 && (
          <div className="text-xs text-gray-500">
            {position.speed} mph
          </div>
        )}

        {/* ETA */}
        {position.eta && (
          <div className="text-xs">
            <span className="text-gray-500">ETA: </span>
            <span className="font-medium text-gray-700">
              {new Date(position.eta).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </span>
          </div>
        )}

        {/* Last update */}
        <div className={`text-xs ${isStale ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {isStale ? '⚠ Stale GPS · ' : ''}Updated {lastUpdate}
        </div>
      </div>

      {/* Action */}
      <div className="border-t border-gray-100 px-3 py-2">
        <Button
          size="sm"
          className="w-full"
          onClick={() => onViewDetails(position.loadId)}
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          View Details
        </Button>
      </div>
    </div>
  )
}
