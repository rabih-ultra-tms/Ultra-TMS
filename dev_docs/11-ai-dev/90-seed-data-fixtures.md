# 85 - Seed Data & Test Fixtures

**Realistic test data for development and testing**

---

## Purpose

This document provides:

- Seed data scripts for populating development database
- Factory functions for generating test data
- Realistic sample data for all major entities
- Test scenarios with pre-configured data states

---

## Quick Start

```bash
# Seed development database
npx prisma db seed

# Reset and reseed
npx prisma migrate reset
```

---

## Seed Script Structure

```typescript
// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import { seedTenants } from './seeds/tenants';
import { seedUsers } from './seeds/users';
import { seedCarriers } from './seeds/carriers';
import { seedCustomers } from './seeds/customers';
import { seedLoads } from './seeds/loads';

const prisma = new PrismaClient();

async function main() {
  console.log('ðŸŒ± Starting seed...');

  // Order matters - respect foreign keys
  await seedTenants(prisma);
  await seedUsers(prisma);
  await seedCustomers(prisma);
  await seedCarriers(prisma);
  await seedLoads(prisma);

  console.log('âœ… Seed completed!');
}

main()
  .catch((e) => {
    console.error('âŒ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 1. Tenants (5 Companies)

```typescript
// prisma/seeds/tenants.ts

export const tenants = [
  {
    id: 'tenant_freight_masters',
    name: 'Freight Masters LLC',
    slug: 'freight-masters',
    status: 'ACTIVE',
    plan: 'PROFESSIONAL',
    settings: {
      timezone: 'America/Chicago',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      defaultPaymentTerms: 30,
    },
  },
  {
    id: 'tenant_swift_logistics',
    name: 'Swift Logistics Inc',
    slug: 'swift-logistics',
    status: 'ACTIVE',
    plan: 'ENTERPRISE',
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      defaultPaymentTerms: 15,
    },
  },
  {
    id: 'tenant_demo',
    name: 'Demo Company',
    slug: 'demo',
    status: 'ACTIVE',
    plan: 'STARTER',
    settings: {
      timezone: 'America/Los_Angeles',
      currency: 'USD',
    },
  },
  {
    id: 'tenant_test',
    name: 'Test Company',
    slug: 'test',
    status: 'ACTIVE',
    plan: 'PROFESSIONAL',
  },
  {
    id: 'tenant_inactive',
    name: 'Inactive Corp',
    slug: 'inactive-corp',
    status: 'INACTIVE',
    plan: 'STARTER',
  },
];

export async function seedTenants(prisma: PrismaClient) {
  for (const tenant of tenants) {
    await prisma.tenant.upsert({
      where: { id: tenant.id },
      update: tenant,
      create: tenant,
    });
  }
  console.log(`  âœ“ ${tenants.length} tenants seeded`);
}
```

---

## 2. Users (20 Users Across All Roles)

```typescript
// prisma/seeds/users.ts

import { hash } from 'bcryptjs';

// Password for all test users: "Test123!"
const DEFAULT_PASSWORD_HASH =
  '$2a$10$K8GpSNwbzMRVZ6IjkTB/8OQZ7X8nF0YpR5jK3L9E1VzQ2W4M6N8Hy';

