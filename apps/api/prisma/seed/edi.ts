import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedEDI(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const companies = await prisma.company.findMany({ where: { tenantId }, take: 10 });
    if (companies.length === 0) continue;

    // EDI Trading Partners (10 per tenant = 50 total)
    const partners = [];
    for (let i = 0; i < 10; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const partner = await prisma.ediTradingPartner.create({
        data: {
          tenantId,
          partnerName: company?.name || faker.company.name(),
          partnerType: faker.helpers.arrayElement(['CUSTOMER', 'CARRIER', 'BROKER', '3PL']),
          isaId: faker.string.alphanumeric(15).toUpperCase(),
          gsId: faker.string.alphanumeric(15).toUpperCase(),
          scac: faker.string.alpha({ length: 4, casing: 'upper' }),
          protocol: faker.helpers.arrayElement(['FTP', 'SFTP', 'AS2', 'VAN']),
          isActive: true,
          externalId: `SEED-EDITRADINGPARTNER-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      partners.push(partner);
      total++;
    }

    // EDI Messages (10 per tenant = 50 total)
    for (let i = 0; i < 10; i++) {
      const isaControl = faker.string.numeric(9);
      const gsControl = faker.string.numeric(9);
      const stControl = faker.string.numeric(9);
      
      await prisma.ediMessage.create({
        data: {
          tenantId,
          tradingPartnerId: partners[Math.floor(Math.random() * partners.length)]?.id,
          messageId: `MSG-${Date.now()}-${i}`,
          transactionType: faker.helpers.arrayElement(['EDI_204', 'EDI_214', 'EDI_990', 'EDI_997']),
          direction: faker.helpers.arrayElement(['INBOUND', 'OUTBOUND']),
          status: faker.helpers.arrayElement(['PENDING', 'SENT', 'DELIVERED', 'ACKNOWLEDGED']),
          isaControlNumber: isaControl,
          gsControlNumber: gsControl,
          stControlNumber: stControl,
          rawContent: `ISA*00*...*${isaControl}~GS*...*${gsControl}~ST*...*${stControl}~SE*1*${stControl}~GE*1*${gsControl}~IEA*1*${isaControl}~`,
          externalId: `SEED-EDIMESSAGE-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} EDI records`);
}
