import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedHR(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 20 });
    if (users.length === 0) continue;

    // Employees (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.employee.create({
        data: {
          tenantId,
          userId: users[i]?.id,
          employeeNumber: `EMP${faker.string.numeric(6)}`,
          hireDate: faker.date.past({ years: 5 }),
          department: faker.helpers.arrayElement(['Operations', 'Sales', 'Accounting', 'Management', 'Customer Service']),
          position: faker.person.jobTitle(),
          employmentType: faker.helpers.arrayElement(['FULL_TIME', 'PART_TIME', 'CONTRACT']),
          status: faker.helpers.arrayElement(['ACTIVE', 'ACTIVE', 'ACTIVE', 'TERMINATED']),
          salary: parseFloat(faker.commerce.price({ min: 40000, max: 150000 })),
          externalId: `SEED-EMPLOYEE-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} HR records`);
}
