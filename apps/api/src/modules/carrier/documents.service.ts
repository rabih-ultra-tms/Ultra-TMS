import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import {
  CreateCarrierDocumentDto,
  UpdateCarrierDocumentDto,
  DocumentStatus,
} from './dto';
import { STORAGE_SERVICE } from '../storage/storage.module';
import type { IStorageService } from '../storage/storage.interface';
import { randomBytes } from 'crypto';
import { extname } from 'path';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService
  ) {}

  async list(tenantId: string, carrierId: string) {
    await this.ensureCarrier(tenantId, carrierId);
    return this.prisma.carrierDocument.findMany({
      where: { tenantId, carrierId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    tenantId: string,
    carrierId: string,
    dto: CreateCarrierDocumentDto,
    file?: Express.Multer.File
  ) {
    await this.ensureCarrier(tenantId, carrierId);

    let filePath: string | undefined = dto.filePath;
    let mimeType: string | undefined = dto.mimeType;
    let fileSize: number | undefined;

    if (file) {
      const ext = extname(file.originalname);
      const uniqueName = `${Date.now()}-${randomBytes(4).toString('hex')}${ext}`;
      filePath = await this.storage.upload(
        file.buffer,
        uniqueName,
        `carrier-documents/${carrierId}`,
        file.mimetype
      );
      mimeType = file.mimetype;
      fileSize = file.size;
    }

    return this.prisma.carrierDocument.create({
      data: {
        tenantId,
        carrierId,
        documentType: dto.documentType,
        name: dto.name,
        description: dto.description,
        filePath,
        mimeType,
        fileSize,
        expirationDate: dto.expirationDate
          ? new Date(dto.expirationDate)
          : null,
        status: DocumentStatus.PENDING,
      },
    });
  }

  async getDownloadUrl(tenantId: string, carrierId: string, docId: string) {
    const doc = await this.requireDocument(tenantId, carrierId, docId);
    if (!doc.filePath) {
      throw new BadRequestException('No file attached to this document');
    }
    const downloadUrl = await this.storage.getSignedUrl(doc.filePath, {
      expiresIn: 900,
    });
    return {
      id: doc.id,
      name: doc.name,
      downloadUrl,
      expiresIn: 900,
    };
  }

  async update(
    tenantId: string,
    carrierId: string,
    docId: string,
    dto: UpdateCarrierDocumentDto
  ) {
    const doc = await this.requireDocument(tenantId, carrierId, docId);

    return this.prisma.carrierDocument.update({
      where: { id: docId, tenantId },
      data: {
        documentType: dto.documentType ?? doc.documentType,
        name: dto.name ?? doc.name,
        description: dto.description ?? doc.description,
        filePath: dto.filePath ?? doc.filePath,
        mimeType: dto.mimeType ?? doc.mimeType,
        expirationDate: dto.expirationDate
          ? new Date(dto.expirationDate)
          : doc.expirationDate,
        status: dto.status ?? doc.status,
        rejectionReason: dto.rejectionReason ?? doc.rejectionReason,
      },
    });
  }

  async approve(
    tenantId: string,
    carrierId: string,
    docId: string,
    reviewerId?: string
  ) {
    await this.requireDocument(tenantId, carrierId, docId);
    return this.prisma.carrierDocument.update({
      where: { id: docId, tenantId },
      data: {
        status: DocumentStatus.APPROVED,
        reviewedAt: new Date(),
        reviewedById: reviewerId,
      },
    });
  }

  async reject(
    tenantId: string,
    carrierId: string,
    docId: string,
    reason?: string,
    reviewerId?: string
  ) {
    await this.requireDocument(tenantId, carrierId, docId);
    if (!reason) throw new BadRequestException('Rejection reason is required');
    return this.prisma.carrierDocument.update({
      where: { id: docId, tenantId },
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
    await this.prisma.carrierDocument.update({
      where: { id: docId, tenantId },
      data: { deletedAt: new Date(), status: DocumentStatus.REJECTED },
    });
    return { success: true };
  }

  private async ensureCarrier(tenantId: string, carrierId: string) {
    const carrier = await this.prisma.carrier.findFirst({
      where: { id: carrierId, tenantId, deletedAt: null },
    });
    if (!carrier) throw new NotFoundException('Carrier not found');
  }

  private async requireDocument(
    tenantId: string,
    carrierId: string,
    docId: string
  ) {
    const doc = await this.prisma.carrierDocument.findFirst({
      where: { id: docId, carrierId, tenantId, deletedAt: null },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }
}
