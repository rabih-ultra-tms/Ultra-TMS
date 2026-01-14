import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class ConfigHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    tenantId: string;
    key: string;
    oldValue: Prisma.InputJsonValue | typeof Prisma.JsonNull | null;
    newValue: Prisma.InputJsonValue | typeof Prisma.JsonNull | null;
    changedBy?: string | null;
    reason?: string | null;
  }) {
    return this.prisma.configHistory.create({
      data: {
        tenantId: params.tenantId,
        configKey: params.key,
        oldValue: (params.oldValue ?? Prisma.JsonNull) as Prisma.NullableJsonNullValueInput,
        newValue: (params.newValue ?? Prisma.JsonNull) as Prisma.JsonNullValueInput,
        changedBy: params.changedBy ?? null,
        changeReason: params.reason ?? null,
      },
    });
  }
}
