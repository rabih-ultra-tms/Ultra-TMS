import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards';
import { RolesGuard } from '../../../common/guards/roles.guard';
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
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Employees')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'HR_MANAGER', 'OPERATIONS_MANAGER')
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Get('balances')
  @ApiOperation({ summary: 'List time-off balances' })
  @ApiStandardResponse('Time-off balances')
  @ApiErrorResponses()
  @Roles('ADMIN', 'HR_MANAGER', 'HR_VIEWER', 'OPERATIONS_MANAGER')
  listBalances(@CurrentTenant() tenantId: string) {
    return this.timeOffService.listBalances(tenantId);
  }

  @Get('requests')
  @ApiOperation({ summary: 'List time-off requests' })
  @ApiStandardResponse('Time-off requests list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'HR_MANAGER', 'HR_VIEWER', 'OPERATIONS_MANAGER')
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
  @Roles('ADMIN', 'HR_MANAGER', 'HR_VIEWER', 'OPERATIONS_MANAGER')
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
  @Roles('ADMIN', 'HR_MANAGER')
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
  @Roles('ADMIN', 'HR_MANAGER')
  denyRequest(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: DenyRequestDto,
  ) {
    return this.timeOffService.denyRequest(tenantId, id, userId, dto);
  }
}
