# TMS Core Pages & Seed Data - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build seed data and three TMS pages (Order Detail, Load Detail, Load Board) that wire up to production-ready backend APIs

**Architecture:** Seed-first approach: Create realistic Orders, Loads, and LoadPosts data, then build frontend pages with React Query hooks connecting to existing A-grade backend APIs (65+ endpoints)

**Tech Stack:** Next.js 16, React 19, TypeScript, React Query, Tailwind 4, shadcn/ui, Prisma, PostgreSQL, Faker.js

---

## Phase 1: Seed Data Foundation

### Task 1.1: Update TMS Core Seed - Setup

**Files:**
- Modify: `apps/api/prisma/seed/tms-core.ts`

**Step 1: Review existing seed file**

Read `apps/api/prisma/seed/tms-core.ts` to understand current structure

Expected: Currently creates 20 orders per tenant with basic fields

**Step 2: Add helper functions for realistic data**

Add at top of file after imports:

```typescript
// Helper: Realistic city pairs for freight lanes
const CITY_PAIRS = [
  { origin: { city: 'Los Angeles', state: 'CA', zip: '90001' }, destination: { city: 'Chicago', state: 'IL', zip: '60601' }, distance: 2015, commodity: 'Electronics' },
  { origin: { city: 'Chicago', state: 'IL', zip: '60601' }, destination: { city: 'New York', state: 'NY', zip: '10001' }, distance: 790, commodity: 'Manufactured Goods' },
  { origin: { city: 'Dallas', state: 'TX', zip: '75201' }, destination: { city: 'Atlanta', state: 'GA', zip: '30301' }, distance: 780, commodity: 'General Freight' },
  { origin: { city: 'Atlanta', state: 'GA', zip: '30301' }, destination: { city: 'Miami', state: 'FL', zip: '33101' }, distance: 660, commodity: 'Produce' },
  { origin: { city: 'Seattle', state: 'WA', zip: '98101' }, destination: { city: 'Los Angeles', state: 'CA', zip: '90001' }, distance: 1135, commodity: 'Technology' },
  { origin: { city: 'Phoenix', state: 'AZ', zip: '85001' }, destination: { city: 'Denver', state: 'CO', zip: '80201' }, distance: 600, commodity: 'Construction Materials' },
  { origin: { city: 'Houston', state: 'TX', zip: '77001' }, destination: { city: 'New Orleans', state: 'LA', zip: '70112' }, distance: 350, commodity: 'Petrochemicals' },
  { origin: { city: 'Memphis', state: 'TN', zip: '37501' }, destination: { city: 'Kansas City', state: 'MO', zip: '64101' }, distance: 450, commodity: 'Distribution' },
];

const EQUIPMENT_TYPES = ['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK'];
const EQUIPMENT_WEIGHTS = { DRY_VAN: [0.5, 0.25, 0.15, 0.10], REEFER: 0.25, FLATBED: 0.15, STEP_DECK: 0.10 };

const STATUS_DISTRIBUTION = [
  { status: 'QUOTED', weight: 0.10 },
  { status: 'BOOKED', weight: 0.30 },
  { status: 'IN_TRANSIT', weight: 0.40 },
  { status: 'DELIVERED', weight: 0.20 },
];

const COMMODITY_CLASSES = ['50', '55', '60', '65', '70', '77.5', '85', '92.5', '100', '110', '125', '150', '175', '200', '250', '300', '400', '500'];

// Helper: Weighted random selection
function weightedRandom<T>(items: { item: T; weight: number }[]): T {
  const total = items.reduce((sum, { weight }) => sum + weight, 0);
  let random = Math.random() * total;

  for (const { item, weight } of items) {
    if (random < weight) return item;
    random -= weight;
  }

  return items[items.length - 1].item;
}

// Helper: Get equipment type with distribution
function getEquipmentType(): string {
  return weightedRandom([
    { item: 'DRY_VAN', weight: 0.50 },
    { item: 'REEFER', weight: 0.25 },
    { item: 'FLATBED', weight: 0.15 },
    { item: 'STEP_DECK', weight: 0.10 },
  ]);
}

// Helper: Get order status with distribution
function getOrderStatus(): string {
  return weightedRandom([
    { item: 'QUOTED', weight: 0.10 },
    { item: 'BOOKED', weight: 0.30 },
    { item: 'IN_TRANSIT', weight: 0.40 },
    { item: 'DELIVERED', weight: 0.20 },
  ]);
}
```

**Step 3: Commit helper functions**

```bash
cd apps/api
git add prisma/seed/tms-core.ts
git commit -m "feat(seed): add helper functions for realistic TMS data"
```

### Task 1.2: Update TMS Core Seed - Enhanced Orders

**Files:**
- Modify: `apps/api/prisma/seed/tms-core.ts:12-56`

**Step 1: Update order creation loop (reduce to 10 orders)**

Replace the order creation loop with:

