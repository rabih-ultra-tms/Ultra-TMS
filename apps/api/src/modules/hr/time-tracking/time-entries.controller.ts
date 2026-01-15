import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import { ApproveTimeEntryDto, CreateTimeEntryDto, UpdateTimeEntryDto } from '../dto/hr.dto';
import { TimeEntriesService } from './time-entries.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('hr/time-entries')
@UseGuards(JwtAuthGuard)
@ApiTags('Employees')
@ApiBearerAuth('JWT-auth')
@Roles('user', 'manager', 'admin')
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Get()
  @ApiOperation({ summary: 'List time entries' })
  @ApiStandardResponse('Time entries list')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  list(@CurrentTenant() tenantId: string) {
    return this.timeEntriesService.list(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Create time entry' })
  @ApiStandardResponse('Time entry created')
  @ApiErrorResponses()
  create(@CurrentTenant() tenantId: string, @Body() dto: CreateTimeEntryDto) {
    return this.timeEntriesService.create(tenantId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update time entry' })
  @ApiParam({ name: 'id', description: 'Time entry ID' })
  @ApiStandardResponse('Time entry updated')
  @ApiErrorResponses()
  update(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateTimeEntryDto) {
    return this.timeEntriesService.update(tenantId, id, dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve time entry' })
  @ApiParam({ name: 'id', description: 'Time entry ID' })
  @ApiStandardResponse('Time entry approved')
  @ApiErrorResponses()
  @Roles('manager', 'admin')
  approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveTimeEntryDto,
  ) {
    return this.timeEntriesService.approve(tenantId, id, userId, dto);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get time entry summary' })
  @ApiStandardResponse('Time entry summary')
  @ApiErrorResponses()
  @Roles('viewer', 'user', 'manager', 'admin')
  summary(@CurrentTenant() tenantId: string) {
    return this.timeEntriesService.summary(tenantId);
  }
}
