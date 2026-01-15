import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../common/decorators';
import { ExecutionsService } from './executions.service';
import { CancelExecutionDto, ExecutionQueryDto, RetryExecutionDto } from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('workflow-executions')
@UseGuards(JwtAuthGuard)
@ApiTags('Workflow Executions')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class ExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get()
  @ApiOperation({ summary: 'List workflow executions' })
  @ApiStandardResponse('Workflow executions list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  findAll(@CurrentTenant() tenantId: string, @Query() query: ExecutionQueryDto) {
    return this.executionsService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow execution by ID' })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiStandardResponse('Workflow execution details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.executionsService.findOne(tenantId, id);
  }

  @Get(':id/steps')
  @ApiOperation({ summary: 'Get workflow execution steps' })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiStandardResponse('Workflow execution steps')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  steps(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.executionsService.getSteps(tenantId, id);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get workflow execution logs' })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiStandardResponse('Workflow execution logs')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  logs(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.executionsService.getLogs(tenantId, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel workflow execution' })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiStandardResponse('Workflow execution canceled')
  @ApiErrorResponses()
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
  @ApiOperation({ summary: 'Retry workflow execution' })
  @ApiParam({ name: 'id', description: 'Execution ID' })
  @ApiStandardResponse('Workflow execution retry started')
  @ApiErrorResponses()
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
@ApiTags('Workflow Executions')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class WorkflowExecutionsController {
  constructor(private readonly executionsService: ExecutionsService) {}

  @Get()
  @ApiOperation({ summary: 'List workflow executions by workflow' })
  @ApiParam({ name: 'workflowId', description: 'Workflow ID' })
  @ApiStandardResponse('Workflow executions list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  findByWorkflow(
    @CurrentTenant() tenantId: string,
    @Param('workflowId') workflowId: string,
    @Query() query: ExecutionQueryDto,
  ) {
    return this.executionsService.findByWorkflow(tenantId, workflowId, query);
  }
}