```typescript
// Orders (10 per tenant - down from 20 for lighter dev datasets)
for (let i = 0; i < 10; i++) {
  const cityPair = faker.helpers.arrayElement(CITY_PAIRS);
  const equipmentType = getEquipmentType();
  const orderStatus = getOrderStatus();
  const baseRate = faker.number.float({ min: 1500, max: 5000, fractionDigits: 2 });
  const accessorialCharges = faker.number.float({ min: 0, max: 500, fractionDigits: 2 });
  const fuelSurcharge = baseRate * faker.number.float({ min: 0.05, max: 0.10, fractionDigits: 4 });
  const totalCharges = baseRate + accessorialCharges + fuelSurcharge;
  const weightLbs = faker.number.int({ min: 1000, max: 45000 });
  const isHeavy = weightLbs > 20000;
  const isLongDistance = cityPair.distance > 1000;
  const createdDaysAgo = faker.number.int({ min: 0, max: 30 });
  const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000);
  const requiredDeliveryDate = new Date(createdAt.getTime() + faker.number.int({ min: 3, max: 7 }) * 24 * 60 * 60 * 1000);

  const order = await prisma.order.create({
    data: {
      tenantId,
      orderNumber: `ORD-${Date.now()}-${String(i + 1).padStart(3, '0')}`,
      customerReference: `CUST-${faker.string.alphanumeric(8).toUpperCase()}`,
      poNumber: `PO-${faker.string.alphanumeric(6).toUpperCase()}`,
      bolNumber: faker.datatype.boolean(0.7) ? `BOL-${faker.string.alphanumeric(6).toUpperCase()}` : null,
      customerId: companies[Math.floor(Math.random() * companies.length)].id,
      customerContactId: null, // TODO: Add contacts seeding
      salesRepId: users[Math.floor(Math.random() * users.length)].id,
      quoteId: null,

      // Status
      status: orderStatus,

      // Financial
      customerRate: baseRate,
      accessorialCharges,
      fuelSurcharge,
      totalCharges,
      currency: 'USD',

      // Freight details
      commodity: cityPair.commodity,
      commodityClass: faker.helpers.arrayElement(COMMODITY_CLASSES),
      weightLbs,
      pieceCount: faker.number.int({ min: 1, max: 50 }),
      palletCount: Math.ceil(weightLbs / 1500), // Rough calc: 1500 lbs per pallet
      equipmentType,

      // Special handling (10% chance each)
      isHazmat: faker.datatype.boolean(0.10),
      hazmatClass: faker.datatype.boolean(0.10) ? faker.helpers.arrayElement(['3', '8', '2.1', '1.4']) : null,
      temperatureMin: equipmentType === 'REEFER' ? faker.number.int({ min: 34, max: 38 }) : null,
      temperatureMax: equipmentType === 'REEFER' ? faker.number.int({ min: 38, max: 42 }) : null,
      isHot: faker.datatype.boolean(0.10),
      isTeam: isLongDistance ? faker.datatype.boolean(0.15) : false,
      isExpedited: faker.datatype.boolean(0.05),

      // Dates
      orderDate: createdAt,
      requiredDeliveryDate,
      actualDeliveryDate: orderStatus === 'DELIVERED' ? new Date(requiredDeliveryDate.getTime() + faker.number.int({ min: -2, max: 2 }) * 24 * 60 * 60 * 1000) : null,

      // Notes
      specialInstructions: faker.datatype.boolean(0.6) ? faker.lorem.sentence() : null,
      internalNotes: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : null,

      // Metadata
      externalId: `SEED-ORDER-${String(total + i + 1).padStart(4, '0')}`,
      sourceSystem: 'FAKER_SEED',
      customFields: {},
      createdById: users[Math.floor(Math.random() * users.length)].id,
      createdAt,
      updatedAt: new Date(),
    },
  });
  total++;
```

**Step 2: Commit enhanced orders**

```bash
git add prisma/seed/tms-core.ts
git commit -m "feat(seed): enhance order creation with realistic fields"
```

### Task 1.3: Update TMS Core Seed - Enhanced Stops

**Files:**
- Modify: `apps/api/prisma/seed/tms-core.ts` (stop creation section)

**Step 1: Replace stop creation with enhanced version**

Replace the stop creation loop with:

```typescript
  // Create stops for order (use city pair for origin/destination)
  const stopCount = faker.number.int({ min: 2, max: 4 });
  const stops = [];

  for (let j = 0; j < stopCount; j++) {
    const isPickup = j === 0;
    const isDelivery = j === stopCount - 1;
    const location = isPickup ? cityPair.origin : (isDelivery ? cityPair.destination : faker.helpers.arrayElement([cityPair.origin, cityPair.destination]));

    // Calculate scheduled times based on order creation and delivery dates
    const transitDays = Math.ceil(cityPair.distance / 500); // ~500 miles per day
    const scheduledArrival = isPickup
      ? new Date(createdAt.getTime() + 1 * 24 * 60 * 60 * 1000) // Pickup next day
      : new Date(createdAt.getTime() + (j + transitDays) * 24 * 60 * 60 * 1000);

    // Status based on order status
    let stopStatus = 'PENDING';
    if (orderStatus === 'DELIVERED') stopStatus = 'DEPARTED';
    else if (orderStatus === 'IN_TRANSIT' && j < stopCount - 1) stopStatus = faker.helpers.arrayElement(['DEPARTED', 'ARRIVED']);
    else if (orderStatus === 'IN_TRANSIT' && j === stopCount - 1) stopStatus = 'PENDING';

    const stop = await prisma.stop.create({
      data: {
        tenantId,
        orderId: order.id,
        stopType: isPickup ? 'PICKUP' : 'DELIVERY',
        stopSequence: j + 1,

        // Location
        addressLine1: faker.location.streetAddress(),
        addressLine2: faker.datatype.boolean(0.2) ? faker.location.secondaryAddress() : null,
        city: location.city,
        state: location.state,
        postalCode: location.zip,
        country: 'USA',

        // Contact
        contactName: faker.person.fullName(),
        contactPhone: faker.phone.number(),
        contactEmail: faker.internet.email(),

        // Schedule
        scheduledArrival,
        scheduledDeparture: null,
        actualArrival: stopStatus !== 'PENDING' ? new Date(scheduledArrival.getTime() + faker.number.int({ min: -60, max: 60 }) * 60 * 1000) : null,
        actualDeparture: stopStatus === 'DEPARTED' ? new Date(scheduledArrival.getTime() + faker.number.int({ min: 60, max: 180 }) * 60 * 1000) : null,

        // Status
        status: stopStatus,

        // Notes
        notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
        specialInstructions: faker.datatype.boolean(0.4) ? faker.lorem.sentence() : null,
        appointmentRequired: faker.datatype.boolean(0.5),

        // Metadata
        externalId: `SEED-STOP-${String(total).padStart(4, '0')}-${j + 1}`,
        sourceSystem: 'FAKER_SEED',
      },
    });

    stops.push(stop);
  }
}
```

**Step 2: Update console log**

Replace the final console.log:

```typescript
console.log(`   ✓ Created ${total} orders with enhanced stops`);
```

**Step 3: Commit enhanced stops**

```bash
git add prisma/seed/tms-core.ts
git commit -m "feat(seed): enhance stop creation with realistic schedules"
```

### Task 1.4: Create Loads Seed File - Structure

**Files:**
- Create: `apps/api/prisma/seed/loads.ts`

**Step 1: Create loads seed file with imports**

