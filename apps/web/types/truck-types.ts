/**
 * Truck Types
 * Equipment types and specifications for load planning
 */

// =============================================================================
// TRUCK CATEGORY ENUM
// =============================================================================

export const TRUCK_CATEGORIES = [
  'FLATBED',
  'STEP_DECK',
  'RGN',
  'LOWBOY',
  'DOUBLE_DROP',
  'LANDOLL',
  'CONESTOGA',
  'DRY_VAN',
  'REEFER',
  'CURTAIN_SIDE',
  'MULTI_AXLE',
  'SPECIALIZED',
  'SCHNABEL',
  'PERIMETER',
  'STEERABLE',
  'BLADE',
  'TANKER',
  'HOPPER',
] as const

export type TruckCategory = (typeof TRUCK_CATEGORIES)[number]

export const TRUCK_CATEGORY_LABELS: Record<TruckCategory, string> = {
  FLATBED: 'Flatbed',
  STEP_DECK: 'Step Deck',
  RGN: 'RGN (Removable Gooseneck)',
  LOWBOY: 'Lowboy',
  DOUBLE_DROP: 'Double Drop',
  LANDOLL: 'Landoll / Tilt Bed',
  CONESTOGA: 'Conestoga',
  DRY_VAN: 'Dry Van',
  REEFER: 'Refrigerated',
  CURTAIN_SIDE: 'Curtain Side',
  MULTI_AXLE: 'Multi-Axle Heavy Haul',
  SPECIALIZED: 'Specialized',
  SCHNABEL: 'Schnabel',
  PERIMETER: 'Perimeter / Beam',
  STEERABLE: 'Steerable Dolly',
  BLADE: 'Blade Trailer',
  TANKER: 'Tanker',
  HOPPER: 'Hopper / Dump',
}

// =============================================================================
// LOADING METHODS
// =============================================================================

export const LOADING_METHODS = [
  'crane',
  'drive-on',
  'forklift',
  'tilt',
  'pump',
  'pneumatic',
  'gravity',
  'dump',
] as const

export type LoadingMethod = (typeof LOADING_METHODS)[number]

export const LOADING_METHOD_LABELS: Record<LoadingMethod, string> = {
  crane: 'Crane',
  'drive-on': 'Drive-On',
  forklift: 'Forklift',
  tilt: 'Tilt/Slide',
  pump: 'Pump',
  pneumatic: 'Pneumatic',
  gravity: 'Gravity',
  dump: 'Dump',
}

// =============================================================================
// MAIN INTERFACES
// =============================================================================

export interface TruckType {
  id: string
  name: string
  category: string
  description: string | null
  
  // Dimensions (feet)
  deckHeightFt: number
  deckLengthFt: number
  deckWidthFt: number
  wellLengthFt: number | null
  wellHeightFt: number | null
  
  // Weight limits (lbs)
  maxCargoWeightLbs: number
  tareWeightLbs: number | null
  
  // Legal limits (feet)
  maxLegalCargoHeightFt: number | null
  maxLegalCargoWidthFt: number | null
  
  // Features and capabilities
  features: string[]
  bestFor: string[]
  loadingMethod: string | null
  
  // Availability and pricing
  isActive: boolean
  baseRateCents: number | null
  ratePerMileCents: number | null
  imageUrl: string | null

  // Display
  sortOrder: number
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

export interface TruckTypeListItem {
  id: string
  name: string
  category: string
  description: string | null
  deckHeightFt: number
  deckLengthFt: number
  deckWidthFt: number
  maxCargoWeightLbs: number
  maxLegalCargoHeightFt: number | null
  loadingMethod: string | null
  isActive: boolean
  sortOrder: number
}

export interface CreateTruckTypeInput {
  name: string
  category: string
  description?: string
  
  deckHeightFt: number
  deckLengthFt: number
  deckWidthFt?: number
  wellLengthFt?: number
  wellHeightFt?: number
  
  maxCargoWeightLbs: number
  tareWeightLbs?: number
  
  maxLegalCargoHeightFt?: number
  maxLegalCargoWidthFt?: number
  
  features?: string[]
  bestFor?: string[]
  loadingMethod?: string
  
  isActive?: boolean
  baseRateCents?: number
  ratePerMileCents?: number
  imageUrl?: string

  sortOrder?: number
}

export interface UpdateTruckTypeInput extends Partial<CreateTruckTypeInput> {
  id: string
}

export interface TruckTypeListResponse {
  data: TruckTypeListItem[]
  total: number
  page: number
  limit: number
}

export interface CategoryCountsResponse {
  [category: string]: number
}
