import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser, Roles } from '../../../common/decorators';
import {
  ApproveRequestDto,
  CreateTimeOffRequestDto,
  DenyRequestDto,
  UpdateTimeOffRequestDto,
} from '../dto/hr.dto';
import { TimeOffService } from './time-off.service';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('hr/time-off')
@UseGuards(JwtAuthGuard)
@ApiTags('Employees')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Get('balances')
  @ApiOperation({ summary: 'List time-off balances' })
  @ApiStandardResponse('Time-off balances')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  listBalances(@CurrentTenant() tenantId: string) {
    return this.timeOffService.listBalances(tenantId);
  }

  @Get('requests')
  @ApiOperation({ summary: 'List time-off requests' })
  @ApiStandardResponse('Time-off requests list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  listRequests(@CurrentTenant() tenantId: string) {
    return this.timeOffService.listRequests(tenantId);
  }

  @Post('requests')
  @ApiOperation({ summary: 'Create time-off request' })
  @ApiStandardResponse('Time-off request created')
  @ApiErrorResponses()
  createRequest(@CurrentTenant() tenantId: string, @Body() dto: CreateTimeOffRequestDto) {
    return this.timeOffService.createRequest(tenantId, dto);
  }

  @Get('requests/:id')
  @ApiOperation({ summary: 'Get time-off request by ID' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiStandardResponse('Time-off request details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  getRequest(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.timeOffService.findOne(tenantId, id);
  }

  @Put('requests/:id')
  @ApiOperation({ summary: 'Update time-off request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiStandardResponse('Time-off request updated')
  @ApiErrorResponses()
  updateRequest(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateTimeOffRequestDto) {
    return this.timeOffService.updateRequest(tenantId, id, dto);
  }

  @Post('requests/:id/approve')
  @ApiOperation({ summary: 'Approve time-off request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiStandardResponse('Time-off request approved')
  @ApiErrorResponses()
  @Roles('MANAGER', 'ADMIN')
  approveRequest(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveRequestDto,
  ) {
    return this.timeOffService.approveRequest(tenantId, id, userId, dto);
  }

  @Post('requests/:id/deny')
  @ApiOperation({ summary: 'Deny time-off request' })
  @ApiParam({ name: 'id', description: 'Request ID' })
  @ApiStandardResponse('Time-off request denied')
  @ApiErrorResponses()
  @Roles('MANAGER', 'ADMIN')
  denyRequest(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: DenyRequestDto,
  ) {
    return this.timeOffService.denyRequest(tenantId, id, userId, dto);
  }
}