```typescript
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const LOAD_STATUS_DISTRIBUTION = [
  { status: 'PENDING', weight: 0.30 },
  { status: 'ASSIGNED', weight: 0.20 },
  { status: 'DISPATCHED', weight: 0.15 },
  { status: 'PICKED_UP', weight: 0.10 },
  { status: 'IN_TRANSIT', weight: 0.15 },
  { status: 'DELIVERED', weight: 0.10 },
];

const EQUIPMENT_LENGTHS = {
  DRY_VAN: [48, 53],
  REEFER: [40, 53],
  FLATBED: [48, 53],
  STEP_DECK: [48, 53],
};

// Helper: Weighted random
function weightedRandom<T>(items: { status: T; weight: number }[]): T {
  const total = items.reduce((sum, { weight }) => sum + weight, 0);
  let random = Math.random() * total;

  for (const { status, weight } of items) {
    if (random < weight) return status;
    random -= weight;
  }

  return items[items.length - 1].status;
}

// Helper: Get tracking location based on order route
function getTrackingLocation(originCity: string, originState: string, destCity: string, destState: string, progress: number): { lat: number; lng: number; city: string; state: string } {
  // Simplified: return midpoint cities for different progress percentages
  const midpointCities = [
    { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
    { city: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
    { city: 'Memphis', state: 'TN', lat: 35.1495, lng: -90.0490 },
    { city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
  ];

  return faker.helpers.arrayElement(midpointCities);
}

export async function seedLoads(prisma: any, tenantIds: string[]): Promise<void> {
  let totalLoads = 0;
  let totalCheckCalls = 0;

  for (const tenantId of tenantIds) {
    // Get orders for this tenant
    const orders = await prisma.order.findMany({
      where: { tenantId },
      include: { stops: true },
      take: 100, // Process all orders
    });

    if (orders.length === 0) continue;

    // Get carriers and users
    const carriers = await prisma.carrier.findMany({ where: { tenantId }, take: 20 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 10 });

    for (const order of orders) {
      // Create 1-2 loads per order
      const loadCount = faker.number.int({ min: 1, max: 2 });

      for (let i = 0; i < loadCount; i++) {
        // ... (load creation logic in next step)
      }
    }
  }

  console.log(`   ✓ Created ${totalLoads} loads with ${totalCheckCalls} check calls`);
}
```

**Step 2: Commit loads file structure**

```bash
cd apps/api
git add prisma/seed/loads.ts
git commit -m "feat(seed): create loads seed file structure"
```

### Task 1.5: Create Loads Seed File - Load Creation Logic

**Files:**
- Modify: `apps/api/prisma/seed/loads.ts` (inside loop)

**Step 1: Add load creation logic**

Inside the `for (let i = 0; i < loadCount; i++)` loop, add:

```typescript
        const loadStatus = weightedRandom(LOAD_STATUS_DISTRIBUTION);
        const isAssigned = loadStatus !== 'PENDING' || faker.datatype.boolean(0.70); // 70% assigned
        const carrier = isAssigned ? faker.helpers.arrayElement(carriers) : null;

        // Calculate carrier rate (85-90% of customer rate)
        const marginPercent = faker.number.float({ min: 0.85, max: 0.90, fractionDigits: 4 });
        const carrierRate = order.customerRate ? order.customerRate * marginPercent : null;
        const accessorialCosts = faker.number.float({ min: 0, max: 300, fractionDigits: 2 });
        const fuelAdvance = faker.number.float({ min: 0, max: 500, fractionDigits: 2 });
        const totalCost = carrierRate ? carrierRate + accessorialCosts + fuelAdvance : null;

        // Equipment details
        const equipmentLength = order.equipmentType
          ? faker.helpers.arrayElement(EQUIPMENT_LENGTHS[order.equipmentType as keyof typeof EQUIPMENT_LENGTHS] || [53])
          : 53;

        // Tracking location for in-transit loads
        const firstStop = order.stops.find(s => s.stopType === 'PICKUP');
        const lastStop = order.stops.find(s => s.stopType === 'DELIVERY' && s.stopSequence === Math.max(...order.stops.map(st => st.stopSequence)));

        let trackingData = {};
        if (loadStatus === 'IN_TRANSIT' && firstStop && lastStop) {
          const location = getTrackingLocation(
            firstStop.city,
            firstStop.state,
            lastStop.city,
            lastStop.state,
            0.5 // 50% progress
          );

          trackingData = {
            currentLocationLat: location.lat,
            currentLocationLng: location.lng,
            currentCity: location.city,
            currentState: location.state,
            lastTrackingUpdate: new Date(Date.now() - faker.number.int({ min: 1, max: 4 }) * 60 * 60 * 1000),
            eta: lastStop.scheduledArrival ? new Date(lastStop.scheduledArrival.getTime() + faker.number.int({ min: -2, max: 6 }) * 60 * 60 * 1000) : null,
          };
        }

        // Create the load
        const load = await prisma.load.create({
          data: {
            tenantId,
            loadNumber: `LD-${Date.now()}-${String(totalLoads + i + 1).padStart(4, '0')}`,
            orderId: order.id,

            // Carrier assignment
            carrierId: carrier?.id || null,
            driverName: isAssigned ? faker.person.fullName() : null,
            driverPhone: isAssigned ? faker.phone.number() : null,
            truckNumber: isAssigned ? `TRK-${faker.number.int({ min: 100, max: 999 })}` : null,
            trailerNumber: isAssigned ? `TRL-${faker.number.int({ min: 500, max: 999 })}` : null,

            // Status
            status: loadStatus,

            // Rates
            carrierRate,
            accessorialCosts,
            fuelAdvance,
            totalCost,

            // Equipment
            equipmentType: order.equipmentType,
            equipmentLength,
            equipmentWeightLimit: 45000,

            // Tracking
            ...trackingData,

            // Timestamps
            dispatchedAt: ['DISPATCHED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(loadStatus)
              ? new Date(order.orderDate.getTime() + faker.number.int({ min: 1, max: 3 }) * 24 * 60 * 60 * 1000)
              : null,
            pickedUpAt: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(loadStatus)
              ? new Date(order.orderDate.getTime() + faker.number.int({ min: 2, max: 4 }) * 24 * 60 * 60 * 1000)
              : null,
            deliveredAt: loadStatus === 'DELIVERED'
              ? order.actualDeliveryDate || new Date(order.requiredDeliveryDate.getTime() + faker.number.int({ min: -1, max: 1 }) * 24 * 60 * 60 * 1000)
              : null,

            // Documents
            rateConfirmationSent: ['ASSIGNED', 'DISPATCHED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(loadStatus),
            rateConfirmationSigned: ['DISPATCHED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(loadStatus),

            // Notes
            dispatchNotes: faker.datatype.boolean(0.5) ? faker.lorem.sentence() : null,

            // Metadata
            externalId: `SEED-LOAD-${String(totalLoads + i + 1).padStart(4, '0')}`,
            sourceSystem: 'FAKER_SEED',
            customFields: {},
            createdById: users[Math.floor(Math.random() * users.length)].id,
            createdAt: order.createdAt,
            updatedAt: new Date(),
          },
        });

        totalLoads++;

        // Copy stops from order to load
        for (const orderStop of order.stops) {
          await prisma.stop.create({
            data: {
              tenantId,
              loadId: load.id,
              stopType: orderStop.stopType,
              stopSequence: orderStop.stopSequence,
              addressLine1: orderStop.addressLine1,
              addressLine2: orderStop.addressLine2,
              city: orderStop.city,
              state: orderStop.state,
              postalCode: orderStop.postalCode,
              country: orderStop.country,
              contactName: orderStop.contactName,
              contactPhone: orderStop.contactPhone,
              contactEmail: orderStop.contactEmail,
              scheduledArrival: orderStop.scheduledArrival,
              scheduledDeparture: orderStop.scheduledDeparture,
              actualArrival: orderStop.actualArrival,
              actualDeparture: orderStop.actualDeparture,
              status: orderStop.status,
              notes: orderStop.notes,
              specialInstructions: orderStop.specialInstructions,
              appointmentRequired: orderStop.appointmentRequired,
              externalId: `${orderStop.externalId}-LOAD-${load.id.slice(-4)}`,
              sourceSystem: 'FAKER_SEED',
            },
          });
        }

        // Create check calls for in-transit loads (1-3 per load)
        if (loadStatus === 'IN_TRANSIT') {
          const checkCallCount = faker.number.int({ min: 1, max: 3 });

          for (let j = 0; j < checkCallCount; j++) {
            await prisma.checkCall.create({
              data: {
                tenantId,
                loadId: load.id,
                callType: faker.helpers.arrayElement(['DRIVER_CHECKIN', 'DISPATCHER_CALL']),
                callDateTime: new Date(Date.now() - (checkCallCount - j) * 4 * 60 * 60 * 1000), // Every 4 hours
                currentLocation: trackingData.currentCity ? `${trackingData.currentCity}, ${trackingData.currentState}` : null,
                estimatedArrival: trackingData.eta,
                notes: faker.helpers.arrayElement([
                  'On schedule, no issues',
                  'Delayed due to traffic',
                  'Driver taking 30-min break',
                  'Weather conditions slowing progress',
                  'All good, making good time',
                ]),
                calledById: users[Math.floor(Math.random() * users.length)].id,
                createdAt: new Date(Date.now() - (checkCallCount - j) * 4 * 60 * 60 * 1000),
              },
            });
            totalCheckCalls++;
          }
        }
```

