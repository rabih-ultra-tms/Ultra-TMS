import type { CargoSpecs, DetailedPermitRequirement, DetailedRoutePermitSummary, EscortCostBreakdown, RoutePermitSummary } from './types'
import { statePermits, type StatePermitData } from './state-permits'

// Escort cost constants (cents)
const ESCORT_PER_DAY_CENTS = 80_000
const POLE_CAR_PER_DAY_CENTS = 100_000
const POLICE_PER_HOUR_CENTS = 10_000

// Regional escort cost multipliers
const ESCORT_REGIONAL_MULTIPLIERS: Record<string, number> = {
  CA: 1.40, WA: 1.20, OR: 1.15, AK: 1.25,
  NY: 1.35, NJ: 1.30, MA: 1.25, CT: 1.20, PA: 1.15, MD: 1.15,
  DE: 1.10, NH: 1.10, VT: 1.05, ME: 1.05, RI: 1.15, DC: 1.35,
  NV: 1.15, CO: 1.10, UT: 1.00, HI: 1.50, WY: 0.95,
  ID: 0.95, MT: 0.90, AZ: 1.00, NM: 0.95, TX: 1.05, OK: 0.90,
  FL: 1.10, GA: 1.00, NC: 0.95, SC: 0.90, VA: 1.05,
  WV: 0.85, KY: 0.85, TN: 0.90, AL: 0.85, MS: 0.80,
  LA: 0.90, AR: 0.85, IL: 1.00, IN: 0.90, OH: 0.95,
  MI: 0.95, WI: 0.90, MN: 0.90, IA: 0.85, MO: 0.90,
  KS: 0.85, NE: 0.80, SD: 0.80, ND: 0.80,
}

const getRegionalMultiplier = (stateCode: string): number =>
  ESCORT_REGIONAL_MULTIPLIERS[stateCode.toUpperCase()] ?? 1.0

const getStateData = (stateCode: string): StatePermitData | undefined =>
  statePermits.find(s => s.stateCode === stateCode.toUpperCase())

const estimateTripDays = (distance: number) => Math.max(1, Math.ceil(distance / 350))
const estimateTripHours = (distance: number) => Math.max(2, Math.ceil(distance / 50))

// Securement width allowance: chains/binders extend ~5" per side = 10" = 0.83 ft
const SECUREMENT_WIDTH_ALLOWANCE = 0.83

function getTransportWidth(width: number, widthIncludesSecurement?: boolean): number {
  return widthIncludesSecurement ? width : width + SECUREMENT_WIDTH_ALLOWANCE
}

