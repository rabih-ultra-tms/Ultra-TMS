import { Injectable, NotFoundException } from '@nestjs/common';
import { JobType, ScheduleType } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateJobDto } from '../dto/job.dto';
import { JobsService } from '../jobs/jobs.service';

@Injectable()
export class TemplatesService {
  constructor(private readonly prisma: PrismaService, private readonly jobsService: JobsService) {}

  list() {
    return this.prisma.jobTemplate.findMany({ orderBy: { code: 'asc' } });
  }

  async get(code: string) {
    const template = await this.prisma.jobTemplate.findUnique({ where: { code } });
    if (!template) throw new NotFoundException('Template not found');
    return template;
  }

  async createFromTemplate(code: string, overrides: Partial<CreateJobDto>, tenantId?: string | null, userId?: string | null) {
    const template = await this.get(code);
    const dto: CreateJobDto = {
      code: overrides.code ?? template.code,
      name: overrides.name ?? template.name,
      description: overrides.description ?? template.description ?? undefined,
      handler: overrides.handler ?? template.handler,
      scheduleType: (overrides.scheduleType as ScheduleType) ?? ScheduleType.MANUAL,
      cronExpression: overrides.cronExpression,
      intervalSeconds: overrides.intervalSeconds,
      runAt: overrides.runAt,
      parameters: overrides.parameters ?? (template.defaultParameters as Record<string, any>),
      timeoutSeconds: overrides.timeoutSeconds ?? 300,
      maxRetries: overrides.maxRetries ?? 3,
      retryDelaySeconds: overrides.retryDelaySeconds ?? 60,
      priority: overrides.priority ?? 5,
      queue: overrides.queue ?? 'default',
      allowConcurrent: overrides.allowConcurrent ?? false,
      maxInstances: overrides.maxInstances ?? 1,
      status: overrides.status ?? 'ACTIVE',
      jobType: (overrides.jobType as JobType) ?? JobType.SYSTEM,
    };

    return this.jobsService.create(dto, tenantId, userId);
  }
}
