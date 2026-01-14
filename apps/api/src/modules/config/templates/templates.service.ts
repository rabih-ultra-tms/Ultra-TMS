import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ConfigHistoryService } from '../history/config-history.service';
import { ApplyTemplateDto } from '../dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService, private readonly history: ConfigHistoryService) {}

  async list(tenantId: string) {
    return this.prisma.configTemplate.findMany({
      where: {
        OR: [{ isSystem: true }, { tenantId }],
      },
      orderBy: { templateName: 'asc' },
    });
  }

  async apply(code: string, tenantId: string, dto: ApplyTemplateDto, userId?: string | null) {
    const template = await this.prisma.configTemplate.findFirst({
      where: {
        AND: [
          { OR: [{ templateName: code }, { id: code }] },
          { OR: [{ isSystem: true }, { tenantId }] },
        ],
      },
    });

    if (!template) throw new NotFoundException('Template not found');

    const targetTenantId = dto.targetTenantId ?? tenantId;
    if (!targetTenantId) throw new NotFoundException('Target tenant not provided');

    const defaults = (template.defaultValues as Record<string, unknown>) || {};

    await this.prisma.$transaction(async tx => {
      for (const [key, value] of Object.entries(defaults)) {
        const existing = await tx.tenantConfig.findUnique({
          where: { tenantId_configKey: { tenantId: targetTenantId, configKey: key } },
        });

        const record = await tx.tenantConfig.upsert({
          where: { tenantId_configKey: { tenantId: targetTenantId, configKey: key } },
          create: {
            tenantId: targetTenantId,
            configKey: key,
            configValue: value as Prisma.InputJsonValue,
            createdById: userId ?? undefined,
            updatedById: userId ?? undefined,
          },
          update: {
            configValue: value as Prisma.InputJsonValue,
            updatedById: userId ?? undefined,
          },
        });

        await this.history.record({
          tenantId: targetTenantId,
          key,
          oldValue: (existing?.configValue as Prisma.InputJsonValue) ?? null,
          newValue: record.configValue as Prisma.InputJsonValue,
          changedBy: userId ?? null,
          reason: `Applied template ${template.templateName}`,
        });
      }
    });

    return { applied: true, template: template.templateName, tenantId: targetTenantId };
  }
}
