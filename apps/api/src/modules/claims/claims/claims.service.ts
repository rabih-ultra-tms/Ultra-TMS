import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ClaimStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { FileClaimDto } from './dto/file-claim.dto';
import { AssignClaimDto } from './dto/assign-claim.dto';
import { QueryClaimsDto } from './dto/query-claims.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';

@Injectable()
export class ClaimsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, userId: string, dto: CreateClaimDto) {
    const claimNumber = await this.generateClaimNumber(tenantId);

    const items = dto.items?.map((item) => ({
      tenantId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalValue: item.totalValue ?? item.quantity * item.unitPrice,
      damageType: item.damageType,
      damageExtent: item.damageExtent,
      createdById: userId,
      updatedById: userId,
    }));

    const claim = await this.prisma.claim.create({
      data: {
        tenantId,
        claimNumber,
        claimType: dto.claimType,
        status: ClaimStatus.DRAFT,
        description: dto.description,
        incidentDate: new Date(dto.incidentDate),
        incidentLocation: dto.incidentLocation,
        claimedAmount: dto.claimedAmount,
        receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        loadId: dto.loadId,
        orderId: dto.orderId,
        carrierId: dto.carrierId,
        companyId: dto.companyId,
        claimantName: dto.claimantName,
        claimantCompany: dto.claimantCompany,
        claimantEmail: dto.claimantEmail,
        claimantPhone: dto.claimantPhone,
        createdById: userId,
        updatedById: userId,
        items: items?.length ? { create: items } : undefined,
      },
      include: {
        items: true,
        documents: true,
        notes: true,
      },
    });

    await this.recordTimeline(tenantId, claim.id, 'CLAIM_CREATED', 'Claim created', { claimNumber }, userId);

