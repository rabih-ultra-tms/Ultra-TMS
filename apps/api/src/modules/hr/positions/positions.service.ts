import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreatePositionDto, UpdatePositionDto } from '../dto/hr.dto';

@Injectable()
export class PositionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.position.findMany({ where: { tenantId }, orderBy: { title: 'asc' } });
  }

  async create(tenantId: string, dto: CreatePositionDto) {
    return this.prisma.position.create({
      data: {
        tenantId,
        title: dto.title,
        code: dto.code,
        description: dto.description,
        minSalary: dto.minSalary ?? undefined,
        maxSalary: dto.maxSalary ?? undefined,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const position = await this.prisma.position.findFirst({ where: { id, tenantId } });
    if (!position) throw new NotFoundException('Position not found');
    return position;
  }

  async update(tenantId: string, id: string, dto: UpdatePositionDto) {
    await this.findOne(tenantId, id);
    return this.prisma.position.update({
      where: { id },
      data: {
        title: dto.title,
        code: dto.code,
        description: dto.description,
        minSalary: dto.minSalary ?? undefined,
        maxSalary: dto.maxSalary ?? undefined,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.position.delete({ where: { id } });
    return { deleted: true };
  }
}
