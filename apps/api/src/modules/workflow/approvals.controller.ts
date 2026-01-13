import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators';
import { ApprovalsService } from './approvals.service';
import {
  ApprovalDecisionDto,
  ApprovalQueryDto,
  DelegateApprovalDto,
  RejectApprovalDto,
} from './dto';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  findAll(@CurrentTenant() tenantId: string, @Query() query: ApprovalQueryDto) {
    return this.approvalsService.findAll(tenantId, query);
  }

  @Get('pending')
  findPending(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query() query: ApprovalQueryDto,
  ) {
    return this.approvalsService.findPending(tenantId, userId, query);
  }

  @Get('stats')
  stats(@CurrentTenant() tenantId: string) {
    return this.approvalsService.stats(tenantId);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.approvalsService.findOne(tenantId, id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: ApprovalDecisionDto,
  ) {
    return this.approvalsService.approve(tenantId, id, userId, dto);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: RejectApprovalDto,
  ) {
    return this.approvalsService.reject(tenantId, id, userId, dto);
  }

  @Post(':id/delegate')
  @HttpCode(HttpStatus.OK)
  delegate(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: DelegateApprovalDto,
  ) {
    return this.approvalsService.delegate(tenantId, id, userId, dto);
  }
}
