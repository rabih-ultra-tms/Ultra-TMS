import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreateReminderDto, SnoozeReminderDto, UpdateReminderDto } from '../dto/reminder.dto';
import { RemindersService } from './reminders.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
@ApiTags('Scheduler')
@ApiBearerAuth('JWT-auth')
export class RemindersController {
  constructor(private readonly service: RemindersService) {}

  @Get()
  @ApiOperation({ summary: 'List reminders' })
  @ApiStandardResponse('Reminders list')
  @ApiErrorResponses()
  list(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.list(tenantId, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create reminder' })
  @ApiStandardResponse('Reminder created')
  @ApiErrorResponses()
  create(
    @Body() dto: CreateReminderDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, tenantId, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiStandardResponse('Reminder updated')
  @ApiErrorResponses()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, dto, tenantId, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiStandardResponse('Reminder deleted')
  @ApiErrorResponses()
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, tenantId, userId);
  }

  @Post(':id/snooze')
  @ApiOperation({ summary: 'Snooze reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiStandardResponse('Reminder snoozed')
  @ApiErrorResponses()
  snooze(
    @Param('id') id: string,
    @Body() dto: SnoozeReminderDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.snooze(id, dto, tenantId, userId);
  }

  @Post(':id/dismiss')
  @ApiOperation({ summary: 'Dismiss reminder' })
  @ApiParam({ name: 'id', description: 'Reminder ID' })
  @ApiStandardResponse('Reminder dismissed')
  @ApiErrorResponses()
  dismiss(@Param('id') id: string, @CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.dismiss(id, tenantId, userId);
  }
}
