import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  async autoAssign(tenantId: string, teamId: string) {
    const team = await this.prisma.supportTeam.findFirst({ where: { id: teamId, tenantId, deletedAt: null } });
    if (!team || !team.autoAssign) return null;

    const members = await this.prisma.supportTeamMember.findMany({
      where: { teamId, isAvailable: true, deletedAt: null },
      orderBy: [{ currentTicketCount: 'asc' }, { createdAt: 'asc' }],
      take: 1,
    });

    return members[0]?.userId ?? null;
  }
}
