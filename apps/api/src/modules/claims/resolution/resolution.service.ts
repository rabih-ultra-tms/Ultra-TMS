import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClaimStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { ApproveClaimDto } from './dto/approve-claim.dto';
import { DenyClaimDto } from './dto/deny-claim.dto';
import { PayClaimDto } from './dto/pay-claim.dto';
import { CloseClaimDto } from './dto/close-claim.dto';
import { UpdateInvestigationDto } from './dto/update-investigation.dto';
import { CreateClaimAdjustmentDto } from './dto/create-claim-adjustment.dto';

@Injectable()
export class ResolutionService {
  constructor(private readonly prisma: PrismaService) {}

  async approve(tenantId: string, userId: string, claimId: string, dto: ApproveClaimDto) {
    const claim = await this.requireClaim(tenantId, claimId);

    if (claim.status === ClaimStatus.CLOSED) {
      throw new BadRequestException('Claim is already closed');
    }

    const updated = await this.prisma.claim.update({
      where: { id: claimId },
      data: {
        status: ClaimStatus.APPROVED,
        approvedAmount: dto.approvedAmount,
        disposition: dto.disposition ?? claim.disposition,
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'CLAIM_APPROVED',
      'Claim approved',
      {
        previousStatus: claim.status,
        newStatus: updated.status,
        approvedAmount: dto.approvedAmount,
      },
      userId,
    );

    return updated;
  }

  async deny(tenantId: string, userId: string, claimId: string, dto: DenyClaimDto) {
    const claim = await this.requireClaim(tenantId, claimId);

    const updated = await this.prisma.claim.update({
      where: { id: claimId },
      data: {
        status: ClaimStatus.DENIED,
        disposition: dto.disposition ?? claim.disposition,
        closedDate: new Date(),
        updatedById: userId,
        customFields: this.mergeCustomFields(claim.customFields, { denialReason: dto.reason }),
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'CLAIM_DENIED',
      'Claim denied',
      {
        previousStatus: claim.status,
        newStatus: updated.status,
        reason: dto.reason,
      },
      userId,
    );

    return updated;
  }

  async pay(tenantId: string, userId: string, claimId: string, dto: PayClaimDto) {
    const claim = await this.requireClaim(tenantId, claimId);

    if (claim.status !== ClaimStatus.APPROVED && claim.status !== ClaimStatus.SETTLED) {
      throw new BadRequestException('Claim must be approved or settled before payment');
    }

    const newPaidAmount = Number(claim.paidAmount) + dto.amount;
    const closeClaim = claim.approvedAmount ? newPaidAmount >= Number(claim.approvedAmount) : false;

    const updated = await this.prisma.claim.update({
      where: { id: claimId },
      data: {
        paidAmount: newPaidAmount,
        status: closeClaim ? ClaimStatus.CLOSED : claim.status,
        closedDate: closeClaim ? new Date() : claim.closedDate,
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'CLAIM_PAID',
      'Claim payment recorded',
      {
        amount: dto.amount,
        paidAmount: newPaidAmount,
        closed: closeClaim,
      },
      userId,
    );

    return updated;
  }

  async close(tenantId: string, userId: string, claimId: string, dto: CloseClaimDto) {
    const claim = await this.requireClaim(tenantId, claimId);

    const updated = await this.prisma.claim.update({
      where: { id: claimId },
      data: {
        status: ClaimStatus.CLOSED,
        closedDate: new Date(),
        updatedById: userId,
        customFields: this.mergeCustomFields(claim.customFields, dto.reason ? { closeReason: dto.reason } : {}),
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'CLAIM_CLOSED',
      'Claim closed',
      {
        previousStatus: claim.status,
        reason: dto.reason,
      },
      userId,
    );

    return updated;
  }

  async updateInvestigation(
    tenantId: string,
    userId: string,
    claimId: string,
    dto: UpdateInvestigationDto,
  ) {
    await this.requireClaim(tenantId, claimId);

    const data: Prisma.ClaimUpdateInput = {
      ...(dto.investigationNotes !== undefined ? { investigationNotes: dto.investigationNotes } : {}),
      ...(dto.rootCause !== undefined ? { rootCause: dto.rootCause } : {}),
      ...(dto.preventionNotes !== undefined ? { preventionNotes: dto.preventionNotes } : {}),
      updatedById: userId,
    };

    const updated = await this.prisma.claim.update({
      where: { id: claimId },
      data,
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'INVESTIGATION_UPDATED',
      'Investigation details updated',
      { updatedFields: Object.keys(data) },
      userId,
    );

    return updated;
  }

  async listAdjustments(tenantId: string, claimId: string) {
    await this.requireClaim(tenantId, claimId);

    return this.prisma.claimAdjustment.findMany({
      where: { tenantId, claimId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addAdjustment(tenantId: string, userId: string, claimId: string, dto: CreateClaimAdjustmentDto) {
    await this.requireClaim(tenantId, claimId);

    const adjustment = await this.prisma.claimAdjustment.create({
      data: {
        tenantId,
        claimId,
        adjustmentType: dto.adjustmentType,
        amount: dto.amount,
        reason: dto.reason,
        createdById: userId,
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'ADJUSTMENT_ADDED',
      'Claim adjustment added',
      {
        adjustmentId: adjustment.id,
        adjustmentType: adjustment.adjustmentType,
        amount: dto.amount,
      },
      userId,
    );

    return adjustment;
  }

  async removeAdjustment(tenantId: string, userId: string, claimId: string, adjustmentId: string) {
    const adjustment = await this.prisma.claimAdjustment.findFirst({
      where: { id: adjustmentId, claimId, tenantId, deletedAt: null },
    });

    if (!adjustment) {
      throw new NotFoundException('Claim adjustment not found');
    }

    await this.prisma.claimAdjustment.update({
      where: { id: adjustmentId },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'ADJUSTMENT_REMOVED',
      'Claim adjustment removed',
      { adjustmentId },
      userId,
    );

    return { success: true };
  }

  private async requireClaim(tenantId: string, claimId: string) {
    const claim = await this.prisma.claim.findFirst({ where: { id: claimId, tenantId, deletedAt: null } });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    return claim;
  }

  private mergeCustomFields(current: unknown, additions: Record<string, unknown>) {
    const existing = (current as Record<string, unknown>) || {};
    return { ...existing, ...additions } as Prisma.InputJsonValue;
  }

  private async recordTimeline(
    tenantId: string,
    claimId: string,
    eventType: string,
    description?: string,
    eventData?: Prisma.InputJsonValue,
    userId?: string,
  ) {
    await this.prisma.claimTimeline.create({
      data: {
        tenantId,
        claimId,
        eventType,
        description,
        eventData,
        createdById: userId,
        updatedById: userId,
      },
    });
  }
}
