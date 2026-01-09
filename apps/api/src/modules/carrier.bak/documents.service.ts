import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateCarrierDocumentDto,
  UpdateCarrierDocumentDto,
  ReviewDocumentDto,
  DocumentListQueryDto,
} from './dto/document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: string, carrierId: string, query: DocumentListQueryDto) {
    const { page = 1, limit = 20, documentType, reviewStatus, expiringSoon } = query;
    const skip = (page - 1) * limit;

    // Verify carrier exists
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId, deletedAt: null },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${carrierId} not found`);
    }

    const where: Record<string, unknown> = {
      carrierId,
      tenantId,
    };

    if (documentType) {
      where.documentType = documentType;
    }

    if (reviewStatus) {
      where.reviewStatus = reviewStatus;
    }

    if (expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      where.expirationDate = { lte: thirtyDaysFromNow };
    }

    const [data, total] = await Promise.all([
      this.prisma.carrierDocument.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.carrierDocument.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, carrierId: string, id: string) {
    const document = await this.prisma.carrierDocument.findFirst({
      where: { id, carrierId, tenantId },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async create(
    tenantId: string,
    carrierId: string,
    userId: string,
    dto: CreateCarrierDocumentDto
  ) {
    // Verify carrier exists
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId, deletedAt: null },
    });

    if (!carrier) {
      throw new NotFoundException(`Carrier with ID ${carrierId} not found`);
    }

    const document = await this.prisma.carrierDocument.create({
      data: {
        ...dto,
        tenantId,
        carrierId,
        effectiveDate: dto.effectiveDate ? new Date(dto.effectiveDate) : undefined,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
        uploadedBy: userId,
      },
    });

    return document;
  }

  async update(
    tenantId: string,
    carrierId: string,
    id: string,
    dto: UpdateCarrierDocumentDto
  ) {
    const document = await this.findOne(tenantId, carrierId, id);

    const { effectiveDate, expirationDate, ...updateData } = dto;

    const updated = await this.prisma.carrierDocument.update({
      where: { id: document.id },
      data: {
        ...updateData,
        ...(effectiveDate && { effectiveDate: new Date(effectiveDate) }),
        ...(expirationDate && { expirationDate: new Date(expirationDate) }),
      },
    });

    return updated;
  }

  async review(
    tenantId: string,
    carrierId: string,
    id: string,
    userId: string,
    dto: ReviewDocumentDto
  ) {
    const document = await this.findOne(tenantId, carrierId, id);

    const updated = await this.prisma.carrierDocument.update({
      where: { id: document.id },
      data: {
        reviewStatus: dto.reviewStatus,
        reviewedAt: new Date(),
        reviewedBy: userId,
        reviewNotes: dto.reviewNotes,
      },
    });

    return updated;
  }

  async delete(tenantId: string, carrierId: string, id: string) {
    const document = await this.findOne(tenantId, carrierId, id);

    await this.prisma.carrierDocument.delete({
      where: { id: document.id },
    });

    return { success: true, message: 'Document deleted successfully' };
  }
}