export const users = [
  // ===== TENANT: freight_masters =====
  // Super Admin
  {
    id: 'user_admin_1',
    email: 'admin@freightmasters.com',
    firstName: 'John',
    lastName: 'Admin',
    role: 'SUPER_ADMIN',
    tenantId: 'tenant_freight_masters',
    status: 'ACTIVE',
  },
  // Admin
  {
    id: 'user_admin_2',
    email: 'sarah.ops@freightmasters.com',
    firstName: 'Sarah',
    lastName: 'Operations',
    role: 'ADMIN',
    tenantId: 'tenant_freight_masters',
    status: 'ACTIVE',
  },
  // Dispatchers
  {
    id: 'user_dispatch_1',
    email: 'maria.dispatcher@freightmasters.com',
    firstName: 'Maria',
    lastName: 'Garcia',
    role: 'DISPATCHER',
    tenantId: 'tenant_freight_masters',
    status: 'ACTIVE',
    preferredLocale: 'es',
  },
  {
    id: 'user_dispatch_2',
    email: 'mike.dispatcher@freightmasters.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'DISPATCHER',
    tenantId: 'tenant_freight_masters',
    status: 'ACTIVE',
  },
  // Sales Agents
  {
    id: 'user_sales_1',
    email: 'james.sales@freightmasters.com',
    firstName: 'James',
    lastName: 'Wilson',
    role: 'SALES_AGENT',
    tenantId: 'tenant_freight_masters',
    status: 'ACTIVE',
    commissionRate: 0.1, // 10%
  },
  {
    id: 'user_sales_2',
    email: 'lisa.sales@freightmasters.com',
    firstName: 'Lisa',
    lastName: 'Brown',
    role: 'SALES_AGENT',
    tenantId: 'tenant_freight_masters',
    status: 'ACTIVE',
    commissionRate: 0.08,
  },
  // Accounting
  {
    id: 'user_accounting_1',
    email: 'emily.ar@freightmasters.com',
    firstName: 'Emily',
    lastName: 'Chen',
    role: 'ACCOUNTING',
    tenantId: 'tenant_freight_masters',
    status: 'ACTIVE',
  },
  // Carrier Relations
  {
    id: 'user_carrier_1',
    email: 'tom.carrier@freightmasters.com',
    firstName: 'Tom',
    lastName: 'Martinez',
    role: 'CARRIER_RELATIONS',
    tenantId: 'tenant_freight_masters',
    status: 'ACTIVE',
  },

  // ===== TENANT: swift_logistics =====
  {
    id: 'user_swift_admin',
    email: 'admin@swiftlogistics.com',
    firstName: 'Robert',
    lastName: 'Swift',
    role: 'SUPER_ADMIN',
    tenantId: 'tenant_swift_logistics',
    status: 'ACTIVE',
  },
  {
    id: 'user_swift_dispatch',
    email: 'dispatch@swiftlogistics.com',
    firstName: 'Angela',
    lastName: 'Davis',
    role: 'DISPATCHER',
    tenantId: 'tenant_swift_logistics',
    status: 'ACTIVE',
  },

  // ===== TENANT: demo =====
  {
    id: 'user_demo_admin',
    email: 'demo@demo.com',
    firstName: 'Demo',
    lastName: 'User',
    role: 'SUPER_ADMIN',
    tenantId: 'tenant_demo',
    status: 'ACTIVE',
  },
  {
    id: 'user_demo_dispatch',
    email: 'dispatch@demo.com',
    firstName: 'Demo',
    lastName: 'Dispatcher',
    role: 'DISPATCHER',
    tenantId: 'tenant_demo',
    status: 'ACTIVE',
  },

  // ===== INACTIVE USERS =====
  {
    id: 'user_inactive_1',
    email: 'former@freightmasters.com',
    firstName: 'Former',
    lastName: 'Employee',
    role: 'DISPATCHER',
    tenantId: 'tenant_freight_masters',
    status: 'INACTIVE',
  },
];

export async function seedUsers(prisma: PrismaClient) {
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: { ...user, passwordHash: DEFAULT_PASSWORD_HASH },
      create: { ...user, passwordHash: DEFAULT_PASSWORD_HASH },
    });
  }
  console.log(`  âœ“ ${users.length} users seeded`);
}
```

### Test Login Credentials

| Email                               | Password | Role        | Tenant          |
| ----------------------------------- | -------- | ----------- | --------------- |
| admin@freightmasters.com            | Test123! | SUPER_ADMIN | Freight Masters |
| maria.dispatcher@freightmasters.com | Test123! | DISPATCHER  | Freight Masters |
| james.sales@freightmasters.com      | Test123! | SALES_AGENT | Freight Masters |
| emily.ar@freightmasters.com         | Test123! | ACCOUNTING  | Freight Masters |
| demo@demo.com                       | Test123! | SUPER_ADMIN | Demo            |

---

## 3. Carriers (50 Carriers)

```typescript
// prisma/seeds/carriers.ts

