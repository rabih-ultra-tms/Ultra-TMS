/**
 * Legacy Smart Plans - Self-contained multi-strategy load planning
 *
 * Generates multiple plan options (recommended, legal-only, fastest, max-safety,
 * best-placement) for user comparison. Uses local truck data.
 */

import type { LoadItem, TruckType } from './types'
import { LEGAL_LIMITS } from './types'
import { trucks } from './trucks'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedLoad {
  id?: string
  items: LoadItem[]
  length: number
  width: number
  height: number
  weight: number
  totalWeight?: number
  origin?: string
  destination?: string
  confidence: number
}

export type PlanStrategy =
  | 'recommended'
  | 'legal-only'
  | 'cost-optimized'
  | 'fewest-trucks'
  | 'fastest'
  | 'max-safety'
  | 'best-placement'

export interface LegacySmartPlanOption {
  strategy: PlanStrategy
  name: string
  description: string
  plan: {
    totalTrucks: number
    totalWeight: number
    totalItems: number
    warnings: string[]
    loads: Array<{
      id: string
      items: LoadItem[]
      recommendedTruck: TruckType
      weight: number
    }>
  }
  totalTrucks: number
  totalCost: number
  permitCount: number
  escortRequired: boolean
  legalLoads: number
  nonLegalLoads: number
  isRecommended: boolean
  badges: string[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function expandItems(items: LoadItem[]): LoadItem[] {
  const expanded: LoadItem[] = []
  for (const item of items) {
    const qty = item.quantity || 1
    for (let i = 0; i < qty; i++) {
      expanded.push({
        ...item,
        id: qty > 1 ? `${item.id}-unit-${i + 1}` : item.id,
        quantity: 1,
      })
    }
  }
  return expanded
}

function getItemWeight(item: LoadItem): number {
  return item.weight * (item.quantity || 1)
}

function isLegalOnTruck(item: LoadItem, truck: TruckType): boolean {
  const totalHeight = item.height + truck.deckHeight
  const itemWeight = getItemWeight(item)
  return (
    item.length <= truck.deckLength &&
    item.width <= truck.deckWidth &&
    itemWeight <= truck.maxCargoWeight &&
    totalHeight <= LEGAL_LIMITS.HEIGHT &&
    item.width <= LEGAL_LIMITS.WIDTH
  )
}

function fitsOnTruck(item: LoadItem, truck: TruckType): boolean {
  const itemWeight = getItemWeight(item)
  return (
    item.length <= truck.deckLength &&
    item.width <= truck.deckWidth &&
    itemWeight <= truck.maxCargoWeight
  )
}

interface SimplePlan {
  loads: Array<{
    id: string
    items: LoadItem[]
    truck: TruckType
    weight: number
    isLegal: boolean
    permits: string[]
  }>
  warnings: string[]
}

function scoreTruckFit(item: LoadItem, truck: TruckType): number {
  if (!fitsOnTruck(item, truck)) return -1
  const legal = isLegalOnTruck(item, truck)
  let score = 50
  // Tighter length fit is better
  const lengthUtil = item.length / truck.deckLength
  score += lengthUtil * 20
  // Weight utilization
  const weightUtil = getItemWeight(item) / truck.maxCargoWeight
  score += weightUtil * 15
  // Legal bonus
  if (legal) score += 15
  return score
}

function buildPlanResult(plan: SimplePlan, totalItems: number): Omit<LegacySmartPlanOption, 'strategy' | 'name' | 'description' | 'isRecommended' | 'badges'> {
  const legalLoads = plan.loads.filter(l => l.isLegal).length
  const permitCount = plan.loads.reduce((sum, l) => sum + l.permits.length, 0)
  const totalWeight = plan.loads.reduce((sum, l) => sum + l.weight, 0)

  return {
    plan: {
      totalTrucks: plan.loads.length,
      totalWeight,
      totalItems,
      warnings: plan.warnings,
      loads: plan.loads.map(l => ({
        id: l.id,
        items: l.items,
        recommendedTruck: l.truck,
        weight: l.weight,
      })),
    },
    totalTrucks: plan.loads.length,
    totalCost: 0, // Overridden by consumer
    permitCount,
    escortRequired: false,
    legalLoads,
    nonLegalLoads: plan.loads.length - legalLoads,
  }
}

// ---------------------------------------------------------------------------
// Strategy Planners
// ---------------------------------------------------------------------------

/** Recommended: best overall truck per item */
function planRecommended(items: LoadItem[]): SimplePlan {
  const loads: SimplePlan['loads'] = []
  const warnings: string[] = []

  for (const item of items) {
    let bestTruck = trucks[0]!
    let bestScore = -1

    for (const truck of trucks) {
      const s = scoreTruckFit(item, truck)
      if (s > bestScore) {
        bestScore = s
        bestTruck = truck
      }
    }

    const legal = isLegalOnTruck(item, bestTruck)
    const permits: string[] = []
    if (!legal) {
      const totalH = item.height + bestTruck.deckHeight
      if (totalH > LEGAL_LIMITS.HEIGHT) permits.push(`Oversize height: ${totalH.toFixed(1)}'`)
      if (item.width > LEGAL_LIMITS.WIDTH) permits.push(`Oversize width: ${item.width.toFixed(1)}'`)
    }

    loads.push({
      id: `load-${loads.length + 1}`,
      items: [item],
      truck: bestTruck,
      weight: getItemWeight(item),
      isLegal: legal,
      permits,
    })
  }

  return { loads, warnings }
}

/** Legal-only: pick trucks that keep loads within legal limits */
function planLegalOnly(items: LoadItem[]): SimplePlan {
  const loads: SimplePlan['loads'] = []
  const warnings: string[] = []

  for (const item of items) {
    const legalTrucks = trucks.filter(t => isLegalOnTruck(item, t))

    if (legalTrucks.length > 0) {
      // Pick smallest legal truck (by deck length)
      const best = [...legalTrucks].sort((a, b) => a.deckLength - b.deckLength)[0]!
      loads.push({
        id: `load-${loads.length + 1}`,
        items: [item],
        truck: best,
        weight: getItemWeight(item),
        isLegal: true,
        permits: [],
      })
    } else {
      // Fallback to best fit
      let bestTruck = trucks[0]!
      let bestScore = -1
      for (const truck of trucks) {
        const s = scoreTruckFit(item, truck)
        if (s > bestScore) { bestScore = s; bestTruck = truck }
      }
      const permits: string[] = ['Oversize/overweight permit required']
      warnings.push(`Item "${item.description}" requires permits (no legal option)`)
      loads.push({
        id: `load-${loads.length + 1}`,
        items: [item],
        truck: bestTruck,
        weight: getItemWeight(item),
        isLegal: false,
        permits,
      })
    }
  }

  return { loads, warnings }
}

/** Fastest: prefer common trucks (flatbed, step deck) for quick dispatch */
function planFastest(items: LoadItem[]): SimplePlan {
  const loads: SimplePlan['loads'] = []
  const warnings: string[] = []
  const commonCategories = ['FLATBED', 'STEP_DECK']

  for (const item of items) {
    const commonLegal = trucks.filter(t =>
      commonCategories.includes(t.category) && isLegalOnTruck(item, t)
    )
    const anyLegal = trucks.filter(t => isLegalOnTruck(item, t))

    const candidates = commonLegal.length > 0 ? commonLegal : anyLegal
    if (candidates.length > 0) {
      const best = [...candidates].sort((a, b) => a.deckLength - b.deckLength)[0]!
      loads.push({
        id: `load-${loads.length + 1}`,
        items: [item],
        truck: best,
        weight: getItemWeight(item),
        isLegal: true,
        permits: [],
      })
    } else {
      let bestTruck = trucks[0]!
      let bestScore = -1
      for (const truck of trucks) {
        const s = scoreTruckFit(item, truck)
        if (s > bestScore) { bestScore = s; bestTruck = truck }
      }
      warnings.push(`Item "${item.description}" requires permits`)
      loads.push({
        id: `load-${loads.length + 1}`,
        items: [item],
        truck: bestTruck,
        weight: getItemWeight(item),
        isLegal: false,
        permits: ['Oversize permit'],
      })
    }
  }

  return { loads, warnings }
}

/** Max safety: oversized trucks with maximum clearance margins */
function planMaxSafety(items: LoadItem[]): SimplePlan {
  const loads: SimplePlan['loads'] = []
  const warnings: string[] = []

  for (const item of items) {
    let bestTruck = trucks[0]!
    let bestMargin = -Infinity

    for (const truck of trucks) {
      if (!fitsOnTruck(item, truck)) continue
      const heightMargin = truck.maxLegalCargoHeight - item.height
      const weightMargin = (truck.maxCargoWeight - getItemWeight(item)) / truck.maxCargoWeight
      const margin = heightMargin * 5 + weightMargin * 50 + (truck.deckLength - item.length) * 2
      if (margin > bestMargin) {
        bestMargin = margin
        bestTruck = truck
      }
    }

    const legal = isLegalOnTruck(item, bestTruck)
    loads.push({
      id: `load-${loads.length + 1}`,
      items: [item],
      truck: bestTruck,
      weight: getItemWeight(item),
      isLegal: legal,
      permits: legal ? [] : ['Oversize permit'],
    })
  }

  return { loads, warnings }
}

/** Best placement: match truck type to cargo description */
function planBestPlacement(items: LoadItem[]): SimplePlan {
  const loads: SimplePlan['loads'] = []
  const warnings: string[] = []

  for (const item of items) {
    let bestTruck = trucks[0]!
    let bestScore = -Infinity
    const desc = (item.description || '').toLowerCase()

    for (const truck of trucks) {
      if (!fitsOnTruck(item, truck)) continue
      let score = 50

      // Equipment matching
      if (truck.loadingMethod === 'drive-on' && /excavator|dozer|loader|tractor|tracked|skid.?steer/.test(desc)) score += 25
      if (['RGN', 'LOWBOY'].includes(truck.category) && /excavator|dozer|loader|heavy/.test(desc)) score += 20
      if (['FLATBED', 'STEP_DECK'].includes(truck.category) && /pallet|crate|forklift|lumber|steel/.test(desc)) score += 15

      // Height fit
      const clearance = truck.maxLegalCargoHeight - item.height
      if (clearance >= 0 && clearance <= 2) score += 10

      if (isLegalOnTruck(item, truck)) score += 15

      if (score > bestScore) { bestScore = score; bestTruck = truck }
    }

    const legal = isLegalOnTruck(item, bestTruck)
    loads.push({
      id: `load-${loads.length + 1}`,
      items: [item],
      truck: bestTruck,
      weight: getItemWeight(item),
      isLegal: legal,
      permits: legal ? [] : ['Oversize permit'],
    })
  }

  return { loads, warnings }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function generateSmartPlans(
  parsedLoad: ParsedLoad,
  _options: {
    routeStates?: string[]
    routeDistance?: number
    shipDate?: Date
  } = {}
): LegacySmartPlanOption[] {
  const items = expandItems([...parsedLoad.items])
  const totalItems = items.length
  const options: LegacySmartPlanOption[] = []

  // Strategy 1: Recommended
  const rec = planRecommended(items)
  options.push({
    ...buildPlanResult(rec, totalItems),
    strategy: 'recommended',
    name: 'Recommended Plan',
    description: 'Best balance of cost, efficiency, and compliance',
    isRecommended: true,
    badges: ['Best Overall'],
  })

  // Strategy 2: Max Safety
  const safety = planMaxSafety(items)
  const safetyResult = buildPlanResult(safety, totalItems)
  options.push({
    ...safetyResult,
    strategy: 'max-safety',
    name: 'Max Safety Plan',
    description: 'Oversized trucks with maximum clearance margins',
    isRecommended: false,
    badges: ['Max Margins'],
  })

  // Strategy 3: Fastest
  const fast = planFastest(items)
  const fastResult = buildPlanResult(fast, totalItems)
  const fastBadges: string[] = ['Quick Dispatch']
  if (fastResult.permitCount === 0) fastBadges.push('No Permits')
  options.push({
    ...fastResult,
    strategy: 'fastest',
    name: 'Fastest Plan',
    description: 'Legal loads with common trucks for quick dispatch',
    isRecommended: false,
    badges: fastBadges,
  })

  // Strategy 4: Best Placement
  const placement = planBestPlacement(items)
  options.push({
    ...buildPlanResult(placement, totalItems),
    strategy: 'best-placement',
    name: 'Best Placement Plan',
    description: 'Trucks matched by cargo type for ideal fit',
    isRecommended: false,
    badges: ['Type Matched'],
  })

  // Strategy 5: Legal Only
  const legal = planLegalOnly(items)
  const legalResult = buildPlanResult(legal, totalItems)
  const legalBadges: string[] = []
  if (legalResult.permitCount === 0) legalBadges.push('No Permits')
  if (legalResult.legalLoads === legal.loads.length) legalBadges.push('100% Legal')
  options.push({
    ...legalResult,
    strategy: 'legal-only',
    name: 'Legal-Only Plan',
    description: legalResult.permitCount === 0
      ? 'All loads within legal limits - no permits required'
      : 'Minimized permits where possible',
    isRecommended: false,
    badges: legalBadges,
  })

  return options
}