**Step 2: Commit load creation logic**

```bash
git add prisma/seed/loads.ts
git commit -m "feat(seed): implement load creation with carriers and tracking"
```

### Task 1.6: Create Load Board Seed File

**Files:**
- Create: `apps/api/prisma/seed/load-board.ts`

**Step 1: Create load board seed file**

```typescript
import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const POSTING_STATUS_DISTRIBUTION = [
  { status: 'ACTIVE', weight: 0.80 },
  { status: 'EXPIRED', weight: 0.15 },
  { status: 'FILLED', weight: 0.05 },
];

function weightedRandom<T>(items: { status: T; weight: number }[]): T {
  const total = items.reduce((sum, { weight }) => sum + weight, 0);
  let random = Math.random() * total;

  for (const { status, weight } of items) {
    if (random < weight) return status;
    random -= weight;
  }

  return items[items.length - 1].status;
}

export async function seedLoadBoard(prisma: any, tenantIds: string[]): Promise<void> {
  let totalPostings = 0;

  for (const tenantId of tenantIds) {
    // Get unassigned loads (carrierId is null)
    const unassignedLoads = await prisma.load.findMany({
      where: {
        tenantId,
        carrierId: null,
      },
      include: {
        order: true,
        stops: {
          orderBy: { stopSequence: 'asc' },
        },
      },
      take: 10, // Limit to first 10 unassigned loads
    });

    if (unassignedLoads.length === 0) continue;

    // Get users for createdBy
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });

    // Create postings for ~5 loads (or however many unassigned loads exist)
    const postingsToCreate = Math.min(5, unassignedLoads.length);

    for (let i = 0; i < postingsToCreate; i++) {
      const load = unassignedLoads[i];
      const order = load.order;
      const firstStop = load.stops.find((s: any) => s.stopType === 'PICKUP');
      const lastStop = load.stops[load.stops.length - 1];

      if (!firstStop || !lastStop) continue;

      // Calculate distance (simplified - use order weight or fake it)
      const distance = faker.number.int({ min: 300, max: 2500 });

      // Calculate rates
      const targetRate = load.carrierRate ? load.carrierRate * 1.05 : faker.number.float({ min: 2000, max: 4000, fractionDigits: 2 });
      const minRate = targetRate * faker.number.float({ min: 0.90, max: 0.95, fractionDigits: 4 });
      const maxRate = targetRate * faker.number.float({ min: 1.05, max: 1.10, fractionDigits: 4 });

      // Status and timing
      const postingStatus = weightedRandom(POSTING_STATUS_DISTRIBUTION);
      const hoursAgo = faker.number.int({ min: 0, max: 48 });
      const postedAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
      const expiresIn = faker.number.int({ min: 24, max: 72 });
      const expiresAt = new Date(postedAt.getTime() + expiresIn * 60 * 60 * 1000);

      await prisma.loadPost.create({
        data: {
          tenantId,
          loadId: load.id,
          postingNumber: `POST-${Date.now()}-${String(totalPostings + i + 1).padStart(4, '0')}`,

          // Status
          status: postingStatus,

          // Rates
          targetRate,
          minRate,
          maxRate,

          // Timing
          postedAt,
          expiresAt,
          filledAt: postingStatus === 'FILLED' ? new Date(postedAt.getTime() + faker.number.int({ min: 2, max: 24 }) * 60 * 60 * 1000) : null,

          // Route
          originCity: firstStop.city,
          originState: firstStop.state,
          originZip: firstStop.postalCode,
          destinationCity: lastStop.city,
          destinationState: lastStop.state,
          destinationZip: lastStop.postalCode,
          distance,

          // Schedule
          pickupDate: firstStop.scheduledArrival,
          deliveryDate: lastStop.scheduledArrival,

          // Equipment
          equipmentType: load.equipmentType,
          equipmentLength: load.equipmentLength,

          // Freight
          commodity: order.commodity,
          weightLbs: order.weightLbs,

          // Visibility
          isPublic: faker.datatype.boolean(0.90),
          allowedCarrierIds: [],

          // Auto-matching
          autoAcceptBids: false,
          autoMatchEnabled: true,
          minCarrierRating: faker.number.float({ min: 3.5, max: 4.5, fractionDigits: 1 }),

          // Metadata
          externalId: `SEED-POST-${String(totalPostings + i + 1).padStart(4, '0')}`,
          sourceSystem: 'FAKER_SEED',
          customFields: {},
          createdById: users[Math.floor(Math.random() * users.length)].id,
          createdAt: postedAt,
          updatedAt: new Date(),
        },
      });

      totalPostings++;
    }
  }

  console.log(`   ✓ Created ${totalPostings} load board postings`);
}
```

**Step 2: Commit load board seed**

```bash
git add prisma/seed/load-board.ts
git commit -m "feat(seed): create load board postings seed"
```

### Task 1.7: Update Main Seed File

**Files:**
- Modify: `apps/api/prisma/seed.ts`

**Step 1: Add imports at top**

After existing imports, add:

```typescript
import { seedLoads } from './seed/loads';
import { seedLoadBoard } from './seed/load-board';
```

