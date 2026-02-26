import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedCommission(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (users.length === 0) continue;

    // Get existing loads and orders for linking entries
    const loads = await prisma.load.findMany({
      where: { tenantId },
      take: 20,
      include: { order: true },
    });

    // Commission Plans (5 per tenant)
    const plans = [];
    for (let i = 0; i < 5; i++) {
      const plan = await prisma.commissionPlan.create({
        data: {
          tenantId,
          name: `${faker.helpers.arrayElement(['Standard', 'Premium', 'Enterprise'])} Sales Plan ${i + 1} ${faker.string.alphanumeric(6)}`,
          description: faker.lorem.sentence(),
          planType: faker.helpers.arrayElement(['FLAT_FEE', 'PERCENT_REVENUE', 'PERCENT_MARGIN', 'TIERED']),
          percentRate: faker.number.float({ min: 2, max: 10, fractionDigits: 2 }),
          effectiveDate: new Date(Date.UTC(2023, 0, 1 + i)),
          status: 'ACTIVE',
          externalId: `SEED-COMMPLAN-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      plans.push(plan);
      total++;
    }

    // User Commission Assignments (assign each user to a plan)
    for (let i = 0; i < users.length; i++) {
      const plan = plans[i % plans.length];
      await prisma.userCommissionAssignment.create({
        data: {
          tenantId,
          userId: users[i].id,
          planId: plan.id,
          effectiveDate: new Date(Date.UTC(2024, 0, 1)),
          status: 'ACTIVE',
          overrideRate: faker.datatype.boolean()
            ? faker.number.float({ min: 3, max: 8, fractionDigits: 2 })
            : null,
          externalId: `SEED-COMMASSIGN-${tenantId}-${i}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }

    // Commission Entries (transactions) — 8 per user
    for (const user of users) {
      const userPlan = plans[users.indexOf(user) % plans.length];
      for (let i = 0; i < 8; i++) {
        const load = loads.length > 0
          ? loads[Math.floor(Math.random() * loads.length)]
          : null;

        const basisAmount = parseFloat(faker.commerce.price({ min: 1000, max: 15000 }));
        const rate = faker.number.float({ min: 2, max: 10, fractionDigits: 2 });
        const commissionAmount = Math.round(basisAmount * rate) / 100;
        const status = faker.helpers.arrayElement(['PENDING', 'APPROVED', 'PAID', 'PAID', 'APPROVED']);
        const isPaid = status === 'PAID';

        await prisma.commissionEntry.create({
          data: {
            tenantId,
            userId: user.id,
            loadId: load?.id ?? null,
            orderId: load?.orderId ?? null,
            entryType: 'LOAD_COMMISSION',
            planId: userPlan.id,
            calculationBasis: faker.helpers.arrayElement(['NET_MARGIN', 'GROSS_REVENUE']),
            basisAmount,
            rateApplied: rate,
            commissionAmount,
            commissionPeriod: faker.date.between({
              from: new Date(Date.UTC(2025, 6, 1)),
              to: new Date(Date.UTC(2026, 1, 28)),
            }),
            status,
            paidAt: isPaid ? faker.date.recent({ days: 30 }) : null,
            notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
            externalId: `SEED-COMMENTRY-${tenantId}-${user.id.slice(0, 4)}-${i}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
        total++;
      }
    }

    // Commission Payouts (15 per tenant)
    for (let i = 0; i < 15; i++) {
      const grossCommission = parseFloat(faker.commerce.price({ min: 500, max: 5000 }));
      const drawRecovery = parseFloat(faker.commerce.price({ min: 0, max: 100 }));
      const adjustments = parseFloat(faker.commerce.price({ min: 0, max: 50 }));
      await prisma.commissionPayout.create({
        data: {
          tenantId,
          userId: users[Math.floor(Math.random() * users.length)].id,
          payoutNumber: `PAY-${Date.now()}-${i}`,
          payoutDate: faker.date.recent(),
          periodStart: faker.date.past(),
          periodEnd: faker.date.recent(),
          grossCommission,
          drawRecovery,
          adjustments,
          netPayout: grossCommission - drawRecovery - adjustments,
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
