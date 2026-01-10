import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedCarrierPortal(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const carriers = await prisma.carrier.findMany({ where: { tenantId }, take: 10 });
    if (carriers.length === 0) continue;

    // Carrier Portal Users (10 per tenant = 50 total)
    for (let i = 0; i < 10; i++) {
      await prisma.carrierPortalUser.create({
        data: {
          tenantId,
          carrierId: carriers[Math.floor(Math.random() * carriers.length)].id,
          email: faker.internet.email(),
          password: '$2b$10$fakehashfakehashfakehashfakehashfakehashfakehash',
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          status: 'ACTIVE',
          lastLoginAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.7 }),
          externalId: `SEED-CARRIERPORTALUSER-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} carrier portal records`);
}
