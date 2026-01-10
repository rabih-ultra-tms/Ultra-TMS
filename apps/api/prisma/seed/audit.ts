import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedAudit(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 10 });
    if (users.length === 0) continue;

    // Audit Logs (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.auditLog.create({
        data: {
          tenantId,
          userId: users[Math.floor(Math.random() * users.length)].id,
          action: faker.helpers.arrayElement(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']),
          entityType: faker.helpers.arrayElement(['ORDER', 'COMPANY', 'USER', 'INVOICE', 'CARRIER']),
          entityId: faker.string.uuid(),
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          externalId: `SEED-AUDITLOG-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} audit records`);
}
