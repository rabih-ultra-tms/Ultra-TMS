import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedContracts(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const companies = await prisma.company.findMany({ where: { tenantId }, take: 10 });
    const carriers = await prisma.carrier.findMany({ where: { tenantId }, take: 10 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (companies.length === 0) continue;

    // Contracts (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      const isCustomerContract = faker.datatype.boolean();
      
      await prisma.contract.create({
        data: {
          tenantId,
          customerId: isCustomerContract ? companies[Math.floor(Math.random() * companies.length)]?.id : undefined,
          carrierId: !isCustomerContract && carriers.length > 0 ? carriers[Math.floor(Math.random() * carriers.length)]?.id : undefined,
          contractNumber: `CNT-${Date.now()}-${i}`,
          name: `${faker.commerce.productAdjective()} Service Agreement`,
          contractType: faker.helpers.arrayElement(['CUSTOMER_RATE', 'CARRIER_RATE', 'DEDICATED_CAPACITY', 'AGENT_AGREEMENT']),
          status: faker.helpers.arrayElement(['DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED']),
          effectiveDate: faker.date.past(),
          expirationDate: faker.date.future(),
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-CONTRACT-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} contract records`);
}