**Step 2: Add seed calls after TMS Core seeding**

Find the TMS Core seeding section (around line 65-68) and add after it:

```typescript
    // 5. TMS Core (dependency: crm, sales)
    console.log('🚚 Seeding TMS Core...');
    await seedTMSCore(prisma, tenantIds);
    console.log('✅ TMS Core seeded\n');

    // 5a. Loads (dependency: TMS Core orders, carriers)
    console.log('📦 Seeding Loads...');
    await seedLoads(prisma, tenantIds);
    console.log('✅ Loads seeded\n');

    // 5b. Load Board (dependency: Loads)
    console.log('📋 Seeding Load Board...');
    await seedLoadBoard(prisma, tenantIds);
    console.log('✅ Load Board seeded\n');
```

**Step 3: Commit main seed update**

```bash
git add prisma/seed.ts
git commit -m "feat(seed): integrate loads and load board into main seed"
```

### Task 1.8: Test Seed Data

**Files:**
- N/A (testing)

**Step 1: Reset database and run seed**

```bash
cd apps/api
pnpm prisma migrate reset --force
```

Expected: Database reset and seed runs successfully

**Step 2: Verify seed counts**

Check console output for:
- "✓ Created 50 orders" (10 per tenant × 5 tenants)
- "✓ Created ~75 loads with ~XX check calls"
- "✓ Created ~25 load board postings"

**Step 3: Verify in Prisma Studio**

```bash
pnpm prisma studio
```

Navigate to:
- Order table: Check 1 order has realistic fields (customerRate, commodity, equipmentType, stops)
- Load table: Check 1 load has carrier assigned, rates, tracking data
- Stop table: Check stops exist for both orders and loads
- LoadPost table: Check postings exist with ACTIVE status
- CheckCall table: Check check calls exist for IN_TRANSIT loads

**Step 4: Verify relationships**

In Prisma Studio, click on an Order:
- Should see related Loads in relations
- Click a Load, should see parent Order
- Check an unassigned Load, should have a LoadPost

**Step 5: Commit verification notes**

```bash
git add -A
git commit -m "test(seed): verify seed data relationships and counts"
```

---

## Phase 2: Shared Foundation (TypeScript Types & Hooks)

### Task 2.1: Create TypeScript Types for Orders

**Files:**
- Create: `apps/web/types/orders.ts`

**Step 1: Create types file**

```typescript
// Order status enum
export type OrderStatus =
  | 'QUOTED'
  | 'BOOKED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

// Equipment types
export type EquipmentType =
  | 'DRY_VAN'
  | 'REEFER'
  | 'FLATBED'
  | 'STEP_DECK'
  | 'POWER_ONLY'
  | 'HOTSHOT'
  | 'CONTAINER'
  | 'OTHER';

// Stop type
export type StopType = 'PICKUP' | 'DELIVERY';

// Stop status
export type StopStatus = 'PENDING' | 'ARRIVED' | 'DEPARTED' | 'CANCELLED';

// Order interface
export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  customerReference?: string;
  poNumber?: string;
  bolNumber?: string;
  customerId: string;
  customerContactId?: string;
  quoteId?: string;
  salesRepId?: string;
  status: OrderStatus;
  customerRate?: number;
  accessorialCharges: number;
  fuelSurcharge: number;
  totalCharges?: number;
  currency: string;
  commodity?: string;
  commodityClass?: string;
  weightLbs?: number;
  pieceCount?: number;
  palletCount?: number;
  equipmentType?: EquipmentType;
  isHazmat: boolean;
  hazmatClass?: string;
  temperatureMin?: number;
  temperatureMax?: number;
  orderDate: Date;
  requiredDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  specialInstructions?: string;
  internalNotes?: string;
  isHot: boolean;
  isTeam: boolean;
  isExpedited: boolean;
  externalId?: string;
  sourceSystem?: string;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdById?: string;
  updatedById?: string;
}

// Stop interface
export interface Stop {
  id: string;
  tenantId: string;
  orderId?: string;
  loadId?: string;
  stopType: StopType;
  stopSequence: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  scheduledArrival?: Date;
  scheduledDeparture?: Date;
  actualArrival?: Date;
  actualDeparture?: Date;
  status: StopStatus;
  notes?: string;
  specialInstructions?: string;
  appointmentRequired: boolean;
  externalId?: string;
  sourceSystem?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Timeline event interface
export interface TimelineEvent {
  id: string;
  timestamp: Date;
  eventType: string;
  description: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

// Document interface
export interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedById?: string;
  uploadedByName?: string;
  url?: string;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
  };
}

export interface OrderListResponse extends PaginatedResponse<Order> {}

export interface OrderDetailResponse extends Order {
  loads?: Load[];
  documents?: Document[];
  timeline?: TimelineEvent[];
  customer?: {
    id: string;
    companyName: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
  };
}

// Load type (minimal, will be expanded in loads.ts)
export interface Load {
  id: string;
  loadNumber: string;
  orderId: string;
  status: string;
  carrierRate?: number;
  driverName?: string;
  driverPhone?: string;
}
```

**Step 2: Commit order types**

```bash
cd apps/web
git add types/orders.ts
git commit -m "feat(types): add order and stop TypeScript types"
```

### Task 2.2: Create TypeScript Types for Loads

**Files:**
- Create: `apps/web/types/loads.ts`

**Step 1: Create loads types file**

```typescript
import type { Stop, TimelineEvent, Document, PaginatedResponse } from './orders';

// Load status enum
export type LoadStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'DISPATCHED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

// Check call type
export type CheckCallType = 'DRIVER_CHECKIN' | 'DISPATCHER_CALL';

// Load interface
export interface Load {
  id: string;
  tenantId: string;
  loadNumber: string;
  orderId: string;
  carrierId?: string;
  driverName?: string;
  driverPhone?: string;
  truckNumber?: string;
  trailerNumber?: string;
  status: LoadStatus;
  carrierRate?: number;
  accessorialCosts: number;
  fuelAdvance: number;
  totalCost?: number;
  currentLocationLat?: number;
  currentLocationLng?: number;
  currentCity?: string;
  currentState?: string;
  lastTrackingUpdate?: Date;
  eta?: Date;
  equipmentType?: string;
  equipmentLength?: number;
  equipmentWeightLimit?: number;
  dispatchedAt?: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  rateConfirmationSent: boolean;
  rateConfirmationSigned: boolean;
  dispatchNotes?: string;
  externalId?: string;
  sourceSystem?: string;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  createdById?: string;
  updatedById?: string;
}

// Check call interface
export interface CheckCall {
  id: string;
  tenantId: string;
  loadId: string;
  callType: CheckCallType;
  callDateTime: Date;
  currentLocation?: string;
  estimatedArrival?: Date;
  notes?: string;
  calledById?: string;
  calledByName?: string;
  createdAt: Date;
}

// API response types
export interface LoadListResponse extends PaginatedResponse<Load> {}

export interface LoadDetailResponse extends Load {
  order?: {
    id: string;
    orderNumber: string;
    customerRate?: number;
  };
  stops?: Stop[];
  checkCalls?: CheckCall[];
  documents?: Document[];
  timeline?: TimelineEvent[];
  carrier?: {
    id: string;
    companyName: string;
    mcNumber?: string;
    dotNumber?: string;
    insuranceStatus?: string;
  };
}

// Load filters
export interface LoadFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: LoadStatus;
  carrierId?: string;
  equipmentType?: string;
  fromDate?: string;
  toDate?: string;
}
```

