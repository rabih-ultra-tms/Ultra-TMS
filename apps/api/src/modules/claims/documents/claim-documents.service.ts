import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { CreateClaimDocumentDto } from './dto/create-claim-document.dto';

@Injectable()
export class ClaimDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, claimId: string) {
    await this.ensureClaim(tenantId, claimId);

    return this.prisma.claimDocument.findMany({
      where: { tenantId, claimId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async add(tenantId: string, userId: string, claimId: string, dto: CreateClaimDocumentDto) {
    await this.ensureClaim(tenantId, claimId);

    const document = await this.prisma.claimDocument.create({
      data: {
        tenantId,
        claimId,
        documentId: dto.documentId,
        documentType: dto.documentType,
        description: dto.description,
        createdById: userId,
        updatedById: userId,
      },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'DOCUMENT_ADDED',
      `Document ${dto.documentType} added`,
      {
        documentId: document.id,
        documentType: document.documentType,
      },
      userId,
    );

    return document;
  }

  async remove(tenantId: string, userId: string, claimId: string, id: string) {
    await this.ensureClaim(tenantId, claimId);

    const exists = await this.prisma.claimDocument.findFirst({
      where: { id, claimId, tenantId, deletedAt: null },
    });

    if (!exists) {
      throw new NotFoundException('Claim document not found');
    }

    await this.prisma.claimDocument.update({
      where: { id },
      data: { deletedAt: new Date(), updatedById: userId },
    });

    await this.recordTimeline(
      tenantId,
      claimId,
      'DOCUMENT_REMOVED',
      `Document removed: ${id}`,
      { documentId: id },
      userId,
    );

    return { success: true };
  }

  private async ensureClaim(tenantId: string, claimId: string) {
    const exists = await this.prisma.claim.count({ where: { id: claimId, tenantId, deletedAt: null } });
    if (exists === 0) {
      throw new NotFoundException('Claim not found');
    }
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
