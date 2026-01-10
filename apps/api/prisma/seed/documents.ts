import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedDocuments(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const orders = await prisma.order.findMany({ where: { tenantId }, take: 10 });
    const users = await prisma.user.findMany({ where: { tenantId }, take: 5 });

    // Document Folders (5 per tenant = 25 total)
    const folders = [];
    for (let i = 0; i < 5; i++) {
      const folder = await prisma.documentFolder.create({
        data: {
          tenantId,
          name: faker.helpers.arrayElement(['Invoices', 'PODs', 'Rate Confirmations', 'BOLs', 'Contracts']),
          description: faker.lorem.sentence(),
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-FOLDER-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      folders.push(folder);
      total++;
    }

    // Documents (15 per tenant = 75 total)
    for (let i = 0; i < 15; i++) {
      const doc = await prisma.document.create({
        data: {
          tenantId,
          orderId: orders[Math.floor(Math.random() * orders.length)]?.id,
          documentType: faker.helpers.arrayElement(['BOL', 'POD', 'INVOICE', 'RATE_CONFIRMATION', 'OTHER']),
          name: `${faker.system.fileName()}.pdf`,
          fileName: `${faker.system.fileName()}.pdf`,
          fileSize: faker.number.int({ min: 10000, max: 5000000 }),
          mimeType: 'application/pdf',
          filePath: `documents/${faker.string.uuid()}.pdf`,
          uploadedBy: users[Math.floor(Math.random() * users.length)].id,
          createdById: users[Math.floor(Math.random() * users.length)].id,
          externalId: `SEED-DOCUMENT-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;

      // Link document to a folder
      if (folders.length > 0) {
        await prisma.folderDocument.create({
          data: {
            folderId: folders[Math.floor(Math.random() * folders.length)].id,
            documentId: doc.id,
            externalId: `SEED-FOLDERDOC-${total}-${i}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
    }
  }

  console.log(`   ✓ Created ${total} document records`);
}