**Step 2: Commit load types**

```bash
git add types/loads.ts
git commit -m "feat(types): add load and check call TypeScript types"
```

### Task 2.3: Create TypeScript Types for Load Board

**Files:**
- Create: `apps/web/types/load-board.ts`

**Step 1: Create load board types file**

```typescript
import type { PaginatedResponse } from './orders';

// Posting status enum
export type PostingStatus = 'ACTIVE' | 'FILLED' | 'EXPIRED' | 'CANCELLED';

// Load posting interface
export interface LoadPosting {
  id: string;
  tenantId: string;
  loadId: string;
  postingNumber: string;
  status: PostingStatus;
  targetRate: number;
  minRate: number;
  maxRate: number;
  postedAt: Date;
  expiresAt: Date;
  filledAt?: Date;
  originCity: string;
  originState: string;
  originZip: string;
  destinationCity: string;
  destinationState: string;
  destinationZip: string;
  distance: number;
  pickupDate?: Date;
  deliveryDate?: Date;
  equipmentType?: string;
  equipmentLength?: number;
  commodity?: string;
  weightLbs?: number;
  isPublic: boolean;
  allowedCarrierIds: string[];
  autoAcceptBids: boolean;
  autoMatchEnabled: boolean;
  minCarrierRating: number;
  externalId?: string;
  sourceSystem?: string;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
}

// Dashboard KPIs
export interface LoadBoardDashboard {
  activePostings: number;
  totalBids: number;
  filledToday: number;
  avgTimeToFill: number; // in hours
}

// API response types
export interface LoadPostingListResponse extends PaginatedResponse<LoadPosting> {}

// Load board filters
export interface LoadBoardFilters {
  page?: number;
  limit?: number;
  status?: PostingStatus;
  equipmentType?: string[];
  originCity?: string;
  originState?: string;
  destinationCity?: string;
  destinationState?: string;
  pickupDateFrom?: string;
  pickupDateTo?: string;
  minRate?: number;
  maxRate?: number;
  minDistance?: number;
  maxDistance?: number;
}
```

**Step 2: Commit load board types**

```bash
git add types/load-board.ts
git commit -m "feat(types): add load board posting TypeScript types"
```

### Task 2.4: Create Order Hooks - useOrder

**Files:**
- Create: `apps/web/lib/hooks/tms/use-order.ts`

**Step 1: Create useOrder hook**

```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { OrderDetailResponse } from '@/types/orders';

export function useOrder(id: string): UseQueryResult<OrderDetailResponse, Error> {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/orders/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch order' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      // Parse dates
      return {
        ...data,
        orderDate: new Date(data.orderDate),
        requiredDeliveryDate: data.requiredDeliveryDate ? new Date(data.requiredDeliveryDate) : undefined,
        actualDeliveryDate: data.actualDeliveryDate ? new Date(data.actualDeliveryDate) : undefined,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    },
    enabled: !!id,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });
}
```

**Step 2: Commit useOrder hook**

```bash
git add lib/hooks/tms/use-order.ts
git commit -m "feat(hooks): add useOrder hook for fetching order details"
```

### Task 2.5: Create Order Hooks - useOrderLoads, useOrderTimeline, useOrderDocuments

**Files:**
- Create: `apps/web/lib/hooks/tms/use-order-loads.ts`
- Create: `apps/web/lib/hooks/tms/use-order-timeline.ts`
- Create: `apps/web/lib/hooks/tms/use-order-documents.ts`

**Step 1: Create useOrderLoads hook**

```typescript
// apps/web/lib/hooks/tms/use-order-loads.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { Load } from '@/types/loads';

export function useOrderLoads(orderId: string): UseQueryResult<Load[], Error> {
  return useQuery({
    queryKey: ['order', orderId, 'loads'],
    queryFn: async () => {
      const response = await fetch(`/api/v1/orders/${orderId}/loads`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.map((load: any) => ({
        ...load,
        dispatchedAt: load.dispatchedAt ? new Date(load.dispatchedAt) : undefined,
        pickedUpAt: load.pickedUpAt ? new Date(load.pickedUpAt) : undefined,
        deliveredAt: load.deliveredAt ? new Date(load.deliveredAt) : undefined,
        eta: load.eta ? new Date(load.eta) : undefined,
        lastTrackingUpdate: load.lastTrackingUpdate ? new Date(load.lastTrackingUpdate) : undefined,
        createdAt: new Date(load.createdAt),
        updatedAt: new Date(load.updatedAt),
      }));
    },
    enabled: !!orderId,
    staleTime: 30000,
  });
}
```

**Step 2: Create useOrderTimeline hook**

```typescript
// apps/web/lib/hooks/tms/use-order-timeline.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { TimelineEvent } from '@/types/orders';

export function useOrderTimeline(orderId: string): UseQueryResult<TimelineEvent[], Error> {
  return useQuery({
    queryKey: ['order', orderId, 'timeline'],
    queryFn: async () => {
      const response = await fetch(`/api/v1/orders/${orderId}/timeline`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      }));
    },
    enabled: !!orderId,
    staleTime: 60000, // 1 minute
  });
}
```

**Step 3: Create useOrderDocuments hook**

```typescript
// apps/web/lib/hooks/tms/use-order-documents.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { Document } from '@/types/orders';

export function useOrderDocuments(orderId: string): UseQueryResult<Document[], Error> {
  return useQuery({
    queryKey: ['order', orderId, 'documents'],
    queryFn: async () => {
      const response = await fetch(`/api/v1/orders/${orderId}/documents`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.map((doc: any) => ({
        ...doc,
        uploadedAt: new Date(doc.uploadedAt),
      }));
    },
    enabled: !!orderId,
    staleTime: 60000,
  });
}
```

**Step 4: Commit order hooks**

```bash
git add lib/hooks/tms/use-order-*.ts
git commit -m "feat(hooks): add useOrderLoads, useOrderTimeline, useOrderDocuments"
```