export const carriers = [
  // ===== ACTIVE, COMPLIANT CARRIERS =====
  {
    id: 'carrier_1',
    name: 'Express Freight Lines',
    mcNumber: '123456',
    dotNumber: '1234567',
    status: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    email: 'dispatch@expressfreight.com',
    phone: '555-100-0001',
    address: {
      street: '100 Trucking Way',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
    },
    insuranceExpiry: '2026-06-30',
    insuranceAmount: 1000000,
    cargoInsurance: 100000,
    rating: 4.8,
    onTimePercentage: 96.5,
    equipmentTypes: ['DRY_VAN', 'REEFER'],
    preferredLanes: ['TX-CA', 'TX-IL', 'TX-FL'],
    paymentTerms: 30,
    tenantId: 'tenant_freight_masters',
  },
  {
    id: 'carrier_2',
    name: 'Reliable Transport Co',
    mcNumber: '234567',
    dotNumber: '2345678',
    status: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    email: 'dispatch@reliabletransport.com',
    phone: '555-100-0002',
    address: {
      street: '200 Highway Blvd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
    },
    insuranceExpiry: '2026-03-15',
    insuranceAmount: 1000000,
    cargoInsurance: 100000,
    rating: 4.5,
    onTimePercentage: 94.2,
    equipmentTypes: ['DRY_VAN', 'FLATBED'],
    preferredLanes: ['IL-TX', 'IL-CA', 'IL-NY'],
    paymentTerms: 21,
    tenantId: 'tenant_freight_masters',
  },
  {
    id: 'carrier_3',
    name: 'Mountain View Trucking',
    mcNumber: '345678',
    dotNumber: '3456789',
    status: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    email: 'ops@mountainviewtrucking.com',
    phone: '555-100-0003',
    address: {
      street: '300 Summit Road',
      city: 'Denver',
      state: 'CO',
      zip: '80201',
    },
    insuranceExpiry: '2026-09-01',
    insuranceAmount: 1000000,
    cargoInsurance: 250000,
    rating: 4.9,
    onTimePercentage: 98.1,
    equipmentTypes: ['REEFER', 'DRY_VAN'],
    preferredLanes: ['CO-CA', 'CO-TX', 'CO-WA'],
    paymentTerms: 30,
    tenantId: 'tenant_freight_masters',
  },
  // Spanish-speaking carrier (for i18n testing)
  {
    id: 'carrier_4',
    name: 'Transportes Rodriguez',
    mcNumber: '456789',
    dotNumber: '4567890',
    status: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    email: 'carlos@transportesrodriguez.com',
    phone: '555-100-0004',
    address: {
      street: '400 Border Ave',
      city: 'Laredo',
      state: 'TX',
      zip: '78040',
    },
    insuranceExpiry: '2026-12-31',
    insuranceAmount: 1000000,
    cargoInsurance: 100000,
    rating: 4.6,
    onTimePercentage: 95.0,
    equipmentTypes: ['DRY_VAN', 'FLATBED'],
    preferredLanes: ['TX-MX', 'TX-CA'],
    paymentTerms: 15,
    primaryLanguage: 'es',
    tenantId: 'tenant_freight_masters',
  },

  // ===== WARNING STATUS CARRIERS =====
  {
    id: 'carrier_5',
    name: 'Sunset Logistics',
    mcNumber: '567890',
    dotNumber: '5678901',
    status: 'ACTIVE',
    complianceStatus: 'WARNING', // Insurance expiring soon
    email: 'dispatch@sunsetlogistics.com',
    phone: '555-100-0005',
    insuranceExpiry: '2025-02-15', // Expiring soon!
    insuranceAmount: 750000,
    rating: 4.2,
    tenantId: 'tenant_freight_masters',
  },

  // ===== EXPIRED/NON-COMPLIANT CARRIERS =====
  {
    id: 'carrier_6',
    name: 'Budget Haulers Inc',
    mcNumber: '678901',
    dotNumber: '6789012',
    status: 'ACTIVE',
    complianceStatus: 'EXPIRED',
    email: 'info@budgethaulers.com',
    phone: '555-100-0006',
    insuranceExpiry: '2024-06-30', // EXPIRED
    insuranceAmount: 500000,
    rating: 3.5,
    tenantId: 'tenant_freight_masters',
  },

  // ===== INACTIVE CARRIERS =====
  {
    id: 'carrier_7',
    name: 'Former Freight Co',
    mcNumber: '789012',
    dotNumber: '7890123',
    status: 'INACTIVE',
    complianceStatus: 'EXPIRED',
    email: 'gone@formerfreight.com',
    phone: '555-100-0007',
    insuranceExpiry: '2023-01-01',
    rating: 2.8,
    tenantId: 'tenant_freight_masters',
  },

  // ===== BLACKLISTED CARRIER =====
  {
    id: 'carrier_8',
    name: 'Problem Trucking LLC',
    mcNumber: '890123',
    dotNumber: '8901234',
    status: 'BLACKLISTED',
    complianceStatus: 'EXPIRED',
    email: 'blocked@problemtrucking.com',
    phone: '555-100-0008',
    rating: 1.5,
    blacklistReason: 'Multiple cargo claims, insurance fraud suspected',
    blacklistedAt: '2024-08-15',
    tenantId: 'tenant_freight_masters',
  },
];

