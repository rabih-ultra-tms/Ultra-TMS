import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentTenant, CurrentUser, Roles } from '../../common/decorators';
import { ApprovalsService } from './approvals.service';
import {
  ApprovalDecisionDto,
  ApprovalQueryDto,
  DelegateApprovalDto,
  RejectApprovalDto,
} from './dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../common/swagger';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
@ApiTags('Workflows')
@ApiBearerAuth('JWT-auth')
@Roles('USER', 'MANAGER', 'ADMIN')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @ApiOperation({ summary: 'List approvals' })
  @ApiStandardResponse('Approvals list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  findAll(@CurrentTenant() tenantId: string, @Query() query: ApprovalQueryDto) {
    return this.approvalsService.findAll(tenantId, query);
  }

  @Get('pending')
  @ApiOperation({ summary: 'List pending approvals' })
  @ApiStandardResponse('Pending approvals list')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  findPending(
    @CurrentTenant() tenantId: string,
    @CurrentUser('id') userId: string,
    @Query() query: ApprovalQueryDto,
  ) {
    return this.approvalsService.findPending(tenantId, userId, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get approvals stats' })
  @ApiStandardResponse('Approvals stats')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  stats(@CurrentTenant() tenantId: string) {
    return this.approvalsService.stats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get approval by ID' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  @ApiStandardResponse('Approval details')
  @ApiErrorResponses()
  @Roles('VIEWER', 'USER', 'MANAGER', 'ADMIN')
  findOne(@CurrentTenant() tenantId: string, @Param('id') id: string) {
    return this.approvalsService.findOne(tenantId, id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve workflow request' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  @ApiStandardResponse('Approval accepted')
  @ApiErrorResponses()
  @Roles('MANAGER', 'ADMIN')
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
  @ApiOperation({ summary: 'Reject workflow request' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  @ApiStandardResponse('Approval rejected')
  @ApiErrorResponses()
  @Roles('MANAGER', 'ADMIN')
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
  @ApiOperation({ summary: 'Delegate approval' })
  @ApiParam({ name: 'id', description: 'Approval ID' })
  @ApiStandardResponse('Approval delegated')
  @ApiErrorResponses()
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
