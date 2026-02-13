import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

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

export async function seedTMSCore(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const companies = await prisma.company.findMany({ where: { tenantId, companyType: { in: ['CUSTOMER', 'BOTH'] } }, take: 10 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (companies.length === 0) continue;

    // Orders (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      const order = await prisma.order.create({
        data: {
          tenantId,
          orderNumber: `ORD-${Date.now()}-${i}`,
          customerId: companies[Math.floor(Math.random() * companies.length)].id,
          status: faker.helpers.arrayElement(['QUOTED', 'BOOKED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']),
          equipmentType: faker.helpers.arrayElement(['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK']),
          customerRate: parseFloat(faker.commerce.price({ min: 1000, max: 5000 })),
          totalCharges: parseFloat(faker.commerce.price({ min: 1000, max: 5000 })),
          commodity: faker.commerce.product(),
          salesRepId: users[Math.floor(Math.random() * users.length)].id,
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-ORDER-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
          customFields: {
            poNumber: faker.string.alphanumeric(8).toUpperCase(),
            specialInstructions: faker.lorem.sentence(),
          },
        },
      });
      total++;

      // Create stops for order (2-4 stops per order)
      const stopCount = faker.number.int({ min: 2, max: 4 });
      for (let j = 0; j < stopCount; j++) {
        await prisma.stop.create({
          data: {
            tenantId,
            orderId: order.id,
            stopType: j === 0 ? 'PICKUP' : j === stopCount - 1 ? 'DELIVERY' : faker.helpers.arrayElement(['PICKUP', 'DELIVERY']),
            stopSequence: j + 1,
            addressLine1: faker.location.streetAddress(),
            city: faker.location.city(),
            state: faker.location.state({ abbreviated: true }),
            postalCode: faker.location.zipCode(),
            country: 'USA',
            status: faker.helpers.arrayElement(['PENDING', 'ARRIVED', 'DEPARTED', 'CANCELLED']),
            externalId: `SEED-STOP-${total}-${j}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
    }
  }

  console.log(`   ✓ Created ${total} TMS core records (orders, stops)`);
}