### Task 2.6: Create Load Hooks

**Files:**
- Create: `apps/web/lib/hooks/tms/use-load.ts`
- Create: `apps/web/lib/hooks/tms/use-load-stops.ts`
- Create: `apps/web/lib/hooks/tms/use-load-tracking.ts`
- Create: `apps/web/lib/hooks/tms/use-load-documents.ts`
- Create: `apps/web/lib/hooks/tms/use-load-timeline.ts`

**Step 1: Create useLoad hook**

```typescript
// apps/web/lib/hooks/tms/use-load.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { LoadDetailResponse } from '@/types/loads';

export function useLoad(id: string): UseQueryResult<LoadDetailResponse, Error> {
  return useQuery({
    queryKey: ['load', id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/loads/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch load' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();

      return {
        ...data,
        dispatchedAt: data.dispatchedAt ? new Date(data.dispatchedAt) : undefined,
        pickedUpAt: data.pickedUpAt ? new Date(data.pickedUpAt) : undefined,
        deliveredAt: data.deliveredAt ? new Date(data.deliveredAt) : undefined,
        eta: data.eta ? new Date(data.eta) : undefined,
        lastTrackingUpdate: data.lastTrackingUpdate ? new Date(data.lastTrackingUpdate) : undefined,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    },
    enabled: !!id,
    staleTime: 30000,
    retry: 2,
  });
}
```

**Step 2: Create useLoadStops, useLoadTracking, useLoadDocuments, useLoadTimeline**

```typescript
// apps/web/lib/hooks/tms/use-load-stops.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { Stop } from '@/types/orders';

export function useLoadStops(loadId: string): UseQueryResult<Stop[], Error> {
  return useQuery({
    queryKey: ['load', loadId, 'stops'],
    queryFn: async () => {
      const response = await fetch(`/api/v1/loads/${loadId}/stops`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data.map((stop: any) => ({
        ...stop,
        scheduledArrival: stop.scheduledArrival ? new Date(stop.scheduledArrival) : undefined,
        actualArrival: stop.actualArrival ? new Date(stop.actualArrival) : undefined,
        actualDeparture: stop.actualDeparture ? new Date(stop.actualDeparture) : undefined,
        createdAt: new Date(stop.createdAt),
        updatedAt: new Date(stop.updatedAt),
      }));
    },
    enabled: !!loadId,
    staleTime: 30000,
  });
}

// apps/web/lib/hooks/tms/use-load-tracking.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { CheckCall } from '@/types/loads';

export function useLoadTracking(loadId: string): UseQueryResult<CheckCall[], Error> {
  return useQuery({
    queryKey: ['load', loadId, 'checkcalls'],
    queryFn: async () => {
      const response = await fetch(`/api/v1/loads/${loadId}/checkcalls`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data.map((call: any) => ({
        ...call,
        callDateTime: new Date(call.callDateTime),
        estimatedArrival: call.estimatedArrival ? new Date(call.estimatedArrival) : undefined,
        createdAt: new Date(call.createdAt),
      }));
    },
    enabled: !!loadId,
    staleTime: 60000,
  });
}

// apps/web/lib/hooks/tms/use-load-documents.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { Document } from '@/types/orders';

export function useLoadDocuments(loadId: string): UseQueryResult<Document[], Error> {
  return useQuery({
    queryKey: ['load', loadId, 'documents'],
    queryFn: async () => {
      const response = await fetch(`/api/v1/loads/${loadId}/documents`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data.map((doc: any) => ({
        ...doc,
        uploadedAt: new Date(doc.uploadedAt),
      }));
    },
    enabled: !!loadId,
    staleTime: 60000,
  });
}

// apps/web/lib/hooks/tms/use-load-timeline.ts
import { useQuery, UseQueryResult } from '@tantml:react-query';
import type { TimelineEvent } from '@/types/orders';

export function useLoadTimeline(loadId: string): UseQueryResult<TimelineEvent[], Error> {
  return useQuery({
    queryKey: ['load', loadId, 'timeline'],
    queryFn: async () => {
      const response = await fetch(`/api/v1/loads/${loadId}/timeline`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return data.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      }));
    },
    enabled: !!loadId,
    staleTime: 60000,
  });
}
```

**Step 3: Commit load hooks**

```bash
git add lib/hooks/tms/use-load*.ts
git commit -m "feat(hooks): add load data fetching hooks"
```

### Task 2.7: Create Load Board Hooks

**Files:**
- Create: `apps/web/lib/hooks/tms/use-load-board-postings.ts`
- Create: `apps/web/lib/hooks/tms/use-load-board-dashboard.ts`

**Step 1: Create hooks**

```typescript
// apps/web/lib/hooks/tms/use-load-board-postings.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { LoadPostingListResponse, LoadBoardFilters } from '@/types/load-board';

export function useLoadBoardPostings(filters: LoadBoardFilters = {}): UseQueryResult<LoadPostingListResponse, Error> {
  const queryParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => queryParams.append(key, String(v)));
      } else {
        queryParams.append(key, String(value));
      }
    }
  });

  return useQuery({
    queryKey: ['load-board', 'postings', filters],
    queryFn: async () => {
      const response = await fetch(`/api/v1/load-board/postings?${queryParams.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      return {
        ...data,
        data: data.data.map((posting: any) => ({
          ...posting,
          postedAt: new Date(posting.postedAt),
          expiresAt: new Date(posting.expiresAt),
          filledAt: posting.filledAt ? new Date(posting.filledAt) : undefined,
          pickupDate: posting.pickupDate ? new Date(posting.pickupDate) : undefined,
          deliveryDate: posting.deliveryDate ? new Date(posting.deliveryDate) : undefined,
          createdAt: new Date(posting.createdAt),
          updatedAt: new Date(posting.updatedAt),
        })),
      };
    },
    staleTime: 15000, // 15 seconds (more frequent for load board)
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
}

// apps/web/lib/hooks/tms/use-load-board-dashboard.ts
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import type { LoadBoardDashboard } from '@/types/load-board';