// Generate 42 more carriers programmatically
function generateMoreCarriers() {
  const cities = [
    { city: 'Los Angeles', state: 'CA', zip: '90001' },
    { city: 'Phoenix', state: 'AZ', zip: '85001' },
    { city: 'Atlanta', state: 'GA', zip: '30301' },
    { city: 'Miami', state: 'FL', zip: '33101' },
    { city: 'Seattle', state: 'WA', zip: '98101' },
    { city: 'Portland', state: 'OR', zip: '97201' },
    { city: 'Nashville', state: 'TN', zip: '37201' },
    { city: 'Charlotte', state: 'NC', zip: '28201' },
  ];

  const prefixes = [
    'Swift',
    'Prime',
    'Eagle',
    'Star',
    'Blue',
    'Red',
    'Gold',
    'Silver',
  ];
  const suffixes = [
    'Trucking',
    'Transport',
    'Logistics',
    'Freight',
    'Hauling',
    'Express',
  ];

  const generated = [];
  for (let i = 9; i <= 50; i++) {
    const cityData = cities[i % cities.length];
    generated.push({
      id: `carrier_${i}`,
      name: `${prefixes[i % prefixes.length]} ${suffixes[i % suffixes.length]} ${i}`,
      mcNumber: String(100000 + i),
      dotNumber: String(1000000 + i),
      status: i % 10 === 0 ? 'INACTIVE' : 'ACTIVE',
      complianceStatus: i % 7 === 0 ? 'WARNING' : 'COMPLIANT',
      email: `dispatch${i}@carrier${i}.com`,
      phone: `555-${String(i).padStart(3, '0')}-${String(1000 + i).slice(-4)}`,
      address: {
        street: `${i * 100} Main Street`,
        ...cityData,
      },
      insuranceExpiry: `2026-${String((i % 12) + 1).padStart(2, '0')}-15`,
      insuranceAmount: 1000000,
      rating: 3.5 + (i % 15) / 10,
      tenantId:
        i % 5 === 0 ? 'tenant_swift_logistics' : 'tenant_freight_masters',
    });
  }
  return generated;
}

export const allCarriers = [...carriers, ...generateMoreCarriers()];

export async function seedCarriers(prisma: PrismaClient) {
  for (const carrier of allCarriers) {
    await prisma.carrier.upsert({
      where: { id: carrier.id },
      update: carrier,
      create: carrier,
    });
  }
  console.log(`  âœ“ ${allCarriers.length} carriers seeded`);
}
```

---

## 4. Customers (30 Customers)

```typescript
// prisma/seeds/customers.ts

export const customers = [
  {
    id: 'customer_1',
    name: 'ABC Manufacturing',
    code: 'ABCMFG',
    status: 'ACTIVE',
    creditStatus: 'APPROVED',
    creditLimit: 50000,
    currentBalance: 12500,
    paymentTerms: 30,
    email: 'logistics@abcmfg.com',
    phone: '555-200-0001',
    billingAddress: {
      street: '1000 Industrial Pkwy',
      city: 'Detroit',
      state: 'MI',
      zip: '48201',
    },
    primaryContactName: 'Jennifer Smith',
    primaryContactEmail: 'jsmith@abcmfg.com',
    primaryContactPhone: '555-200-0002',
    salesRepId: 'user_sales_1',
    tenantId: 'tenant_freight_masters',
  },
  {
    id: 'customer_2',
    name: 'Tech Distributors Inc',
    code: 'TECHDIST',
    status: 'ACTIVE',
    creditStatus: 'APPROVED',
    creditLimit: 100000,
    currentBalance: 45000,
    paymentTerms: 15,
    email: 'shipping@techdist.com',
    phone: '555-200-0010',
    billingAddress: {
      street: '2000 Tech Center Dr',
      city: 'San Jose',
      state: 'CA',
      zip: '95101',
    },
    primaryContactName: 'Michael Chen',
    primaryContactEmail: 'mchen@techdist.com',
    salesRepId: 'user_sales_1',
    tenantId: 'tenant_freight_masters',
  },
  {
    id: 'customer_3',
    name: 'Food Service Supply Co',
    code: 'FOODSVC',
    status: 'ACTIVE',
    creditStatus: 'APPROVED',
    creditLimit: 75000,
    currentBalance: 8200,
    paymentTerms: 30,
    email: 'orders@foodsvc.com',
    phone: '555-200-0020',
    requiresRefrigerated: true,
    temperatureRequirements: { min: 34, max: 40 },
    billingAddress: {
      street: '3000 Cold Storage Ln',
      city: 'Atlanta',
      state: 'GA',
      zip: '30301',
    },
    salesRepId: 'user_sales_2',
    tenantId: 'tenant_freight_masters',
  },
  // Credit hold customer
  {
    id: 'customer_4',
    name: 'Struggling Retailer',
    code: 'STRRET',
    status: 'ACTIVE',
    creditStatus: 'HOLD',
    creditLimit: 25000,
    currentBalance: 28000, // Over limit
    paymentTerms: 30,
    email: 'ap@strugglingretailer.com',
    phone: '555-200-0030',
    creditHoldReason: 'Over credit limit, past due invoices',
    tenantId: 'tenant_freight_masters',
  },
  // COD customer
  {
    id: 'customer_5',
    name: 'Cash Only Corp',
    code: 'CASHONLY',
    status: 'ACTIVE',
    creditStatus: 'COD',
    creditLimit: 0,
    currentBalance: 0,
    paymentTerms: 0,
    email: 'shipping@cashonly.com',
    phone: '555-200-0040',
    tenantId: 'tenant_freight_masters',
  },
];