function calculateStatePermitFees(
  stateData: StatePermitData,
  cargo: CargoSpecs,
  distanceMiles: number
): { permitFeeCents: number; oversizeRequired: boolean; overweightRequired: boolean; isSuperload: boolean; warnings: string[] } {
  const limits = stateData.legalLimits
  const transportWidth = getTransportWidth(cargo.width, cargo.widthIncludesSecurement)

  const oversizeWidth = transportWidth > limits.maxWidth
  const oversizeHeight = cargo.height > limits.maxHeight
  const oversizeLength = cargo.length > limits.maxLength.combination
  const oversizeRequired = oversizeWidth || oversizeHeight || oversizeLength
  const overweightRequired = cargo.grossWeight > limits.maxWeight.gross

  // Superload check
  const st = stateData.superloadThresholds
  const isSuperload = st
    ? (transportWidth > (st.width ?? 16)) || (cargo.height > (st.height ?? 16)) ||
      (cargo.length > (st.length ?? 120)) || (cargo.grossWeight > (st.weight ?? 200000))
    : transportWidth > 16 || cargo.height > 16 || cargo.grossWeight > 200000

  const warnings: string[] = []
  let permitFeeCents = 0

  // Oversize permit fees (in dollars from state data, convert to cents)
  if (oversizeRequired) {
    const oversize = stateData.oversizePermits.singleTrip
    permitFeeCents += oversize.baseFee * 100

    // Dimension surcharges
    const surcharges = oversize.dimensionSurcharges
    if (surcharges) {
      const isCumulative = oversize.surchargeModel !== 'tiered'

      if (surcharges.width) {
        let widthSurcharge = 0
        for (const s of surcharges.width) {
          if (transportWidth > s.threshold) {
            widthSurcharge = isCumulative ? widthSurcharge + s.fee * 100 : Math.max(widthSurcharge, s.fee * 100)
          }
        }
        permitFeeCents += widthSurcharge
      }

      if (surcharges.height) {
        let heightSurcharge = 0
        for (const s of surcharges.height) {
          if (cargo.height > s.threshold) {
            heightSurcharge = isCumulative ? heightSurcharge + s.fee * 100 : Math.max(heightSurcharge, s.fee * 100)
          }
        }
        permitFeeCents += heightSurcharge
      }

      if (surcharges.length) {
        let lengthSurcharge = 0
        for (const s of surcharges.length) {
          if (cargo.length > s.threshold) {
            lengthSurcharge = isCumulative ? lengthSurcharge + s.fee * 100 : Math.max(lengthSurcharge, s.fee * 100)
          }
        }
        permitFeeCents += lengthSurcharge
      }
    }
  }

  // Overweight permit fees
  if (overweightRequired) {
    const overweight = stateData.overweightPermits.singleTrip
    permitFeeCents += overweight.baseFee * 100

    // Weight bracket surcharges
    if (overweight.weightBrackets) {
      for (const bracket of overweight.weightBrackets) {
        if (cargo.grossWeight <= bracket.upTo) {
          permitFeeCents += bracket.fee * 100
          break
        }
      }
    }

    // Per-mile fees
    if (overweight.perMileFee) {
      permitFeeCents += Math.round(overweight.perMileFee * distanceMiles * 100)
    }

    // Ton-mile fees
    if (overweight.tonMileFee) {
      const tonMiles = (cargo.grossWeight / 2000) * distanceMiles
      permitFeeCents += Math.round(overweight.tonMileFee * tonMiles * 100)
    }

    // Extra-legal fees
    if (overweight.extraLegalFees?.perTrip) {
      permitFeeCents += overweight.extraLegalFees.perTrip * 100
    }
  }

  if (isSuperload) {
    warnings.push(`Superload in ${stateData.stateName} - requires route survey and extended processing`)
  }

  return { permitFeeCents, oversizeRequired, overweightRequired, isSuperload, warnings }
}

function calculateStateEscortFees(
  stateData: StatePermitData,
  cargo: CargoSpecs,
  distanceMiles: number
): { escortFeeCents: number; escortsRequired: number; poleCarRequired: boolean; policeEscortRequired: boolean; travelRestrictions: string[] } {
  const transportWidth = getTransportWidth(cargo.width, cargo.widthIncludesSecurement)
  const rules = stateData.escortRules
  const multiplier = getRegionalMultiplier(stateData.stateCode)
  const days = estimateTripDays(distanceMiles)
  const hours = estimateTripHours(distanceMiles)

  let escortsRequired = 0
  if (transportWidth > rules.width.oneEscort) escortsRequired = 1
  if (rules.width.twoEscorts && transportWidth > rules.width.twoEscorts) escortsRequired = 2
  if (rules.length?.oneEscort && cargo.length > rules.length.oneEscort) escortsRequired = Math.max(escortsRequired, 1)
  if (rules.length?.twoEscorts && cargo.length > rules.length.twoEscorts) escortsRequired = Math.max(escortsRequired, 2)

  const poleCarRequired = rules.height ? cargo.height > rules.height.poleCar : false
  const policeEscortRequired = rules.policeEscort
    ? (rules.policeEscort.width ? transportWidth > rules.policeEscort.width : false) ||
      (rules.policeEscort.height ? cargo.height > rules.policeEscort.height : false)
    : false

  let escortFeeCents = 0
  escortFeeCents += Math.round(escortsRequired * ESCORT_PER_DAY_CENTS * days * multiplier)
  if (poleCarRequired) escortFeeCents += Math.round(POLE_CAR_PER_DAY_CENTS * days * multiplier)
  if (policeEscortRequired) {
    const policeFee = rules.policeEscort?.fee
      ? rules.policeEscort.fee * 100 * Math.ceil(distanceMiles / 50) // fee per segment
      : POLICE_PER_HOUR_CENTS * hours
    escortFeeCents += Math.round(policeFee * multiplier)
  }

  // Travel restrictions
  const travelRestrictions: string[] = []
  const tr = stateData.travelRestrictions
  if (tr.noNightTravel) travelRestrictions.push(tr.nightDefinition ?? 'Daylight travel only')
  if (tr.noWeekendTravel) travelRestrictions.push(tr.weekendDefinition ?? 'No weekend travel')
  if (tr.noHolidayTravel) travelRestrictions.push('No holiday travel')
  if (tr.peakHourRestrictions) travelRestrictions.push(tr.peakHourRestrictions)

  return { escortFeeCents, escortsRequired, poleCarRequired, policeEscortRequired, travelRestrictions }
}

