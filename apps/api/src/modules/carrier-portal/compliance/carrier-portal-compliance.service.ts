import { Injectable } from '@nestjs/common';
import { CarrierDocumentStatus, CarrierDocumentType } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class CarrierPortalComplianceService {
  constructor(private readonly prisma: PrismaService) {}

  async status(tenantId: string, carrierId: string) {
    const docs = await this.prisma.carrierPortalDocument.findMany({ where: { tenantId, carrierId } });
    const expiring = docs.filter((d) => d.status === CarrierDocumentStatus.REVIEWING).length;
    return { total: docs.length, expiring, approved: docs.filter((d) => d.status === CarrierDocumentStatus.APPROVED).length };
  }

  requiredDocs() {
    return [
      { type: CarrierDocumentType.POD, expiryWarning: null },
      { type: CarrierDocumentType.BOL_SIGNED, expiryWarning: null },
      { type: CarrierDocumentType.WEIGHT_TICKET, expiryWarning: 30 },
      { type: CarrierDocumentType.SCALE_TICKET, expiryWarning: 30 },
      { type: CarrierDocumentType.LUMPER_RECEIPT, expiryWarning: null },
    ];
  }

  async upload(tenantId: string, carrierId: string, userId: string, body: any) {
    return this.prisma.carrierPortalDocument.create({
      data: {
        tenantId,
        carrierId,
        userId,
        documentType: body.documentType ?? CarrierDocumentType.OTHER,
        fileName: body.fileName ?? 'document.pdf',
        filePath: `/compliance/${body.fileName ?? 'document.pdf'}`,
        fileSize: body.fileSize ?? 0,
        mimeType: body.mimeType ?? 'application/pdf',
      },
    });
  }

  async docStatus(tenantId: string, carrierId: string, id: string) {
    return this.prisma.carrierPortalDocument.findFirst({ where: { id, tenantId, carrierId } });
  }

  async expiring(tenantId: string, carrierId: string) {
    return this.prisma.carrierPortalDocument.findMany({ where: { tenantId, carrierId, status: CarrierDocumentStatus.REVIEWING } });
  }
}