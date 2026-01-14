import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { Prisma } from '@prisma/client';
import { CreateWidgetDto } from '../dto/feedback.dto';

@Injectable()
export class WidgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string) {
    return this.prisma.feedbackWidget.findMany({ where: { tenantId }, orderBy: { createdAt: 'desc' } });
  }

  async create(tenantId: string, dto: CreateWidgetDto) {
    return this.prisma.feedbackWidget.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        placement: dto.placement,
        pages: dto.pages as Prisma.InputJsonValue | undefined,
        widgetType: dto.widgetType,
        config: dto.config as Prisma.InputJsonValue,
        triggerRules: dto.triggerRules as Prisma.InputJsonValue | undefined,
        isActive: dto.isActive ?? true,
      },
    });
  }
}