// Fallback for states not in the database
const FALLBACK_LIMITS = { maxWidth: 8.5, maxHeight: 13.5, maxLength: { single: 48, combination: 65 }, maxWeight: { gross: 80000 } }

function getFallbackResult(stateCode: string, cargo: CargoSpecs, distanceMiles: number) {
  const oversizeRequired = cargo.width > FALLBACK_LIMITS.maxWidth || cargo.height > FALLBACK_LIMITS.maxHeight || cargo.length > FALLBACK_LIMITS.maxLength.combination
  const overweightRequired = cargo.grossWeight > FALLBACK_LIMITS.maxWeight.gross
  const isSuperload = cargo.width > 16 || cargo.height > 16 || cargo.grossWeight > 200000
  const days = estimateTripDays(distanceMiles)
  const hours = estimateTripHours(distanceMiles)
  const escortsRequired = cargo.width > 12 ? 1 : 0
  const poleCarRequired = cargo.height > 14.5
  const policeEscortRequired = cargo.width > 14 || cargo.height > 16

  const permitFees = 5000 + (oversizeRequired ? 3000 : 0) + (overweightRequired ? 10000 : 0)
  const escortFees = (escortsRequired * ESCORT_PER_DAY_CENTS * days) +
    (poleCarRequired ? POLE_CAR_PER_DAY_CENTS * days : 0) +
    (policeEscortRequired ? POLICE_PER_HOUR_CENTS * hours : 0)

  return {
    stateCode, stateName: stateCode, oversizeRequired, overweightRequired, isSuperload,
    permitFees, escortFees, totalCost: permitFees + escortFees,
    escortsRequired, poleCarRequired, policeEscortRequired,
    travelRestrictions: oversizeRequired ? ['Daylight travel only'] : [],
    warnings: isSuperload ? ['Superload - contact DOT for routing'] : [],
    source: { agency: `${stateCode} DOT`, phone: 'N/A', website: 'https://www.transportation.gov', lastUpdated: '2025-01-15' },
  }
}

