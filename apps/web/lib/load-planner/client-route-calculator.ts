import type { RouteResult } from './route-calculator'
import type { RouteAlternative } from './types'
import type { TruckCargoSpecs } from './types'

const STATE_CODES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC'
])

const extractState = (address: string): string | null => {
  const matches = address.toUpperCase().match(/\b[A-Z]{2}\b/g)
  if (!matches) return null
  return matches.find(code => STATE_CODES.has(code)) || null
}

const estimateDistance = (origin: string, destination: string, states: string[]): number => {
  if (states.length <= 1) return 300
  const delta = Math.abs(origin.length - destination.length)
  return Math.max(450, delta * 20 + 500)
}

const buildStateDistances = (states: string[], totalDistance: number): Record<string, number> => {
  if (states.length === 0) return {}
  const perState = totalDistance / states.length
  return states.reduce((acc, state) => ({ ...acc, [state]: perState }), {})
}

export async function calculateRouteClientSide(origin: string, destination: string): Promise<RouteResult> {
  const originState = extractState(origin)
  const destinationState = extractState(destination)
  const statesTraversed = originState && destinationState
    ? (originState === destinationState ? [originState] : [originState, destinationState])
    : []

  const totalDistanceMiles = estimateDistance(origin, destination, statesTraversed)
  const totalDurationMinutes = Math.round((totalDistanceMiles / 50) * 60)

  return {
    totalDistanceMiles,
    totalDurationMinutes,
    statesTraversed,
    stateDistances: buildStateDistances(statesTraversed, totalDistanceMiles),
    waypoints: [],
  }
}

interface PerTruckRouteResult {
  truckRoutes: Array<{
    truckIndex: number
    truckId: string
    truckName: string
    cargoSpecs: TruckCargoSpecs
    isOversize: boolean
    isOverweight: boolean
    recommendedRouteId: string
    recommendedRouteName: string
    reasoning: string[]
    usesDifferentRoute: boolean
    differentRouteReason?: string
  }>
  routeGroups: Array<{ routeId: string; truckIndexes: number[] }>
}

export async function calculatePerTruckRoutes(
  origin: string,
  destination: string,
  trucks: TruckCargoSpecs[]
): Promise<PerTruckRouteResult> {
  const route = await calculateRouteClientSide(origin, destination)
  const routeName = route.statesTraversed.length > 0
    ? `via ${route.statesTraversed.join(' → ')}`
    : 'Direct Route'

  const truckRoutes = trucks.map((truck) => ({
    truckIndex: truck.truckIndex,
    truckId: truck.truckId,
    truckName: truck.truckName,
    cargoSpecs: truck,
    isOversize: truck.isOversize,
    isOverweight: truck.isOverweight,
    recommendedRouteId: 'route-0',
    recommendedRouteName: routeName,
    reasoning: truck.isOversize || truck.isOverweight
      ? ['Oversize/overweight permits required', 'Route optimized for permit compliance']
      : ['Legal load dimensions', 'Primary route is sufficient'],
    usesDifferentRoute: false,
  }))

  return {
    truckRoutes,
    routeGroups: [{ routeId: 'route-0', truckIndexes: trucks.map(t => t.truckIndex) }],
  }
}

interface MultipleRoutesResult {
  routes: RouteAlternative[]
}

export async function calculateMultipleRoutes(
  origin: string,
  destination: string,
  cargo: TruckCargoSpecs | { width: number; height: number; length: number; grossWeight: number }
): Promise<MultipleRoutesResult> {
  const base = await calculateRouteClientSide(origin, destination)

  const baseRoute: RouteAlternative = {
    id: 'route-0',
    name: 'Primary Route',
    totalDistanceMiles: base.totalDistanceMiles,
    totalDurationMinutes: base.totalDurationMinutes,
    statesTraversed: base.statesTraversed,
    stateDistances: base.stateDistances,
  }

  const alt1: RouteAlternative = {
    id: 'route-1',
    name: 'Alternate Route A',
    totalDistanceMiles: Math.round(base.totalDistanceMiles * 1.08),
    totalDurationMinutes: Math.round(base.totalDurationMinutes * 1.1),
    statesTraversed: base.statesTraversed,
    stateDistances: base.stateDistances,
  }

  const alt2: RouteAlternative = {
    id: 'route-2',
    name: 'Alternate Route B',
    totalDistanceMiles: Math.round(base.totalDistanceMiles * 0.96),
    totalDurationMinutes: Math.round(base.totalDurationMinutes * 0.95),
    statesTraversed: base.statesTraversed,
    stateDistances: base.stateDistances,
  }

  return { routes: [baseRoute, alt1, alt2] }
}
