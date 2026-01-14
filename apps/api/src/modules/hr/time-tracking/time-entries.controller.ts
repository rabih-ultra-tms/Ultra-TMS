import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import { ApproveTimeEntryDto, CreateTimeEntryDto, UpdateTimeEntryDto } from '../dto/hr.dto';
import { TimeEntriesService } from './time-entries.service';

@Controller('hr/time-entries')
@UseGuards(JwtAuthGuard)
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Get()
  list(@CurrentTenant() tenantId: string) {
    return this.timeEntriesService.list(tenantId);
  }

  @Post()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateTimeEntryDto) {
    return this.timeEntriesService.create(tenantId, dto);
  }

  @Put(':id')
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateTimeEntryDto) {
    return this.timeEntriesService.update(tenantId, id, dto);
  }

  @Post(':id/approve')
  approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveTimeEntryDto,
  ) {
    return this.timeEntriesService.approve(tenantId, id, userId, dto);
  }

  @Get('summary')
  summary(@CurrentTenant() tenantId: string) {
    return this.timeEntriesService.summary(tenantId);
  }
}
