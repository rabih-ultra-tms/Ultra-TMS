import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateTeamDto, ManageMembersDto, UpdateTeamDto } from '../dto/help-desk.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.supportTeam.findMany({ where: { tenantId, deletedAt: null }, orderBy: { name: 'asc' } });
  }

  async create(tenantId: string, userId: string, dto: CreateTeamDto) {
    return this.prisma.supportTeam.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        email: dto.email,
        autoAssign: dto.autoAssign ?? false,
        assignmentMethod: dto.assignmentMethod ?? 'ROUND_ROBIN',
        managerId: dto.managerId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const team = await this.prisma.supportTeam.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateTeamDto) {
    await this.findOne(tenantId, id);
    return this.prisma.supportTeam.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        email: dto.email,
        autoAssign: dto.autoAssign,
        assignmentMethod: dto.assignmentMethod,
        managerId: dto.managerId,
        updatedById: userId,
      },
    });
  }

  async manageMembers(tenantId: string, id: string, dto: ManageMembersDto) {
    await this.findOne(tenantId, id);
    const ops = [this.prisma.supportTeamMember.deleteMany({ where: { teamId: id } })];
    if (dto.members.length) {
      ops.push(
        this.prisma.supportTeamMember.createMany({
          data: dto.members.map((m) => ({
            teamId: id,
            userId: m.userId,
            role: m.role ?? 'MEMBER',
            maxOpenTickets: m.maxOpenTickets ?? 20,
            isAvailable: m.isAvailable ?? true,
          })),
        }),
      );
    }
    await this.prisma.$transaction(ops);
    return this.prisma.supportTeamMember.findMany({ where: { teamId: id } });
  }
}
