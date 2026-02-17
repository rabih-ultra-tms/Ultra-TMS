'use client'

/**
 * TrackingMap
 *
 * Full-screen Google Maps component for real-time load tracking.
 * Features:
 *  - Color-coded markers by ETA status (green/yellow/red/gray)
 *  - Hover tooltip with load summary
 *  - Click marker → InfoWindow popup → open detail side panel
 *  - Detail side panel (Sheet) with full load info
 *  - WebSocket real-time position updates via use-tracking hook
 *  - 15s polling fallback when WS disconnected
 *  - Toolbar: status filters + search
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow,
} from '@react-google-maps/api'
import { Loader2, Search, Maximize2, RefreshCw, X, PhoneCall, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_API_KEY } from '@/lib/google-maps'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'

import {
  useTrackingPositions,
  useLoadTrackingDetail,
  ETA_STATUS_COLORS,
  ETA_STATUS_LABELS,
  formatTimestampAge,
  isGpsStale,
  type EtaStatus,
  type TrackingPosition,
  type TrackingFilters,
} from '@/lib/hooks/tms/use-tracking'
import { TrackingPinPopup } from './tracking-pin-popup'
import { TrackingSidebar } from './tracking-sidebar'

// Tailwind background classes per ETA status (avoids inline styles in badges)
const ETA_STATUS_BG: Record<EtaStatus, string> = {
  'on-time': 'bg-emerald-500',
  tight: 'bg-amber-500',
  'at-risk': 'bg-red-500',
  stale: 'bg-gray-400',
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' }

const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 } // Center of US

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  styles: [
    // Subtle muted style
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  ],
}

const ETA_STATUS_OPTIONS: EtaStatus[] = ['on-time', 'tight', 'at-risk', 'stale']

// ─── Marker icon factory ────────────────────────────────────────────────────

function buildMarkerIcon(
  etaStatus: EtaStatus,
  isSelected: boolean,
): google.maps.Icon {
  const color = ETA_STATUS_COLORS[etaStatus]
  const size = isSelected ? 44 : 36
  const strokeW = isSelected ? 3 : 2

  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - strokeW}" fill="${color}" stroke="white" stroke-width="${strokeW}" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"/>
      <g transform="translate(${size * 0.2},${size * 0.28}) scale(${size * 0.016})">
        <path d="M0 12 L3 4 L15 4 L18 8 L22 8 L22 16 L19 16 A3 3 0 0 1 13 16 L9 16 A3 3 0 0 1 3 16 L0 16 Z" fill="white" opacity="0.95"/>
        <rect x="1" y="10" width="20" height="2" fill="${color}" opacity="0.4"/>
      </g>
    </svg>
  `)

  return {
    url: `data:image/svg+xml;charset=UTF-8,${svg}`,
    scaledSize: new window.google.maps.Size(size, size),
    anchor: new window.google.maps.Point(size / 2, size / 2),
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TrackingMap() {
  const router = useRouter()
  const mapRef = useRef<google.maps.Map | null>(null)

  // Filter state
  const [activeStatusFilters, setActiveStatusFilters] = useState<EtaStatus[]>([...ETA_STATUS_OPTIONS])
  const [searchQuery, setSearchQuery] = useState('')

  // Map interaction state
  const [selectedPosition, setSelectedPosition] = useState<TrackingPosition | null>(null)
  const [detailLoadId, setDetailLoadId] = useState<string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // Build filters for hook (status filter applied server-side)
  const filters: TrackingFilters = useMemo(
    () => ({ etaStatus: activeStatusFilters }),
    [activeStatusFilters],
  )

  // Data
  const { data: positions = [], isLoading, refetch } = useTrackingPositions(filters)

  // Client-side search filter
  const filteredPositions = useMemo(() => {
    if (!searchQuery.trim()) return positions
    const q = searchQuery.toLowerCase()
    return positions.filter(
      (p) =>
        p.loadNumber.toLowerCase().includes(q) ||
        p.carrier?.name.toLowerCase().includes(q) ||
        p.driver?.name.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q) ||
        p.destination.toLowerCase().includes(q),
    )
  }, [positions, searchQuery])

  // ─── Map callbacks ───────────────────────────────────────────────────────

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const onMapUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  const centerOnLoad = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return
    mapRef.current.panTo({ lat, lng })
    mapRef.current.setZoom(10)
  }, [])

  const fitAllMarkers = useCallback(() => {
    if (!mapRef.current || filteredPositions.length === 0) return
    const bounds = new window.google.maps.LatLngBounds()
    filteredPositions.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }))
    mapRef.current.fitBounds(bounds, 80)
  }, [filteredPositions])

  // ─── Marker handlers ─────────────────────────────────────────────────────

  const handleMarkerClick = useCallback((pos: TrackingPosition) => {
    setSelectedPosition(pos)
    centerOnLoad(pos.lat, pos.lng)
  }, [centerOnLoad])

  const handleInfoWindowClose = useCallback(() => {
    setSelectedPosition(null)
  }, [])

  const handleViewDetails = useCallback((loadId: string) => {
    setDetailLoadId(loadId)
    setIsDetailOpen(true)
    setSelectedPosition(null)
  }, [])

  // Sidebar click → center map on load
  const handleSidebarSelectLoad = useCallback(
    (loadId: string) => {
      const pos = positions.find((p) => p.loadId === loadId)
      if (pos) {
        centerOnLoad(pos.lat, pos.lng)
        setSelectedPosition(pos)
      }
    },
    [positions, centerOnLoad],
  )

  // ─── Status filter toggle ─────────────────────────────────────────────────

  const toggleStatusFilter = useCallback((status: EtaStatus) => {
    setActiveStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    )
  }, [])

  // ─── Google Maps loader ───────────────────────────────────────────────────

  const { isLoaded: isMapLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  // ─── Render ───────────────────────────────────────────────────────────────

  if (loadError) {
    return <MapLoadError onRetry={() => window.location.reload()} />
  }

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* Left sidebar: active loads list */}
      <TrackingSidebar
        positions={positions}
        selectedLoadId={selectedPosition?.loadId ?? detailLoadId}
        isLoading={isLoading}
        onSelectLoad={handleSidebarSelectLoad}
      />

      {/* Map area */}
      <div className="relative flex-1">
        {/* Floating Toolbar */}
        <div className="absolute left-3 right-3 top-3 z-10">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm">
            {/* Status filter chips */}
            <div className="flex items-center gap-1.5">
              {ETA_STATUS_OPTIONS.map((status) => {
                const active = activeStatusFilters.includes(status)
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleStatusFilter(status)}
                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                      active
                        ? `text-white shadow-sm ${ETA_STATUS_BG[status]}`
                        : 'bg-gray-100 text-gray-500 opacity-60'
                    }`}
                  >
                    {ETA_STATUS_LABELS[status]}
                  </button>
                )
              })}
            </div>

            <div className="mx-2 h-4 w-px bg-gray-200" />

            {/* Search */}
            <div className="relative flex-1 max-w-48">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search loads..."
                className="h-7 pl-8 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="ml-auto flex items-center gap-1">
              {/* Fit all */}
              {isMapLoaded && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={fitAllMarkers}
                  title="Fit all loads"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
              )}

              {/* Refresh */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => void refetch()}
                title="Refresh positions"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>

              {/* Load count */}
              {!isLoading && (
                <span className="text-xs text-gray-400">
                  {filteredPositions.length} load{filteredPositions.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Google Map */}
        {!isMapLoaded ? (
          <MapSkeleton />
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={DEFAULT_CENTER}
            zoom={4}
            options={MAP_OPTIONS}
            onLoad={onMapLoad}
            onUnmount={onMapUnmount}
          >
            {/* Load markers */}
            {filteredPositions.map((pos) => {
              const stale = isGpsStale(pos.timestamp)
              const effectiveEta: EtaStatus = stale ? 'stale' : pos.etaStatus
              const isSelected = selectedPosition?.loadId === pos.loadId

              return (
                <Marker
                  key={pos.loadId}
                  position={{ lat: pos.lat, lng: pos.lng }}
                  icon={buildMarkerIcon(effectiveEta, isSelected)}
                  title={pos.loadNumber}
                  onClick={() => handleMarkerClick(pos)}
                />
              )
            })}

            {/* InfoWindow: click popup */}
            {selectedPosition && (
              <InfoWindow
                position={{ lat: selectedPosition.lat, lng: selectedPosition.lng }}
                onCloseClick={handleInfoWindowClose}
                options={{ pixelOffset: new window.google.maps.Size(0, -20) }}
              >
                <TrackingPinPopup
                  position={selectedPosition}
                  onViewDetails={handleViewDetails}
                />
              </InfoWindow>
            )}
          </GoogleMap>
        )}

        {/* No results overlay */}
        {isMapLoaded && !isLoading && filteredPositions.length === 0 && (
          <NoLoadsOverlay
            hasFilters={activeStatusFilters.length < ETA_STATUS_OPTIONS.length || !!searchQuery}
            onClearFilters={() => {
              setActiveStatusFilters([...ETA_STATUS_OPTIONS])
              setSearchQuery('')
            }}
          />
        )}
      </div>

      {/* Detail Side Panel */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent side="right" className="w-[400px] p-0 sm:max-w-[400px]">
          {detailLoadId && (
            <LoadDetailPanel
              loadId={detailLoadId}
              position={positions.find((p) => p.loadId === detailLoadId) ?? null}
              onViewFullDetail={(id) => router.push(`/operations/loads/${id}`)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

function LoadDetailPanel({
  loadId,
  position,
  onViewFullDetail,
}: {
  loadId: string
  position: TrackingPosition | null
  onViewFullDetail: (id: string) => void
}) {
  const { data: detail, isLoading, isError, refetch } = useLoadTrackingDetail(loadId)

  const stale = position ? isGpsStale(position.timestamp) : false
  const effectiveEta: EtaStatus = stale ? 'stale' : (position?.etaStatus ?? 'stale')

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <SheetHeader className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <SheetTitle className="font-mono text-base font-bold text-blue-600">
              {detail?.loadNumber ?? position?.loadNumber ?? loadId}
            </SheetTitle>
            <div className="flex items-center gap-2">
              {detail?.status && (
                <Badge variant="outline" className="text-xs">
                  {detail.status}
                </Badge>
              )}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white ${ETA_STATUS_BG[effectiveEta]}`}
              >
                {ETA_STATUS_LABELS[effectiveEta]}
              </span>
            </div>
          </div>
        </div>
        {position && (
          <p className="mt-1 text-sm text-gray-500">
            {position.origin} → {position.destination}
          </p>
        )}
      </SheetHeader>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <DetailPanelSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-gray-500">Failed to load details</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : detail ? (
          <div className="divide-y divide-gray-100">
            {/* ETA Section */}
            <Section title="ETA">
              {detail.eta ? (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(detail.eta).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${ETA_STATUS_BG[effectiveEta]}`}
                  >
                    {ETA_STATUS_LABELS[effectiveEta]}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No ETA set</p>
              )}
            </Section>

            {/* GPS */}
            {position && (
              <Section title="GPS">
                <div className="space-y-0.5 text-sm">
                  <p className="text-gray-700">
                    {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                  </p>
                  {position.speed > 0 && (
                    <p className="text-gray-500">{position.speed} mph</p>
                  )}
                  <p
                    className={`text-xs ${
                      stale ? 'font-medium text-red-500' : 'text-gray-400'
                    }`}
                  >
                    {stale ? '⚠ Stale · ' : ''}
                    Updated {formatTimestampAge(position.timestamp)}
                  </p>
                </div>
              </Section>
            )}

            {/* Carrier + Driver */}
            {detail.carrier && (
              <Section title="Carrier">
                <div className="space-y-1 text-sm">
                  <p className="font-medium text-blue-600">{detail.carrier.name}</p>
                  {detail.carrier.mcNumber && (
                    <p className="text-xs text-gray-500">MC# {detail.carrier.mcNumber}</p>
                  )}
                  {detail.driver && (
                    <>
                      <p className="text-gray-700">{detail.driver.name}</p>
                      {detail.driver.phone && (
                        <a
                          href={`tel:${detail.driver.phone}`}
                          className="flex items-center gap-1.5 text-blue-600 hover:underline text-xs"
                        >
                          <PhoneCall className="h-3.5 w-3.5" />
                          {detail.driver.phone}
                        </a>
                      )}
                    </>
                  )}
                  {detail.truckNumber && (
                    <p className="text-xs text-gray-500">
                      Truck #{detail.truckNumber}
                      {detail.trailerNumber ? ` · Trailer #${detail.trailerNumber}` : ''}
                    </p>
                  )}
                </div>
              </Section>
            )}

            {/* Last Check Call */}
            <Section title="Last Check Call">
              {detail.lastCheckCall ? (
                <div className="space-y-0.5 text-sm">
                  <p
                    className={`text-xs ${
                      Date.now() - new Date(detail.lastCheckCall.timestamp).getTime() >
                      4 * 60 * 60 * 1000
                        ? 'font-medium text-red-500'
                        : 'text-gray-500'
                    }`}
                  >
                    {new Date(detail.lastCheckCall.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}{' '}
                    ({formatTimestampAge(detail.lastCheckCall.timestamp)})
                  </p>
                  {detail.lastCheckCall.location && (
                    <p className="text-gray-700">{detail.lastCheckCall.location}</p>
                  )}
                  {detail.lastCheckCall.notes && (
                    <p className="italic text-gray-500">&quot;{detail.lastCheckCall.notes}&quot;</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No check calls logged</p>
              )}
            </Section>

            {/* Stops */}
            {detail.stops.length > 0 && (
              <Section title="Stops">
                <div className="space-y-2">
                  {detail.stops.map((stop, idx) => {
                    const isDone = ['DEPARTED', 'COMPLETED'].includes(stop.status)
                    const isActive = stop.status === 'ARRIVED'
                    return (
                      <div key={stop.id} className="flex items-start gap-2.5">
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`z-10 h-3 w-3 rounded-full border-2 border-white shadow ${
                              isDone
                                ? 'bg-emerald-500'
                                : isActive
                                ? 'bg-blue-500 animate-pulse'
                                : 'bg-gray-200'
                            }`}
                          />
                          {idx < detail.stops.length - 1 && (
                            <div className="h-5 w-0.5 bg-gray-200" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1 py-0 ${
                                stop.stopType === 'PICKUP'
                                  ? 'border-blue-200 text-blue-700'
                                  : 'border-purple-200 text-purple-700'
                              }`}
                            >
                              {stop.stopType === 'PICKUP' ? 'PU' : 'DEL'}
                            </Badge>
                            <span className="truncate font-medium text-gray-700">
                              {stop.facilityName}
                            </span>
                          </div>
                          <p className="mt-0.5 text-gray-500">
                            {stop.city}, {stop.state}
                          </p>
                          {!isDone && stop.appointmentTimeFrom && (
                            <p className="text-gray-400">
                              {new Date(stop.appointmentTimeFrom).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {stop.status}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* Route info */}
            {(detail.totalMiles || detail.remainingMiles) && (
              <Section title="Route">
                <div className="text-sm text-gray-600">
                  {detail.totalMiles && (
                    <p>{detail.totalMiles.toLocaleString()} miles total</p>
                  )}
                  {detail.remainingMiles && (
                    <p>{detail.remainingMiles.toLocaleString()} miles remaining</p>
                  )}
                </div>
              </Section>
            )}
          </div>
        ) : null}
      </ScrollArea>

      {/* Actions */}
      <div className="shrink-0 space-y-2 border-t border-gray-200 p-4">
        <Button
          className="w-full"
          onClick={() => onViewFullDetail(loadId)}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View Full Detail
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            toast.info('Opening check call form...')
          }}
        >
          <PhoneCall className="mr-2 h-4 w-4" />
          Add Check Call
        </Button>
      </div>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="px-4 py-3">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>
      {children}
    </div>
  )
}

function DetailPanelSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading map...</p>
      </div>
    </div>
  )
}

function MapLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gray-50 p-8">
      <div className="text-center">
        <p className="text-lg font-semibold text-gray-900">Map could not be loaded</p>
        <p className="mt-1 text-sm text-gray-500">
          Check your internet connection and Google Maps API key.
        </p>
      </div>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  )
}

function NoLoadsOverlay({
  hasFilters,
  onClearFilters,
}: {
  hasFilters: boolean
  onClearFilters: () => void
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="pointer-events-auto rounded-xl border border-gray-200 bg-white/95 px-8 py-6 shadow-lg backdrop-blur-sm text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <span className="text-2xl">🚛</span>
        </div>
        {hasFilters ? (
          <>
            <p className="mt-3 text-sm font-semibold text-gray-900">No loads match your filters</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onClearFilters}
            >
              Clear Filters
            </Button>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm font-semibold text-gray-900">No active loads to track</p>
            <p className="mt-1 text-xs text-gray-400">
              Loads appear here once dispatched with GPS reporting
            </p>
          </>
        )}
      </div>
    </div>
  )
}
