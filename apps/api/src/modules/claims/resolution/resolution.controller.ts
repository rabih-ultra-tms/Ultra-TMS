import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentTenant } from '../../../common/decorators/current-tenant.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResolutionService } from './resolution.service';
import { ApproveClaimDto } from './dto/approve-claim.dto';
import { DenyClaimDto } from './dto/deny-claim.dto';
import { PayClaimDto } from './dto/pay-claim.dto';
import { CloseClaimDto } from './dto/close-claim.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { CreateClaimAdjustmentDto } from './dto/create-claim-adjustment.dto';

@Controller('claims')
@UseGuards(JwtAuthGuard)
export class ResolutionController {
  constructor(private readonly resolutionService: ResolutionService) {}

  @Post(':claimId/approve')
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
  async updateInvestigation(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: UpdateInvestigationDto,
  ) {
    return this.resolutionService.updateInvestigation(tenantId, user.id, claimId, dto);
  }

  @Get(':claimId/adjustments')
  async listAdjustments(
    @CurrentTenant() tenantId: string,
    @Param('claimId') claimId: string,
  ) {
    return this.resolutionService.listAdjustments(tenantId, claimId);
  }

  @Post(':claimId/adjustments')
  async addAdjustment(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: { id: string },
    @Param('claimId') claimId: string,
    @Body() dto: CreateClaimAdjustmentDto,
  ) {
    return this.resolutionService.addAdjustment(tenantId, user.id, claimId, dto);
  }

  @Delete(':claimId/adjustments/:adjustmentId')
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
