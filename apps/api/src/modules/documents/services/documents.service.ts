import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from '../dto';
import type { IStorageService } from '../../storage/storage.interface';
import { STORAGE_SERVICE } from '../../storage/storage.module';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storageService: IStorageService,
  ) {}

  async create(tenantId: string, dto: CreateDocumentDto, userId?: string) {
    return this.prisma.document.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        documentType: dto.documentType,
        fileName: dto.fileName,
        filePath: dto.filePath,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        fileExtension: dto.fileExtension,
        bucketName: dto.bucketName,
        entityType: dto.entityType,
        entityId: dto.entityId,
        loadId: dto.loadId,
        orderId: dto.orderId,
        carrierId: dto.carrierId,
        companyId: dto.companyId,
        tags: dto.tags || [],
        isPublic: dto.isPublic || false,
        uploadedBy: userId,
      },
    });
  }

  async uploadAndCreate(
    tenantId: string,
    file: { buffer: Buffer; originalname: string; size: number; mimetype: string },
    metadata: {
      name: string;
      documentType: string;
      description?: string;
      entityType?: string;
      entityId?: string;
      loadId?: string;
      orderId?: string;
      carrierId?: string;
      companyId?: string;
      tags?: string[];
      isPublic?: boolean;
    },
    userId?: string,
  ) {
    const fileExtension = file.originalname.split('.').pop() || '';
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${tenantId}-${Date.now()}-${sanitizedName}`;
    const folder = `documents/${tenantId}`;

    const filePath = await this.storageService.upload(file.buffer, filename, folder);

    return this.prisma.document.create({
      data: {
        tenantId,
        name: metadata.name,
        description: metadata.description,
        documentType: metadata.documentType,
        fileName: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileExtension,
        entityType: metadata.entityType,
        entityId: metadata.entityId,
        loadId: metadata.loadId,
        orderId: metadata.orderId,
        carrierId: metadata.carrierId,
        companyId: metadata.companyId,
        tags: metadata.tags || [],
        isPublic: metadata.isPublic || false,
        uploadedBy: userId,
      },
    });
  }

  async findAll(
    tenantId: string,
    documentType?: string,
    entityType?: string,
    entityId?: string,
    page?: number,
    limit?: number
  ) {
    const where: Record<string, any> = { tenantId, deletedAt: null };

    if (documentType) {
      where.documentType = documentType;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    // Default pagination
    const currentPage = page || 1;
    const itemsPerPage = limit || 20;
    const skip = (currentPage - 1) * itemsPerPage;

    // Get total count for pagination
    const total = await this.prisma.document.count({ where });

    // Get paginated results
    const data = await this.prisma.document.findMany({
      where,
      include: {
        load: true,
        order: true,
        carrier: true,
        company: true,
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: itemsPerPage,
    });

    return {
      data,
      pagination: {
        page: currentPage,
        limit: itemsPerPage,
        total,
        totalPages: Math.ceil(total / itemsPerPage),
      },
    };
  }

  async findOne(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        load: true,
        order: true,
        carrier: true,
        company: true,
        uploader: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        childDocuments: true,
        parentDocument: true,
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async getDownloadUrl(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const downloadUrl = await this.storageService.getSignedUrl(document.filePath, {
      expiresIn: 15 * 60,
    });

    return {
      id: document.id,
      name: document.name,
      downloadUrl,
      expiresAt,
    };
  }

  async update(tenantId: string, id: string, dto: UpdateDocumentDto) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'DELETED',
      },
    });
  }

  async getByEntity(tenantId: string, entityType: string, entityId: string) {
    return this.prisma.document.findMany({
      where: {
        tenantId,
        entityType,
        entityId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOcrText(tenantId: string, id: string, ocrText: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id },
      data: {
        ocrText,
        ocrProcessed: true,
        ocrProcessedAt: new Date(),
      },
    });
  }
}
