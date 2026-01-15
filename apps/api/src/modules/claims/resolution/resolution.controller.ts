import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../../common/decorators';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Audit } from '../../audit/decorators/audit.decorator';
import { AuditAction, AuditActionCategory, AuditSeverity } from '@prisma/client';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResolutionService } from './resolution.service';
import { ApproveClaimDto } from './dto/approve-claim.dto';
import { DenyClaimDto } from './dto/deny-claim.dto';
import { PayClaimDto } from './dto/pay-claim.dto';
import { CloseClaimDto } from './dto/close-claim.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { CreateClaimAdjustmentDto } from './dto/create-claim-adjustment.dto';
import { ApiErrorResponses, ApiStandardResponse } from '../../../common/swagger';

@Controller('claims')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Claim Settlements')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
export class ResolutionController {
  constructor(private readonly resolutionService: ResolutionService) {}

  @Post(':claimId/approve')
  @ApiOperation({ summary: 'Approve claim payout' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim approved')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER')
  @Audit({
    action: AuditAction.UPDATE,
    category: AuditActionCategory.ADMIN,
    severity: AuditSeverity.CRITICAL,
    entityType: 'CLAIM',
    entityIdParam: 'claimId',
    sensitiveFields: ['approvedAmount'],
    description: 'Approved claim settlement',
  })
  @HttpCode(HttpStatus.OK)
  async approve(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: ApproveClaimDto,
  ) {
    return this.resolutionService.approve(tenantId, user.id, claimId, dto);
  }

  @Post(':claimId/deny')
  @ApiOperation({ summary: 'Deny claim' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim denied')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER')
  @Audit({
    action: AuditAction.UPDATE,
    category: AuditActionCategory.ADMIN,
    severity: AuditSeverity.CRITICAL,
    entityType: 'CLAIM',
    entityIdParam: 'claimId',
    description: 'Denied claim settlement',
  })
  @HttpCode(HttpStatus.OK)
  async deny(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: DenyClaimDto,
  ) {
    return this.resolutionService.deny(tenantId, user.id, claimId, dto);
  }

  @Post(':claimId/pay')
  @ApiOperation({ summary: 'Process claim payment' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim payment processed')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER')
  @Audit({
    action: AuditAction.UPDATE,
    category: AuditActionCategory.ADMIN,
    severity: AuditSeverity.CRITICAL,
    entityType: 'CLAIM',
    entityIdParam: 'claimId',
    sensitiveFields: ['paidAmount'],
    description: 'Processed claim payment',
  })
  @HttpCode(HttpStatus.OK)
  async pay(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: PayClaimDto,
  ) {
    return this.resolutionService.pay(tenantId, user.id, claimId, dto);
  }

  @Post(':claimId/close')
  @ApiOperation({ summary: 'Close claim' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim closed')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER')
  @Audit({
    action: AuditAction.UPDATE,
    category: AuditActionCategory.ADMIN,
    severity: AuditSeverity.CRITICAL,
    entityType: 'CLAIM',
    entityIdParam: 'claimId',
    description: 'Closed claim',
  })
  @HttpCode(HttpStatus.OK)
  async close(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CloseClaimDto,
  ) {
    return this.resolutionService.close(tenantId, user.id, claimId, dto);
  }

  @Put(':claimId/investigation')
  @ApiOperation({ summary: 'Update claim investigation' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Investigation updated')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  async updateInvestigation(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: UpdateInvestigationDto,
  ) {
    return this.resolutionService.updateInvestigation(tenantId, user.id, claimId, dto);
  }

  @Get(':claimId/adjustments')
  @ApiOperation({ summary: 'List claim adjustments' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim adjustments list')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER', 'DISPATCHER')
  async listAdjustments(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.resolutionService.listAdjustments(tenantId, claimId);
  }

  @Post(':claimId/adjustments')
  @ApiOperation({ summary: 'Add claim adjustment' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiStandardResponse('Claim adjustment added')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER', 'CLAIMS_ADJUSTER')
  async addAdjustment(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CreateClaimAdjustmentDto,
  ) {
    return this.resolutionService.addAdjustment(tenantId, user.id, claimId, dto);
  }

  @Delete(':claimId/adjustments/:adjustmentId')
  @ApiOperation({ summary: 'Delete claim adjustment' })
  @ApiParam({ name: 'claimId', description: 'Claim ID' })
  @ApiParam({ name: 'adjustmentId', description: 'Adjustment ID' })
  @ApiStandardResponse('Claim adjustment deleted')
  @ApiErrorResponses()
  @Roles('ADMIN', 'CLAIMS_MANAGER')
  @HttpCode(HttpStatus.OK)
  async removeAdjustment(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Param('adjustmentId') adjustmentId: string,
  ) {
    return this.resolutionService.removeAdjustment(tenantId, user.id, claimId, adjustmentId);
  }
}
