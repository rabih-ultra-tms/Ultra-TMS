import { PrismaClient, Company } from '@prisma/client';

/**
 * Seed a handful of companies for a given tenant.
 * Usage:
 *   SEED_TENANT_ID=<tenant-id> pnpm ts-node prisma/seed-companies.ts
 */
const prisma = new PrismaClient();

const seedCompanies: Array<Pick<Company,
  'name' | 'legalName' | 'companyType' | 'status' | 'industry' | 'segment' | 'tier' |
  'website' | 'phone' | 'email' | 'addressLine1' | 'city' | 'state' | 'postalCode'
>> = [
  {
    name: 'Acme Manufacturing',
    legalName: 'Acme Manufacturing LLC',
    companyType: 'CUSTOMER',
    status: 'ACTIVE',
    industry: 'Manufacturing',
    segment: 'MID_MARKET',
    tier: 'GOLD',
    website: 'https://acme.example.com',
    phone: '+1-312-555-1100',
    email: 'ops@acme.example.com',
    addressLine1: '123 Industrial Way',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60601',
  },
  {
    name: 'Blue River Foods',
    legalName: 'Blue River Foods Inc',
    companyType: 'CUSTOMER',
    status: 'ACTIVE',
    industry: 'Food & Beverage',
    segment: 'ENTERPRISE',
    tier: 'PLATINUM',
    website: 'https://blueriverfoods.example.com',
    phone: '+1-816-555-2200',
    email: 'logistics@blueriverfoods.example.com',
    addressLine1: '987 Market St',
    city: 'Kansas City',
    state: 'MO',
    postalCode: '64106',
  },
  {
    name: 'Crown Retail Group',
    legalName: 'Crown Retail Group LLC',
    companyType: 'CUSTOMER',
    status: 'ACTIVE',
    industry: 'Retail',
    segment: 'MID_MARKET',
    tier: 'SILVER',
    website: 'https://crownretail.example.com',
    phone: '+1-214-555-3300',
    email: 'supply@crownretail.example.com',
    addressLine1: '450 Commerce Dr',
    city: 'Dallas',
    state: 'TX',
    postalCode: '75201',
  },
  {
    name: 'Delta Auto Parts',
    legalName: 'Delta Auto Parts Corp',
    companyType: 'PROSPECT',
    status: 'ACTIVE',
    industry: 'Automotive',
    segment: 'MID_MARKET',
    tier: 'BRONZE',
    website: 'https://deltaauto.example.com',
    phone: '+1-248-555-4400',
    email: 'purchasing@deltaauto.example.com',
    addressLine1: '75 Motor City Blvd',
    city: 'Detroit',
    state: 'MI',
    postalCode: '48226',
  },
  {
    name: 'Evergreen Organics',
    legalName: 'Evergreen Organics Co',
    companyType: 'PROSPECT',
    status: 'ACTIVE',
    industry: 'Agriculture',
    segment: 'SMB',
    tier: 'BRONZE',
    website: 'https://evergreen.example.com',
    phone: '+1-541-555-5500',
    email: 'hello@evergreen.example.com',
    addressLine1: '22 Farm Lane',
    city: 'Eugene',
    state: 'OR',
    postalCode: '97401',
  },
  {
    name: 'Frontier Tech Partners',
    legalName: 'Frontier Tech Partners LLC',
    companyType: 'PARTNER',
    status: 'ACTIVE',
    industry: 'Technology',
    segment: 'MID_MARKET',
    tier: 'GOLD',
    website: 'https://frontiertechnology.example.com',
    phone: '+1-415-555-6600',
    email: 'partners@frontiertech.example.com',
    addressLine1: '600 Mission St',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
  },
  {
    name: 'Glacier Transport',
    legalName: 'Glacier Transport Ltd',
    companyType: 'VENDOR',
    status: 'ACTIVE',
    industry: 'Logistics',
    segment: 'SMB',
    tier: 'SILVER',
    website: 'https://glaciertransport.example.com',
    phone: '+1-406-555-7700',
    email: 'dispatch@glaciertransport.example.com',
    addressLine1: '17 Freight Ave',
    city: 'Billings',
    state: 'MT',
    postalCode: '59101',
  },
  {
    name: 'Harbor Medical Supplies',
    legalName: 'Harbor Medical Supplies Inc',
    companyType: 'CUSTOMER',
    status: 'ACTIVE',
    industry: 'Healthcare',
    segment: 'MID_MARKET',
    tier: 'GOLD',
    website: 'https://harbormed.example.com',
    phone: '+1-617-555-8800',
    email: 'ops@harbormed.example.com',
    addressLine1: '300 Harbor Dr',
    city: 'Boston',
    state: 'MA',
    postalCode: '02110',
  },
  {
    name: 'Ironclad Metals',
    legalName: 'Ironclad Metals LLC',
    companyType: 'CUSTOMER',
    status: 'ACTIVE',
    industry: 'Metals & Mining',
    segment: 'MID_MARKET',
    tier: 'SILVER',
    website: 'https://ironcladmetals.example.com',
    phone: '+1-412-555-9900',
    email: 'supply@ironcladmetals.example.com',
    addressLine1: '810 Steel St',
    city: 'Pittsburgh',
    state: 'PA',
    postalCode: '15222',
  },
  {
    name: 'Jetstream Apparel',
    legalName: 'Jetstream Apparel Co',
    companyType: 'CUSTOMER',
    status: 'ACTIVE',
    industry: 'Apparel',
    segment: 'SMB',
    tier: 'BRONZE',
    website: 'https://jetstreamapparel.example.com',
    phone: '+1-704-555-1010',
    email: 'logistics@jetstreamapparel.example.com',
    addressLine1: '44 Textile Rd',
    city: 'Charlotte',
    state: 'NC',
    postalCode: '28202',
  },
];

async function main() {
  const tenantId = process.env.SEED_TENANT_ID;
  const userId = process.env.SEED_USER_ID; // optional assigned user

  if (!tenantId) {
    throw new Error('Please set SEED_TENANT_ID to the tenant you want to seed.');
  }

  console.log(`Seeding ${seedCompanies.length} companies for tenant ${tenantId}...`);

  for (const company of seedCompanies) {
    await prisma.company.create({
      data: {
        tenantId,
        ...company,
        assignedUserId: userId || undefined,
      },
    });
  }

  console.log('✅ Company seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