// Generate more customers
function generateMoreCustomers() {
  const types = [
    'Manufacturing',
    'Distribution',
    'Retail',
    'Wholesale',
    'Services',
  ];
  const generated = [];

  for (let i = 6; i <= 30; i++) {
    generated.push({
      id: `customer_${i}`,
      name: `Customer ${types[i % types.length]} ${i}`,
      code: `CUST${String(i).padStart(3, '0')}`,
      status: i % 8 === 0 ? 'INACTIVE' : 'ACTIVE',
      creditStatus: i % 6 === 0 ? 'PENDING' : 'APPROVED',
      creditLimit: 25000 + i * 5000,
      currentBalance: i * 1000,
      paymentTerms: [15, 21, 30, 45][i % 4],
      email: `logistics@customer${i}.com`,
      phone: `555-${200 + i}-0001`,
      salesRepId: i % 2 === 0 ? 'user_sales_1' : 'user_sales_2',
      tenantId:
        i % 4 === 0 ? 'tenant_swift_logistics' : 'tenant_freight_masters',
    });
  }
  return generated;
}

export const allCustomers = [...customers, ...generateMoreCustomers()];

export async function seedCustomers(prisma: PrismaClient) {
  for (const customer of allCustomers) {
    await prisma.customer.upsert({
      where: { id: customer.id },
      update: customer,
      create: customer,
    });
  }
  console.log(`  âœ“ ${allCustomers.length} customers seeded`);
}
```

---

## 5. Loads (100 Loads in Various States)

```typescript
// prisma/seeds/loads.ts

import { addDays, subDays } from 'date-fns';

const today = new Date();

