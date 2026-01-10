import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedFactoring(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const carriers = await prisma.carrier.findMany({ where: { tenantId }, take: 10 });
    if (carriers.length === 0) continue;

    // Factoring Companies (5 per tenant = 25 total)
    const factoringCompanies = [];
    for (let i = 0; i < 5; i++) {
      total++;
      const company = await prisma.factoringCompany.create({
        data: {
          tenantId,
          name: (faker.company.name() + ' Factoring').substring(0, 200),
          companyCode: `FACT-${total}`,
          email: faker.internet.email().substring(0, 100),
          phone: '555-' + faker.string.numeric(3) + '-' + faker.string.numeric(4),
          verificationMethod: faker.helpers.arrayElement(['PHONE', 'EMAIL', 'FAX', 'API']),
          status: 'ACTIVE',
          externalId: `SEED-FACTORING-${total}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      factoringCompanies.push(company);
    }
  }

  console.log(`   ✓ Created ${total} factoring records`);
}
