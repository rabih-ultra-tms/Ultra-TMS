import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.role.findMany({
      where: {
        OR: [{ tenantId }, { tenantId: null, isSystem: true }],
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async findOne(tenantId: string, id: string) {
    const role = await this.prisma.role.findFirst({
      where: {
        id,
        OR: [{ tenantId }, { tenantId: null, isSystem: true }],
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async create(tenantId: string, dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        permissions: dto.permissions || [],
        isSystem: false,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateRoleDto) {
    const role = await this.findOne(tenantId, id);

    if (role.isSystem) {
      throw new Error('Cannot modify system roles');
    }

    return this.prisma.role.update({
      where: { id },
      data: dto,
    });
  }

  async delete(tenantId: string, id: string) {
    const role = await this.findOne(tenantId, id);

    if (role.isSystem) {
      throw new Error('Cannot delete system roles');
    }

    // Check if any users have this role
    const usersWithRole = await this.prisma.user.count({
      where: { roleId: id, deletedAt: null },
    });

    if (usersWithRole > 0) {
      throw new Error(`Cannot delete role: ${usersWithRole} users are assigned to it`);
    }

    await this.prisma.role.delete({ where: { id } });
    return { success: true };
  }
}
