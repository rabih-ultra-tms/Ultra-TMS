import type { TruckCategory } from '@/types/truck-types'

export type TrailerCategory = TruckCategory

export interface TruckType {
  id: string
  name: string
  category: TrailerCategory
  description: string
  deckHeight: number
  deckLength: number
  deckWidth: number
  wellLength?: number
  wellHeight?: number
  maxCargoWeight: number
  tareWeight?: number
  maxLegalCargoHeight: number
  maxLegalCargoWidth: number
  features: string[]
  bestFor: string[]
  loadingMethod?: string
  imageUrl?: string
}

export type ItemGeometry = 'box' | 'cylinder' | 'hollow-cylinder'
export type OrientationMode = 1 | 3 | 63 | number

export interface LoadItem {
  id: string
  description: string
  quantity: number
  length: number
  width: number
  height: number
  weight: number
  widthIncludesSecurement?: boolean
  stackable?: boolean
  bottomOnly?: boolean
  fragile?: boolean
  hazmat?: boolean
  maxLayers?: number
  orientation?: OrientationMode
  geometry?: ItemGeometry
  imageUrl?: string
  imageUrl2?: string
}

export interface ItemPlacement {
  itemId: string
  x: number
  y: number
  z: number
  rotated?: boolean
  failed?: boolean
}

export interface PlannedLoad {
  id: string
  recommendedTruck: TruckType
  items: LoadItem[]
  placements: ItemPlacement[]
  warnings: string[]
}

export interface LoadPlan {
  loads: PlannedLoad[]
  totalTrucks: number
  totalItems: number
  totalWeight: number
  warnings: string[]
}

export interface CargoSpecs {
  length: number
  width: number
  height: number
  grossWeight: number
  widthIncludesSecurement?: boolean
}

export interface TruckCargoSpecs extends CargoSpecs {
  truckIndex: number
  truckName: string
  truckId: string
  isOversize: boolean
  isOverweight: boolean
}

export interface RouteRecommendation {
  recommendedRouteId: string
  recommendedRouteName: string
  reasoning: string[]
  costSavings?: { amount: number; comparedTo: string }
  warnings: string[]
  alternativeConsiderations: Array<{
    routeId: string
    routeName: string
    pros: string[]
    cons: string[]
  }>
}

export interface TruckRouteRecommendation {
  truckIndex: number
  truckId: string
  truckName: string
  cargoDescription: string
  isOversize: boolean
  isOverweight: boolean
  recommendedRouteId: string
  recommendedRouteName: string
  reasoning: string[]
  alternativeRouteId?: string
  alternativeReason?: string
}

export interface RouteAlternative {
  id: string
  name: string
  totalDistanceMiles: number
  totalDurationMinutes: number
  statesTraversed: string[]
  stateDistances: Record<string, number>
  routePolyline?: string
  permitSummary?: DetailedRoutePermitSummary
  estimatedCosts?: {
    permits: number
    escorts: number
    total: number
  }
}

export interface RoutePermitStateSummary {
  stateCode: string
  stateName: string
  oversizeRequired: boolean
  overweightRequired: boolean
  isSuperload: boolean
  escortsRequired: number
  poleCarRequired: boolean
  policeEscortRequired: boolean
  travelRestrictions: string[]
}

export interface RoutePermitSummary {
  statePermits: RoutePermitStateSummary[]
  totalPermitCost: number
  totalPermitFees: number
  totalEscortCost: number
  overallRestrictions: string[]
  warnings: string[]
}

export interface PermitSourceInfo {
  agency: string
  phone: string
  website: string
  lastUpdated: string
}

export interface DetailedPermitRequirement {
  stateCode: string
  stateName: string
  state?: string // alias for stateName (used by old RouteIntelligence)
  distanceInState?: number // miles in this state
  oversizeRequired: boolean
  overweightRequired: boolean
  isSuperload: boolean
  permitFees: number
  escortFees: number
  estimatedFee?: number // total fee in dollars (for display)
  totalCost: number
  escortsRequired: number
  poleCarRequired: boolean
  policeEscortRequired: boolean
  travelRestrictions: string[]
  warnings: string[]
  reasons?: string[] // why permit is required
  calculationDetails?: string[] // fee breakdown details
  source?: PermitSourceInfo
}

export interface EscortCostBreakdown {
  escortCount: number
  needsPoleCar: boolean
  needsPoliceEscort: boolean
  tripDays: number
  tripHours: number
  rates: {
    escortPerDay: number
    poleCarPerDay: number
    policePerHour: number
  }
  totalEscortCost: number
  totalPoleCarCost: number
  totalPoliceCost: number
  grandTotal: number
  perState: Array<{
    stateCode: string
    stateName: string
    distanceMiles: number
    daysInState: number
    escortCountInState: number
    poleCarRequiredInState: boolean
    policeRequiredInState: boolean
    stateCost: number
  }>
}

export interface DetailedRoutePermitSummary {
  statePermits: DetailedPermitRequirement[]
  totalPermitCost: number
  totalEscortCost: number
  totalCost: number
  escortBreakdown?: EscortCostBreakdown
}

export interface MultiRouteResult {
  routes: RouteAlternative[]
  selectedRouteId: string
}
