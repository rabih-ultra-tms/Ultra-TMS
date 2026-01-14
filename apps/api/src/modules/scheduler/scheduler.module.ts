import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JobsController } from './jobs/jobs.controller';
import { JobsService } from './jobs/jobs.service';
import { JobSchedulerService } from './jobs/job-scheduler.service';
import { LockService } from './locking/lock.service';
import { RetryService } from './retry/retry.service';
import { ExecutionsController } from './executions/executions.controller';
import { ExecutionsService } from './executions/executions.service';
import { JobExecutorService } from './executions/job-executor.service';
import { TasksController } from './tasks/tasks.controller';
import { TasksService } from './tasks/tasks.service';
import { RemindersController } from './reminders/reminders.controller';
import { RemindersService } from './reminders/reminders.service';
import { TemplatesController } from './templates/templates.controller';
import { TemplatesService } from './templates/templates.service';
import { HandlerRegistry } from './handlers/handler-registry';
import { JobProcessor } from './processors/job.processor';
import { TaskProcessor } from './processors/task.processor';

@Module({
  controllers: [JobsController, ExecutionsController, TasksController, RemindersController, TemplatesController],
  providers: [
    PrismaService,
    JobsService,
    JobSchedulerService,
    LockService,
    RetryService,
    ExecutionsService,
    JobExecutorService,
    TasksService,
    RemindersService,
    TemplatesService,
    HandlerRegistry,
    JobProcessor,
    TaskProcessor,
  ],
  exports: [JobsService, JobSchedulerService, HandlerRegistry],
})
export class SchedulerModule {}
