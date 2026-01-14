import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../modules/auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { CreateReminderDto, SnoozeReminderDto, UpdateReminderDto } from '../dto/reminder.dto';
import { RemindersService } from './reminders.service';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class RemindersController {
  constructor(private readonly service: RemindersService) {}

  @Get()
  list(@CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.list(tenantId, userId);
  }

  @Post()
  create(
    @Body() dto: CreateReminderDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.create(dto, tenantId, userId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.update(id, dto, tenantId, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.remove(id, tenantId, userId);
  }

  @Post(':id/snooze')
  snooze(
    @Param('id') id: string,
    @Body() dto: SnoozeReminderDto,
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.snooze(id, dto, tenantId, userId);
  }

  @Post(':id/dismiss')
  dismiss(@Param('id') id: string, @CurrentTenant() tenantId: string, @CurrentUser('id') userId: string) {
    return this.service.dismiss(id, tenantId, userId);
  }
}
