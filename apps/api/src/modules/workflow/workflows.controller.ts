import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { WorkflowsService } from './workflows.service';
import {
  CreateWorkflowDto,
  ExecuteWorkflowDto,
  UpdateWorkflowDto,
  WorkflowQueryDto,
} from './dto';
import { actionLibrary, triggerEvents, triggerSchemas } from './actions.constants';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get('actions')
  listActions() {
    return Object.entries(actionLibrary).map(([key, value]) => ({ type: key, ...value }));
  }

  @Get('actions/:type')
  getAction(@Param('type') type: string) {
    const action = (actionLibrary as Record<string, any>)[type];
    return action ? { type, ...action } : {};
  }

  @Get('triggers')
  listTriggers() {
    return triggerSchemas.map(schema => ({
      type: schema.type,
      description: schema.description,
      schema: schema.schema,
      events: schema.type === 'EVENT' ? triggerEvents : undefined,
    }));
  }

  @Get('triggers/:type')
  getTrigger(@Param('type') type: string) {
    const trigger = triggerSchemas.find(t => t.type.toLowerCase() === type.toLowerCase());
    return trigger ? { ...trigger, events: trigger.type === 'EVENT' ? triggerEvents : undefined } : {};
  }

  @Post('validate')
  validateDefinition(@Body() dto: CreateWorkflowDto | UpdateWorkflowDto) {
    return this.workflowsService.validateDefinition(dto);
  }

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: WorkflowQueryDto) {
    return this.workflowsService.findAll(tenantId, query);
  }

  @Post()
  create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.workflowsService.create(tenantId, userId, dto);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.workflowsService.findOne(tenantId, id);
  }

  @Put(':id')
  update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    await this.workflowsService.remove(tenantId, id);
  }

  @Post(':id/publish')
  publish(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.publish(tenantId, id, userId);
  }

  @Post(':id/activate')
  activate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.activate(tenantId, id, userId);
  }

  @Post(':id/deactivate')
  deactivate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.deactivate(tenantId, id, userId);
  }

  @Post(':id/execute')
  execute(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ExecuteWorkflowDto,
  ) {
    return this.workflowsService.execute(tenantId, id, userId, dto);
  }

  @Get(':id/stats')
  stats(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.workflowsService.stats(tenantId, id);
  }
}
