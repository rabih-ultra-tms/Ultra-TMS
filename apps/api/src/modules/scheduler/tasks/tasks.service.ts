import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ScheduleTaskDto } from '../dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string) {
    return this.prisma.scheduledTask.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async get(id: string, tenantId: string) {
    const task = await this.prisma.scheduledTask.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  schedule(dto: ScheduleTaskDto, tenantId: string, userId?: string | null) {
    return this.prisma.scheduledTask.create({
      data: {
        tenantId,
        taskType: dto.taskType,
        referenceType: dto.referenceType,
        referenceId: dto.referenceId,
        scheduledAt: new Date(dto.scheduledAt),
        timezone: dto.timezone,
        payload: dto.payload,
        handler: dto.handler,
        priority: dto.priority ?? 5,
        timeoutSeconds: dto.timeoutSeconds ?? 60,
        status: TaskStatus.PENDING,
        createdById: userId ?? undefined,
      },
    });
  }

  async cancel(id: string, tenantId: string) {
    await this.get(id, tenantId);
    return this.prisma.scheduledTask.update({
      where: { id },
      data: { status: TaskStatus.CANCELLED, processedAt: new Date() },
    });
  }
}
