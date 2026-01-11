import { Injectable, NotFoundException } from '@nestjs/common';
import { CarrierDocumentType } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class CarrierPortalDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  list(tenantId: string, carrierId: string) {
    return this.prisma.carrierPortalDocument.findMany({ where: { tenantId, carrierId } });
  }

  async upload(tenantId: string, carrierId: string, userId: string, payload: { loadId?: string; fileName: string; fileSize: number; mimeType: string; documentType?: CarrierDocumentType }) {
    return this.prisma.carrierPortalDocument.create({
      data: {
        tenantId,
        carrierId,
        userId,
        loadId: payload.loadId,
        fileName: payload.fileName,
        filePath: `/uploads/${payload.fileName}`,
        fileSize: payload.fileSize,
        mimeType: payload.mimeType,
        documentType: payload.documentType ?? CarrierDocumentType.POD,
      },
    });
  }

  async get(tenantId: string, carrierId: string, id: string) {
    const doc = await this.prisma.carrierPortalDocument.findFirst({ where: { id, tenantId, carrierId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async delete(tenantId: string, carrierId: string, id: string) {
    await this.get(tenantId, carrierId, id);
    await this.prisma.carrierPortalDocument.delete({ where: { id } });
    return { success: true };
  }
}