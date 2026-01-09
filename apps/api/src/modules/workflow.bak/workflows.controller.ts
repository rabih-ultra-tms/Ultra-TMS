import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { WorkflowsService } from './workflows.service';
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowQueryDto,
  ExecuteWorkflowDto,
  CloneWorkflowDto,
} from './dto';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Get()
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: WorkflowQueryDto,
  ) {
    return this.workflowsService.findAll(tenantId, query);
  }

  @Get(':id')
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateWorkflowDto,
  ) {
    return this.workflowsService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateWorkflowDto,
  ) {
    return this.workflowsService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    await this.workflowsService.delete(tenantId, id);
  }

  @Post(':id/publish')
  async publish(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.publish(tenantId, id, userId);
  }

  @Post(':id/activate')
  async activate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.activate(tenantId, id, userId);
  }

  @Post(':id/deactivate')
  async deactivate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.deactivate(tenantId, id, userId);
  }

  @Post(':id/clone')
  async clone(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: CloneWorkflowDto,
  ) {
    return this.workflowsService.clone(tenantId, id, userId, dto);
  }

  @Get(':id/versions')
  async getVersionHistory(
    @CurrentTenant() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.workflowsService.getVersionHistory(tenantId, id);
  }

  @Post(':id/test')
  async testRun(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: ExecuteWorkflowDto,
  ) {
    return this.workflowsService.testRun(tenantId, id, userId, dto);
  }

  @Post(':id/execute')
  async execute(
    @CurrentTenant() tenantId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: ExecuteWorkflowDto,
  ) {
    return this.workflowsService.execute(tenantId, id, userId, dto);
  }
}