export function calculateRoutePermits(
  states: string[],
  cargo: CargoSpecs,
  stateDistances: Record<string, number> = {}
): RoutePermitSummary {
  const permits = states.map((stateCode) => {
    const stateData = getStateData(stateCode)
    const distance = stateDistances[stateCode] || 200

    if (!stateData) {
      const fb = getFallbackResult(stateCode, cargo, distance)
      return {
        stateCode, stateName: stateCode, oversizeRequired: fb.oversizeRequired,
        overweightRequired: fb.overweightRequired, isSuperload: fb.isSuperload,
        escortsRequired: fb.escortsRequired, poleCarRequired: fb.poleCarRequired,
        policeEscortRequired: fb.policeEscortRequired, travelRestrictions: fb.travelRestrictions,
      }
    }

    const { oversizeRequired, overweightRequired, isSuperload } = calculateStatePermitFees(stateData, cargo, distance)
    const escort = calculateStateEscortFees(stateData, cargo, distance)

    return {
      stateCode, stateName: stateData.stateName, oversizeRequired, overweightRequired, isSuperload,
      escortsRequired: escort.escortsRequired, poleCarRequired: escort.poleCarRequired,
      policeEscortRequired: escort.policeEscortRequired, travelRestrictions: escort.travelRestrictions,
    }
  })

  const totalPermitFees = states.reduce((sum, stateCode) => {
    const stateData = getStateData(stateCode)
    const distance = stateDistances[stateCode] || 200
    if (!stateData) return sum + 5000
    return sum + calculateStatePermitFees(stateData, cargo, distance).permitFeeCents
  }, 0)

  const totalEscortCost = states.reduce((sum, stateCode) => {
    const stateData = getStateData(stateCode)
    const distance = stateDistances[stateCode] || 200
    if (!stateData) return sum
    return sum + calculateStateEscortFees(stateData, cargo, distance).escortFeeCents
  }, 0)

  return {
    statePermits: permits,
    totalPermitCost: totalPermitFees,
    totalPermitFees,
    totalEscortCost,
    overallRestrictions: permits.flatMap(p => p.travelRestrictions),
    warnings: [],
  }
}

