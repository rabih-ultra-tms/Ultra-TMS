export async function seedTenantServices(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  const services = [
    { serviceKey: 'customer', enabled: true, displayOrder: 1 },
    { serviceKey: 'route', enabled: true, displayOrder: 2 },
    { serviceKey: 'cargo', enabled: true, displayOrder: 3 },
    { serviceKey: 'trucks', enabled: false, displayOrder: 4 },
    { serviceKey: 'pricing', enabled: true, displayOrder: 5 },
    { serviceKey: 'permits', enabled: false, displayOrder: 6 },
    { serviceKey: 'compare', enabled: false, displayOrder: 7 },
    { serviceKey: 'pdf', enabled: true, displayOrder: 8 },
  ];

  for (const tenantId of tenantIds) {
    for (const svc of services) {
      await prisma.tenantService.upsert({
        where: {
          tenantId_serviceKey: { tenantId, serviceKey: svc.serviceKey },
        },
        update: {},
        create: {
          tenantId,
          serviceKey: svc.serviceKey,
          enabled: svc.enabled,
          displayOrder: svc.displayOrder,
          externalId: `SEED-SVC-${svc.serviceKey}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} tenant service records`);
}
