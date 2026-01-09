import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string, options?: {
    page?: number;
    limit?: number;
    activityType?: string;
    companyId?: string;
    contactId?: string;
    opportunityId?: string;
    ownerId?: string;
    completed?: boolean;
  }) {
    const { page = 1, limit = 20, activityType, companyId, contactId, opportunityId, ownerId, completed } = options || {};
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (activityType) where.activityType = activityType;
    if (companyId) where.companyId = companyId;
    if (contactId) where.contactId = contactId;
    if (opportunityId) where.opportunityId = opportunityId;
    if (ownerId) where.ownerId = ownerId;
    if (typeof completed === 'boolean') {
      where.completedAt = completed ? { not: null } : null;
    }

    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          opportunity: { select: { id: true, name: true } },
          owner: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(tenantId: string, id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, tenantId },
      include: {
        company: true,
        contact: true,
        opportunity: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  async create(tenantId: string, userId: string, dto: CreateActivityDto) {
    return this.prisma.activity.create({
      data: {
        tenantId,
        entityType: dto.entityType || 'GENERAL',
        entityId: dto.entityId || '',
        activityType: dto.activityType,
        subject: dto.subject,
        description: dto.description,
        companyId: dto.companyId,
        contactId: dto.contactId,
        opportunityId: dto.opportunityId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
        priority: dto.priority || 'MEDIUM',
        status: 'PENDING',
        ownerId: dto.ownerId || userId,
        createdById: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async update(tenantId: string, id: string, userId: string, dto: UpdateActivityDto) {
    await this.findOne(tenantId, id);

    return this.prisma.activity.update({
      where: { id },
      data: {
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority,
        durationMinutes: dto.durationMinutes,
        activityDate: dto.activityDate ? new Date(dto.activityDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        status: dto.status,
        ownerId: dto.ownerId,
        updatedById: userId,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.activity.delete({ where: { id } });
    return { success: true };
  }

  async getUpcoming(tenantId: string, userId: string, days: number = 7) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return this.prisma.activity.findMany({
      where: {
        tenantId,
        ownerId: userId,
        completedAt: null,
        dueDate: { lte: endDate },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        opportunity: { select: { id: true, name: true } },
      },
    });
  }
}
