export interface SeasonalRestriction {
  stateCode: string
  stateName: string
  restrictionType: string
  startMonth: number
  endMonth: number
  maxWeightReductionPct: number
  notes: string
}

const SPRING_THAW_STATES = new Set(['MN', 'ND', 'SD', 'WI', 'MI', 'ME'])
const WINTER_STATES = new Set(['ND', 'SD', 'MN', 'WI', 'MI'])

export function checkRouteSeasonalRestrictions(states: string[], shipDate?: Date) {
  const date = shipDate || new Date()
  const month = date.getMonth() + 1

  const affectedStates: SeasonalRestriction[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  states.forEach((state) => {
    if (SPRING_THAW_STATES.has(state) && month >= 3 && month <= 4) {
      affectedStates.push({
        stateCode: state,
        stateName: state,
        restrictionType: 'Spring thaw weight limits',
        startMonth: 3,
        endMonth: 4,
        maxWeightReductionPct: 15,
        notes: 'Reduced axle weights may apply on secondary roads',
      })
      warnings.push(`${state}: Spring thaw weight limits in effect`)
      recommendations.push('Plan alternate routes or reduce axle weights')
    }
    if (WINTER_STATES.has(state) && (month <= 2 || month === 12)) {
      affectedStates.push({
        stateCode: state,
        stateName: state,
        restrictionType: 'Winter load restrictions',
        startMonth: 12,
        endMonth: 2,
        maxWeightReductionPct: 10,
        notes: 'Seasonal restrictions due to freeze/thaw cycles',
      })
      warnings.push(`${state}: Winter travel restrictions possible`)
    }
  })

  return {
    hasRestrictions: affectedStates.length > 0,
    affectedStates,
    warnings,
    recommendations,
  }
}
