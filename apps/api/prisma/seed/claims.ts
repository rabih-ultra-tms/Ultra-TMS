import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedClaims(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const orders = await prisma.order.findMany({ where: { tenantId }, take: 20 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (orders.length === 0) continue;

    // Claims (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.claim.create({
        data: {
          tenantId,
          orderId: orders[Math.floor(Math.random() * orders.length)]?.id,
          claimNumber: `CLM-${Date.now()}-${i}`,
          claimType: faker.helpers.arrayElement(['CARGO_DAMAGE', 'CARGO_LOSS', 'SHORTAGE', 'LATE_DELIVERY', 'OVERCHARGE', 'OTHER']),
          status: faker.helpers.arrayElement(['DRAFT', 'SUBMITTED', 'UNDER_INVESTIGATION', 'PENDING_DOCUMENTATION', 'APPROVED', 'DENIED', 'SETTLED', 'CLOSED']),
          claimedAmount: parseFloat(faker.commerce.price({ min: 100, max: 10000 })),
          approvedAmount: faker.helpers.maybe(() => parseFloat(faker.commerce.price({ min: 50, max: 10000 })), { probability: 0.5 }),
          incidentDate: faker.date.past(),
          description: faker.lorem.paragraphs(2),
          claimantName: faker.person.fullName(),
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-CLAIM-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} claims records`);
}
