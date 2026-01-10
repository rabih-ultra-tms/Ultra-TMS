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
          userId: users[i]?.id ?? null,
          employeeNumber: `EMP${faker.string.numeric(7)}`,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number({ style: 'international' }),
          employmentType: faker.helpers.arrayElement(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMP']),
          hireDate: faker.date.past({ years: 5 }),
          annualSalary: parseFloat(faker.commerce.price({ min: 45000, max: 160000 })),
          externalId: `SEED-EMPLOYEE-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} HR records`);
}
