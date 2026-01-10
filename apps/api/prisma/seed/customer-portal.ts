import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedCustomerPortal(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const companies = await prisma.company.findMany({ where: { tenantId, companyType: { in: ['CUSTOMER', 'BOTH'] } }, take: 10 });
    if (companies.length === 0) continue;

    // Portal Users (10 per tenant = 50 total)
    for (let i = 0; i < 10; i++) {
      await prisma.portalUser.create({
        data: {
          tenantId,
          companyId: companies[Math.floor(Math.random() * companies.length)].id,
          email: faker.internet.email(),
          password: '$2b$10$fakehashfakehashfakehashfakehashfakehashfakehash',
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          status: 'ACTIVE',
          lastLoginAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.7 }),
          externalId: `SEED-PORTALUSER-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} customer portal records`);
}
