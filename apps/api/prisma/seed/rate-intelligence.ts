import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedRateIntelligence(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });

    // Rate Queries (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.rateQuery.create({
        data: {
          tenantId,
          originCity: faker.location.city(),
          originState: faker.location.state({ abbreviated: true }),
          destinationCity: faker.location.city(),
          destinationState: faker.location.state({ abbreviated: true }),
          equipmentType: faker.helpers.arrayElement(['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK']),
          queriedAt: faker.date.recent(),
          averageRate: parseFloat(faker.commerce.price({ min: 1000, max: 4000 })),
          lowRate: parseFloat(faker.commerce.price({ min: 800, max: 3500 })),
          highRate: parseFloat(faker.commerce.price({ min: 1200, max: 5000 })),
          queriedById: users[Math.floor(Math.random() * users.length)]?.id,
          externalId: `SEED-RATEQUERY-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} rate intelligence records`);
}
