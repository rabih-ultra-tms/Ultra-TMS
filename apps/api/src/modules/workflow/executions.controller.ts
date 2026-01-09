import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { ExecutionsService } from './executions.service';
import {
  ExecutionQueryDto,
  CancelExecutionDto,
  RetryExecutionDto,
} from './dto';

@Controller('workflow-executions')
@UseGuards(JwtAuthGuard)
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: ExecutionQueryDto,
  ) {
    return this.executionsService.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.executionsService.findOne(tenantId, id);
  }

  @Get(':id/steps')
  async getSteps(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.executionsService.getSteps(tenantId, id);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: CancelExecutionDto,
  ) {
    return this.executionsService.cancel(tenantId, id, userId, dto);
  }

  @Post(':id/retry')
  @HttpCode(HttpStatus.OK)
  async retry(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
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
  async findByWorkflow(
    @CurrentTenant() tenantId: string,
    @Param('workflowId') workflowId: string,
    @Query() query: ExecutionQueryDto,
  ) {
    return this.executionsService.findByWorkflow(tenantId, workflowId, query);
  }
}
