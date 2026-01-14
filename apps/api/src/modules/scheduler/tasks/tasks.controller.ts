import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { ScheduleTaskDto } from '../dto/task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  get(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.get(id, tenantId);
  }

  @Post()
  create(@Body() dto: ScheduleTaskDto, @CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.schedule(dto, tenantId, userId);
  }

  @Delete(':id')
  cancel(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.cancel(id, tenantId);
  }
}