export function calculateDetailedRoutePermits(
  states: string[],
  cargo: CargoSpecs,
  stateDistances: Record<string, number> = {}
): DetailedRoutePermitSummary {
  const detailed: DetailedPermitRequirement[] = states.map((stateCode) => {
    const stateData = getStateData(stateCode)
    const distance = stateDistances[stateCode] || 200

    if (!stateData) {
      const fb = getFallbackResult(stateCode, cargo, distance)
      return {
        ...fb,
        state: fb.stateName,
        distanceInState: distance,
        estimatedFee: (fb.totalCost) / 100,
        reasons: [
          ...(fb.oversizeRequired ? [`Load exceeds legal size limits`] : []),
          ...(fb.overweightRequired ? [`Load exceeds legal weight limit of 80,000 lbs`] : []),
        ],
        calculationDetails: [`Estimated permit fee: $${(fb.permitFees / 100).toFixed(0)}`, `Estimated escort fee: $${(fb.escortFees / 100).toFixed(0)}`],
      }
    }

    const permit = calculateStatePermitFees(stateData, cargo, distance)
    const escort = calculateStateEscortFees(stateData, cargo, distance)
    const transportWidth = getTransportWidth(cargo.width, cargo.widthIncludesSecurement)
    const limits = stateData.legalLimits

    // Build reasons array
    const reasons: string[] = []
    if (transportWidth > limits.maxWidth) {
      reasons.push(`Width ${transportWidth.toFixed(1)}' exceeds legal limit of ${limits.maxWidth}'`)
    }
    if (cargo.height > limits.maxHeight) {
      reasons.push(`Height ${cargo.height.toFixed(1)}' exceeds legal limit of ${limits.maxHeight}'`)
    }
    if (cargo.length > limits.maxLength.combination) {
      reasons.push(`Length ${cargo.length.toFixed(1)}' exceeds legal limit of ${limits.maxLength.combination}'`)
    }
    if (cargo.grossWeight > limits.maxWeight.gross) {
      reasons.push(`Weight ${(cargo.grossWeight / 1000).toFixed(0)}k lbs exceeds legal limit of ${(limits.maxWeight.gross / 1000).toFixed(0)}k lbs`)
    }

    // Build calculationDetails array
    const calculationDetails: string[] = []
    if (permit.oversizeRequired) {
      calculationDetails.push(`Oversize permit base fee: $${(stateData.oversizePermits.singleTrip.baseFee).toFixed(0)}`)
    }
    if (permit.overweightRequired) {
      calculationDetails.push(`Overweight permit base fee: $${(stateData.overweightPermits.singleTrip.baseFee).toFixed(0)}`)
    }
    calculationDetails.push(`Total permit fees: $${(permit.permitFeeCents / 100).toFixed(0)}`)
    if (escort.escortsRequired > 0) {
      calculationDetails.push(`Escort vehicles required: ${escort.escortsRequired}`)
    }
    if (escort.poleCarRequired) {
      calculationDetails.push(`Pole car / height pole required`)
    }
    if (escort.policeEscortRequired) {
      calculationDetails.push(`Police escort required`)
    }
    if (escort.escortFeeCents > 0) {
      calculationDetails.push(`Total escort fees: $${(escort.escortFeeCents / 100).toFixed(0)}`)
    }

    const totalCost = permit.permitFeeCents + escort.escortFeeCents

    return {
      stateCode,
      stateName: stateData.stateName,
      state: stateData.stateName,
      distanceInState: distance,
      oversizeRequired: permit.oversizeRequired,
      overweightRequired: permit.overweightRequired,
      isSuperload: permit.isSuperload,
      permitFees: permit.permitFeeCents,
      escortFees: escort.escortFeeCents,
      totalCost,
      estimatedFee: totalCost / 100,
      escortsRequired: escort.escortsRequired,
      poleCarRequired: escort.poleCarRequired,
      policeEscortRequired: escort.policeEscortRequired,
      travelRestrictions: escort.travelRestrictions,
      warnings: permit.warnings,
      reasons,
      calculationDetails,
      source: {
        agency: stateData.contact.agency,
        phone: stateData.contact.phone,
        website: stateData.contact.website,
        lastUpdated: stateData.lastVerified ?? '2025-01-15',
      },
    }
  })

  const totalPermitCost = detailed.reduce((sum, item) => sum + item.permitFees, 0)
  const totalEscortCost = detailed.reduce((sum, item) => sum + item.escortFees, 0)
  const totalDistance = Object.values(stateDistances).reduce((a, b) => a + b, 0) || 200

  const escortBreakdown: EscortCostBreakdown = {
    escortCount: Math.max(...detailed.map(p => p.escortsRequired), 0),
    needsPoleCar: detailed.some(p => p.poleCarRequired),
    needsPoliceEscort: detailed.some(p => p.policeEscortRequired),
    tripDays: estimateTripDays(totalDistance),
    tripHours: estimateTripHours(totalDistance),
    rates: {
      escortPerDay: ESCORT_PER_DAY_CENTS / 100,
      poleCarPerDay: POLE_CAR_PER_DAY_CENTS / 100,
      policePerHour: POLICE_PER_HOUR_CENTS / 100,
    },
    totalEscortCost: detailed.reduce((sum, item) => sum + item.escortsRequired * ESCORT_PER_DAY_CENTS, 0) / 100,
    totalPoleCarCost: detailed.filter(p => p.poleCarRequired).reduce((sum, p) => sum + POLE_CAR_PER_DAY_CENTS * estimateTripDays(stateDistances[p.stateCode] || 200), 0) / 100,
    totalPoliceCost: detailed.filter(p => p.policeEscortRequired).reduce((sum, p) => sum + POLICE_PER_HOUR_CENTS * estimateTripHours(stateDistances[p.stateCode] || 200), 0) / 100,
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

/** Get state contact info for permit portal links */
export function getStateContacts(stateCodes: string[]): Array<{
  stateCode: string; stateName: string; agency: string; phone: string; website: string; processingTime: string
}> {
  return stateCodes.map(code => {
    const data = getStateData(code)
    if (!data) return { stateCode: code, stateName: code, agency: `${code} DOT`, phone: 'N/A', website: '', processingTime: 'N/A' }
    return {
      stateCode: data.stateCode,
      stateName: data.stateName,
      agency: data.contact.agency,
      phone: data.contact.phone,
      website: data.contact.website,
      processingTime: data.oversizePermits.singleTrip.processingTime,
    }
  })
}
