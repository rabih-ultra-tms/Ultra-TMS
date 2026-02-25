import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedLoadBoard(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    // Find unassigned loads (PENDING status, no carrier) — these get posted to load board
    const unassignedLoads = await prisma.load.findMany({
      where: { tenantId, status: 'PENDING', carrierId: null },
      include: {
        order: { include: { stops: true } },
      },
      take: 10,
    });

    if (unassignedLoads.length === 0) continue;

    // Reuse load board accounts created by load-board-external seed
    const account = await prisma.loadBoardAccount.findFirst({ where: { tenantId } });
    if (!account) continue;

    const users: any[] = await prisma.user.findMany({ where: { tenantId }, take: 5 });

    for (const load of unassignedLoads) {
      const order = load.order;
      if (!order) continue;

      const pickupStop = order.stops?.find((s: any) => s.stopSequence === 1);
      const deliveryStop = order.stops?.length > 0
        ? order.stops.reduce((max: any, s: any) => s.stopSequence > max.stopSequence ? s : max, order.stops[0])
        : null;

      const postedAt = new Date(Date.now() - faker.number.int({ min: 1, max: 72 }) * 60 * 60 * 1000);
      const expiresAt = new Date(postedAt.getTime() + faker.number.int({ min: 24, max: 72 }) * 60 * 60 * 1000);

      await prisma.loadPost.create({
        data: {
          tenantId,
          accountId: account.id,
          loadId: load.id,
          orderId: order.id,
          postNumber: `BP-${Date.now()}-${String(total + 1).padStart(4, '0')}`,
          status: faker.helpers.arrayElement(['DRAFT', 'POSTED', 'POSTED', 'POSTED', 'RESPONDED']), // Mostly POSTED

          // Origin from pickup stop
          originCity: pickupStop?.city ?? faker.location.city(),
          originState: pickupStop?.state ?? faker.location.state({ abbreviated: true }),
          originZip: pickupStop?.postalCode ?? faker.location.zipCode(),

          // Destination from delivery stop
          destCity: deliveryStop?.city ?? faker.location.city(),
          destState: deliveryStop?.state ?? faker.location.state({ abbreviated: true }),
          destZip: deliveryStop?.postalCode ?? faker.location.zipCode(),

          // Dates
          pickupDate: pickupStop?.scheduledAppointment ?? faker.date.soon({ days: 3 }),
          deliveryDate: deliveryStop?.scheduledAppointment ?? null,

          // Equipment from order
          equipmentType: order.equipmentType ?? 'DRY_VAN',
          length: load.equipmentLength ?? 53,
          weight: order.weightLbs ? Number(order.weightLbs) : null,
          commodity: order.commodity ?? null,

          // Rate (posted rate is typically higher than carrier rate — add 5-15%)
          postedRate: load.carrierRate
            ? parseFloat((Number(load.carrierRate) * faker.number.float({ min: 1.05, max: 1.15, fractionDigits: 4 })).toFixed(2))
            : faker.number.float({ min: 1500, max: 4000, fractionDigits: 2 }),
          currency: 'USD',

          // Contact
          contactName: faker.person.fullName(),
          contactPhone: faker.phone.number({ style: 'national' }).slice(0, 20),
          contactEmail: faker.internet.email(),

          // Timestamps
          postedAt,
          expiresAt,

          // Engagement metrics
          views: faker.number.int({ min: 0, max: 50 }),
          clicks: faker.number.int({ min: 0, max: 15 }),
          leadCount: faker.number.int({ min: 0, max: 5 }),

          // Metadata
          externalId: `SEED-LOADBOARD-${String(total + 1).padStart(4, '0')}`,
          sourceSystem: 'FAKER_SEED',
          createdById: users.length > 0 ? faker.helpers.arrayElement(users).id : null,
          createdAt: postedAt,
        },
      });
      total++;
    }
  }

  console.log(`   ✓ Created ${total} load board postings`);
}
