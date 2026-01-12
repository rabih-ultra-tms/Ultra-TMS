import { Injectable, NotFoundException } from '@nestjs/common';
import { PostingFrequency, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreatePostingRuleDto, RuleQueryDto, UpdatePostingRuleDto } from './dto';

@Injectable()
export class RulesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, query: RuleQueryDto) {
    const { isActive, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;
    const where: any = { tenantId, deletedAt: null };
    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.prisma.postingRule.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.postingRule.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const rule = await this.prisma.postingRule.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!rule) {
      throw new NotFoundException('Posting rule not found');
    }
    return rule;
  }

  async create(tenantId: string, userId: string, dto: CreatePostingRuleDto) {
    return this.prisma.postingRule.create({
      data: {
        tenantId,
        ruleName: dto.ruleName,
        isActive: dto.autoPost,
        conditions: dto.conditions as Prisma.InputJsonValue,
        frequency: dto.autoPost ? PostingFrequency.IMMEDIATE : PostingFrequency.MANUAL,
        scheduleTime: dto.postDelayMinutes ? `${dto.postDelayMinutes}m` : undefined,
        customFields: {
          postAccounts: dto.postAccounts,
          rateAdjustmentType: dto.rateAdjustmentType,
          rateAdjustmentValue: dto.rateAdjustmentValue,
          priority: dto.priority,
          description: dto.description,
        },
        createdById: userId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdatePostingRuleDto) {
    await this.assertRule(tenantId, id);

    return this.prisma.postingRule.update({
      where: { id },
      data: {
        ruleName: dto.ruleName,
        isActive: dto.isActive,
        ...(dto.conditions ? { conditions: dto.conditions as Prisma.InputJsonValue } : {}),
        ...(dto.postDelayMinutes ? { scheduleTime: `${dto.postDelayMinutes}m` } : {}),
        ...(dto.postAccounts
          ? {
              customFields: {
                postAccounts: dto.postAccounts,
                rateAdjustmentType: dto.rateAdjustmentType,
                rateAdjustmentValue: dto.rateAdjustmentValue,
                priority: dto.priority,
                description: dto.description,
              },
            }
          : {}),
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.assertRule(tenantId, id);
    await this.prisma.postingRule.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
    return { success: true };
  }

  private async assertRule(tenantId: string, id: string) {
    const rule = await this.prisma.postingRule.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!rule) {
      throw new NotFoundException('Posting rule not found');
    }
    return rule;
  }
}
