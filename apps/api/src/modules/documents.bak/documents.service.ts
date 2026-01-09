import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentQueryDto,
  DocumentStatus,
} from './dto';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string,
    userId: string,
    dto: CreateDocumentDto,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    // Generate unique file path
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
    const filePath = `${tenantId}/${dto.documentType.toLowerCase()}/${fileName}`;

    // In production, upload to S3/MinIO here
    // For now, we'll just store the path

    const document = await this.prisma.document.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        documentType: dto.documentType,
        fileName: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileExtension,
        storageProvider: 'S3',
        bucketName: process.env.S3_BUCKET || 'ultra-tms-documents',
        entityType: dto.entityType,
        entityId: dto.entityId,
        loadId: dto.loadId,
        orderId: dto.orderId,
        carrierId: dto.carrierId,
        companyId: dto.companyId,
        tags: dto.tags || [],
        metadata: (dto.metadata || {}) as Prisma.InputJsonValue,
        uploadedBy: userId,
      },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return document;
  }

  async findAll(tenantId: string, query: DocumentQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      documentType,
      status,
      entityType,
      entityId,
      loadId,
      carrierId,
      companyId,
      includeArchived,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.DocumentWhereInput = {
      tenantId,
      deletedAt: null,
    };

    if (!includeArchived) {
      where.status = { not: DocumentStatus.ARCHIVED };
    }

    if (status) {
      where.status = status;
    }

    if (documentType) {
      where.documentType = documentType;
    }

    if (entityType) {
      where.entityType = entityType;
    }

    if (entityId) {
      where.entityId = entityId;
    }

    if (loadId) {
      where.loadId = loadId;
    }

    if (carrierId) {
      where.carrierId = carrierId;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } },
        { ocrText: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          uploader: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          load: { select: { id: true, loadNumber: true } },
          carrier: { select: { id: true, legalName: true } },
          company: { select: { id: true, name: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: documents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        load: { select: { id: true, loadNumber: true, status: true } },
        order: { select: { id: true, orderNumber: true } },
        carrier: { select: { id: true, legalName: true, mcNumber: true } },
        company: { select: { id: true, name: true } },
        versions: {
          where: { isLatestVersion: false },
          orderBy: { version: 'desc' },
          take: 10,
        },
        shares: {
          where: { status: 'ACTIVE' },
          select: { id: true, shareType: true, expiresAt: true, viewCount: true },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
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
      data: {
        name: dto.name,
        description: dto.description,
        documentType: dto.documentType,
        status: dto.status,
        tags: dto.tags,
        retentionDate: dto.retentionDate,
        metadata: dto.metadata
          ? ({ ...(document.metadata as object), ...dto.metadata } as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }

  async delete(tenantId: string, id: string, hardDelete = false) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (hardDelete) {
      // In production, also delete from S3/MinIO
      await this.prisma.document.delete({ where: { id } });
    } else {
      await this.prisma.document.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          status: DocumentStatus.DELETED,
        },
      });
    }

    return { success: true };
  }

  async bulkDelete(tenantId: string, documentIds: string[]) {
    const result = await this.prisma.document.updateMany({
      where: {
        id: { in: documentIds },
        tenantId,
      },
      data: {
        deletedAt: new Date(),
        status: DocumentStatus.DELETED,
      },
    });

    return { deleted: result.count };
  }

  async getDownloadUrl(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // In production, generate pre-signed S3 URL
    const downloadUrl = `/api/v1/documents/${id}/file`;

    return {
      url: downloadUrl,
      fileName: document.fileName,
      mimeType: document.mimeType,
      expiresIn: 3600, // 1 hour
    };
  }

  async getPreviewUrl(tenantId: string, id: string) {
    const document = await this.prisma.document.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Generate preview URL based on file type
    const supportedPreviewTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];

    if (!supportedPreviewTypes.includes(document.mimeType)) {
      throw new BadRequestException('Preview not available for this file type');
    }

    return {
      url: `/api/v1/documents/${id}/preview-file`,
      mimeType: document.mimeType,
    };
  }

  async uploadNewVersion(
    tenantId: string,
    userId: string,
    documentId: string,
    file: {
      originalname: string;
      mimetype: string;
      size: number;
      buffer: Buffer;
    },
  ) {
    const existingDocument = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId, deletedAt: null },
    });

    if (!existingDocument) {
      throw new NotFoundException('Document not found');
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
    const filePath = `${tenantId}/${existingDocument.documentType.toLowerCase()}/versions/${fileName}`;

    // Mark old version as not latest
    await this.prisma.document.update({
      where: { id: documentId },
      data: { isLatestVersion: false },
    });

    // Create new version
    const newDocument = await this.prisma.document.create({
      data: {
        tenantId,
        name: existingDocument.name,
        description: existingDocument.description,
        documentType: existingDocument.documentType,
        fileName: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileExtension,
        storageProvider: existingDocument.storageProvider,
        bucketName: existingDocument.bucketName,
        entityType: existingDocument.entityType,
        entityId: existingDocument.entityId,
        loadId: existingDocument.loadId,
        orderId: existingDocument.orderId,
        carrierId: existingDocument.carrierId,
        companyId: existingDocument.companyId,
        tags: existingDocument.tags,
        metadata: existingDocument.metadata || {},
        version: existingDocument.version + 1,
        parentDocumentId: existingDocument.parentDocumentId || existingDocument.id,
        isLatestVersion: true,
        uploadedBy: userId,
      },
    });

    return newDocument;
  }

  async getVersions(tenantId: string, documentId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const rootDocumentId = document.parentDocumentId || document.id;

    const versions = await this.prisma.document.findMany({
      where: {
        tenantId,
        OR: [
          { id: rootDocumentId },
          { parentDocumentId: rootDocumentId },
        ],
      },
      orderBy: { version: 'desc' },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return versions;
  }

  async search(tenantId: string, searchTerm: string, limit = 20) {
    const documents = await this.prisma.document.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: 'ACTIVE',
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { fileName: { contains: searchTerm, mode: 'insensitive' } },
          { ocrText: { contains: searchTerm, mode: 'insensitive' } },
          { tags: { has: searchTerm } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        documentType: true,
        fileName: true,
        mimeType: true,
        entityType: true,
        entityId: true,
        createdAt: true,
      },
    });

    return documents;
  }

  async getEntityDocuments(
    tenantId: string,
    entityType: string,
    entityId: string,
    documentType?: string,
  ) {
    const where: Prisma.DocumentWhereInput = {
      tenantId,
      deletedAt: null,
      status: 'ACTIVE',
    };

    // Map entity type to the correct field
    switch (entityType.toUpperCase()) {
      case 'LOAD':
        where.loadId = entityId;
        break;
      case 'ORDER':
        where.orderId = entityId;
        break;
      case 'CARRIER':
        where.carrierId = entityId;
        break;
      case 'COMPANY':
        where.companyId = entityId;
        break;
      default:
        where.entityType = entityType;
        where.entityId = entityId;
    }

    if (documentType) {
      where.documentType = documentType;
    }

    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        uploader: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }
}
