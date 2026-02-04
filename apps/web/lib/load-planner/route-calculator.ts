export interface LatLng {
  lat: number
  lng: number
}

export interface StateSegment {
  stateCode: string
  distanceMiles: number
}

export interface RouteResult {
  totalDistanceMiles: number
  totalDurationMinutes: number
  statesTraversed: string[]
  stateDistances: Record<string, number>
  waypoints: LatLng[]
}

export function formatDuration(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return 'N/A'
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  if (hours <= 0) return `${minutes} min`
  return `${hours}h ${minutes}m`
}
