import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import {
  CreateDocumentFolderDto,
  UpdateDocumentFolderDto,
  AddDocumentToFolderDto,
} from '../dto';

@Injectable()
export class DocumentFoldersService {
  constructor(private prisma: PrismaService) {}

  async create(
    tenantId: string,
    dto: CreateDocumentFolderDto,
    userId?: string
  ) {
    // Build folder path
    let path = '/';
    if (dto.parentFolderId) {
      const parent = await this.prisma.documentFolder.findFirst({
        where: { id: dto.parentFolderId, tenantId },
      });
      if (parent) {
        path = `${parent.path}${parent.name}/`;
      }
    }

    return this.prisma.documentFolder.create({
      data: {
        tenantId,
        name: dto.name,
        description: dto.description,
        parentFolderId: dto.parentFolderId,
        path,
        entityType: dto.entityType,
        entityId: dto.entityId,
        isSystem: dto.isSystem || false,
        createdById: userId,
      },
    });
  }

  async findAll(tenantId: string, parentFolderId?: string) {
    const where: { tenantId: string; parentFolderId: string | null; deletedAt?: Date | null } = {
      tenantId,
      parentFolderId: parentFolderId ?? null,
      deletedAt: null,
    };

    return this.prisma.documentFolder.findMany({
      where,
      include: {
        _count: {
          select: {
            folderDocuments: true,
            childFolders: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        folderDocuments: {
          include: {
            document: true,
          },
        },
        childFolders: true,
      },
    });

    if (!folder) {
      throw new NotFoundException('Document folder not found');
    }

    return folder;
  }

  async update(tenantId: string, id: string, dto: UpdateDocumentFolderDto) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!folder) {
      throw new NotFoundException('Document folder not found');
    }

    return this.prisma.documentFolder.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!folder) {
      throw new NotFoundException('Document folder not found');
    }

    return this.prisma.documentFolder.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async addDocument(
    tenantId: string,
    folderId: string,
    dto: AddDocumentToFolderDto,
    userId?: string
  ) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id: folderId, tenantId, deletedAt: null },
    });

    if (!folder) {
      throw new NotFoundException('Document folder not found');
    }

    const document = await this.prisma.document.findFirst({
      where: { id: dto.documentId, tenantId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.folderDocument.create({
      data: {
        folderId,
        documentId: dto.documentId,
        addedBy: userId,
      },
    });
  }

  async removeDocument(tenantId: string, folderId: string, documentId: string) {
    const folder = await this.prisma.documentFolder.findFirst({
      where: { id: folderId, tenantId, deletedAt: null },
    });

    if (!folder) {
      throw new NotFoundException('Document folder not found');
    }

    return this.prisma.folderDocument.delete({
      where: {
        folderId_documentId: {
          folderId,
          documentId,
        },
      },
    });
  }
}
