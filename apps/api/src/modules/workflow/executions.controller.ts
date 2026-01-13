import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { ExecutionsService } from './executions.service';
import { CancelExecutionDto, ExecutionQueryDto, RetryExecutionDto } from './dto';

@Controller('workflow-executions')
@UseGuards(JwtAuthGuard)
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: ExecutionQueryDto) {
    return this.executionsService.findAll(tenantId, query);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.executionsService.findOne(tenantId, id);
  }

  @Get(':id/steps')
  steps(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.executionsService.getSteps(tenantId, id);
  }

  @Get(':id/logs')
  logs(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.executionsService.getLogs(tenantId, id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CancelExecutionDto,
  ) {
    return this.executionsService.cancel(tenantId, id, userId, dto);
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  retry(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RetryExecutionDto,
  ) {
    return this.executionsService.retry(tenantId, id, userId, dto);
  }
}

@Controller('workflows/:workflowId/executions')
@UseGuards(JwtAuthGuard)
export class WorkflowExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get()
  findByWorkflow(
    @CurrentTenant() tenantId: string,
    @Param('workflowId') workflowId: string,
    @Query() query: ExecutionQueryDto,
  ) {
    return this.executionsService.findByWorkflow(tenantId, workflowId, query);
  }
}
