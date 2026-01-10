import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedCommission(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (users.length === 0) continue;

    // Commission Plans (5 per tenant = 25 total)
    const plans = [];
    for (let i = 0; i < 5; i++) {
      const plan = await prisma.commissionPlan.create({
        data: {
          tenantId,
          name: `${faker.helpers.arrayElement(['Standard', 'Premium', 'Enterprise'])} Sales Plan`,
          description: faker.lorem.sentence(),
          planType: faker.helpers.arrayElement(['FLAT_FEE', 'PERCENT_REVENUE', 'PERCENT_MARGIN', 'TIERED']),
          percentRate: faker.number.float({ min: 2, max: 10, fractionDigits: 2 }),
          effectiveDate: faker.date.past(),
          status: 'ACTIVE',
          externalId: `SEED-COMMPLAN-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      plans.push(plan);
      total++;
    }

    // Commission Payouts (15 per tenant = 75 total)
    for (let i = 0; i < 15; i++) {
      await prisma.commissionPayout.create({
        data: {
          tenantId,
          userId: users[Math.floor(Math.random() * users.length)].id,
          payoutNumber: `PAY-${Date.now()}-${i}`,
          payoutDate: faker.date.recent(),
          periodStart: faker.date.past(),
          periodEnd: faker.date.recent(),
          grossCommission: parseFloat(faker.commerce.price({ min: 500, max: 5000 })),
          netPayout: parseFloat(faker.commerce.price({ min: 400, max: 4800 })),
          status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'PAID']),
          externalId: `SEED-COMMPAYOUT-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} commission records`);
}
