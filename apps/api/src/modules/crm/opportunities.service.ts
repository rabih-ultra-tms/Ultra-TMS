import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateOpportunityDto, UpdateOpportunityDto } from './dto';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, options?: {
    page?: number;
    limit?: number;
    stage?: string;
    ownerId?: string;
    companyId?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, stage, ownerId, companyId, search } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };
    if (stage) where.stage = stage;
    if (ownerId) where.ownerId = ownerId;
    if (companyId) where.companyId = companyId;
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true } },
          primaryContact: { select: { id: true, firstName: true, lastName: true } },
          owner: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const opportunity = await this.prisma.opportunity.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        company: true,
        primaryContact: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!opportunity) {
      throw new NotFoundException(`Opportunity with ID ${id} not found`);
    }

    return opportunity;
  }

  async create(tenantId: string, userId: string, dto: CreateOpportunityDto) {
    return this.prisma.opportunity.create({
      data: {
        tenantId,
        name: dto.name,
        companyId: dto.companyId,
        primaryContactId: dto.primaryContactId,
        stage: dto.stage || 'LEAD',
        estimatedValue: dto.estimatedValue,
        probability: dto.probability || 0,
        estimatedLoadsPerMonth: dto.estimatedLoadsPerMonth,
        avgLoadValue: dto.avgLoadValue,
        expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : null,
        actualCloseDate: dto.actualCloseDate ? new Date(dto.actualCloseDate) : null,
        description: dto.description,
        serviceTypes: dto.serviceTypes || [],
        lanes: dto.lanes || [],
        competition: dto.competition,
        ownerId: dto.ownerId || userId,
        customFields: dto.customFields || {},
        tags: dto.tags || [],
        createdById: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
        primaryContact: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateOpportunityDto) {
    const existing = await this.findOne(tenantId, id);

    // Track stage changes
    const stageChanged = dto.stage && dto.stage !== existing.stage;

    return this.prisma.opportunity.update({
      where: { id },
      data: {
        name: dto.name,
        primaryContactId: dto.primaryContactId,
        stage: dto.stage,
        estimatedValue: dto.estimatedValue,
        probability: dto.probability,
        estimatedLoadsPerMonth: dto.estimatedLoadsPerMonth,
        avgLoadValue: dto.avgLoadValue,
        expectedCloseDate: dto.expectedCloseDate ? new Date(dto.expectedCloseDate) : undefined,
        description: dto.description,
        serviceTypes: dto.serviceTypes,
        lanes: dto.lanes,
        competition: dto.competition,
        winReason: dto.winReason,
        lossReason: dto.lossReason,
        ownerId: dto.ownerId,
        actualCloseDate: (dto.stage === 'WON' || dto.stage === 'LOST') && stageChanged ? new Date() : (dto.actualCloseDate ? new Date(dto.actualCloseDate) : undefined),
        customFields: dto.customFields,
        tags: dto.tags,
        updatedById: userId,
      },
    });
  }

  async delete(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    await this.prisma.opportunity.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    return { success: true };
  }

  async getPipeline(tenantId: string, ownerId?: string) {
    const where: any = { tenantId, deletedAt: null, stage: { notIn: ['WON', 'LOST'] } };
    if (ownerId) where.ownerId = ownerId;

    const opportunities = await this.prisma.opportunity.findMany({
      where,
      include: {
        company: { select: { id: true, name: true } },
        primaryContact: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { expectedCloseDate: 'asc' },
    });

    // Group by stage
    const pipeline: Record<string, typeof opportunities> = {
      LEAD: [],
      QUALIFIED: [],
      PROPOSAL: [],
      NEGOTIATION: [],
    };

    for (const opp of opportunities) {
      const stage = opp.stage;
      if (stage in pipeline) {
        pipeline[stage]!.push(opp);
      }
    }

    return pipeline;
  }
}
