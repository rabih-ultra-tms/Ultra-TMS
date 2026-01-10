import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedAccounting(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const orders = await prisma.order.findMany({ where: { tenantId }, take: 20 });
    const companies = await prisma.company.findMany({ where: { tenantId }, take: 10 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    if (orders.length === 0) continue;

    // Invoices (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      const subtotal = parseFloat(faker.commerce.price({ min: 1000, max: 5000 }));
      const taxAmount = parseFloat(faker.commerce.price({ min: 0, max: 200 }));
      const totalAmount = subtotal + taxAmount;
      const amountPaid = faker.helpers.maybe(() => parseFloat(faker.commerce.price({ min: 0, max: totalAmount })), { probability: 0.6 }) || 0;
      const balanceDue = totalAmount - amountPaid;
      
      await prisma.invoice.create({
        data: {
          tenantId,
          invoiceNumber: `INV-${Date.now()}-${i}`,
          orderId: orders[Math.floor(Math.random() * orders.length)]?.id,
          companyId: companies[Math.floor(Math.random() * companies.length)].id,
          invoiceDate: faker.date.past(),
          dueDate: faker.date.future(),
          status: faker.helpers.arrayElement(['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED']),
          subtotal,
          taxAmount,
          totalAmount,
          amountPaid,
          balanceDue,
          currency: 'USD',
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-INVOICE-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} accounting records`);
}
