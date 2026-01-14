import { Injectable, NotFoundException } from '@nestjs/common';
import { JobType, Prisma, ScheduleType } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateJobDto, UpdateJobDto } from '../dto/job.dto';
import { JobExecutorService } from '../executions/job-executor.service';
import { JobSchedulerService } from './job-scheduler.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scheduler: JobSchedulerService,
    private readonly executor: JobExecutorService,
  ) {}

  list(tenantId?: string) {
    return this.prisma.scheduledJob.findMany({
      where: {
        deletedAt: null,
        OR: tenantId ? [{ tenantId }, { tenantId: null }] : [{ tenantId: null }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findJob(id: string, tenantId?: string | null) {
    const job = await this.prisma.scheduledJob.findUnique({ where: { id } });
    if (!job || job.deletedAt) throw new NotFoundException('Job not found');
    if (job.tenantId && tenantId && job.tenantId !== tenantId) throw new NotFoundException('Job not found');
    if (job.tenantId && !tenantId) throw new NotFoundException('Job not found');
    return job;
  }

  async get(id: string, tenantId?: string | null) {
    return this.findJob(id, tenantId);
  }

  async create(dto: CreateJobDto, tenantId?: string | null, userId?: string | null) {
    const runAt = dto.runAt ? new Date(dto.runAt) : null;
    const nextRunAt = this.scheduler.nextRunAt({
      scheduleType: dto.scheduleType as ScheduleType,
      cronExpression: dto.cronExpression,
      intervalSeconds: dto.intervalSeconds,
      scheduledAt: runAt,
      timezone: dto.timezone,
    });

    return this.prisma.scheduledJob.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        jobType: (dto.jobType as JobType) ?? (tenantId ? JobType.TENANT : JobType.SYSTEM),
        scheduleType: dto.scheduleType as ScheduleType,
        cronExpression: dto.cronExpression,
        intervalSeconds: dto.intervalSeconds,
        runAt,
        timezone: dto.timezone ?? 'UTC',
        handler: dto.handler,
        handlerName: dto.handler,
        parameters: (dto.parameters ?? {}) as Prisma.InputJsonValue,
        timeoutSeconds: dto.timeoutSeconds ?? 300,
        timeoutMinutes: dto.timeoutSeconds ? Math.ceil(dto.timeoutSeconds / 60) : null,
        maxRetries: dto.maxRetries ?? 3,
        retryAttempts: dto.maxRetries ?? 3,
        retryDelaySeconds: dto.retryDelaySeconds ?? 60,
        status: dto.status ?? 'ACTIVE',
        priority: dto.priority ?? 5,
        queue: dto.queue ?? 'default',
        allowConcurrent: dto.allowConcurrent ?? false,
        maxInstances: dto.maxInstances ?? 1,
        isEnabled: dto.status ? dto.status === 'ACTIVE' : true,
        nextRunAt,
        tenantId: tenantId ?? null,
        createdById: userId ?? undefined,
      },
    });
  }

  async update(id: string, dto: UpdateJobDto, tenantId?: string | null) {
    const existing = await this.findJob(id, tenantId);
    const runAt = dto.runAt ? new Date(dto.runAt) : existing.runAt ?? existing.scheduledAt;
    const nextRunAt = this.scheduler.nextRunAt({
      scheduleType: (dto.scheduleType as ScheduleType) ?? existing.scheduleType,
      cronExpression: dto.cronExpression ?? existing.cronExpression,
      intervalSeconds: dto.intervalSeconds ?? existing.intervalSeconds ?? existing.intervalMinutes,
      scheduledAt: runAt,
      timezone: dto.timezone ?? existing.timezone,
    });

    return this.prisma.scheduledJob.update({
      where: { id },
      data: {
        code: dto.code ?? existing.code,
        name: dto.name ?? existing.name,
        description: dto.description ?? existing.description,
        jobType: (dto.jobType as JobType) ?? existing.jobType,
        scheduleType: (dto.scheduleType as ScheduleType) ?? existing.scheduleType,
        cronExpression: dto.cronExpression ?? existing.cronExpression,
        intervalSeconds: dto.intervalSeconds ?? existing.intervalSeconds ?? existing.intervalMinutes,
        runAt,
        timezone: dto.timezone ?? existing.timezone,
        handler: dto.handler ?? existing.handler,
        handlerName: dto.handler ?? existing.handlerName,
        parameters: (dto.parameters ?? (existing.parameters as Prisma.InputJsonValue)) as Prisma.InputJsonValue,
        timeoutSeconds: dto.timeoutSeconds ?? existing.timeoutSeconds,
        timeoutMinutes: dto.timeoutSeconds ? Math.ceil(dto.timeoutSeconds / 60) : existing.timeoutMinutes,
        maxRetries: dto.maxRetries ?? existing.maxRetries,
        retryAttempts: dto.maxRetries ?? existing.retryAttempts,
        retryDelaySeconds: dto.retryDelaySeconds ?? existing.retryDelaySeconds,
        status: dto.status ?? existing.status,
        priority: dto.priority ?? existing.priority,
        queue: dto.queue ?? existing.queue,
        allowConcurrent: dto.allowConcurrent ?? existing.allowConcurrent,
        maxInstances: dto.maxInstances ?? existing.maxInstances,
        isEnabled: dto.status ? dto.status === 'ACTIVE' : existing.isEnabled,
        nextRunAt,
      },
    });
  }

  async remove(id: string, tenantId?: string | null) {
    await this.findJob(id, tenantId);
    return this.prisma.scheduledJob.update({ where: { id }, data: { deletedAt: new Date(), isEnabled: false, status: 'DISABLED' } });
  }

  async runNow(id: string, tenantId?: string | null, userId?: string | null) {
    const job = await this.findJob(id, tenantId);
    return this.executor.execute(job, userId ?? 'manual-trigger');
  }

  async pause(id: string, tenantId?: string | null) {
    await this.findJob(id, tenantId);
    return this.prisma.scheduledJob.update({ where: { id }, data: { status: 'PAUSED', isEnabled: false } });
  }

  async resume(id: string, tenantId?: string | null) {
    await this.findJob(id, tenantId);
    return this.prisma.scheduledJob.update({ where: { id }, data: { status: 'ACTIVE', isEnabled: true } });
  }
}
