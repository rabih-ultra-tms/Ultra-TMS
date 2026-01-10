import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedHelpDesk(prisma: any, tenantIds: string[]): Promise<void> {
  let total = 0;

  for (const tenantId of tenantIds) {
    const users = await prisma.user.findMany({ where: { tenantId }, take: 20 });
    if (users.length === 0) continue;

    // Support Teams (3 per tenant = 15 total)
    const teams = [];
    const teamNames = ['Technical Support', 'Customer Success', 'Operations'];
    for (let i = 0; i < 3; i++) {
      const team = await prisma.supportTeam.create({
        data: {
          tenantId,
          name: teamNames[i],
          description: `${teamNames[i]} team handles ${faker.lorem.sentence()}`,
          isActive: true,
          externalId: `SEED-TEAM-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
      teams.push(team);
    }
    total += 3;

    // Support Team Members (2 per team = 6 per tenant = 30 total)
    for (const team of teams) {
      const memberIds = faker.helpers.shuffle(users).slice(0, 2).map((u: any) => u.id);
      for (let i = 0; i < memberIds.length; i++) {
        await prisma.supportTeamMember.create({
          data: {
            userId: memberIds[i],
            teamId: team.id,
            role: faker.helpers.arrayElement(['LEAD', 'MEMBER']),
            maxOpenTickets: faker.number.int({ min: 10, max: 30 }),
            isAvailable: faker.datatype.boolean(),
            externalId: `SEED-TEAM-MEMBER-${total + i + 1}`,
            sourceSystem: 'FAKER_SEED',
          },
        });
      }
      total += memberIds.length;
    }

    // SLA Policies (4 per tenant = 20 total)
    const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
    for (let i = 0; i < 4; i++) {
      await prisma.slaPolicy.create({
        data: {
          tenantId,
          name: `${priorities[i]} Priority SLA`,
          description: faker.lorem.sentence(),
          conditions: { priority: [priorities[i]] },
          firstResponseTarget: priorities[i] === 'URGENT' ? 15 : priorities[i] === 'HIGH' ? 60 : priorities[i] === 'NORMAL' ? 240 : 480,
          resolutionTarget: priorities[i] === 'URGENT' ? 240 : priorities[i] === 'HIGH' ? 480 : priorities[i] === 'NORMAL' ? 1440 : 2880,
          useBusinessHours: true,
          priority: i,
          isActive: true,
          externalId: `SEED-SLA-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 4;

    // Escalation Rules (2 per tenant = 10 total)
    for (let i = 0; i < 2; i++) {
      await prisma.escalationRule.create({
        data: {
          tenantId,
          name: `Auto-escalate ${faker.helpers.arrayElement(['unresponsive', 'high priority'])} tickets`,
          description: faker.lorem.sentence(),
          triggerType: faker.helpers.arrayElement(['SLA_BREACH', 'NO_RESPONSE', 'CUSTOMER_REPLY']),
          triggerMinutes: faker.number.int({ min: 60, max: 480 }),
          conditions: { priority: ['URGENT'] },
          actionType: faker.helpers.arrayElement(['NOTIFY', 'REASSIGN', 'CHANGE_PRIORITY']),
          actionConfig: { notify_users: [], reassign_to: teams[Math.floor(Math.random() * teams.length)].id },
          isActive: true,
          externalId: `SEED-ESCALATION-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 2;

    // Canned Responses (5 per tenant = 25 total)
    const responseCategories = ['GREETING', 'RESOLUTION', 'FOLLOW_UP', 'CLOSING'];
    for (let i = 0; i < 5; i++) {
      await prisma.cannedResponse.create({
        data: {
          tenantId,
          title: faker.lorem.words(3),
          category: faker.helpers.arrayElement(responseCategories),
          content: faker.lorem.paragraphs(2),
          isPublic: faker.datatype.boolean(),
          isActive: true,
          externalId: `SEED-CANNED-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 5;

    // Support Tickets (20 per tenant = 100 total)
    for (let i = 0; i < 20; i++) {
      await prisma.supportTicket.create({
        data: {
          tenantId,
          ticketNumber: `TKT-${Date.now()}-${i}`,
          subject: faker.lorem.sentence(),
          description: faker.lorem.paragraphs(2),
          source: faker.helpers.arrayElement(['EMAIL', 'PORTAL', 'PHONE', 'INTERNAL']),
          type: faker.helpers.arrayElement(['QUESTION', 'PROBLEM', 'INCIDENT', 'REQUEST']),
          status: faker.helpers.arrayElement(['NEW', 'OPEN', 'PENDING', 'RESOLVED', 'CLOSED']),
          priority: faker.helpers.arrayElement(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
          createdById: users[Math.floor(Math.random() * users.length)].id,
          assignedToId: faker.helpers.maybe(() => users[Math.floor(Math.random() * users.length)].id, { probability: 0.7 }),
          teamId: faker.helpers.maybe(() => teams[Math.floor(Math.random() * teams.length)].id, { probability: 0.8 }),
          externalId: `SEED-TICKET-${total + i + 1}`,
          sourceSystem: 'FAKER_SEED',
        },
      });
    }
    total += 20;
  }

  console.log(`   ✓ Created ${total} help desk records (teams, members, SLAs, escalations, responses, tickets)`);
}
