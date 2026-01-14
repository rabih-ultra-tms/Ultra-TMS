import { Injectable } from '@nestjs/common';
import { JobExecution, JobExecutionStatus, ScheduledJob } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class RetryService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateDelayMs(attempt: number, baseDelaySeconds: number) {
    const exponential = baseDelaySeconds * Math.pow(2, Math.max(attempt - 1, 0));
    const jitter = Math.random() * 0.3 * exponential;
    return Math.min((exponential + jitter) * 1000, 60 * 60 * 1000); // cap at 1h
  }

  async scheduleRetry(execution: JobExecution, job: ScheduledJob) {
    const customFields = execution.customFields as Record<string, any> | null | undefined;
    const currentAttempt = execution.attemptNumber ?? customFields?.attemptNumber ?? 1;
    const maxAttempts = job.maxRetries ?? job.retryAttempts ?? 0;
    if (maxAttempts <= 0 || currentAttempt >= maxAttempts) return null;

    const baseDelaySeconds = job.retryDelaySeconds ?? 60;
    const delayMs = this.calculateDelayMs(currentAttempt + 1, baseDelaySeconds);
    const scheduledAt = new Date(Date.now() + delayMs);

    await this.prisma.jobExecution.create({
      data: {
        jobId: job.id,
        tenantId: job.tenantId,
        status: JobExecutionStatus.PENDING,
        executionNumber: execution.executionNumber ?? 1,
        attemptNumber: currentAttempt + 1,
        retryOf: execution.id,
        scheduledAt,
        createdById: execution.createdById ?? undefined,
        customFields: { scheduledAt: scheduledAt.toISOString(), retryOf: execution.id },
      },
    });

    await Promise.all([
      this.prisma.scheduledJob.update({ where: { id: job.id }, data: { nextRunAt: scheduledAt } }),
      this.prisma.jobExecution.update({ where: { id: execution.id }, data: { willRetry: true } }),
    ]);

    return scheduledAt;
  }
}
