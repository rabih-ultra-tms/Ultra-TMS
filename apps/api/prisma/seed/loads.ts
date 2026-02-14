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
        const loadStatus = getLoadStatus();
        const isAssigned = faker.datatype.boolean(0.70);
        const carrier = isAssigned && carriers.length > 0
          ? faker.helpers.arrayElement(carriers)
          : null;

        // Financial: carrier rate is 85-90% of customer rate
        const customerRate = order.customerRate ? Number(order.customerRate) : 0;
        const carrierRate = customerRate * faker.number.float({ min: 0.85, max: 0.90, fractionDigits: 4 });
        const accessorialCosts = faker.number.float({ min: 0, max: 300, fractionDigits: 2 });
        const fuelAdvance = faker.number.float({ min: 0, max: 500, fractionDigits: 2 });
        const totalCost = carrierRate + accessorialCosts + fuelAdvance;

        // Equipment
        const equipmentType = order.equipmentType ?? 'DRY_VAN';
        const lengths = EQUIPMENT_LENGTHS[equipmentType] ?? [48, 53];
        const equipmentLength = faker.helpers.arrayElement(lengths);

        // Timestamps based on status progression
        const orderCreated = new Date(order.createdAt);
        const dispatchedAt = ['DISPATCHED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(loadStatus)
          ? new Date(orderCreated.getTime() + faker.number.int({ min: 1, max: 3 }) * 24 * 60 * 60 * 1000)
          : null;
        const pickedUpAt = ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(loadStatus) && dispatchedAt
          ? new Date(dispatchedAt.getTime() + faker.number.int({ min: 4, max: 12 }) * 60 * 60 * 1000)
          : null;
        const deliveredAt = loadStatus === 'DELIVERED' && order.requiredDeliveryDate
          ? new Date(new Date(order.requiredDeliveryDate).getTime() + faker.number.int({ min: -2, max: 2 }) * 24 * 60 * 60 * 1000)
          : null;

        // Tracking for IN_TRANSIT loads
        const originStop = order.stops?.find((s: any) => s.stopSequence === 1);
        const lastStop = order.stops?.length > 0
          ? order.stops.reduce((max: any, s: any) => s.stopSequence > max.stopSequence ? s : max, order.stops[0])
          : null;
        const originCity = originStop?.city ?? 'Chicago';
        const destCity = lastStop?.city ?? 'New York';
        const progress = faker.number.float({ min: 0.1, max: 0.9, fractionDigits: 2 });
        const tracking = loadStatus === 'IN_TRANSIT'
          ? getTrackingLocation(originCity, destCity, progress)
          : null;

        // Documents
        const statusOrder = ['PENDING', 'ASSIGNED', 'DISPATCHED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];
        const statusIdx = statusOrder.indexOf(loadStatus);
        const rateConfirmationSent = statusIdx >= 1; // ASSIGNED+
        const rateConfirmationSigned = statusIdx >= 2; // DISPATCHED+

        const load = await prisma.load.create({
          data: {
            tenantId,
            loadNumber: `LD-${Date.now()}-${String(totalLoads + 1).padStart(4, '0')}`,
            orderId: order.id,
            carrierId: carrier?.id ?? null,

            // Driver & vehicle (only if carrier assigned)
            driverName: carrier ? faker.person.fullName() : null,
            driverPhone: carrier ? faker.phone.number() : null,
            truckNumber: carrier ? `T${faker.string.numeric(4)}` : null,
            trailerNumber: carrier ? `TR${faker.string.numeric(5)}` : null,

            status: loadStatus,

            // Financial
            carrierRate,
            accessorialCosts,
            fuelAdvance,
            totalCost,

            // Tracking
            currentLocationLat: tracking?.lat ?? null,
            currentLocationLng: tracking?.lng ?? null,
            currentCity: tracking?.city ?? null,
            currentState: tracking?.state ?? null,
            lastTrackingUpdate: tracking ? new Date(Date.now() - faker.number.int({ min: 1, max: 4 }) * 60 * 60 * 1000) : null,
            eta: loadStatus === 'IN_TRANSIT' && order.requiredDeliveryDate
              ? new Date(order.requiredDeliveryDate)
              : null,

            // Equipment
            equipmentType,
            equipmentLength,
            equipmentWeightLimit: 45000,

            // Timestamps
            dispatchedAt,
            pickedUpAt,
            deliveredAt,

            // Documents
            rateConfirmationSent,
            rateConfirmationSigned,

            // Notes
            dispatchNotes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,

            // Metadata
            externalId: `SEED-LOAD-${String(totalLoads + 1).padStart(4, '0')}`,
            sourceSystem: 'FAKER_SEED',
            customFields: {},
            createdById: users.length > 0 ? faker.helpers.arrayElement(users).id : null,
            createdAt: orderCreated,
            updatedAt: new Date(),
          },
        });

        // Check calls for IN_TRANSIT loads (1-3 per load, spaced ~4 hours apart)
        if (loadStatus === 'IN_TRANSIT' && tracking) {
          const checkCallCount = faker.number.int({ min: 1, max: 3 });
          for (let c = 0; c < checkCallCount; c++) {
            const hoursAgo = (checkCallCount - c) * 4;
            const ccProgress = Math.max(0.05, progress - (checkCallCount - c) * 0.1);
            const ccTracking = getTrackingLocation(originCity, destCity, ccProgress);

            await prisma.checkCall.create({
              data: {
                tenantId,
                loadId: load.id,
                city: ccTracking.city,
                state: ccTracking.state,
                latitude: ccTracking.lat,
                longitude: ccTracking.lng,
                status: 'IN_TRANSIT',
                notes: faker.helpers.arrayElement([
                  'Driver confirmed on schedule',
                  'Checked in with driver, ETA on track',
                  'Driver reports smooth traffic',
                  'Minor delay due to weather, adjusted ETA',
                  'Fuel stop, resuming shortly',
                ]),
                contacted: 'DRIVER',
                contactMethod: faker.helpers.arrayElement(['PHONE', 'TEXT', 'ELD']),
                eta: order.requiredDeliveryDate ? new Date(order.requiredDeliveryDate) : null,
                milesRemaining: Math.round((1 - ccProgress) * faker.number.int({ min: 300, max: 2000 })),
                source: faker.helpers.arrayElement(['MANUAL', 'ELD', 'TRACKING']),
                externalId: `SEED-CHECKCALL-${totalLoads + 1}-${c}`,
                sourceSystem: 'FAKER_SEED',
                createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
                createdById: users.length > 0 ? faker.helpers.arrayElement(users).id : null,
              },
            });
            totalCheckCalls++;
          }
        }

        totalLoads++;
      }
    }
  }

  console.log(`   ✓ Created ${totalLoads} loads, ${totalCheckCalls} check calls`);
}