export const loads = [
  // ===== PENDING LOADS (awaiting dispatch) =====
  {
    id: 'load_1',
    loadNumber: 'FM-2025-0001',
    status: 'PENDING',
    customerId: 'customer_1',
    equipmentType: 'DRY_VAN',
    weight: 42000,
    origin: {
      name: 'ABC Manufacturing',
      street: '1000 Industrial Pkwy',
      city: 'Detroit',
      state: 'MI',
      zip: '48201',
    },
    destination: {
      name: 'Midwest Distribution',
      street: '500 Warehouse Rd',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
    },
    pickupDate: addDays(today, 2),
    deliveryDate: addDays(today, 3),
    customerRate: 1850,
    miles: 280,
    specialInstructions:
      'Dock appointment required. Call 1 hour before arrival.',
    tenantId: 'tenant_freight_masters',
    createdById: 'user_sales_1',
  },
  {
    id: 'load_2',
    loadNumber: 'FM-2025-0002',
    status: 'PENDING',
    customerId: 'customer_2',
    equipmentType: 'DRY_VAN',
    weight: 38000,
    origin: {
      name: 'Tech Distributors',
      city: 'San Jose',
      state: 'CA',
    },
    destination: {
      name: 'Phoenix Depot',
      city: 'Phoenix',
      state: 'AZ',
    },
    pickupDate: addDays(today, 1),
    deliveryDate: addDays(today, 2),
    customerRate: 2200,
    miles: 650,
    tenantId: 'tenant_freight_masters',
  },

  // ===== COVERED LOADS (carrier assigned, not dispatched) =====
  {
    id: 'load_3',
    loadNumber: 'FM-2025-0003',
    status: 'COVERED',
    customerId: 'customer_1',
    carrierId: 'carrier_1',
    equipmentType: 'DRY_VAN',
    weight: 44000,
    origin: { city: 'Dallas', state: 'TX' },
    destination: { city: 'Houston', state: 'TX' },
    pickupDate: addDays(today, 1),
    deliveryDate: addDays(today, 1),
    customerRate: 850,
    carrierRate: 700,
    miles: 240,
    margin: 150,
    marginPercent: 17.6,
    tenantId: 'tenant_freight_masters',
  },

  // ===== DISPATCHED LOADS =====
  {
    id: 'load_4',
    loadNumber: 'FM-2025-0004',
    status: 'DISPATCHED',
    customerId: 'customer_3',
    carrierId: 'carrier_3',
    driverId: 'driver_1',
    equipmentType: 'REEFER',
    temperature: { min: 34, max: 38 },
    weight: 40000,
    origin: { city: 'Denver', state: 'CO' },
    destination: { city: 'Los Angeles', state: 'CA' },
    pickupDate: today,
    deliveryDate: addDays(today, 2),
    customerRate: 4500,
    carrierRate: 3800,
    miles: 1020,
    dispatchedAt: subDays(today, 1),
    dispatchedById: 'user_dispatch_1',
    tenantId: 'tenant_freight_masters',
  },

  // ===== IN TRANSIT LOADS =====
  {
    id: 'load_5',
    loadNumber: 'FM-2025-0005',
    status: 'EN_ROUTE_PICKUP',
    customerId: 'customer_2',
    carrierId: 'carrier_2',
    driverId: 'driver_2',
    equipmentType: 'DRY_VAN',
    origin: { city: 'Chicago', state: 'IL' },
    destination: { city: 'New York', state: 'NY' },
    pickupDate: today,
    deliveryDate: addDays(today, 1),
    customerRate: 2800,
    carrierRate: 2400,
    miles: 790,
    currentLocation: {
      lat: 41.8781,
      lng: -87.6298,
      updatedAt: new Date(),
    },
    eta: addDays(today, 1),
    tenantId: 'tenant_freight_masters',
  },
  {
    id: 'load_6',
    loadNumber: 'FM-2025-0006',
    status: 'AT_PICKUP',
    customerId: 'customer_1',
    carrierId: 'carrier_1',
    equipmentType: 'DRY_VAN',
    origin: { city: 'Detroit', state: 'MI' },
    destination: { city: 'Columbus', state: 'OH' },
    pickupDate: today,
    deliveryDate: today,
    customerRate: 950,
    carrierRate: 780,
    arrivedPickupAt: new Date(),
    tenantId: 'tenant_freight_masters',
  },
  {
    id: 'load_7',
    loadNumber: 'FM-2025-0007',
    status: 'LOADED',
    customerId: 'customer_2',
    carrierId: 'carrier_4',
    equipmentType: 'FLATBED',
    origin: { city: 'Houston', state: 'TX' },
    destination: { city: 'Phoenix', state: 'AZ' },
    pickupDate: today,
    deliveryDate: addDays(today, 2),
    customerRate: 3200,
    carrierRate: 2750,
    loadedAt: new Date(),
    tenantId: 'tenant_freight_masters',
  },
  {
    id: 'load_8',
    loadNumber: 'FM-2025-0008',
    status: 'EN_ROUTE_DELIVERY',
    customerId: 'customer_3',
    carrierId: 'carrier_2',
    equipmentType: 'REEFER',
    origin: { city: 'Atlanta', state: 'GA' },
    destination: { city: 'Miami', state: 'FL' },
    pickupDate: subDays(today, 1),
    deliveryDate: today,
    customerRate: 1800,
    carrierRate: 1500,
    currentLocation: {
      lat: 27.9506,
      lng: -82.4572,
      updatedAt: new Date(),
    },
    tenantId: 'tenant_freight_masters',
  },
  {
    id: 'load_9',
    loadNumber: 'FM-2025-0009',
    status: 'AT_DELIVERY',
    customerId: 'customer_1',
    carrierId: 'carrier_3',
    equipmentType: 'DRY_VAN',
    origin: { city: 'Denver', state: 'CO' },
    destination: { city: 'Salt Lake City', state: 'UT' },
    pickupDate: subDays(today, 1),
    deliveryDate: today,
    customerRate: 1400,
    carrierRate: 1150,
    arrivedDeliveryAt: new Date(),
    tenantId: 'tenant_freight_masters',
  },

  // ===== DELIVERED LOADS =====
  {
    id: 'load_10',
    loadNumber: 'FM-2025-0010',
    status: 'DELIVERED',
    customerId: 'customer_2',
    carrierId: 'carrier_1',
    equipmentType: 'DRY_VAN',
    origin: { city: 'Los Angeles', state: 'CA' },
    destination: { city: 'San Francisco', state: 'CA' },
    pickupDate: subDays(today, 2),
    deliveryDate: subDays(today, 1),
    deliveredAt: subDays(today, 1),
    customerRate: 1200,
    carrierRate: 950,
    podReceived: true,
    podReceivedAt: subDays(today, 1),
    tenantId: 'tenant_freight_masters',
  },

  // ===== COMPLETED LOADS (invoiced) =====
  {
    id: 'load_11',
    loadNumber: 'FM-2024-0500',
    status: 'COMPLETED',
    customerId: 'customer_1',
    carrierId: 'carrier_2',
    equipmentType: 'DRY_VAN',
    pickupDate: subDays(today, 10),
    deliveryDate: subDays(today, 9),
    deliveredAt: subDays(today, 9),
    customerRate: 2100,
    carrierRate: 1750,
    invoicedAt: subDays(today, 8),
    invoiceId: 'invoice_1',
    tenantId: 'tenant_freight_masters',
  },

  // ===== CANCELLED LOAD =====
  {
    id: 'load_12',
    loadNumber: 'FM-2025-0012',
    status: 'CANCELLED',
    customerId: 'customer_4',
    equipmentType: 'DRY_VAN',
    origin: { city: 'Nashville', state: 'TN' },
    destination: { city: 'Memphis', state: 'TN' },
    pickupDate: addDays(today, 5),
    cancelledAt: subDays(today, 1),
    cancelledById: 'user_sales_1',
    cancellationReason: 'Customer cancelled order',
    tenantId: 'tenant_freight_masters',
  },
];

