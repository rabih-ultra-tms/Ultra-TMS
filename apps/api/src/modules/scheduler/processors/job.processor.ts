import { Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { JobExecutorService } from '../executions/job-executor.service';

@Injectable()
export class JobProcessor {
  constructor(private readonly jobsService: JobsService, private readonly executor: JobExecutorService) {}

  async process(jobId: string) {
    const job = await this.jobsService.get(jobId);
    return this.executor.execute(job);
  }
}
