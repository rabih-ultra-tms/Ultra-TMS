import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ApiAuditQueryDto } from '../dto';

@Injectable()
export class ApiAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: ApiAuditQueryDto) {
    const where = this.buildWhere(tenantId, query);
    const take = query.limit ?? 50;
    const skip = query.offset ?? 0;

    const [logs, total] = await Promise.all([
      this.prisma.aPIAuditLog.findMany({ where, take, skip, orderBy: { timestamp: 'desc' } }),
      this.prisma.aPIAuditLog.count({ where }),
    ]);

    return { data: logs, total, limit: take, offset: skip };
  }

  async listErrors(tenantId: string, query: ApiAuditQueryDto) {
    const where = this.buildWhere(tenantId, query);
    where.responseStatus = { gte: 400 };
    const take = query.limit ?? 50;
    const skip = query.offset ?? 0;

    const [logs, total] = await Promise.all([
      this.prisma.aPIAuditLog.findMany({ where, take, skip, orderBy: { timestamp: 'desc' } }),
      this.prisma.aPIAuditLog.count({ where }),
    ]);

    return { data: logs, total, limit: take, offset: skip };
  }

  async findById(tenantId: string, id: string) {
    const log = await this.prisma.aPIAuditLog.findFirst({ where: { id, tenantId } });
    if (!log) {
      throw new NotFoundException('API audit log not found');
    }
    return log;
  }

  private buildWhere(tenantId: string, query: ApiAuditQueryDto): Prisma.APIAuditLogWhereInput {
    const where: Prisma.APIAuditLogWhereInput = { tenantId };

    if (query.method) where.method = query.method;
    if (query.endpoint) where.endpoint = { contains: query.endpoint, mode: 'insensitive' };
    if (query.userId) where.userId = query.userId;
    if (query.statusFrom || query.statusTo) {
      where.responseStatus = {
        gte: query.statusFrom ?? undefined,
        lte: query.statusTo ?? undefined,
      };
    }
    if (query.startDate || query.endDate) {
      where.timestamp = {
        gte: query.startDate ? new Date(query.startDate) : undefined,
        lte: query.endDate ? new Date(query.endDate) : undefined,
      };
    }

    return where;
  }
}
