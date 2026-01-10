import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedCredit(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const companies = await prisma.company.findMany({ where: { tenantId }, take: 10 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (companies.length === 0) continue;

    // Credit Applications (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      await prisma.creditApplication.create({
        data: {
          tenantId,
          companyId: company.id,
          applicationNumber: `CRD-${Date.now()}-${i}`,
          businessName: company.name,
          status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'DENIED', 'UNDER_REVIEW']),
          requestedLimit: parseFloat(faker.commerce.price({ min: 5000, max: 100000 })),
          approvedLimit: faker.helpers.maybe(() => parseFloat(faker.commerce.price({ min: 5000, max: 100000 })), { probability: 0.6 }),
          creditScore: faker.number.int({ min: 300, max: 850 }),
          reviewedById: users[Math.floor(Math.random() * users.length)]?.id,
          externalId: `SEED-CREDITAPP-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} credit records`);
}
