import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedFeedback(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 10 });
    if (users.length === 0) continue;

    // Feedback (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.feedback.create({
        data: {
          tenantId,
          userId: users[Math.floor(Math.random() * users.length)].id,
          type: faker.helpers.arrayElement(['BUG', 'FEATURE_REQUEST', 'IMPROVEMENT', 'GENERAL']),
          subject: faker.lorem.sentence(),
          description: faker.lorem.paragraphs(2),
          status: faker.helpers.arrayElement(['NEW', 'UNDER_REVIEW', 'PLANNED', 'IMPLEMENTED', 'REJECTED']),
          rating: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 5 }), { probability: 0.6 }),
          externalId: `SEED-FEEDBACK-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} feedback records`);
}
