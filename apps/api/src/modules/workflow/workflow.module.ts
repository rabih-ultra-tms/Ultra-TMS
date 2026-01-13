import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { WorkflowsController } from './workflows.controller';
import { ExecutionsController, WorkflowExecutionsController } from './executions.controller';
import { ApprovalsController } from './approvals.controller';
import { TemplatesController } from './templates.controller';
import { WorkflowsService } from './workflows.service';
import { ExecutionsService } from './executions.service';
import { ApprovalsService } from './approvals.service';
import { TemplatesService } from './templates.service';

@Module({
  controllers: [
    WorkflowsController,
    ExecutionsController,
    WorkflowExecutionsController,
    ApprovalsController,
    TemplatesController,
  ],
  providers: [PrismaService, WorkflowsService, ExecutionsService, ApprovalsService, TemplatesService],
})
export class WorkflowModule {}
