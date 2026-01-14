import { Injectable } from '@nestjs/common';
import { LoginMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { LoginAuditQueryDto } from '../dto';

@Injectable()
export class LoginAuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    tenantId: string | null;
    userId?: string | null;
    email?: string;
    method?: LoginMethod;
    success: boolean;
    failureReason?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    sessionId?: string | null;
  }) {
    await this.prisma.loginAudit.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId ?? null,
        email: params.email ?? 'unknown',
        loginMethod: params.method ?? LoginMethod.PASSWORD,
        success: params.success,
        failureReason: params.success ? null : params.failureReason ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        sessionId: params.sessionId ?? null,
      },
    });
  }

  async list(tenantId: string, query: LoginAuditQueryDto) {
    const where: Prisma.LoginAuditWhereInput = { tenantId };

    if (query.email) where.email = query.email;
    if (query.userId) where.userId = query.userId;
    if (query.loginMethod) where.loginMethod = query.loginMethod as LoginMethod;
    if (query.success !== undefined) {
      where.success = query.success === 'true';
    }
    if (query.startDate || query.endDate) {
      where.timestamp = {
        gte: query.startDate ? new Date(query.startDate) : undefined,
        lte: query.endDate ? new Date(query.endDate) : undefined,
      };
    }

    const take = query.limit ?? 50;
    const skip = query.offset ?? 0;

    const [audits, total] = await Promise.all([
      this.prisma.loginAudit.findMany({ where, take, skip, orderBy: { timestamp: 'desc' } }),
      this.prisma.loginAudit.count({ where }),
    ]);

    return { data: audits, total, limit: take, offset: skip };
  }

  async summary(tenantId: string) {
    const [total, success, failure] = await Promise.all([
      this.prisma.loginAudit.count({ where: { tenantId } }),
      this.prisma.loginAudit.count({ where: { tenantId, success: true } }),
      this.prisma.loginAudit.count({ where: { tenantId, success: false } }),
    ]);

    return { total, success, failure };
  }
}
