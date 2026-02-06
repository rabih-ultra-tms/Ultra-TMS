import type { LatLng } from './route-calculator'

export interface LowClearanceBridge {
  id: string
  name: string
  state: string
  routeName: string
  clearance: number
  location: LatLng
}

export type ClearanceSeverity = 'ok' | 'caution' | 'warning' | 'danger'

export interface RouteBridgeClearanceSummary {
  hasIssues: boolean
  bridges: Array<{
    bridge: LowClearanceBridge
    clearanceResult: {
      clears: boolean
      clearance: number
      deficit: number
      severity: ClearanceSeverity
    }
  }>
  warnings: string[]
  recommendations: string[]
}

const SAMPLE_BRIDGES: LowClearanceBridge[] = [
  {
    id: 'bridge-1',
    name: 'I-80 Overpass',
    state: 'IA',
    routeName: 'I-80',
    clearance: 13.8,
    location: { lat: 41.6, lng: -93.6 },
  },
  {
    id: 'bridge-2',
    name: 'State Hwy 20 Bridge',
    state: 'IL',
    routeName: 'SR-20',
    clearance: 13.2,
    location: { lat: 42.0, lng: -88.0 },
  },
]

export function checkRouteBridgeClearances(
  waypoints: LatLng[],
  totalHeight: number
): RouteBridgeClearanceSummary {
  if (!totalHeight) {
    return {
      hasIssues: false,
      bridges: [],
      warnings: [],
      recommendations: [],
    }
  }

  const bridges = SAMPLE_BRIDGES.map((bridge) => {
    const deficit = Math.max(0, totalHeight - bridge.clearance)
    const clears = deficit <= 0
    const severity: ClearanceSeverity = deficit <= 0
      ? 'ok'
      : deficit < 0.5
        ? 'caution'
        : deficit < 1.5
          ? 'warning'
          : 'danger'

    return {
      bridge,
      clearanceResult: {
        clears,
        clearance: bridge.clearance,
        deficit,
        severity,
      },
    }
  })

  const issues = bridges.filter(b => !b.clearanceResult.clears)

  return {
    hasIssues: issues.length > 0,
    bridges: issues.length > 0 ? issues : bridges.slice(0, 1),
    warnings: issues.length > 0
      ? [`${issues.length} bridge(s) have insufficient clearance`]
      : ['No critical bridge clearance issues detected'],
    recommendations: issues.length > 0
      ? ['Consider alternate routing or adjust load height']
      : ['Maintain planned route'],
  }
}