// Generate more loads
function generateMoreLoads() {
  const statuses = [
    'PENDING',
    'COVERED',
    'DISPATCHED',
    'EN_ROUTE_PICKUP',
    'AT_PICKUP',
    'LOADED',
    'EN_ROUTE_DELIVERY',
    'AT_DELIVERY',
    'DELIVERED',
    'COMPLETED',
  ];
  const equipment = ['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK'];
  const cities = [
    { city: 'Dallas', state: 'TX' },
    { city: 'Chicago', state: 'IL' },
    { city: 'Los Angeles', state: 'CA' },
    { city: 'Atlanta', state: 'GA' },
    { city: 'Phoenix', state: 'AZ' },
    { city: 'Denver', state: 'CO' },
    { city: 'Seattle', state: 'WA' },
    { city: 'Miami', state: 'FL' },
  ];

  const generated = [];
  for (let i = 13; i <= 100; i++) {
    const status = statuses[i % statuses.length];
    const daysOffset = (i % 20) - 10; // -10 to +10 days

    generated.push({
      id: `load_${i}`,
      loadNumber: `FM-2025-${String(i).padStart(4, '0')}`,
      status,
      customerId: `customer_${(i % 5) + 1}`,
      carrierId: status !== 'PENDING' ? `carrier_${(i % 8) + 1}` : null,
      equipmentType: equipment[i % equipment.length],
      origin: cities[i % cities.length],
      destination: cities[(i + 3) % cities.length],
      pickupDate: addDays(today, daysOffset),
      deliveryDate: addDays(today, daysOffset + 1 + (i % 3)),
      customerRate: 1000 + i * 50,
      carrierRate: status !== 'PENDING' ? 800 + i * 40 : null,
      miles: 200 + i * 10,
      tenantId:
        i % 6 === 0 ? 'tenant_swift_logistics' : 'tenant_freight_masters',
    });
  }
  return generated;
}

export const allLoads = [...loads, ...generateMoreLoads()];

export async function seedLoads(prisma: PrismaClient) {
  for (const load of allLoads) {
    await prisma.load.upsert({
      where: { id: load.id },
      update: load,
      create: load,
    });
  }
  console.log(`  âœ“ ${allLoads.length} loads seeded`);
}
```

---

## 6. Factory Functions

```typescript
// test/factories/index.ts

import { faker } from '@faker-js/faker';

