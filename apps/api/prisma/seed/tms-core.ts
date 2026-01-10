import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

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
