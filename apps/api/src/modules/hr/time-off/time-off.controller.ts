import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards';
import { CurrentTenant, CurrentUser } from '../../../common/decorators';
import {
  ApproveRequestDto,
  CreateTimeOffRequestDto,
  DenyRequestDto,
  UpdateTimeOffRequestDto,
} from '../dto/hr.dto';
import { TimeOffService } from './time-off.service';

@Controller('hr/time-off')
@UseGuards(JwtAuthGuard)
export class TimeOffController {
  constructor(private readonly timeOffService: TimeOffService) {}

  @Get('balances')
  listBalances(@CurrentTenant() tenantId: string) {
    return this.timeOffService.listBalances(tenantId);
  }

  @Get('requests')
  listRequests(@CurrentTenant() tenantId: string) {
    return this.timeOffService.listRequests(tenantId);
  }

  @Post('requests')
  createRequest(@CurrentTenant() tenantId: string, @Body() dto: CreateTimeOffRequestDto) {
    return this.timeOffService.createRequest(tenantId, dto);
  }

  @Get('requests/:id')
  getRequest(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.timeOffService.findOne(tenantId, id);
  }

  @Put('requests/:id')
  updateRequest(@CurrentTenant() tenantId: string, @Param('id') id: string, @Body() dto: UpdateTimeOffRequestDto) {
    return this.timeOffService.updateRequest(tenantId, id, dto);
  }

  @Post('requests/:id/approve')
  approveRequest(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ApproveRequestDto,
  ) {
    return this.timeOffService.approveRequest(tenantId, id, userId, dto);
  }

  @Post('requests/:id/deny')
  denyRequest(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: DenyRequestDto,
  ) {
    return this.timeOffService.denyRequest(tenantId, id, userId, dto);
  }
}
