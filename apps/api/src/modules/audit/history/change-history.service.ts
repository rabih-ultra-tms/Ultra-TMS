import { Injectable, NotFoundException } from '@nestjs/common';
import { ChangeHistory, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { HistoryQueryDto } from '../dto';

@Injectable()
export class ChangeHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, entityType: string, entityId: string, query: HistoryQueryDto) {
    const where: Prisma.ChangeHistoryWhereInput = {
      tenantId,
      entityType,
      entityId,
    };

    if (query.field) where.field = query.field;
    if (query.startDate || query.endDate) {
      where.createdAt = {
        gte: query.startDate ? new Date(query.startDate) : undefined,
        lte: query.endDate ? new Date(query.endDate) : undefined,
      };
    }

    const take = query.limit ?? 50;
    const skip = query.offset ?? 0;

    const [records, total] = await Promise.all([
      this.prisma.changeHistory.findMany({ where, take, skip, orderBy: { createdAt: 'desc' } }),
      this.prisma.changeHistory.count({ where }),
    ]);

    return {
      data: records.map(record => this.toResponse(record)),
      total,
      limit: take,
      offset: skip,
    };
  }

  async versions(tenantId: string, entityType: string, entityId: string) {
    const records = await this.prisma.changeHistory.findMany({
      where: { tenantId, entityType, entityId },
      orderBy: { createdAt: 'asc' },
    });

    return records.map((record, index) => ({
      version: index + 1,
      field: record.field,
      createdAt: record.createdAt,
      userId: record.userId,
    }));
  }

  async versionDetails(tenantId: string, entityType: string, entityId: string, version: number) {
    const records = await this.prisma.changeHistory.findMany({
      where: { tenantId, entityType, entityId },
      orderBy: { createdAt: 'asc' },
    });

    if (version < 1 || version > records.length) {
      throw new NotFoundException('Requested version not found');
    }

    const record = records[version - 1];
    if (!record) throw new NotFoundException('Requested version not found');
    return {
      version,
      change: this.toResponse(record),
      totalVersions: records.length,
    };
  }

  private toResponse(record: ChangeHistory) {
    return {
      id: record.id,
      tenantId: record.tenantId,
      entityType: record.entityType,
      entityId: record.entityId,
      field: record.field,
      oldValue: record.oldValue,
      newValue: record.newValue,
      userId: record.userId,
      createdAt: record.createdAt,
    };
  }
}
