export interface LatLng {
  lat: number
  lng: number
}

export interface StateSegment {
  stateCode: string
  stateName?: string
  entryPoint?: LatLng
  exitPoint?: LatLng
  distanceMiles: number
  order?: number
}

export interface RouteResult {
  totalDistanceMiles: number
  totalDurationMinutes: number
  estimatedDriveTime?: string
  statesTraversed: string[]
  stateSegments?: StateSegment[]
  stateDistances: Record<string, number>
  routePolyline?: string
  waypoints: LatLng[]
  warnings?: string[]
}

export function formatDuration(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return 'N/A'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  if (hours <= 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

/**
 * Calculate distance between two lat/lng points using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(point1: LatLng, point2: LatLng): number {
  const R = 3958.8 // Earth's radius in miles
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
