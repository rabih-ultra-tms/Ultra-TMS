import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedAccounting(prisma: any, tenantIds: string[]): Promise<void> {
  let invoiceCount = 0;
  let settlementCount = 0;
  let paymentReceivedCount = 0;
  let paymentMadeCount = 0;

  for (const tenantId of tenantIds) {
    const orders = await prisma.order.findMany({ where: { tenantId }, take: 20 });
    const companies = await prisma.company.findMany({ where: { tenantId }, take: 10 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });
    const carriers = await prisma.carrier.findMany({ where: { tenantId }, take: 10 });
    const loads = await prisma.load.findMany({ where: { tenantId }, take: 20 });

    if (companies.length === 0 || users.length === 0) continue;

    // ─── Invoices (25 per tenant) ──────────────────────────
    const createdInvoices: any[] = [];
    for (let i = 0; i < 25; i++) {
      const subtotal = parseFloat(faker.commerce.price({ min: 800, max: 8000 }));
      const taxAmount = parseFloat(faker.commerce.price({ min: 0, max: 300 }));
      const totalAmount = subtotal + taxAmount;

      // Vary status distribution: more SENT/OVERDUE to make dashboard interesting
      const status = faker.helpers.weightedArrayElement([
        { weight: 10, value: 'DRAFT' },
        { weight: 25, value: 'SENT' },
        { weight: 30, value: 'PAID' },
        { weight: 20, value: 'OVERDUE' },
        { weight: 5, value: 'PARTIAL' },
        { weight: 5, value: 'CANCELLED' },
        { weight: 5, value: 'VOID' },
      ]);

      let amountPaid = 0;
      if (status === 'PAID') amountPaid = totalAmount;
      else if (status === 'PARTIAL') amountPaid = parseFloat((totalAmount * faker.number.float({ min: 0.2, max: 0.8 })).toFixed(2));
      else if (status === 'CANCELLED' || status === 'VOID') amountPaid = 0;
      else amountPaid = faker.helpers.maybe(() => parseFloat((totalAmount * faker.number.float({ min: 0.1, max: 0.5 })).toFixed(2)), { probability: 0.3 }) || 0;

      const balanceDue = parseFloat((totalAmount - amountPaid).toFixed(2));

      // Create invoices spread across last 6 months with some this month
      const invoiceDate = i < 5
        ? faker.date.recent({ days: 28 })  // Recent invoices for MTD
        : faker.date.past({ years: 0.5 });

      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + faker.helpers.arrayElement([15, 30, 45, 60]));

      // Make overdue invoices actually past due
      if (status === 'OVERDUE') {
        dueDate.setDate(dueDate.getDate() - faker.number.int({ min: 10, max: 90 }));
      }

      const invoice = await prisma.invoice.create({
        data: {
          tenantId,
          invoiceNumber: `INV-${Date.now()}-${String(invoiceCount + 1).padStart(4, '0')}`,
          orderId: orders.length > 0 ? orders[Math.floor(Math.random() * orders.length)]?.id : undefined,
          loadId: loads.length > 0 ? loads[Math.floor(Math.random() * loads.length)]?.id : undefined,
          companyId: companies[Math.floor(Math.random() * companies.length)].id,
          invoiceDate,
          dueDate,
          status,
          subtotal,
          taxAmount,
          totalAmount,
          amountPaid,
          balanceDue,
          paymentTerms: faker.helpers.arrayElement(['NET_15', 'NET_30', 'NET_45', 'NET_60']),
          currency: 'USD',
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-INVOICE-${invoiceCount + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
        include: { company: { select: { id: true, name: true } } },
      });

      // Add 1-3 line items per invoice
      const lineCount = faker.number.int({ min: 1, max: 3 });
      for (let ln = 0; ln < lineCount; ln++) {
        const qty = faker.number.int({ min: 1, max: 5 });
        const unitPrice = parseFloat((subtotal / lineCount / qty).toFixed(2));
        await prisma.invoiceLineItem.create({
          data: {
            tenantId,
            invoiceId: invoice.id,
            lineNumber: ln + 1,
            description: faker.helpers.arrayElement([
              'Freight charges - FTL',
              'LTL shipping service',
              'Fuel surcharge',
              'Detention fee',
              'Lumper service',
              'Accessorial - lift gate',
              'Reefer surcharge',
              'Hazmat handling',
            ]),
            itemType: faker.helpers.arrayElement(['FREIGHT', 'FUEL_SURCHARGE', 'HANDLING', 'DETENTION']),
            quantity: qty,
            unitPrice,
            amount: parseFloat((qty * unitPrice).toFixed(2)),
            loadId: loads.length > 0 ? loads[Math.floor(Math.random() * loads.length)]?.id : undefined,
          },
        });
      }

      createdInvoices.push(invoice);
      invoiceCount++;
    }

    // ─── Payments Received (10 per tenant) ─────────────────
    const paidInvoices = createdInvoices.filter(inv => ['PAID', 'PARTIAL'].includes(inv.status));
    for (let i = 0; i < Math.min(10, paidInvoices.length); i++) {
      const inv = paidInvoices[i]!;
      const paymentAmount = Number(inv.amountPaid);
      if (paymentAmount <= 0) continue;

      const payment = await prisma.paymentReceived.create({
        data: {
          tenantId,
          paymentNumber: `PMT-${Date.now()}-${String(paymentReceivedCount + 1).padStart(4, '0')}`,
          companyId: inv.companyId,
          paymentDate: faker.date.between({ from: inv.invoiceDate, to: new Date() }),
          paymentMethod: faker.helpers.arrayElement(['CHECK', 'ACH', 'WIRE', 'CREDIT_CARD']),
          amount: paymentAmount,
          unappliedAmount: 0,
          currency: 'USD',
          referenceNumber: faker.helpers.arrayElement([
            `CHK-${faker.number.int({ min: 10000, max: 99999 })}`,
            `ACH-${faker.string.alphanumeric(8).toUpperCase()}`,
            `WIRE-${faker.string.alphanumeric(10).toUpperCase()}`,
          ]),
          status: 'RECEIVED',
          externalId: `SEED-PMTRCV-${paymentReceivedCount + 1}`,
          sourceSystem: 'FAKER_SEED',
          createdById: users[Math.floor(Math.random() * users.length)].id,
        },
      });

      // Apply payment to invoice
      await prisma.paymentApplication.create({
        data: {
          tenantId,
          paymentId: payment.id,
          invoiceId: inv.id,
          amount: paymentAmount,
          externalId: `SEED-PMTAPP-${paymentReceivedCount + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });

      paymentReceivedCount++;
    }

    // ─── Settlements (8 per tenant) ────────────────────────
    if (carriers.length > 0) {
      for (let i = 0; i < 8; i++) {
        const carrier = carriers[Math.floor(Math.random() * carriers.length)];
        const grossAmount = parseFloat(faker.commerce.price({ min: 2000, max: 12000 }));
        const deductions = parseFloat((grossAmount * faker.number.float({ min: 0, max: 0.1 })).toFixed(2));
        const netAmount = parseFloat((grossAmount - deductions).toFixed(2));

        const status = faker.helpers.weightedArrayElement([
          { weight: 15, value: 'DRAFT' },
          { weight: 25, value: 'SENT' },
          { weight: 30, value: 'APPROVED' },
          { weight: 25, value: 'PAID' },
          { weight: 5, value: 'DISPUTED' },
        ]);

        const amountPaid = status === 'PAID' ? netAmount : 0;

        const settlement = await prisma.settlement.create({
          data: {
            tenantId,
            settlementNumber: `STL-${Date.now()}-${String(settlementCount + 1).padStart(4, '0')}`,
            carrierId: carrier.id,
            settlementDate: faker.date.recent({ days: 60 }),
            dueDate: faker.date.soon({ days: 30 }),
            grossAmount,
            deductionsTotal: deductions,
            netAmount,
            amountPaid,
            balanceDue: parseFloat((netAmount - amountPaid).toFixed(2)),
            status,
            paymentType: faker.helpers.arrayElement(['STANDARD', 'QUICK_PAY']),
            paymentMethod: faker.helpers.arrayElement(['CHECK', 'ACH', 'WIRE']),
            currency: 'USD',
            externalId: `SEED-SETTLE-${settlementCount + 1}`,
            sourceSystem: 'FAKER_SEED',
            createdById: users[Math.floor(Math.random() * users.length)].id,
          },
        });

        // Add 1-3 line items per settlement
        const slLineCount = faker.number.int({ min: 1, max: 3 });
        for (let ln = 0; ln < slLineCount; ln++) {
          await prisma.settlementLineItem.create({
            data: {
              tenantId,
              settlementId: settlement.id,
              lineNumber: ln + 1,
              description: faker.helpers.arrayElement([
                'Linehaul freight',
                'Fuel surcharge',
                'Detention charge',
                'Lumper reimbursement',
                'Toll reimbursement',
              ]),
              itemType: faker.helpers.arrayElement(['LOAD', 'FUEL_SURCHARGE', 'TOLL', 'DETENTION']),
              quantity: 1,
              unitRate: parseFloat((grossAmount / slLineCount).toFixed(2)),
              amount: parseFloat((grossAmount / slLineCount).toFixed(2)),
              loadId: loads.length > 0 ? loads[Math.floor(Math.random() * loads.length)]?.id : undefined,
            },
          });
        }

        settlementCount++;
      }
    }

    // ─── Payments Made / Payables (6 per tenant) ───────────
    if (carriers.length > 0) {
      for (let i = 0; i < 6; i++) {
        const carrier = carriers[Math.floor(Math.random() * carriers.length)];
        const amount = parseFloat(faker.commerce.price({ min: 1500, max: 10000 }));

        await prisma.paymentMade.create({
          data: {
            tenantId,
            paymentNumber: `PAY-M-${Date.now()}-${String(paymentMadeCount + 1).padStart(4, '0')}`,
            carrierId: carrier.id,
            paymentDate: faker.date.recent({ days: 45 }),
            paymentMethod: faker.helpers.arrayElement(['CHECK', 'ACH', 'WIRE']),
            amount,
            currency: 'USD',
            referenceNumber: `ACH-${faker.string.alphanumeric(10).toUpperCase()}`,
            status: faker.helpers.weightedArrayElement([
              { weight: 30, value: 'PENDING' },
              { weight: 20, value: 'SENT' },
              { weight: 40, value: 'PROCESSED' },
              { weight: 10, value: 'FAILED' },
            ]),
            externalId: `SEED-PAYMADE-${paymentMadeCount + 1}`,
            sourceSystem: 'FAKER_SEED',
            createdById: users[Math.floor(Math.random() * users.length)].id,
          },
        });

        paymentMadeCount++;
      }
    }
  }

  console.log(`   ✓ Created ${invoiceCount} invoices, ${paymentReceivedCount} payments received, ${settlementCount} settlements, ${paymentMadeCount} payments made`);
}
