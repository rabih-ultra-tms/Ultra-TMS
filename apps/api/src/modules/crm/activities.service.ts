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
    const { page, limit, activityType, companyId, contactId, opportunityId, ownerId, completed } = options || {};
    const resolvedPage = Number(page);
    const resolvedLimit = Number(limit);
    const safePage = Number.isFinite(resolvedPage) && resolvedPage > 0 ? resolvedPage : 1;
    const safeLimit = Number.isFinite(resolvedLimit) && resolvedLimit > 0 ? resolvedLimit : 20;
    const skip = (safePage - 1) * safeLimit;

    const where: any = { tenantId, deletedAt: null };
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
        take: safeLimit,
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

    return { data, total, page: safePage, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async findOne(tenantId: string, id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, tenantId, deletedAt: null },
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

  async delete(tenantId: string, id: string, userId?: string) {
    await this.findOne(tenantId, id);
    await this.prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });
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

  async getMyTasks(tenantId: string, userId: string, options?: { page?: number; limit?: number; includeCompleted?: boolean }) {
    const { page = 1, limit = 20, includeCompleted = false } = options || {};
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      ownerId: userId,
      activityType: 'TASK',
    };
    if (!includeCompleted) {
      where.completedAt = null;
    }

    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
        include: {
          company: { select: { id: true, name: true } },
          contact: { select: { id: true, firstName: true, lastName: true } },
          opportunity: { select: { id: true, name: true } },
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getOverdueTasks(tenantId: string, userId: string) {
    const now = new Date();

    return this.prisma.activity.findMany({
      where: {
        tenantId,
        ownerId: userId,
        activityType: 'TASK',
        completedAt: null,
        dueDate: { lt: now },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
        opportunity: { select: { id: true, name: true } },
      },
    });
  }

  async markComplete(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    return this.prisma.activity.update({
      where: { id },
      data: {
        completedAt: new Date(),
        status: 'COMPLETED',
        updatedById: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async reopenTask(tenantId: string, id: string, userId: string) {
    await this.findOne(tenantId, id);

    return this.prisma.activity.update({
      where: { id },
      data: {
        completedAt: null,
        status: 'PENDING',
        updatedById: userId,
      },
    });
  }

  async reschedule(tenantId: string, id: string, userId: string, newDueDate: string) {
    await this.findOne(tenantId, id);

    return this.prisma.activity.update({
      where: { id },
      data: {
        dueDate: new Date(newDueDate),
        updatedById: userId,
      },
      include: {
        company: { select: { id: true, name: true } },
        contact: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getStats(tenantId: string, userId?: string) {
    const where: any = { tenantId, deletedAt: null };
    if (userId) where.ownerId = userId;

    const now = new Date();

    const [total, tasks, completed, overdue] = await Promise.all([
      this.prisma.activity.count({ where }),
      this.prisma.activity.count({ where: { ...where, activityType: 'TASK' } }),
      this.prisma.activity.count({ where: { ...where, completedAt: { not: null } } }),
      this.prisma.activity.count({
        where: {
          ...where,
          activityType: 'TASK',
          completedAt: null,
          dueDate: { lt: now },
        },
      }),
    ]);

    return { total, tasks, completed, overdue };
  }
}
