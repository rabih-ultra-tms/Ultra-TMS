import { ConflictException, Injectable } from '@nestjs/common';
import { JobExecutionStatus, Prisma, ScheduledJob } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { HandlerRegistry } from '../handlers/handler-registry';
import { JobSchedulerService } from '../jobs/job-scheduler.service';
import { LockService } from '../locking/lock.service';
import { RetryService } from '../retry/retry.service';

@Injectable()
export class JobExecutorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lockService: LockService,
    private readonly scheduler: JobSchedulerService,
    private readonly handlers: HandlerRegistry,
    private readonly retry: RetryService,
  ) {}

  async execute(job: ScheduledJob, userId?: string | null) {
    const workerId = userId ?? 'scheduler-api';
    const acquired = await this.lockService.acquire(job.id, workerId, job.tenantId, 'job-execution');
    if (!acquired) throw new ConflictException('Job is locked by another worker');

    const startedAt = new Date();
    const scheduledAt = job.nextRunAt ?? job.runAt ?? job.scheduledAt ?? startedAt;
    const execution = await this.prisma.jobExecution.create({
      data: {
        jobId: job.id,
        tenantId: job.tenantId,
        executionNumber: (job.runCount ?? 0) + 1,
        attemptNumber: 1,
        status: JobExecutionStatus.RUNNING,
        scheduledAt,
        startedAt,
        workerId,
        parameters: job.parameters as Prisma.InputJsonValue,
        createdById: userId ?? undefined,
      },
    });

    try {
      const result = await this.handlers.execute(job.handler, (job.parameters as Record<string, any>) ?? {});
      const completedAt = new Date();
      const durationMs = completedAt.getTime() - startedAt.getTime();

      await this.prisma.jobExecution.update({
        where: { id: execution.id },
        data: { status: JobExecutionStatus.COMPLETED, completedAt, durationMs, result: result as any },
      });

      const nextRunAt = this.scheduler.nextRunAt({
        scheduleType: job.scheduleType,
        cronExpression: job.cronExpression,
        intervalSeconds: job.intervalSeconds ?? job.intervalMinutes,
        scheduledAt: job.runAt ?? job.scheduledAt,
        timezone: job.timezone,
      });

      await this.prisma.scheduledJob.update({
        where: { id: job.id },
        data: {
          lastRunAt: completedAt,
          lastRunStatus: JobExecutionStatus.COMPLETED,
          lastRunDurationMs: durationMs,
          nextRunAt,
          runCount: (job.runCount ?? 0) + 1,
          failureCount: job.failureCount ?? 0,
        },
      });

      return this.prisma.jobExecution.findUnique({ where: { id: execution.id } });
    } catch (err) {
      const completedAt = new Date();
      await this.prisma.jobExecution.update({
        where: { id: execution.id },
        data: {
          status: JobExecutionStatus.FAILED,
          completedAt,
          errorMessage: err instanceof Error ? err.message : 'Execution failed',
        },
      });

      const retryAt = await this.retry.scheduleRetry(execution, job);

      await this.prisma.scheduledJob.update({
        where: { id: job.id },
        data: {
          lastRunAt: completedAt,
          lastRunStatus: JobExecutionStatus.FAILED,
          failureCount: (job.failureCount ?? 0) + 1,
          nextRunAt: retryAt ?? job.nextRunAt,
        },
      });

      return this.prisma.jobExecution.findUnique({ where: { id: execution.id } });
    } finally {
      await this.lockService.release(job.id, workerId);
    }
  }
}
