import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JobExecutionStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { RetryService } from '../retry/retry.service';

@Injectable()
export class ExecutionsService {
  constructor(private readonly prisma: PrismaService, private readonly retryService: RetryService) {}

  private async ensureJob(jobId: string, tenantId?: string | null) {
    const job = await this.prisma.scheduledJob.findUnique({ where: { id: jobId } });
    if (!job || job.deletedAt) throw new NotFoundException('Job not found');
    if (job.tenantId && tenantId && job.tenantId !== tenantId) throw new NotFoundException('Job not found');
    if (job.tenantId && !tenantId) throw new NotFoundException('Job not found');
    return job;
  }

  async list(jobId: string, tenantId?: string | null) {
    await this.ensureJob(jobId, tenantId);
    return this.prisma.jobExecution.findMany({ where: { jobId }, orderBy: { createdAt: 'desc' } });
  }

  async get(jobId: string, executionId: string, tenantId?: string | null) {
    await this.ensureJob(jobId, tenantId);
    const execution = await this.prisma.jobExecution.findFirst({ where: { id: executionId, jobId } });
    if (!execution) throw new NotFoundException('Execution not found');
    return execution;
  }

  async cancel(jobId: string, executionId: string, tenantId?: string | null) {
    const execution = await this.get(jobId, executionId, tenantId);
    if (!(execution.status === JobExecutionStatus.PENDING || execution.status === JobExecutionStatus.RUNNING)) {
      throw new BadRequestException('Execution cannot be cancelled');
    }

    return this.prisma.jobExecution.update({
      where: { id: execution.id },
      data: { status: JobExecutionStatus.CANCELLED, completedAt: new Date() },
    });
  }

  async retry(jobId: string, executionId: string, tenantId?: string | null) {
    const execution = await this.get(jobId, executionId, tenantId);
    const job = await this.ensureJob(jobId, tenantId);
    return this.retryService.scheduleRetry(execution, job);
  }
}
