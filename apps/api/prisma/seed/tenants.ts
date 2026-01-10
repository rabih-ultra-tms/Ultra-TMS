import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedTenants(prisma: any): Promise<string[]> {
  const tenants = [
    {
      name: 'Acme Logistics',
      slug: 'acme-logistics',
      domain: 'acme.ultra-tms.local',
      settings: {
        timezone: 'America/Chicago',
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
      },
      features: {
        accounting: true,
        crm: true,
        tms: true,
        carrier: true,
        commission: true,
        edi: true,
        factoring: true,
        analytics: true,
      },
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#10b981',
        logo: null,
      },
      status: 'ACTIVE',
    },
    {
      name: 'Global Freight Solutions',
      slug: 'global-freight',
      domain: 'global.ultra-tms.local',
      settings: {
        timezone: 'America/New_York',
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
      },
      features: {
        accounting: true,
        crm: true,
        tms: true,
        carrier: true,
        commission: true,
        edi: true,
        factoring: false,
        analytics: true,
      },
      branding: {
        primaryColor: '#6366f1',
        secondaryColor: '#f59e0b',
        logo: null,
      },
      status: 'ACTIVE',
    },
    {
      name: 'Premier Transportation',
      slug: 'premier-transport',
      domain: 'premier.ultra-tms.local',
      settings: {
        timezone: 'America/Los_Angeles',
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
      },
      features: {
        accounting: true,
        crm: true,
        tms: true,
        carrier: true,
        commission: true,
        edi: false,
        factoring: true,
        analytics: true,
      },
      branding: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#ef4444',
        logo: null,
      },
      status: 'ACTIVE',
    },
    {
      name: 'Express Carriers Inc',
      slug: 'express-carriers',
      domain: 'express.ultra-tms.local',
      settings: {
        timezone: 'America/Denver',
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
      },
      features: {
        accounting: true,
        crm: true,
        tms: true,
        carrier: true,
        commission: false,
        edi: true,
        factoring: false,
        analytics: true,
      },
      branding: {
        primaryColor: '#ec4899',
        secondaryColor: '#14b8a6',
        logo: null,
      },
      status: 'ACTIVE',
    },
    {
      name: 'Nationwide Logistics',
      slug: 'nationwide-logistics',
      domain: 'nationwide.ultra-tms.local',
      settings: {
        timezone: 'America/Chicago',
        language: 'en',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
      },
      features: {
        accounting: true,
        crm: true,
        tms: true,
        carrier: true,
        commission: true,
        edi: true,
        factoring: true,
        analytics: true,
      },
      branding: {
        primaryColor: '#f97316',
        secondaryColor: '#06b6d4',
        logo: null,
      },
      status: 'ACTIVE',
    },
  ];

  const tenantIds: string[] = [];

  for (const tenantData of tenants) {
    const tenant = await prisma.tenant.upsert({
      where: { slug: tenantData.slug },
      update: {},
      create: {
        ...tenantData,
        externalId: `SEED-TENANT-${tenants.indexOf(tenantData) + 1}`,
        sourceSystem: 'FAKER_SEED',
      },
    });

    tenantIds.push(tenant.id);
    console.log(`   ✓ ${tenant.name}`);
  }

  return tenantIds;
}
