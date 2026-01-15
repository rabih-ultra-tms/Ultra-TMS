import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards/roles.guard';
import { WorkflowsService } from './workflows.service';
import {
  CreateWorkflowDto,
  ExecuteWorkflowDto,
  UpdateWorkflowDto,
  WorkflowQueryDto,
} from './dto';
import { actionLibrary, triggerEvents, triggerSchemas } from './actions.constants';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Workflows')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get('actions')
  @ApiOperation({ summary: 'List workflow actions' })
  @ApiStandardResponse('Workflow actions list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
  listActions() {
    return Object.entries(actionLibrary).map(([key, value]) => ({ type: key, ...value }));
  }

  @Get('actions/:type')
  @ApiOperation({ summary: 'Get workflow action' })
  @ApiParam({ name: 'type', description: 'Action type' })
  @ApiStandardResponse('Workflow action details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
  getAction(@Param('type') type: string) {
    const action = (actionLibrary as Record<string, any>)[type];
    return action ? { type, ...action } : {};
  }

  @Get('triggers')
  @ApiOperation({ summary: 'List workflow triggers' })
  @ApiStandardResponse('Workflow triggers list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
  listTriggers() {
    return triggerSchemas.map(schema => ({
      type: schema.type,
      description: schema.description,
      schema: schema.schema,
      events: schema.type === 'EVENT' ? triggerEvents : undefined,
    }));
  }

  @Get('triggers/:type')
  @ApiOperation({ summary: 'Get workflow trigger' })
  @ApiParam({ name: 'type', description: 'Trigger type' })
  @ApiStandardResponse('Workflow trigger details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
  getTrigger(@Param('type') type: string) {
    const trigger = triggerSchemas.find(t => t.type.toLowerCase() === type.toLowerCase());
    return trigger ? { ...trigger, events: trigger.type === 'EVENT' ? triggerEvents : undefined } : {};
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate workflow definition' })
  @ApiStandardResponse('Workflow definition validation')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER')
  validateDefinition(@Body() dto: CreateWorkflowDto | UpdateWorkflowDto) {
    return this.workflowsService.validateDefinition(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List workflows' })
  @ApiStandardResponse('Workflows list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
  findAll(@CurrentTenant() tenantId: string, @Query() query: WorkflowQueryDto) {
    return this.workflowsService.findAll(tenantId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create workflow' })
  @ApiStandardResponse('Workflow created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER')
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.workflowsService.create(tenantId, userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow by ID' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiStandardResponse('Workflow details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.workflowsService.findOne(tenantId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiStandardResponse('Workflow updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiStandardResponse('Workflow deleted')
  @ApiErrorResponses()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    await this.workflowsService.remove(tenantId, id);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiStandardResponse('Workflow published')
  @ApiErrorResponses()
  @Roles('ADMIN')
  publish(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.publish(tenantId, id, userId);
  }

  @Post(':id/activate')
  @ApiOperation({ summary: 'Activate workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiStandardResponse('Workflow activated')
  @ApiErrorResponses()
  @Roles('ADMIN')
  activate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.activate(tenantId, id, userId);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiStandardResponse('Workflow deactivated')
  @ApiErrorResponses()
  @Roles('ADMIN')
  deactivate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.deactivate(tenantId, id, userId);
  }

  @Post(':id/execute')
  @ApiOperation({ summary: 'Execute workflow' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiStandardResponse('Workflow execution started')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER')
  execute(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ExecuteWorkflowDto,
  ) {
    return this.workflowsService.execute(tenantId, id, userId, dto);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get workflow stats' })
  @ApiParam({ name: 'id', description: 'Workflow ID' })
  @ApiStandardResponse('Workflow stats')
  @ApiErrorResponses()
  @Roles('ADMIN', 'OPERATIONS_MANAGER', 'DISPATCHER', 'SALES_REP')
  stats(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.workflowsService.stats(tenantId, id);
  }
}