    return claim;
  }

  async findAll(tenantId: string, query: QueryClaimsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ClaimWhereInput = {
      tenantId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.claimType ? { claimType: query.claimType } : {}),
      ...(query.carrierId ? { carrierId: query.carrierId } : {}),
      ...(query.companyId ? { companyId: query.companyId } : {}),
      ...(query.search
        ? {
            OR: [
              { claimNumber: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              { claimantName: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.claim.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.claim.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    return this.requireClaim(tenantId, id, true);
  }

  async update(tenantId: string, userId: string, id: string, dto: UpdateClaimDto) {
    const claim = await this.requireClaim(tenantId, id);

    if (claim.status === ClaimStatus.CLOSED) {
      throw new BadRequestException('Closed claims cannot be updated');
    }

    const data: Prisma.ClaimUpdateInput = {
      ...(dto.claimType !== undefined ? { claimType: dto.claimType } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.incidentDate !== undefined ? { incidentDate: new Date(dto.incidentDate) } : {}),
      ...(dto.incidentLocation !== undefined ? { incidentLocation: dto.incidentLocation } : {}),
      ...(dto.claimedAmount !== undefined ? { claimedAmount: dto.claimedAmount } : {}),
      ...(dto.receivedDate !== undefined ? { receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : null } : {}),
      ...(dto.dueDate !== undefined ? { dueDate: dto.dueDate ? new Date(dto.dueDate) : null } : {}),
      ...(dto.loadId !== undefined ? { load: dto.loadId ? { connect: { id: dto.loadId } } : { disconnect: true } } : {}),
      ...(dto.orderId !== undefined ? { order: dto.orderId ? { connect: { id: dto.orderId } } : { disconnect: true } } : {}),
      ...(dto.carrierId !== undefined ? { carrier: dto.carrierId ? { connect: { id: dto.carrierId } } : { disconnect: true } } : {}),
      ...(dto.companyId !== undefined ? { company: dto.companyId ? { connect: { id: dto.companyId } } : { disconnect: true } } : {}),
      ...(dto.claimantName !== undefined ? { claimantName: dto.claimantName } : {}),
      ...(dto.claimantCompany !== undefined ? { claimantCompany: dto.claimantCompany } : {}),
      ...(dto.claimantEmail !== undefined ? { claimantEmail: dto.claimantEmail } : {}),
      ...(dto.claimantPhone !== undefined ? { claimantPhone: dto.claimantPhone } : {}),
      updatedById: userId,
    };

    const updated = await this.prisma.claim.update({
      where: { id: claim.id },
      data,
    });

    await this.recordTimeline(
      tenantId,
      id,
      'CLAIM_UPDATED',
      'Claim updated',
      { updatedFields: Object.keys(data) },
      userId,
    );

    return updated;
  }

  async fileClaim(tenantId: string, userId: string, id: string, dto: FileClaimDto) {
    const claim = await this.requireClaim(tenantId, id);

    if (claim.status !== ClaimStatus.DRAFT) {
      throw new BadRequestException('Only draft claims can be filed');
    }

    const updated = await this.prisma.claim.update({
      where: { id },
      data: {
        status: ClaimStatus.SUBMITTED,
        receivedDate: dto.receivedDate ? new Date(dto.receivedDate) : claim.receivedDate ?? new Date(),
        dueDate: dto.dueDate ? new Date(dto.dueDate) : claim.dueDate,
        updatedById: userId,
      },
    });

    await this.recordTimeline(tenantId, id, 'CLAIM_SUBMITTED', 'Claim filed', {
      previousStatus: claim.status,
      newStatus: updated.status,
    }, userId);

    return updated;
  }

  async assign(tenantId: string, userId: string, id: string, dto: AssignClaimDto) {
    await this.requireClaim(tenantId, id);

    const updated = await this.prisma.claim.update({
      where: { id },
      data: {
        assignedToId: dto.assignedToId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      id,
      'CLAIM_ASSIGNED',
      'Claim assigned',
      {
        assignedToId: dto.assignedToId,
        dueDate: dto.dueDate,
      },
      userId,
    );

    return updated;
  }

  async updateStatus(tenantId: string, userId: string, id: string, dto: UpdateClaimStatusDto) {
    const claim = await this.requireClaim(tenantId, id);

    if (claim.status === ClaimStatus.CLOSED && dto.status !== ClaimStatus.CLOSED) {
      throw new BadRequestException('Closed claims cannot transition to another status');
    }

    const updated = await this.prisma.claim.update({
      where: { id },
      data: {
        status: dto.status,
        closedDate: dto.status === ClaimStatus.CLOSED ? new Date() : claim.closedDate,
        updatedById: userId,
      },
    });

    await this.recordTimeline(tenantId, id, 'STATUS_CHANGED', 'Claim status changed', {
      previousStatus: claim.status,
      newStatus: dto.status,
      reason: dto.reason,
    }, userId);

    return updated;
  }

  async delete(tenantId: string, userId: string, id: string) {
    await this.requireClaim(tenantId, id);

    await this.prisma.claim.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    await this.recordTimeline(tenantId, id, 'CLAIM_DELETED', 'Claim archived', undefined, userId);

    return { success: true };
  }

  private async requireClaim(tenantId: string, id: string, includeRelations = false) {
    const claim = await this.prisma.claim.findFirst({
      where: { id, tenantId, deletedAt: null },
      ...(includeRelations
        ? { include: { items: true, documents: true, notes: true, timeline: true } }
        : {}),
    });

    if (!claim) {
      throw new NotFoundException('Claim not found');
    }

    return claim;
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

  private async generateClaimNumber(tenantId: string, attempt = 0): Promise<string> {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const randomPart = Math.floor(Math.random() * 10_000)
      .toString()
      .padStart(4, '0');
    const claimNumber = `CLM-${datePart}-${randomPart}`;

    const existing = await this.prisma.claim.count({
      where: { tenantId, claimNumber },
    });

    if (existing === 0) {
      return claimNumber;
    }

    if (attempt > 3) {
      throw new BadRequestException('Unable to generate unique claim number');
    }

    return this.generateClaimNumber(tenantId, attempt + 1);
  }
}
