import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateCannedResponseDto, UpdateCannedResponseDto } from '../dto/help-desk.dto';

@Injectable()
export class CannedResponsesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.cannedResponse.findMany({ where: { tenantId, deletedAt: null }, orderBy: { title: 'asc' } });
  }

  async create(tenantId: string, userId: string, dto: CreateCannedResponseDto) {
    return this.prisma.cannedResponse.create({
      data: {
        tenantId,
        title: dto.title,
        content: dto.content,
        category: dto.category,
        isPublic: dto.isPublic ?? false,
        ownerId: dto.ownerId ?? userId,
        createdById: userId,
        updatedById: userId,
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const record = await this.prisma.cannedResponse.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!record) throw new NotFoundException('Canned response not found');
    return record;
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateCannedResponseDto) {
    await this.findOne(tenantId, id);
    return this.prisma.cannedResponse.update({
      where: { id },
      data: {
        title: dto.title,
        content: dto.content,
        category: dto.category,
        isPublic: dto.isPublic,
        ownerId: dto.ownerId,
        updatedById: userId,
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.cannedResponse.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }
}