export function createTenant(overrides = {}) {
  return {
    id: `tenant_${faker.string.alphanumeric(8)}`,
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    status: 'ACTIVE',
    plan: faker.helpers.arrayElement(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']),
    ...overrides,
  };
}

export function createUser(tenantId: string, overrides = {}) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  return {
    id: `user_${faker.string.alphanumeric(8)}`,
    email: faker.internet.email({ firstName, lastName }),
    firstName,
    lastName,
    role: faker.helpers.arrayElement([
      'ADMIN',
      'DISPATCHER',
      'SALES_AGENT',
      'ACCOUNTING',
    ]),
    status: 'ACTIVE',
    tenantId,
    ...overrides,
  };
}

export function createCarrier(tenantId: string, overrides = {}) {
  const mcNumber = faker.string.numeric(6);
  return {
    id: `carrier_${faker.string.alphanumeric(8)}`,
    name: `${faker.company.name()} Trucking`,
    mcNumber,
    dotNumber: faker.string.numeric(7),
    status: 'ACTIVE',
    complianceStatus: 'COMPLIANT',
    email: faker.internet.email(),
    phone: faker.phone.number(),
    insuranceExpiry: faker.date.future({ years: 1 }),
    insuranceAmount: 1000000,
    rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    equipmentTypes: faker.helpers.arrayElements(
      ['DRY_VAN', 'REEFER', 'FLATBED', 'STEP_DECK'],
      2
    ),
    tenantId,
    ...overrides,
  };
}

export function createCustomer(tenantId: string, overrides = {}) {
  return {
    id: `customer_${faker.string.alphanumeric(8)}`,
    name: faker.company.name(),
    code: faker.string.alpha(6).toUpperCase(),
    status: 'ACTIVE',
    creditStatus: 'APPROVED',
    creditLimit: faker.helpers.arrayElement([25000, 50000, 75000, 100000]),
    currentBalance: faker.number.int({ min: 0, max: 20000 }),
    paymentTerms: faker.helpers.arrayElement([15, 21, 30, 45]),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    tenantId,
    ...overrides,
  };
}

export function createLoad(
  tenantId: string,
  customerId: string,
  overrides = {}
) {
  const baseRate = faker.number.int({ min: 1000, max: 5000 });
  return {
    id: `load_${faker.string.alphanumeric(8)}`,
    loadNumber: `LD-${faker.string.numeric(8)}`,
    status: 'PENDING',
    customerId,
    equipmentType: faker.helpers.arrayElement(['DRY_VAN', 'REEFER', 'FLATBED']),
    weight: faker.number.int({ min: 20000, max: 45000 }),
    origin: createAddress(),
    destination: createAddress(),
    pickupDate: faker.date.soon({ days: 7 }),
    deliveryDate: faker.date.soon({ days: 10 }),
    customerRate: baseRate,
    miles: faker.number.int({ min: 100, max: 2000 }),
    tenantId,
    ...overrides,
  };
}

export function createAddress() {
  return {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    zip: faker.location.zipCode(),
  };
}

// Bulk creation helpers
export function createManyCarriers(tenantId: string, count: number) {
  return Array.from({ length: count }, () => createCarrier(tenantId));
}

export function createManyLoads(
  tenantId: string,
  customerId: string,
  count: number
) {
  return Array.from({ length: count }, () => createLoad(tenantId, customerId));
}
```

---

## Quick Reference: Test Scenarios

| Scenario                   | Data Available                                        |
| -------------------------- | ----------------------------------------------------- |
| **Happy path dispatch**    | Loads 1-2 (PENDING), Carriers 1-4 (ACTIVE, COMPLIANT) |
| **Insurance warning**      | Carrier 5 (insurance expiring soon)                   |
| **Compliance block**       | Carrier 6 (EXPIRED insurance)                         |
| **Credit hold**            | Customer 4 (over credit limit)                        |
| **COD customer**           | Customer 5 (COD only)                                 |
| **In-transit tracking**    | Loads 5, 7, 8 (various transit statuses)              |
| **Delivered awaiting POD** | Load 10                                               |
| **Spanish language**       | Carrier 4, User maria.dispatcher                      |
| **Blacklisted carrier**    | Carrier 8                                             |
| **Multi-tenant isolation** | tenant_freight_masters vs tenant_swift_logistics      |

---

## Navigation

- **Previous:** [AI Development Playbook](./84-ai-development-playbook.md)
- **Next:** [Entity Data Dictionary](./86-entity-data-dictionary.md)
