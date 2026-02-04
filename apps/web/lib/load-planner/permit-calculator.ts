import type { CargoSpecs, DetailedPermitRequirement, DetailedRoutePermitSummary, EscortCostBreakdown, RoutePermitSummary } from './types'

const BASE_PERMIT_CENTS = 7500
const OVERWEIGHT_FEE_CENTS = 15000
const OVERSIZE_FEE_CENTS = 5000
const ESCORT_PER_DAY_CENTS = 80000
const POLE_CAR_PER_DAY_CENTS = 100000
const POLICE_PER_HOUR_CENTS = 10000

const LEGAL_LIMITS = {
  width: 8.5,
  height: 13.5,
  length: 53,
  weight: 80000,
}

const formatStateName = (stateCode: string) => stateCode

const estimateTripDays = (distance: number) => Math.max(1, Math.ceil(distance / 400))

const estimateTripHours = (distance: number) => Math.max(2, Math.ceil(distance / 50))

export function calculateRoutePermits(
  states: string[],
  cargo: CargoSpecs,
  stateDistances: Record<string, number> = {}
): RoutePermitSummary {
  const statePermits = states.map((state) => {
    const oversizeRequired = cargo.width > LEGAL_LIMITS.width || cargo.height > LEGAL_LIMITS.height || cargo.length > LEGAL_LIMITS.length
    const overweightRequired = cargo.grossWeight > LEGAL_LIMITS.weight
    const isSuperload = cargo.width > 14 || cargo.height > 16 || cargo.grossWeight > 200000
    const escortsRequired = cargo.width > 12 || cargo.height > 15 ? 1 : 0
    const poleCarRequired = cargo.height > 14.5
    const policeEscortRequired = cargo.width > 14 || cargo.height > 16

    const travelRestrictions = oversizeRequired || overweightRequired
      ? ['Daylight travel only', 'No weekend/holiday travel']
      : []

    return {
      stateCode: state,
      stateName: formatStateName(state),
      oversizeRequired,
      overweightRequired,
      isSuperload,
      escortsRequired,
      poleCarRequired,
      policeEscortRequired,
      travelRestrictions,
    }
  })

  const totalPermitFees = statePermits.reduce((sum, state) => {
    const oversizeFees = state.oversizeRequired ? OVERSIZE_FEE_CENTS : 0
    const overweightFees = state.overweightRequired ? OVERWEIGHT_FEE_CENTS : 0
    return sum + BASE_PERMIT_CENTS + oversizeFees + overweightFees
  }, 0)

  const totalEscortCost = statePermits.reduce((sum, state) => {
    if (state.escortsRequired === 0 && !state.poleCarRequired && !state.policeEscortRequired) return sum
    const distance = stateDistances[state.stateCode] || 200
    const days = estimateTripDays(distance)
    const hours = estimateTripHours(distance)
    const escortCost = state.escortsRequired * ESCORT_PER_DAY_CENTS * days
    const poleCost = state.poleCarRequired ? POLE_CAR_PER_DAY_CENTS * days : 0
    const policeCost = state.policeEscortRequired ? POLICE_PER_HOUR_CENTS * hours : 0
    return sum + escortCost + poleCost + policeCost
  }, 0)

  const overallRestrictions = statePermits.flatMap(p => p.travelRestrictions)

  return {
    statePermits,
    totalPermitCost: totalPermitFees,
    totalPermitFees,
    totalEscortCost,
    overallRestrictions,
    warnings: [],
  }
}

export function calculateDetailedRoutePermits(
  states: string[],
  cargo: CargoSpecs,
  stateDistances: Record<string, number> = {}
): DetailedRoutePermitSummary {
  const detailed: DetailedPermitRequirement[] = states.map((state) => {
    const oversizeRequired = cargo.width > LEGAL_LIMITS.width || cargo.height > LEGAL_LIMITS.height || cargo.length > LEGAL_LIMITS.length
    const overweightRequired = cargo.grossWeight > LEGAL_LIMITS.weight
    const isSuperload = cargo.width > 14 || cargo.height > 16 || cargo.grossWeight > 200000
    const escortsRequired = cargo.width > 12 || cargo.height > 15 ? 1 : 0
    const poleCarRequired = cargo.height > 14.5
    const policeEscortRequired = cargo.width > 14 || cargo.height > 16
    const travelRestrictions = oversizeRequired || overweightRequired
      ? ['Daylight travel only', 'No weekend/holiday travel']
      : []

    const permitFees = BASE_PERMIT_CENTS + (oversizeRequired ? OVERSIZE_FEE_CENTS : 0) + (overweightRequired ? OVERWEIGHT_FEE_CENTS : 0)
    const distance = stateDistances[state] || 200
    const days = estimateTripDays(distance)
    const hours = estimateTripHours(distance)
    const escortFees = (escortsRequired * ESCORT_PER_DAY_CENTS * days)
      + (poleCarRequired ? POLE_CAR_PER_DAY_CENTS * days : 0)
      + (policeEscortRequired ? POLICE_PER_HOUR_CENTS * hours : 0)

    return {
      stateCode: state,
      stateName: formatStateName(state),
      oversizeRequired,
      overweightRequired,
      isSuperload,
      permitFees,
      escortFees,
      totalCost: permitFees + escortFees,
      escortsRequired,
      poleCarRequired,
      policeEscortRequired,
      travelRestrictions,
      warnings: isSuperload ? ['Superload - additional routing review required'] : [],
      source: {
        agency: `${state} DOT`,
        phone: '1-800-DOT-INFO',
        website: 'https://www.transportation.gov',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    }
  })

  const totalPermitCost = detailed.reduce((sum, item) => sum + item.permitFees, 0)
  const totalEscortCost = detailed.reduce((sum, item) => sum + item.escortFees, 0)

  const escortBreakdown: EscortCostBreakdown = {
    escortCount: Math.max(...detailed.map(p => p.escortsRequired), 0),
    needsPoleCar: detailed.some(p => p.poleCarRequired),
    needsPoliceEscort: detailed.some(p => p.policeEscortRequired),
    tripDays: estimateTripDays(Object.values(stateDistances)[0] || 200),
    tripHours: estimateTripHours(Object.values(stateDistances)[0] || 200),
    rates: {
      escortPerDay: ESCORT_PER_DAY_CENTS / 100,
      poleCarPerDay: POLE_CAR_PER_DAY_CENTS / 100,
      policePerHour: POLICE_PER_HOUR_CENTS / 100,
    },
    totalEscortCost: detailed.reduce((sum, item) => sum + item.escortsRequired * ESCORT_PER_DAY_CENTS, 0) / 100,
    totalPoleCarCost: detailed.some(p => p.poleCarRequired) ? POLE_CAR_PER_DAY_CENTS / 100 : 0,
    totalPoliceCost: detailed.some(p => p.policeEscortRequired) ? POLICE_PER_HOUR_CENTS / 100 : 0,
    grandTotal: totalEscortCost / 100,
    perState: detailed.map(p => ({
      stateCode: p.stateCode,
      stateName: p.stateName,
      distanceMiles: stateDistances[p.stateCode] || 200,
      daysInState: estimateTripDays(stateDistances[p.stateCode] || 200),
      escortCountInState: p.escortsRequired,
      poleCarRequiredInState: p.poleCarRequired,
      policeRequiredInState: p.policeEscortRequired,
      stateCost: p.escortFees / 100,
    })),
  }

  return {
    statePermits: detailed,
    totalPermitCost,
    totalEscortCost,
    totalCost: totalPermitCost + totalEscortCost,
    escortBreakdown,
  }
}
