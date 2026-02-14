import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

// Load status distribution (weighted towards active statuses for realistic demo data)
const LOAD_STATUS_DISTRIBUTION = [
  { item: 'PENDING', weight: 0.15 },
  { item: 'ASSIGNED', weight: 0.15 },
  { item: 'DISPATCHED', weight: 0.10 },
  { item: 'PICKED_UP', weight: 0.10 },
  { item: 'IN_TRANSIT', weight: 0.30 },
  { item: 'DELIVERED', weight: 0.20 },
];

// Equipment trailer lengths by type (feet)
const EQUIPMENT_LENGTHS: Record<string, number[]> = {
  DRY_VAN: [48, 53],
  REEFER: [40, 53],
  FLATBED: [48, 53],
  STEP_DECK: [48, 53],
};

// Approximate lat/lng for city pairs (for tracking interpolation)
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Chicago': { lat: 41.8781, lng: -87.6298 },
  'New York': { lat: 40.7128, lng: -74.0060 },
  'Dallas': { lat: 32.7767, lng: -96.7970 },
  'Atlanta': { lat: 33.7490, lng: -84.3880 },
  'Miami': { lat: 25.7617, lng: -80.1918 },
  'Seattle': { lat: 47.6062, lng: -122.3321 },
  'Phoenix': { lat: 33.4484, lng: -112.0740 },
  'Denver': { lat: 39.7392, lng: -104.9903 },
  'Houston': { lat: 29.7604, lng: -95.3698 },
  'New Orleans': { lat: 29.9511, lng: -90.0715 },
  'Memphis': { lat: 35.1495, lng: -90.0490 },
  'Kansas City': { lat: 39.0997, lng: -94.5786 },
};

// Helper: Weighted random selection (same pattern as tms-core.ts)
function weightedRandom<T>(items: { item: T; weight: number }[]): T {
  const total = items.reduce((sum, { weight }) => sum + weight, 0);
  let random = Math.random() * total;

  for (const { item, weight } of items) {
    if (random < weight) return item;
    random -= weight;
  }

  return items[items.length - 1].item;
}

// Helper: Get load status with weighted distribution
function getLoadStatus(): string {
  return weightedRandom(LOAD_STATUS_DISTRIBUTION);
}

// Helper: Interpolate tracking location between origin and destination
function getTrackingLocation(
  originCity: string,
  destCity: string,
  progress: number, // 0.0 to 1.0
): { lat: number; lng: number; city: string; state: string } {
  const origin = CITY_COORDS[originCity] ?? { lat: 39.8283, lng: -98.5795 }; // US center fallback
  const dest = CITY_COORDS[destCity] ?? { lat: 39.8283, lng: -98.5795 };

  const lat = origin.lat + (dest.lat - origin.lat) * progress;
  const lng = origin.lng + (dest.lng - origin.lng) * progress;

  // Use faker for the intermediate city/state (actual geocoding not needed for seed)
  return {
    lat: parseFloat(lat.toFixed(7)),
    lng: parseFloat(lng.toFixed(7)),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  };
}

export async function seedLoads(prisma: any, tenantIds: string[]): Promise<void> {
  let totalLoads = 0;
  let totalCheckCalls = 0;

  for (const tenantId of tenantIds) {
    const orders = await prisma.order.findMany({
      where: { tenantId },
      include: { stops: true },
      take: 100,
    });
    const carriers = await prisma.carrier.findMany({ where: { tenantId }, take: 20 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 10 });

    if (orders.length === 0) continue;

    for (const order of orders) {
      const loadCount = faker.number.int({ min: 1, max: 2 });

      for (let i = 0; i < loadCount; i++) {
        // TODO: Task 1.5 — Load creation logic goes here
        // Will create Load records with:
        // - Status from getLoadStatus()
        // - Carrier assignment (70% assigned)
        // - Financial data derived from order rates
        // - Equipment details from order
        // - Tracking data for IN_TRANSIT loads via getTrackingLocation()
        // - Check calls for active loads
        totalLoads++;
      }
    }
  }

  console.log(`   ✓ Created ${totalLoads} loads, ${totalCheckCalls} check calls`);
}
