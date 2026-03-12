import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { ScheduleTaskDto } from '../dto/task.dto';
import { TasksService } from './tasks.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'DISPATCHER', 'OPERATIONS_MANAGER')
@ApiTags('Scheduler')
@ApiBearerAuth('JWT-auth')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List scheduled tasks' })
  @ApiStandardResponse('Tasks list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string) {
    return this.service.list(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiStandardResponse('Task details')
  @ApiErrorResponses()
  get(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.get(id, tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Schedule task' })
  @ApiStandardResponse('Task scheduled')
  @ApiErrorResponses()
  create(@Body() dto: ScheduleTaskDto, @CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.schedule(dto, tenantId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel task' })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiStandardResponse('Task cancelled')
  @ApiErrorResponses()
  cancel(@Param('id') id: string, @CurrentTenant() tenantId: string) {
    return this.service.cancel(id, tenantId);
  }
}
