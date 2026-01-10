import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateCarrierDocumentDto, UpdateCarrierDocumentDto, DocumentStatus } from './dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, carrierId: string) {
    await this.ensureCarrier(tenantId, carrierId);
    return this.prisma.carrierDocument.findMany({
      where: { tenantId, carrierId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(tenantId: string, carrierId: string, dto: CreateCarrierDocumentDto) {
    await this.ensureCarrier(tenantId, carrierId);

    return this.prisma.carrierDocument.create({
      data: {
        tenantId,
        carrierId,
        documentType: dto.documentType,
        name: dto.name,
        description: dto.description,
        filePath: dto.filePath,
        mimeType: dto.mimeType,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
        status: DocumentStatus.PENDING,
      },
    });
  }

  async update(tenantId: string, carrierId: string, docId: string, dto: UpdateCarrierDocumentDto) {
    const doc = await this.requireDocument(tenantId, carrierId, docId);

    return this.prisma.carrierDocument.update({
      where: { id: docId },
      data: {
        documentType: dto.documentType ?? doc.documentType,
        name: dto.name ?? doc.name,
        description: dto.description ?? doc.description,
        filePath: dto.filePath ?? doc.filePath,
        mimeType: dto.mimeType ?? doc.mimeType,
        expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : doc.expirationDate,
        status: dto.status ?? doc.status,
        rejectionReason: dto.rejectionReason ?? doc.rejectionReason,
      },
    });
  }

  async approve(tenantId: string, carrierId: string, docId: string, reviewerId?: string) {
    await this.requireDocument(tenantId, carrierId, docId);
    return this.prisma.carrierDocument.update({
      where: { id: docId },
      data: {
        status: DocumentStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
      },
    });
  }

  async reject(tenantId: string, carrierId: string, docId: string, reason?: string, reviewerId?: string) {
    await this.requireDocument(tenantId, carrierId, docId);
    if (!reason) throw new BadRequestException('Rejection reason is required');
    return this.prisma.carrierDocument.update({
      where: { id: docId },
      data: {
        status: DocumentStatus.REJECTED,
        rejectionReason: reason,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
      },
    });
  }

  async remove(tenantId: string, carrierId: string, docId: string) {
    await this.requireDocument(tenantId, carrierId, docId);
    await this.prisma.carrierDocument.update({ where: { id: docId }, data: { deletedAt: new Date(), status: DocumentStatus.REJECTED } });
    return { success: true };
  }

  private async ensureCarrier(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.carrier.findFirst({ where: { id: carrierId, tenantId, deletedAt: null } });
    if (!carrier) throw new NotFoundException('Carrier not found');
  }

  private async requireDocument(tenantId: string, carrierId: string, docId: string) {
    const doc = await this.prisma.carrierDocument.findFirst({
      where: { id: docId, carrierId, tenantId, deletedAt: null },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }
}