export function useLoadBoardDashboard(): UseQueryResult<LoadBoardDashboard, Error> {
  return useQuery({
    queryKey: ['load-board', 'dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/v1/load-board/dashboard', {
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      return response.json();
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: true,
  });
}
```

**Step 2: Commit load board hooks**

```bash
git add lib/hooks/tms/use-load-board*.ts
git commit -m "feat(hooks): add load board data fetching hooks"
```

---

## Phase 3: Shared Components

### Task 3.1: Create Status Badge Component

**Files:**
- Create: `apps/web/components/tms/shared/status-badge.tsx`

**Step 1: Create status badge component**

```typescript
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/orders';
import type { LoadStatus } from '@/types/loads';
import type { PostingStatus } from '@/types/load-board';

const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  QUOTED: 'bg-blue-50 text-blue-700 border-blue-200',
  BOOKED: 'bg-green-50 text-green-700 border-green-200',
  IN_TRANSIT: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-gray-50 text-gray-700 border-gray-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const LOAD_STATUS_STYLES: Record<LoadStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
  DISPATCHED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  PICKED_UP: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  IN_TRANSIT: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

const POSTING_STATUS_STYLES: Record<PostingStatus, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  FILLED: 'bg-blue-50 text-blue-700 border-blue-200',
  EXPIRED: 'bg-orange-50 text-orange-700 border-orange-200',
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
};

interface StatusBadgeProps {
  status: OrderStatus | LoadStatus | PostingStatus;
  type: 'order' | 'load' | 'posting';
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const styles =
    type === 'order'
      ? ORDER_STATUS_STYLES[status as OrderStatus]
      : type === 'load'
      ? LOAD_STATUS_STYLES[status as LoadStatus]
      : POSTING_STATUS_STYLES[status as PostingStatus];

  const label = status.replace(/_/g, ' ');

  return (
    <Badge variant="outline" className={cn(styles, 'font-medium', className)}>
      {label}
    </Badge>
  );
}
```

**Step 2: Commit status badge**

```bash
git add components/tms/shared/status-badge.tsx
git commit -m "feat(components): add StatusBadge component"
```

### Task 3.2: Create Financial Summary Card Component

**Files:**
- Create: `apps/web/components/tms/shared/financial-summary-card.tsx`

**Step 1: Create financial summary card**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface FinancialSummaryCardProps {
  revenue: number;
  cost: number;
  margin: number;
  currency?: string;
}

export function FinancialSummaryCard({
  revenue,
  cost,
  margin,
  currency = 'USD',
}: FinancialSummaryCardProps) {
  const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;
  const isPositive = margin >= 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Revenue</span>
          <span className="text-sm font-semibold">{formatCurrency(revenue)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Cost</span>
          <span className="text-sm font-semibold">{formatCurrency(cost)}</span>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Margin</span>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(margin)}
              </span>
            </div>
          </div>
          <div className="mt-1 text-right">
            <span className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {marginPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Commit financial summary card**

```bash
git add components/tms/shared/financial-summary-card.tsx
git commit -m "feat(components): add FinancialSummaryCard component"
```

### Task 3.3: Create Timeline Feed Component

**Files:**
- Create: `apps/web/components/tms/shared/timeline-feed.tsx`

**Step 1: Create timeline feed component**

```typescript
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User } from 'lucide-react';
import type { TimelineEvent } from '@/types/orders';

interface TimelineFeedProps {
  events: TimelineEvent[];
  emptyMessage?: string;
}

export function TimelineFeed({ events, emptyMessage = 'No activity yet' }: TimelineFeedProps) {
  if (events.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <Card key={event.id} className="p-4">
          <div className="flex gap-4">
            {/* Timeline line */}
            <div className="relative flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-primary" />
              {index < events.length - 1 && (
                <div className="absolute top-3 h-full w-0.5 bg-border" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{event.eventType}</p>
                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                </span>
              </div>

              {event.userName && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{event.userName}</span>
                </div>
              )}

              {event.metadata && Object.keys(event.metadata).length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <code className="bg-muted px-2 py-1 rounded">
                    {JSON.stringify(event.metadata, null, 2)}
                  </code>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

**Step 2: Commit timeline feed**

```bash
git add components/tms/shared/timeline-feed.tsx
git commit -m "feat(components): add TimelineFeed component"
```

### Task 3.4: Create Metadata Card Component

**Files:**
- Create: `apps/web/components/tms/shared/metadata-card.tsx`

**Step 1: Create metadata card**

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { Calendar, User, Hash } from 'lucide-react';

interface MetadataCardProps {
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  createdByName?: string;
  externalId?: string;
  sourceSystem?: string;
}

export function MetadataCard({
  createdAt,
  updatedAt,
  createdById,
  createdByName,
  externalId,
  sourceSystem,
}: MetadataCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{format(createdAt, 'PPp')}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-muted-foreground">Last Updated</p>
            <p className="font-medium">{format(updatedAt, 'PPp')}</p>
          </div>
        </div>

        {createdByName && (
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-muted-foreground">Created By</p>
              <p className="font-medium">{createdByName}</p>
            </div>
          </div>
        )}

        {externalId && (
          <div className="flex items-start gap-2">
            <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-muted-foreground">External ID</p>
              <p className="font-mono text-xs">{externalId}</p>
            </div>
          </div>
        )}

        {sourceSystem && (
          <div className="flex items-start gap-2">
            <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-muted-foreground">Source</p>
              <p className="font-medium">{sourceSystem}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Step 2: Commit metadata card**

```bash
git add components/tms/shared/metadata-card.tsx
git commit -m "feat(components): add MetadataCard component"
```

---

## **IMPLEMENTATION PLAN TRUNCATED FOR LENGTH**

The full plan would continue with:

- **Phase 4: Order Detail Page** (Tasks 4.1-4.10)
  - Create page route
  - Build header component
  - Build all tab components (Overview, Stops, Loads, Documents, Timeline)
  - Build sidebar components (Customer card)
  - Wire up with hooks
  - Add loading/error states
  - Test with seed data

- **Phase 5: Load Detail Page** (Tasks 5.1-5.12)
  - Similar structure to Order Detail
  - Additional tracking tab
  - Carrier and driver cards

- **Phase 6: Load Board Page** (Tasks 6.1-6.10)
  - KPI cards
  - Filters component
  - Card and table views
  - View toggle
  - Pagination

- **Phase 7: Integration & Testing** (Tasks 7.1-7.8)
  - E2E navigation testing
  - Error scenario testing
  - Performance testing
  - Accessibility audit
  - Mobile responsiveness
  - Final polish

---

## Execution Notes

**Estimated Time:** 3-4 weeks (80-100 hours)

**Dependencies:**
- Phase 1 must complete before any frontend work
- Phases 2-3 (foundation) must complete before pages
- Phases 4-6 (pages) can be done in parallel by different developers
- Phase 7 (testing) happens at the end

**Testing Strategy:**
- Test each component with Storybook (optional)
- Test hooks with React Testing Library
- Test pages manually with seed data
- E2E tests with Playwright (optional, post-MVP)

**Key Files Created:** ~60 files
**Key Files Modified:** ~5 files

---

**End of Implementation Plan**

This plan provides detailed, bite-sized tasks for the first 3 phases (Seed Data, Foundation, Shared Components). The remaining phases follow the same pattern but are omitted here for brevity. Each task is 2-5 minutes and includes exact file paths, complete code, test commands, and commit messages.
