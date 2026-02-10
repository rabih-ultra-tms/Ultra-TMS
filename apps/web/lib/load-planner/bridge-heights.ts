/**
 * Bridge Heights Database for Load Planner
 *
 * Database of known low clearance bridges, tunnels, and overpasses
 * that pose hazards for oversize loads.
 */

import type { LatLng } from './route-calculator'
import { calculateDistance } from './route-calculator'

export interface LowClearanceBridge {
  id: string
  name: string
  location: string
  state: string
  highway: string
  clearanceHeight: number
  coordinates: LatLng
  type: 'bridge' | 'tunnel' | 'overpass' | 'underpass'
  restrictionType: 'posted' | 'parkway' | 'structural'
  alternateRoute?: string
  notes?: string
  hazardLevel: 'caution' | 'warning' | 'danger'
  truckProhibited?: boolean
  lastVerified?: string
}

export const LOW_CLEARANCE_BRIDGES: LowClearanceBridge[] = [
  { id: 'ny-belt-pkwy-1', name: 'Belt Parkway Bridges', location: 'Belt Parkway, Brooklyn/Queens', state: 'NY', highway: 'Belt Parkway', clearanceHeight: 10.5, coordinates: { lat: 40.5869, lng: -73.8981 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-278 or local streets', notes: 'NO commercial vehicles allowed on parkways', hazardLevel: 'danger', truckProhibited: true },
  { id: 'ny-hutchinson-pkwy', name: 'Hutchinson River Parkway Bridges', location: 'Westchester County', state: 'NY', highway: 'Hutchinson River Pkwy', clearanceHeight: 10.0, coordinates: { lat: 40.9357, lng: -73.7753 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-95 or I-287', notes: 'NO commercial vehicles - multiple low bridges', hazardLevel: 'danger', truckProhibited: true },
  { id: 'ny-saw-mill-pkwy', name: 'Saw Mill River Parkway', location: 'Westchester County', state: 'NY', highway: 'Saw Mill River Pkwy', clearanceHeight: 9.5, coordinates: { lat: 41.0168, lng: -73.8584 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-87 (NY Thruway)', notes: 'One of the lowest parkways - NO trucks', hazardLevel: 'danger', truckProhibited: true },
  { id: 'ny-11foot8-rome', name: 'Rome Railroad Bridge', location: 'Rome, NY - Erie Blvd', state: 'NY', highway: 'Erie Blvd E', clearanceHeight: 11.0, coordinates: { lat: 43.2129, lng: -75.4557 }, type: 'bridge', restrictionType: 'structural', alternateRoute: 'Use NY-49 or NY-69', notes: 'Frequent truck strikes', hazardLevel: 'danger' },
  { id: 'ny-cross-island-pkwy', name: 'Cross Island Parkway Bridges', location: 'Queens', state: 'NY', highway: 'Cross Island Pkwy', clearanceHeight: 10.5, coordinates: { lat: 40.7573, lng: -73.7543 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-295 or local streets', hazardLevel: 'danger', truckProhibited: true },
  { id: 'ny-bronx-river-pkwy', name: 'Bronx River Parkway Bridges', location: 'Bronx River Parkway', state: 'NY', highway: 'Bronx River Pkwy', clearanceHeight: 9.5, coordinates: { lat: 40.9073, lng: -73.8248 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-87 or I-95', hazardLevel: 'danger', truckProhibited: true },
  { id: 'ny-taconic-pkwy', name: 'Taconic State Parkway Bridges', location: 'Westchester/Putnam', state: 'NY', highway: 'Taconic State Pkwy', clearanceHeight: 10.0, coordinates: { lat: 41.2576, lng: -73.7867 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-87 or US-9', hazardLevel: 'danger', truckProhibited: true },
  { id: 'ma-storrow-drive', name: 'Storrow Drive Bridges', location: 'Storrow Drive, Boston', state: 'MA', highway: 'Storrow Drive', clearanceHeight: 10.0, coordinates: { lat: 42.3546, lng: -71.0892 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-93 or I-90 (Mass Pike)', notes: 'Famous for truck strikes every move-in day', hazardLevel: 'danger', truckProhibited: true },
  { id: 'ma-memorial-drive', name: 'Memorial Drive Bridges', location: 'Memorial Drive, Cambridge', state: 'MA', highway: 'Memorial Drive', clearanceHeight: 10.5, coordinates: { lat: 42.3584, lng: -71.0942 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-93', hazardLevel: 'danger', truckProhibited: true },
  { id: 'ma-soldiers-field-rd', name: 'Soldiers Field Road Bridges', location: 'Boston/Allston', state: 'MA', highway: 'Soldiers Field Rd', clearanceHeight: 10.0, coordinates: { lat: 42.3589, lng: -71.1298 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-90', hazardLevel: 'danger', truckProhibited: true },
  { id: 'nc-11foot8', name: '11foot8 Bridge (The Can Opener)', location: 'Gregson St, Durham', state: 'NC', highway: 'S Gregson St', clearanceHeight: 11.67, coordinates: { lat: 35.9988, lng: -78.9089 }, type: 'bridge', restrictionType: 'structural', alternateRoute: 'Use Main St or Duke St', hazardLevel: 'danger', lastVerified: '2019-10-01' },
  { id: 'pa-liberty-tunnel', name: 'Liberty Tunnel', location: 'Pittsburgh - Route 51', state: 'PA', highway: 'PA-51', clearanceHeight: 13.0, coordinates: { lat: 40.4162, lng: -79.9855 }, type: 'tunnel', restrictionType: 'structural', alternateRoute: 'Use I-376 or Fort Pitt Tunnel', hazardLevel: 'warning' },
  { id: 'pa-squirrel-hill-tunnel', name: 'Squirrel Hill Tunnel', location: 'Pittsburgh - I-376', state: 'PA', highway: 'I-376', clearanceHeight: 13.5, coordinates: { lat: 40.4298, lng: -79.9188 }, type: 'tunnel', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'va-hampton-roads-tunnel', name: 'Hampton Roads Bridge-Tunnel', location: 'I-64, Hampton Roads', state: 'VA', highway: 'I-64', clearanceHeight: 13.5, coordinates: { lat: 37.0046, lng: -76.3074 }, type: 'tunnel', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'md-baltimore-harbor-tunnel', name: 'Baltimore Harbor Tunnel', location: 'I-895, Baltimore', state: 'MD', highway: 'I-895', clearanceHeight: 13.5, coordinates: { lat: 39.2473, lng: -76.5786 }, type: 'tunnel', restrictionType: 'structural', alternateRoute: 'Use I-695', hazardLevel: 'caution' },
  { id: 'md-fort-mchenry-tunnel', name: 'Fort McHenry Tunnel', location: 'I-95, Baltimore', state: 'MD', highway: 'I-95', clearanceHeight: 13.5, coordinates: { lat: 39.2639, lng: -76.5820 }, type: 'tunnel', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'wv-wheeling-tunnel', name: 'Wheeling Tunnel', location: 'I-70, Wheeling', state: 'WV', highway: 'I-70', clearanceHeight: 13.5, coordinates: { lat: 40.0640, lng: -80.7209 }, type: 'tunnel', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'co-eisenhower-tunnel', name: 'Eisenhower-Johnson Memorial Tunnel', location: 'I-70, Continental Divide', state: 'CO', highway: 'I-70', clearanceHeight: 13.5, coordinates: { lat: 39.6795, lng: -105.9114 }, type: 'tunnel', restrictionType: 'structural', alternateRoute: 'Use US-6 Loveland Pass', hazardLevel: 'caution' },
  { id: 'ct-merritt-parkway', name: 'Merritt Parkway Bridges', location: 'Fairfield County', state: 'CT', highway: 'CT-15 (Merritt Pkwy)', clearanceHeight: 10.5, coordinates: { lat: 41.1175, lng: -73.4204 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-95', notes: 'Historic Art Deco bridges - NO commercial vehicles', hazardLevel: 'danger', truckProhibited: true },
  { id: 'ct-wilbur-cross', name: 'Wilbur Cross Parkway Bridges', location: 'New Haven area', state: 'CT', highway: 'CT-15 (Wilbur Cross)', clearanceHeight: 11.0, coordinates: { lat: 41.3276, lng: -72.9658 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-91 or I-95', hazardLevel: 'danger', truckProhibited: true },
  { id: 'nj-garden-state-pkwy', name: 'Garden State Parkway Bridges', location: 'Garden State Parkway', state: 'NJ', highway: 'Garden State Pkwy', clearanceHeight: 12.5, coordinates: { lat: 40.2826, lng: -74.0119 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use NJ Turnpike (I-95) or US-9', hazardLevel: 'warning', truckProhibited: true },
  { id: 'nj-pulaski-skyway', name: 'Pulaski Skyway', location: 'US-1/9, Jersey City to Newark', state: 'NJ', highway: 'US-1/9', clearanceHeight: 13.0, coordinates: { lat: 40.7227, lng: -74.1077 }, type: 'bridge', restrictionType: 'structural', alternateRoute: 'Use NJ Turnpike', hazardLevel: 'warning' },
  { id: 'nj-lincoln-tunnel-approaches', name: 'Lincoln Tunnel Approach', location: 'NJ-495, Weehawken', state: 'NJ', highway: 'NJ-495', clearanceHeight: 13.0, coordinates: { lat: 40.7638, lng: -74.0145 }, type: 'tunnel', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'ri-benefit-st-bridge', name: 'Benefit Street Railroad Bridge', location: 'Providence', state: 'RI', highway: 'Benefit St', clearanceHeight: 11.0, coordinates: { lat: 41.8267, lng: -71.4028 }, type: 'bridge', restrictionType: 'structural', alternateRoute: 'Use I-95 or I-195', hazardLevel: 'danger' },
  { id: 'il-lake-shore-drive', name: 'Lake Shore Drive Viaducts', location: 'Lake Shore Drive, Chicago', state: 'IL', highway: 'US-41 (LSD)', clearanceHeight: 12.0, coordinates: { lat: 41.8826, lng: -87.6126 }, type: 'overpass', restrictionType: 'parkway', alternateRoute: 'Use I-90/94', hazardLevel: 'danger', truckProhibited: true },
  { id: 'oh-detroit-shoreway', name: 'Detroit-Shoreway Bridges', location: 'Detroit Ave, Cleveland', state: 'OH', highway: 'Detroit Ave', clearanceHeight: 12.5, coordinates: { lat: 41.4855, lng: -81.7310 }, type: 'overpass', restrictionType: 'structural', alternateRoute: 'Use I-90', hazardLevel: 'warning' },
  { id: 'tn-jefferson-st-bridge', name: 'Jefferson Street Railroad Bridge', location: 'Nashville', state: 'TN', highway: 'Jefferson St', clearanceHeight: 11.5, coordinates: { lat: 36.1697, lng: -86.8134 }, type: 'bridge', restrictionType: 'structural', alternateRoute: 'Use I-65 or Charlotte Ave', hazardLevel: 'danger' },
  { id: 'in-indianapolis-downtown', name: 'Indianapolis Downtown Underpasses', location: 'Downtown Indianapolis', state: 'IN', highway: 'Various', clearanceHeight: 12.5, coordinates: { lat: 39.7684, lng: -86.1581 }, type: 'underpass', restrictionType: 'structural', alternateRoute: 'Use I-465 bypass', hazardLevel: 'warning' },
  { id: 'in-gary-broadway', name: 'Gary Broadway Underpass', location: 'Gary - Broadway', state: 'IN', highway: 'Broadway', clearanceHeight: 11.5, coordinates: { lat: 41.5934, lng: -87.3464 }, type: 'underpass', restrictionType: 'structural', alternateRoute: 'Use I-90', hazardLevel: 'danger' },
  { id: 'tx-gessner-overpass', name: 'Gessner Road Overpass', location: 'Houston - US-290', state: 'TX', highway: 'Gessner Rd', clearanceHeight: 12.5, coordinates: { lat: 29.8064, lng: -95.5310 }, type: 'overpass', restrictionType: 'structural', alternateRoute: 'Use US-290 mainlanes', hazardLevel: 'warning' },
  { id: 'la-i10-metairie', name: 'I-10 Metairie Road Overpass', location: 'Metairie, New Orleans area', state: 'LA', highway: 'Metairie Rd', clearanceHeight: 12.5, coordinates: { lat: 29.9833, lng: -90.1534 }, type: 'overpass', restrictionType: 'structural', alternateRoute: 'Use Veterans Memorial Blvd', hazardLevel: 'danger' },
  { id: 'ca-caldecott-tunnel', name: 'Caldecott Tunnel', location: 'SR-24, Oakland/Orinda', state: 'CA', highway: 'SR-24', clearanceHeight: 14.6, coordinates: { lat: 37.8573, lng: -122.1825 }, type: 'tunnel', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'ga-talmadge-bridge', name: 'Talmadge Memorial Bridge Approaches', location: 'US-17, Savannah', state: 'GA', highway: 'US-17', clearanceHeight: 14.0, coordinates: { lat: 32.0809, lng: -81.0912 }, type: 'overpass', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'wa-aurora-bridge', name: 'Aurora Bridge', location: 'Seattle - SR-99', state: 'WA', highway: 'SR-99', clearanceHeight: 13.5, coordinates: { lat: 47.6506, lng: -122.3472 }, type: 'bridge', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'mo-forest-park-overpass', name: 'Forest Park Overpasses', location: 'St. Louis', state: 'MO', highway: 'Various', clearanceHeight: 12.5, coordinates: { lat: 38.6365, lng: -90.2853 }, type: 'overpass', restrictionType: 'structural', alternateRoute: 'Use I-64 or I-44', hazardLevel: 'warning' },
  { id: 'ky-clark-memorial-bridge', name: 'Clark Memorial Bridge', location: 'Louisville - US-31', state: 'KY', highway: 'US-31', clearanceHeight: 13.0, coordinates: { lat: 38.2665, lng: -85.7443 }, type: 'bridge', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'al-birmingham-20th-st', name: 'Birmingham 20th Street Underpass', location: 'Birmingham', state: 'AL', highway: '20th St N', clearanceHeight: 12.0, coordinates: { lat: 33.5186, lng: -86.8092 }, type: 'underpass', restrictionType: 'structural', alternateRoute: 'Use I-20/59', hazardLevel: 'warning' },
  { id: 'sc-charleston-meeting-st', name: 'Charleston Meeting Street Underpass', location: 'Charleston', state: 'SC', highway: 'Meeting St', clearanceHeight: 11.5, coordinates: { lat: 32.7876, lng: -79.9403 }, type: 'underpass', restrictionType: 'structural', alternateRoute: 'Use I-26', hazardLevel: 'danger' },
  { id: 'fl-jacksonville-main-st', name: 'Jacksonville Main Street Bridge', location: 'Jacksonville', state: 'FL', highway: 'US-1/Main St', clearanceHeight: 13.0, coordinates: { lat: 30.3233, lng: -81.6557 }, type: 'bridge', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'ms-jackson-state-st', name: 'Jackson State Street Underpass', location: 'Jackson', state: 'MS', highway: 'State St', clearanceHeight: 12.0, coordinates: { lat: 32.2988, lng: -90.1848 }, type: 'underpass', restrictionType: 'structural', alternateRoute: 'Use I-55', hazardLevel: 'warning' },
  { id: 'ar-little-rock-broadway', name: 'Little Rock Broadway Bridge', location: 'Little Rock', state: 'AR', highway: 'Broadway', clearanceHeight: 12.5, coordinates: { lat: 34.7465, lng: -92.2896 }, type: 'underpass', restrictionType: 'structural', alternateRoute: 'Use I-30', hazardLevel: 'warning' },
  { id: 'ks-wichita-douglas-ave', name: 'Wichita Douglas Avenue Underpass', location: 'Wichita', state: 'KS', highway: 'Douglas Ave', clearanceHeight: 12.5, coordinates: { lat: 37.6872, lng: -97.3361 }, type: 'underpass', restrictionType: 'structural', alternateRoute: 'Use I-135', hazardLevel: 'warning' },
  { id: 'ne-omaha-farnam-st', name: 'Omaha Farnam Street Underpass', location: 'Omaha', state: 'NE', highway: 'Farnam St', clearanceHeight: 12.0, coordinates: { lat: 41.2565, lng: -95.9345 }, type: 'underpass', restrictionType: 'structural', alternateRoute: 'Use I-80 or I-480', hazardLevel: 'warning' },
  { id: 'ok-tulsa-11th-st', name: 'Tulsa 11th Street Bridge Approach', location: 'Tulsa', state: 'OK', highway: 'Route 66', clearanceHeight: 12.5, coordinates: { lat: 36.1465, lng: -95.9780 }, type: 'underpass', restrictionType: 'structural', alternateRoute: 'Use I-44', hazardLevel: 'warning' },
  { id: 'az-phoenix-grand-ave', name: 'Phoenix Grand Avenue Underpass', location: 'Phoenix', state: 'AZ', highway: 'US-60/Grand Ave', clearanceHeight: 13.0, coordinates: { lat: 33.4573, lng: -112.0988 }, type: 'underpass', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'nv-reno-virginia-st', name: 'Reno Virginia Street Underpass', location: 'Reno', state: 'NV', highway: 'Virginia St', clearanceHeight: 12.5, coordinates: { lat: 39.5297, lng: -119.8137 }, type: 'underpass', restrictionType: 'structural', alternateRoute: 'Use I-80', hazardLevel: 'warning' },
  { id: 'ut-slc-north-temple', name: 'Salt Lake City North Temple Underpass', location: 'Salt Lake City', state: 'UT', highway: 'North Temple', clearanceHeight: 13.0, coordinates: { lat: 40.7716, lng: -111.9055 }, type: 'underpass', restrictionType: 'structural', hazardLevel: 'caution' },
  { id: 'or-portland-burnside', name: 'Portland Burnside Bridge Approaches', location: 'Portland', state: 'OR', highway: 'Burnside St', clearanceHeight: 13.0, coordinates: { lat: 45.5230, lng: -122.6694 }, type: 'bridge', restrictionType: 'structural', hazardLevel: 'caution' },
]

export function checkBridgeClearance(bridge: LowClearanceBridge, cargoTotalHeight: number): { clears: boolean; clearance: number; deficit: number; severity: 'ok' | 'caution' | 'warning' | 'danger' } {
  const clearance = bridge.clearanceHeight - cargoTotalHeight
  const deficit = clearance < 0 ? Math.abs(clearance) : 0
  let severity: 'ok' | 'caution' | 'warning' | 'danger' = 'ok'
  if (clearance < 0) severity = 'danger'
  else if (clearance < 0.5) severity = 'warning'
  else if (clearance < 1) severity = 'caution'
  return { clears: clearance >= 0, clearance: Math.round(clearance * 10) / 10, deficit: Math.round(deficit * 10) / 10, severity }
}

export function findNearbyBridges(routePoints: LatLng[], maxDistanceMiles: number = 0.5): LowClearanceBridge[] {
  const nearbyBridges: LowClearanceBridge[] = []
  for (const bridge of LOW_CLEARANCE_BRIDGES) {
    for (const point of routePoints) {
      if (calculateDistance(point, bridge.coordinates) <= maxDistanceMiles) {
        if (!nearbyBridges.includes(bridge)) nearbyBridges.push(bridge)
        break
      }
    }
  }
  return nearbyBridges
}

export function checkRouteBridgeClearances(routePoints: LatLng[], cargoTotalHeight: number): {
  hasIssues: boolean
  bridges: Array<{ bridge: LowClearanceBridge; clearanceResult: ReturnType<typeof checkBridgeClearance> }>
  warnings: string[]
  recommendations: string[]
} {
  const nearbyBridges = findNearbyBridges(routePoints)
  const issues: Array<{ bridge: LowClearanceBridge; clearanceResult: ReturnType<typeof checkBridgeClearance> }> = []
  const warnings: string[] = []
  const recommendations: string[] = []
  for (const bridge of nearbyBridges) {
    const cr = checkBridgeClearance(bridge, cargoTotalHeight)
    if (cr.severity !== 'ok') {
      issues.push({ bridge, clearanceResult: cr })
      if (cr.severity === 'danger') {
        warnings.push(cr.clears ? `TIGHT CLEARANCE: ${bridge.name} (${bridge.state}) - only ${cr.clearance}' clearance` : `WILL NOT FIT: ${bridge.name} (${bridge.state}) - ${cr.deficit}' too tall`)
        if (bridge.alternateRoute) recommendations.push(`${bridge.name}: ${bridge.alternateRoute}`)
      } else if (cr.severity === 'warning') {
        warnings.push(`Warning: ${bridge.name} (${bridge.state}) - ${cr.clearance}' clearance`)
      }
    }
    if (bridge.truckProhibited) {
      warnings.push(`${bridge.name}: Commercial vehicles PROHIBITED`)
      if (bridge.alternateRoute) recommendations.push(`${bridge.name}: ${bridge.alternateRoute}`)
    }
  }
  issues.sort((a, b) => ({ danger: 0, warning: 1, caution: 2, ok: 3 })[a.clearanceResult.severity] - ({ danger: 0, warning: 1, caution: 2, ok: 3 })[b.clearanceResult.severity])
  return { hasIssues: issues.length > 0, bridges: issues, warnings, recommendations }
}

export function getBridgesInState(stateCode: string): LowClearanceBridge[] {
  return LOW_CLEARANCE_BRIDGES.filter(b => b.state === stateCode.toUpperCase())
}

export const STANDARD_CLEARANCES = { INTERSTATE_MINIMUM: 16.0, STANDARD_OVERPASS: 14.0, LEGAL_HEIGHT_LIMIT: 13.5, PARKWAY_TYPICAL: 10.5 } as const

export function needsHeightConsideration(totalHeight: number): { needs: boolean; reason: string } {
  if (totalHeight > 14.0) return { needs: true, reason: "Height exceeds standard overpass clearance (14') - route survey recommended" }
  if (totalHeight > 13.5) return { needs: true, reason: "Height exceeds legal limit (13.5') - avoid parkways and check bridge clearances" }
  if (totalHeight > 12.0) return { needs: true, reason: 'Height may conflict with older infrastructure - verify route clearances' }
  return { needs: false, reason: '' }
}
