import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/hr.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.department.findMany({ where: { tenantId }, orderBy: { name: 'asc' } });
  }

  async create(tenantId: string, dto: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        tenantId,
        name: dto.name,
        code: dto.code,
        description: dto.description,
        parentDepartmentId: dto.parentDepartmentId,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const department = await this.prisma.department.findFirst({ where: { id, tenantId } });
    if (!department) throw new NotFoundException('Department not found');
    return department;
  }

  async update(tenantId: string, id: string, dto: UpdateDepartmentDto) {
    await this.findOne(tenantId, id);
    return this.prisma.department.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        description: dto.description,
        parentDepartmentId: dto.parentDepartmentId,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.department.delete({ where: { id } });
    return { deleted: true };
  }
}
