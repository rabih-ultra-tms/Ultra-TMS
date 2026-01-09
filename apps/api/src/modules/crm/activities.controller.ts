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
import { JwtAuthGuard } from '../auth/guards';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto } from './dto';
import { CurrentTenant } from '../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
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
  async getUpcoming(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query('days') days?: number,
  ) {
    return this.activitiesService.getUpcoming(tenantId, userId, days || 7);
  }

  @Get(':id')
  async findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.activitiesService.findOne(tenantId, id);
  }

  @Post()
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateActivityDto,
  ) {
    return this.activitiesService.create(tenantId, userId, dto);
  }

  @Put(':id')
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateActivityDto,
  ) {
    return this.activitiesService.update(tenantId, id, userId, dto);
  }

  @Delete(':id')
  async delete(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.activitiesService.delete(tenantId, id);
  }

  @Get('tasks/my')
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
  async getOverdueTasks(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.activitiesService.getOverdueTasks(tenantId, userId);
  }

  @Patch(':id/complete')
  async markComplete(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.activitiesService.markComplete(tenantId, id, userId);
  }

  @Patch(':id/reopen')
  async reopenTask(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.activitiesService.reopenTask(tenantId, id, userId);
  }

  @Patch(':id/reschedule')
  async reschedule(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: { dueDate: string },
  ) {
    return this.activitiesService.reschedule(tenantId, id, userId, dto.dueDate);
  }
}
