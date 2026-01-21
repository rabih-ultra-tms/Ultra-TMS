import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('crm/activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Activities')
@ApiBearerAuth('JWT-auth')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List activities' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'activityType', required: false, type: String })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'contactId', required: false, type: String })
  @ApiQuery({ name: 'opportunityId', required: false, type: String })
  @ApiQuery({ name: 'ownerId', required: false, type: String })
  @ApiQuery({ name: 'completed', required: false, type: String })
  @ApiStandardResponse('Activities list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('activityType') activityType?: string,
    @Query('companyId') companyId?: string,
    @Query('contactId') contactId?: string,
    @Query('opportunityId') opportunityId?: string,
    @Query('ownerId') ownerId?: string,
    @Query('completed') completed?: string,
  ) {
    return this.activitiesService.findAll(tenantId, {
      page,
      limit,
      activityType,
      companyId,
      contactId,
      opportunityId,
      ownerId,
      completed: completed === 'true' ? true : completed === 'false' ? false : undefined,
    });
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'List upcoming activities' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiStandardResponse('Upcoming activities list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async getUpcoming(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ) {
    return this.activitiesService.getUpcoming(tenantId, userId, days || 7);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by ID' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiStandardResponse('Activity details')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.activitiesService.findOne(tenantId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create activity' })
  @ApiStandardResponse('Activity created')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateActivityDto,
  ) {
    return this.activitiesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update activity' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiStandardResponse('Activity updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete activity' })
  @ApiParam({ name: 'id', description: 'Activity ID' })
  @ApiStandardResponse('Activity deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async delete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.activitiesService.delete(tenantId, id, userId);
  }

  @Get('tasks/my')
  @ApiOperation({ summary: 'List my tasks' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'includeCompleted', required: false, type: String })
  @ApiStandardResponse('My tasks list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async getMyTasks(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('includeCompleted') includeCompleted?: string,
  ) {
    return this.activitiesService.getMyTasks(tenantId, userId, {
      page,
      limit,
      includeCompleted: includeCompleted === 'true',
    });
  }

  @Get('tasks/overdue')
  @ApiOperation({ summary: 'List overdue tasks' })
  @ApiStandardResponse('Overdue tasks list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async getOverdueTasks(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.activitiesService.getOverdueTasks(tenantId, userId);
  }

  @Patch(':id/complete')
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async markComplete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.activitiesService.markComplete(tenantId, id, userId);
  }

  @Patch(':id/reopen')
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async reopenTask(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.activitiesService.reopenTask(tenantId, id, userId);
  }

  @Patch(':id/reschedule')
  @Roles('ADMIN', 'SALES_REP', 'SALES_MANAGER', 'ACCOUNT_MANAGER')
  async reschedule(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { dueDate: string },
  ) {
    return this.activitiesService.reschedule(tenantId, id, userId, dto.dueDate);
  }
}
