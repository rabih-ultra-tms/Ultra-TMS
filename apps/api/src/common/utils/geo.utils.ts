/**
 * Geographic utility functions for distance calculations
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns Distance in miles
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 3959; // Earth's radius in miles

  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);
  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLng = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate bounding box for a radius search
 * Used to pre-filter results before precise distance calculation
 */
export function getBoundingBox(
  center: Coordinates,
  radiusMiles: number,
): {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
} {
  const latDelta = radiusMiles / 69; // ~69 miles per degree latitude
  const lngDelta = radiusMiles / (69 * Math.cos(toRadians(center.latitude)));

  return {
    minLat: center.latitude - latDelta,
    maxLat: center.latitude + latDelta,
    minLng: center.longitude - lngDelta,
    maxLng: center.longitude + lngDelta,
  };
}

/**
 * Check if a point is within radius of a center point
 */
export function isWithinRadius(
  center: Coordinates,
  point: Coordinates,
  radiusMiles: number,
): boolean {
  const distance = calculateDistance(center, point);
  return distance <= radiusMiles;
}

/**
 * Sort points by distance from a center point
 */
export function sortByDistance<T extends { latitude: number; longitude: number }>(
  center: Coordinates,
  points: T[],
): Array<T & { distance: number }> {
  return points
    .map((point) => ({
      ...point,
      distance: calculateDistance(center, {
        latitude: point.latitude,
        longitude: point.longitude,
      }),
    }))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Get approximate coordinates for a US city/state
 * Fallback when lat/lng not available
 */
export async function geocodeCity(city: string, state: string): Promise<Coordinates | null> {
  const key = `${city.toLowerCase()},${state.toLowerCase()}`;
  return US_CITY_COORDINATES[key] || null;
}

// Major US city coordinates (subset for MVP)
const US_CITY_COORDINATES: Record<string, Coordinates> = {
  'chicago,il': { latitude: 41.8781, longitude: -87.6298 },
  'los angeles,ca': { latitude: 34.0522, longitude: -118.2437 },
  'new york,ny': { latitude: 40.7128, longitude: -74.006 },
  'houston,tx': { latitude: 29.7604, longitude: -95.3698 },
  'phoenix,az': { latitude: 33.4484, longitude: -112.074 },
  'philadelphia,pa': { latitude: 39.9526, longitude: -75.1652 },
  'san antonio,tx': { latitude: 29.4241, longitude: -98.4936 },
  'san diego,ca': { latitude: 32.7157, longitude: -117.1611 },
  'dallas,tx': { latitude: 32.7767, longitude: -96.797 },
  'san jose,ca': { latitude: 37.3382, longitude: -121.8863 },
  'austin,tx': { latitude: 30.2672, longitude: -97.7431 },
  'jacksonville,fl': { latitude: 30.3322, longitude: -81.6557 },
  'fort worth,tx': { latitude: 32.7555, longitude: -97.3308 },
  'columbus,oh': { latitude: 39.9612, longitude: -82.9988 },
  'charlotte,nc': { latitude: 35.2271, longitude: -80.8431 },
  'seattle,wa': { latitude: 47.6062, longitude: -122.3321 },
  'denver,co': { latitude: 39.7392, longitude: -104.9903 },
  'detroit,mi': { latitude: 42.3314, longitude: -83.0458 },
  'atlanta,ga': { latitude: 33.749, longitude: -84.388 },
  'memphis,tn': { latitude: 35.1495, longitude: -90.049 },
  'nashville,tn': { latitude: 36.1627, longitude: -86.7816 },
  'indianapolis,in': { latitude: 39.7684, longitude: -86.1581 },
  'kansas city,mo': { latitude: 39.0997, longitude: -94.5786 },
  'miami,fl': { latitude: 25.7617, longitude: -80.1918 },
  'orlando,fl': { latitude: 28.5383, longitude: -81.3792 },
  'st. louis,mo': { latitude: 38.627, longitude: -90.1994 },
  'minneapolis,mn': { latitude: 44.9778, longitude: -93.265 },
  'cleveland,oh': { latitude: 41.4993, longitude: -81.6944 },
  'pittsburgh,pa': { latitude: 40.4406, longitude: -79.9959 },
  'cincinnati,oh': { latitude: 39.1031, longitude: -84.512 },
  'tampa,fl': { latitude: 27.9506, longitude: -82.4572 },
  'baltimore,md': { latitude: 39.2904, longitude: -76.6122 },
  'las vegas,nv': { latitude: 36.1699, longitude: -115.1398 },
  'portland,or': { latitude: 45.5152, longitude: -122.6784 },
  'salt lake city,ut': { latitude: 40.7608, longitude: -111.891 },
  'milwaukee,wi': { latitude: 43.0389, longitude: -87.9065 },
  'louisville,ky': { latitude: 38.2527, longitude: -85.7585 },
  'oklahoma city,ok': { latitude: 35.4676, longitude: -97.5164 },
  'albuquerque,nm': { latitude: 35.0844, longitude: -106.6504 },
  'tucson,az': { latitude: 32.2226, longitude: -110.9747 },
  'fresno,ca': { latitude: 36.7378, longitude: -119.7871 },
  'sacramento,ca': { latitude: 38.5816, longitude: -121.4944 },
  'omaha,ne': { latitude: 41.2565, longitude: -95.9345 },
  'raleigh,nc': { latitude: 35.7796, longitude: -78.6382 },
  'birmingham,al': { latitude: 33.5207, longitude: -86.8025 },
  'new orleans,la': { latitude: 29.9511, longitude: -90.0715 },
};
