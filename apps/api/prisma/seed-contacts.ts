import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const CONTACTS_PER_COMPANY = 3; // Create 3 contacts per company

async function seedContacts() {
  console.log('🌱 Starting contacts seeding...\n');

  try {
    // Get all tenants
    const tenants = await prisma.tenant.findMany();
    console.log(`📋 Found ${tenants.length} tenant(s)\n`);

    let totalCreated = 0;

    for (const tenant of tenants) {
      console.log(`\n📦 Processing tenant: ${tenant.name} (${tenant.id})`);

      // Get all companies for this tenant
      const companies = await prisma.company.findMany({
        where: { tenantId: tenant.id },
      });

      console.log(`  Found ${companies.length} companies`);

      if (companies.length === 0) {
        console.log('  ⚠️  No companies found. Skipping...');
        continue;
      }

      // Create contacts for each company
      let tenantContactCount = 0;

      for (const company of companies) {
        // Create multiple contacts per company
        for (let i = 0; i < CONTACTS_PER_COMPANY; i++) {
          const roleTypes = ['PRIMARY', 'BILLING', 'SHIPPING', 'OPERATIONS', 'EXECUTIVE'];
          const contactMethods = ['EMAIL', 'PHONE', 'SMS'];
          const departments = ['Sales', 'Operations', 'Accounting', 'Logistics', 'Management', 'Customer Service'];

          const firstName = faker.person.firstName();
          const lastName = faker.person.lastName();
          const isPrimary = i === 0; // First contact is always primary

          try {
            await prisma.contact.create({
              data: {
                tenantId: tenant.id,
                companyId: company.id,
                firstName,
                lastName,
                title: faker.person.jobTitle(),
                department: faker.helpers.arrayElement(departments),
                roleType: faker.helpers.arrayElement(roleTypes),
                email: faker.internet.email({ firstName, lastName }).toLowerCase(),
                phone: faker.phone.number('###-###-####'),
                mobile: faker.helpers.maybe(() => faker.phone.number('###-###-####'), { probability: 0.7 }),
                fax: faker.helpers.maybe(() => faker.phone.number('###-###-####'), { probability: 0.2 }),
                preferredContactMethod: faker.helpers.arrayElement(contactMethods),
                language: 'en',
                timezone: faker.helpers.arrayElement([
                  'America/New_York',
                  'America/Chicago',
                  'America/Denver',
                  'America/Los_Angeles',
                  'America/Phoenix',
                ]),
                status: 'ACTIVE',
                isPrimary,
                receivesInvoices: faker.helpers.arrayElement([true, false, false]),
                receivesTracking: faker.helpers.arrayElement([true, true, false]),
                externalId: `SEED-CONTACT-${totalCreated + 1}`,
                sourceSystem: 'FAKER_SEED',
                customFields: {
                  birthday: faker.helpers.maybe(() => faker.date.birthdate().toISOString(), { probability: 0.3 }),
                  linkedIn: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.4 }),
                  notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }),
                },
                tags: faker.helpers.arrayElements(
                  ['VIP', 'Decision Maker', 'Influencer', 'Gatekeeper', 'Technical', 'Financial'],
                  { min: 0, max: 2 }
                ),
              },
            });

            tenantContactCount++;
            totalCreated++;
          } catch (error) {
            console.error(`  ❌ Error creating contact for company ${company.name}:`, error);
          }
        }
      }

      console.log(`  ✅ Created ${tenantContactCount} contacts for ${tenant.name}`);
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`📊 Total contacts created: ${totalCreated}`);

    // Display summary statistics
    const summary = await prisma.contact.groupBy({
      by: ['tenantId'],
      _count: true,
    });

    console.log('\n📈 Contacts per tenant:');
    for (const stat of summary) {
      const tenant = await prisma.tenant.findUnique({ where: { id: stat.tenantId } });
      console.log(`   ${tenant?.name}: ${stat._count} contacts`);
    }

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedContacts();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
